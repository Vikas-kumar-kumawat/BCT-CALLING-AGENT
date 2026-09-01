// sttService.js – Speech-to-Text: u-law → WAV via ffmpeg → Google Web Speech via Python
const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const fetch = (...args) => (globalThis.fetch ? globalThis.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)))

const PY_SCRIPT = path.join(__dirname, 'python_stt.py')

// Precompute u-law to 16-bit linear PCM table
const ulaw2linear = new Int16Array(256);
for (let i = 0; i < 256; i++) {
    const uLawByte = ~i;
    const sign = (uLawByte & 0x80) ? -1 : 1;
    const exponent = (uLawByte >> 4) & 0x07;
    const mantissa = uLawByte & 0x0F;
    const sample = ((mantissa << 3) + 132) << exponent;
    ulaw2linear[i] = sign * (sample - 132);
}

// Pure JavaScript u-law → WAV (8000Hz 16-bit PCM) Converter (No ffmpeg/disk I/O required)
function ulawToWavBuffer(ulawBuffer) {
  const pcmDataLength = ulawBuffer.length * 2;
  const wavBuffer = Buffer.alloc(44 + pcmDataLength);
  
  // RIFF chunk descriptor
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + pcmDataLength, 4);
  wavBuffer.write('WAVE', 8);
  
  // fmt sub-chunk
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(1, 22);
  wavBuffer.writeUInt32LE(8000, 24);
  wavBuffer.writeUInt32LE(16000, 28);
  wavBuffer.writeUInt16LE(2, 32);
  wavBuffer.writeUInt16LE(16, 34);
  
  // data sub-chunk
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(pcmDataLength, 40);
  
  let offset = 44;
  for (let i = 0; i < ulawBuffer.length; i++) {
    wavBuffer.writeInt16LE(ulaw2linear[ulawBuffer[i]], offset);
    offset += 2;
  }
  
  return wavBuffer;
}


async function transcribeAudio(audioInput) {
  if (!Buffer.isBuffer(audioInput) || !audioInput.length)
    return '(No audio – RTP port blocked or customer silent)';

  // Convert u-law directly to WAV in memory using pure JS (no ffmpeg needed)
  let wavBuffer;
  try {
    wavBuffer = ulawToWavBuffer(audioInput);
  } catch (e) {
    return '(No speech detected)';
  }

  const tmp = path.join(__dirname, `tmp_${Date.now()}.wav`);
  await fs.promises.writeFile(tmp, wavBuffer);

  return new Promise((resolve) => {
    function findPythonCmd() {
      const isWin = process.platform === 'win32';
      const venvPython = isWin 
        ? path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe')
        : path.join(__dirname, '..', '.venv', 'bin', 'python');

      const candidates = [
        process.env.PYTHON, 
        require('fs').existsSync(venvPython) ? venvPython : null,
        'python', 
        'python3', 
        'py'
      ].filter(Boolean);

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
      fs.promises.unlink(tmp).catch(() => {});
      console.warn('[STT] Critical Error: Python environment not found! STT will fail.');
      return resolve('(STT Error: Python environment not found)');
    }

    // Execute Python speech_recognition script
    const py = spawn(pythonCmd, [PY_SCRIPT, tmp], { windowsHide: true });
    let out = '';
    let err = '';
    py.stdout.setEncoding('utf8');
    py.stdout.on('data', d => out += d);
    py.stderr.setEncoding('utf8');
    py.stderr.on('data', d => err += d);
    
    py.on('close', code => {
      fs.promises.unlink(tmp).catch(() => {});
      const txt = (out || '').trim();
      if (txt.startsWith('ERROR:') || err) {
         console.warn(`[STT] Python Error: ${err || txt}`);
         return resolve(`(STT Error: ${err || txt})`);
      }
      resolve(txt || '(No speech detected)');
    });
    
    py.on('error', e => {
      fs.promises.unlink(tmp).catch(() => {});
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
