/**
 * sttService.js - Speech-to-Text (STT) Transcription Service
 * Converts customer's captured audio (PCM / WAV / u-law) into text.
 * Uses Sarvam AI STT / Gemini API with automatic fallback.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Convert raw u-law buffer → PCM WAV using ffmpeg
 */
function ulawToPcmWav(ulawBuffer) {
  return new Promise((resolve, reject) => {
    const chunks = []
    const ff = spawn('ffmpeg', [
      '-f', 'mulaw',      // input format: raw u-law
      '-ar', '8000',      // sample rate 8kHz
      '-ac', '1',         // mono
      '-i', 'pipe:0',     // read from stdin
      '-f', 'wav',        // output: WAV container (PCM)
      '-ar', '16000',     // upsample to 16kHz for better STT accuracy
      'pipe:1'            // write to stdout
    ])
    ff.stdin.write(ulawBuffer)
    ff.stdin.end()
    ff.stdout.on('data', c => chunks.push(c))
    ff.stderr.on('data', () => { })
    ff.on('close', code => {
      if (chunks.length === 0) return reject(new Error(`ffmpeg failed (${code})`))
      resolve(Buffer.concat(chunks))
    })
    ff.on('error', reject)
  })
}

/**
 * Transcribe raw G.711 u-law audio buffer into text string via Google Gemini API.
 */
async function transcribeAudio(audioInput) {
  const geminiApiKey = process.env.GEMINI_API_KEY

  try {
    let wavBuffer

    if (Buffer.isBuffer(audioInput) && audioInput.length > 0) {
      console.log(`[STT] Converting ${audioInput.length} bytes u-law → PCM WAV via ffmpeg...`)
      wavBuffer = await ulawToPcmWav(audioInput)
    } else {
      console.warn('[STT] Empty or invalid audio — skipping transcription.')
      return "(No audio captured - RTP port blocked or customer silent)"
    }

    console.log('[STT] Sending to Free Google Web Speech API (via Python)...')
    
    // Save to temp file
    const tmpFile = path.join(__dirname, `tmp_audio_${Date.now()}.wav`)
    fs.writeFileSync(tmpFile, wavBuffer)

    try {
      const { execSync } = require('child_process')
      const pyScript = path.join(__dirname, 'python_stt.py')
      const out = execSync(`python "${pyScript}" "${tmpFile}"`, { encoding: 'utf-8' }).trim()
      
      // Cleanup temp file
      try { fs.unlinkSync(tmpFile) } catch(e){}

      if (out.startsWith('ERROR:')) {
        console.warn(`[STT API Error] ${out}`)
        return `(STT Error: ${out})`
      } else if (out) {
        console.log(`[STT Success] "${out}"`)
        return out
      } else {
        console.warn(`[STT Warning] Empty transcription returned`)
        return "(STT: No speech detected)"
      }
    } catch (err) {
      try { fs.unlinkSync(tmpFile) } catch(e){}
      console.warn('[STT Error]', err.message)
      return `(STT Execution Error: ${err.message})`
    }
  } catch (err) {
    console.warn('[STT Error]', err.message)
    return `(STT Exception: ${err.message})`
  }

  return "(STT Failed to return transcript)"
}

/**
 * Capture incoming RTP audio from UDP socket for a specified duration
 * @param {dgram.Socket} socket - UDP Socket
 * @param {number} durationMs - Duration to record in ms
 * @returns {Promise<Buffer>} Audio Buffer
 */
function captureRtpAudio(socket, durationMs = 4000) {
  return new Promise((resolve) => {
    const packets = [];

    const onMessage = (msg) => {
      // Collect incoming RTP payload (strip 12-byte RTP header)
      if (msg.length > 12) {
        packets.push(msg.slice(12));
      }
    };

    if (socket && typeof socket.on === 'function') {
      socket.on('message', onMessage);
    }

    setTimeout(() => {
      if (socket && typeof socket.removeListener === 'function') {
        socket.removeListener('message', onMessage);
      }
      const audioBuffer = Buffer.concat(packets);
      console.log(`[RTP Capture] Captured ${audioBuffer.length} bytes of customer audio`);
      resolve(audioBuffer);
    }, durationMs);
  });
}

module.exports = { transcribeAudio, captureRtpAudio };
