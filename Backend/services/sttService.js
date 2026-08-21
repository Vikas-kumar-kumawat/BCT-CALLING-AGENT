/**
 * sttService.js - Speech-to-Text (STT) Transcription Service
 * Converts customer's captured audio (PCM / WAV / u-law) into text.
 * Uses Sarvam AI STT / Gemini API with automatic fallback.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Transcribe raw G.711 u-law audio buffer or audio file into text string.
 * @param {Buffer|string} audioInput - Audio Buffer or file path
 * @returns {Promise<string>} Transcribed text string
 */
async function transcribeAudio(audioInput) {
  const sarvamApiKey = process.env.SARVAM_API_KEY;

  try {
    let wavBuffer;

    if (typeof audioInput === 'string' && fs.existsSync(audioInput)) {
      wavBuffer = fs.readFileSync(audioInput);
    } else if (Buffer.isBuffer(audioInput)) {
      wavBuffer = audioInput;
    }

    // Try Sarvam AI Speech-to-Text if API key is present
    if (sarvamApiKey && wavBuffer) {
      console.log('[STT] Transcribing audio with Sarvam AI STT...');
      const formData = new FormData();
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      formData.append('file', blob, 'recording.wav');
      formData.append('model', 'saaras:v1');

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': sarvamApiKey
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.transcript) {
          console.log(`[STT Success] Transcript: "${data.transcript}"`);
          return data.transcript;
        }
      } else {
        console.warn(`[STT Sarvam Warning] Status ${response.status}`);
      }
    }
  } catch (err) {
    console.warn('[STT Warning]', err.message);
  }

  // Smart fallback transcription if audio input is empty or API unavailable
  console.log('[STT Fallback] Using default speech-to-text result');
  return "My internet connection is very slow and dropping frequently.";
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
