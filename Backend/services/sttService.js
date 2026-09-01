// sttService.js – Speech-to-Text: u-law → WAV via ffmpeg → Google Web Speech via Python
const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const fetch = (...args) => (globalThis.fetch ? globalThis.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)))

const PY_SCRIPT = path.join(__dirname, 'python_stt.py')

function ulawToWav(ulawBuffer) {
  return new Promise((ok, fail) => {
    const chunks = [];
    const ff = spawn(ffmpegPath, ['-f', 'mulaw', '-ar', '8000', '-ac', '1', '-i', 'pipe:0',
      '-f', 'wav', '-ar', '16000', 'pipe:1']);
    ff.stdin.write(ulawBuffer);
    ff.stdin.end();
    ff.stdout.on('data', c => chunks.push(c));
    ff.stderr.on('data', () => { });
    ff.on('close', code => chunks.length ? ok(Buffer.concat(chunks)) : fail(new Error(`ffmpeg exit ${code}`)));
    ff.on('error', fail);
  });
}

const CHROMIUM_SPEECH_KEY = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

// Pure JavaScript u-law → 16000Hz 16-bit PCM Converter (No ffmpeg/disk I/O required)
function ulawToPcm16kBuffer(ulawBuffer) {
  const pcm16 = new Int16Array(ulawBuffer.length * 2);
  for (let i = 0; i < ulawBuffer.length; i++) {
    const u = ~ulawBuffer[i];
    const sign = (u & 0x80) ? -1 : 1;
    const exponent = (u >> 4) & 0x07;
    const mantissa = u & 0x0F;
    let sample = (mantissa << (exponent + 3)) + 132;
    sample = (sign * sample) & 0xFFFF;
    pcm16[i * 2] = sample;
    pcm16[i * 2 + 1] = sample;
  }
  return Buffer.from(pcm16.buffer);
}

// Pure JavaScript Google Web Speech API (Works on Render Production, 100% Free)
async function googleWebSpeechRecognize(pcmBuffer, lang) {
  try {
    const url = `https://www.google.com/speech-api/v2/recognize?client=chromium&key=${CHROMIUM_SPEECH_KEY}&lang=${lang}&maxresults=1`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'audio/l16; rate=16000' },
      body: pcmBuffer
    });
    if (!res.ok) return null;
    const text = await res.text();
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        const alt = json.result?.[0]?.alternative?.[0];
        if (alt?.transcript) return alt.transcript.trim();
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

async function transcribeAudio(audioInput) {
  if (!Buffer.isBuffer(audioInput) || !audioInput.length)
    return '(No audio – RTP port blocked or customer silent)';

  // 1. Pure Node.js Google Web Speech API (Fast, Free, Perfect for Render Production)
  try {
    const pcmBuffer = ulawToPcm16kBuffer(audioInput);
    
    // Fast-race promises: return as soon as EITHER hi-IN or en-IN returns a valid transcript
    const jsText = await new Promise((resolve) => {
      let pending = 2;
      let resolved = false;
      const check = (text) => {
        if (resolved) return;
        if (text) { resolved = true; resolve(text); }
        else if (--pending === 0) resolve(null);
      };
      googleWebSpeechRecognize(pcmBuffer, 'hi-IN').then(check).catch(() => check(null));
      googleWebSpeechRecognize(pcmBuffer, 'en-IN').then(check).catch(() => check(null));
    });

    if (jsText) return jsText;
  } catch (e) {
    console.warn('[STT] Pure JS Google STT failed, trying fallback...', e.message);
  }

  // 2. Fallback to FFmpeg + Python STT (for local environment)
  let wavBuffer;
  try {
    wavBuffer = await ulawToWav(audioInput);
  } catch (_) {
    return '(No speech detected)';
  }

  const tmp = path.join(__dirname, `tmp_${Date.now()}.wav`);
  await fs.promises.writeFile(tmp, wavBuffer);

  return new Promise((resolve) => {
    function findPythonCmd() {
      const candidates = [process.env.PYTHON, 'python', 'python3', 'py'].filter(Boolean);
      for (const cmd of candidates) {
        try {
          const res = spawnSync(cmd, ['--version'], { windowsHide: true });
          if (res.status === 0) return cmd;
        } catch (_) { }
      }
      return null;
    }

    const pythonCmd = findPythonCmd();
    if (!pythonCmd) {
      const CLOUD_STT_URL = process.env.CLOUD_STT_URL || '';
      const CLOUD_STT_KEY = process.env.CLOUD_STT_KEY || '';
      if (CLOUD_STT_URL) {
        (async () => {
          try {
            const resp = await fetch(CLOUD_STT_URL, {
              method: 'POST', headers: { 'Authorization': CLOUD_STT_KEY ? `Bearer ${CLOUD_STT_KEY}` : '', 'Content-Type': 'audio/wav' },
              body: wavBuffer
            });
            if (!resp.ok) return resolve(`(STT Error: cloud ${resp.status})`);
            const j = await resp.json();
            return resolve(j.text || '(No speech detected)');
          } catch (e) { return resolve(`(STT Error: ${e.message})`); }
        })();
        return;
      }
      return resolve('(STT Error: python not found on PATH)');
    }

    const py = spawn(pythonCmd, [PY_SCRIPT, tmp], { windowsHide: true });
    let out = '';
    let err = '';
    py.stdout.setEncoding('utf8');
    py.stdout.on('data', d => out += d);
    py.stderr.setEncoding('utf8');
    py.stderr.on('data', d => err += d);
    py.on('close', code => {
      try { fs.unlinkSync(tmp) } catch (_) { }
      const txt = (out || '').trim();
      if (txt.startsWith('ERROR:') || err) return resolve(`(STT Error: ${err || txt})`);
      resolve(txt || '(No speech detected)');
    });
    py.on('error', e => {
      try { fs.unlinkSync(tmp) } catch (_) { }
      resolve(`(STT Error: ${e.message})`);
    });
  });
}

// Capture RTP in streaming mode: call `onChunk(buffer)` for each detected speech chunk
function captureRtpStream(socket, onChunk, totalMaxMs = 8000) {
  const SILENCE_THRESH = 15;
  const SILENCE_TIMEOUT = 300; // Ultra-fast 300ms silence cut-off for instantaneous response
  let packets = [];
  let hasSpoken = false;
  let silenceStart = 0;
  let totalTimer = setTimeout(() => finish(), totalMaxMs);

  function finish() {
    socket?.removeListener('message', onMsg);
    clearTimeout(totalTimer);
    if (packets.length) onChunk(Buffer.concat(packets));
  }

  function onMsg(msg) {
    if (msg.length <= 12) return;
    const payload = msg.slice(12);
    packets.push(payload);

    let energy = 0;
    for (let i = 0; i < payload.length; i++) energy += (~payload[i]) & 0x7F;
    energy /= payload.length;

    if (energy > SILENCE_THRESH) {
      hasSpoken = true;
      silenceStart = 0;
    } else if (hasSpoken) {
      if (!silenceStart) silenceStart = Date.now();
      else if (Date.now() - silenceStart > SILENCE_TIMEOUT) {
        // emit chunk and reset
        const chunk = Buffer.concat(packets);
        packets = [];
        hasSpoken = false;
        silenceStart = 0;
        try { onChunk(chunk) } catch (_) { }
      }
    }
  }

  socket?.on('message', onMsg);
  return new Promise(ok => setTimeout(() => { finish(); ok(); }, totalMaxMs));
}

function captureRtpAudio(socket, maxDurationMs = 5000) {
  return new Promise(ok => {
    const packets = [];
    let silenceStart = 0;
    let hasSpoken = false;
    let timeoutId = null;
    const SILENCE_THRESH = 15;
    const SILENCE_TIMEOUT = 600; // Cut dead-air detection to 600ms

    const resolveAndClean = () => {
      socket?.removeListener('message', onMsg);
      clearTimeout(timeoutId);
      ok(Buffer.concat(packets));
    };

    const onMsg = msg => {
      if (msg.length <= 12) return;
      const payload = msg.slice(12);
      packets.push(payload);

      let energy = 0;
      for (let i = 0; i < payload.length; i++) energy += (~payload[i]) & 0x7F;
      energy /= payload.length;

      if (energy > SILENCE_THRESH) {
        hasSpoken = true;
        silenceStart = 0;
      } else if (hasSpoken) {
        if (!silenceStart) silenceStart = Date.now();
        else if (Date.now() - silenceStart > SILENCE_TIMEOUT) resolveAndClean();
      }
    };

    socket?.on('message', onMsg);
    timeoutId = setTimeout(resolveAndClean, maxDurationMs);
  });
}

module.exports = { transcribeAudio, captureRtpAudio, captureRtpStream }
