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

async function transcribeAudio(audioInput) {
  if (!Buffer.isBuffer(audioInput) || !audioInput.length)
    return '(No audio – RTP port blocked or customer silent)';

  // Safe FFmpeg conversion that ensures 16000Hz sample rate required by Python STT
  const wavBuffer = await ulawToWav(audioInput);

  // Attempt blazing fast HTTP transcription via Groq Whisper if available
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
  if (GROQ_API_KEY) {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'audio.wav');
      formData.append('model', 'whisper-large-v3');

      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        return data.text ? data.text.trim() : '(No speech detected)';
      }
    } catch (e) {
      console.warn('[STT] Groq fast transcription failed, falling back...', e.message);
    }
  }

  // Attempt blazing fast HTTP transcription via Gemini Audio if available (Pure Node.js, perfect for Render)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  if (GEMINI_API_KEY) {
    try {
      const payload = {
        contents: [{
          parts: [
            { text: "Transcribe the speech in this audio exactly. Output ONLY the transcribed text." },
            { inlineData: { mimeType: "audio/wav", data: wavBuffer.toString('base64') } }
          ]
        }]
      };
      let GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      if (GEMINI_MODEL.includes('2.5')) GEMINI_MODEL = 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text.trim()) return text.trim();
      } else {
        console.warn('[GEMINI STT] HTTP Error', res.status);
      }
    } catch (e) {
      console.warn('[STT] Gemini transcription failed, falling back...', e.message);
    }
  }

  // Fallback to legacy Python/Cloud STT which requires disk I/O
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
  const SILENCE_TIMEOUT = 400; // Aggressive 400ms silence cut-off for instant response
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
