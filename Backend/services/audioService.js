/**
 * audioService.js - Converts local MP3 to G.711 u-law for RTP streaming
 * Uses ffmpeg (available on this machine) to decode MP3 → raw u-law 8kHz mono
 * Includes in-memory caching to avoid repeated ffmpeg process spawning.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const audioCache = new Map();

/**
 * Convert a local MP3 file to raw G.711 u-law bytes (8kHz, mono)
 * Returns a Buffer ready to feed directly into rtpService.streamAudio()
 * Caches converted buffer in memory for instant subsequent playback.
 */
function getLocalAudio(filename) {
  if (audioCache.has(filename)) {
    console.log(`[Audio Cache] Returning pre-converted u-law buffer for ${filename}`);
    return Promise.resolve(audioCache.get(filename));
  }

  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../audio', filename);

    if (!fs.existsSync(filePath)) {
      return reject(new Error(`Audio file not found: ${filePath}`));
    }

    console.log(`[Audio] Converting ${filename} → u-law 8kHz...`);

    const chunks = [];
    const ff = spawn('ffmpeg', [
      '-i', filePath,   // input file
      '-ar', '8000',    // resample to 8kHz
      '-ac', '1',       // mono
      '-f', 'mulaw',    // raw G.711 u-law output (no container)
      '-'               // pipe to stdout
    ]);

    ff.stdout.on('data', chunk => chunks.push(chunk));
    ff.stderr.on('data', () => {}); // suppress ffmpeg progress spam

    ff.on('close', (code) => {
      if (chunks.length === 0) {
        return reject(new Error(`ffmpeg failed (exit ${code}) for ${filename}`));
      }
      const buf = Buffer.concat(chunks);
      console.log(`[Audio] Converted: ${buf.length} bytes u-law (~${(buf.length / 8000).toFixed(1)}s)`);
      audioCache.set(filename, buf);
      resolve(buf);
    });

    ff.on('error', (err) => reject(new Error(`ffmpeg spawn error: ${err.message}`)));
  });
}

/**
 * Clear in-memory audio cache if needed.
 */
function clearAudioCache() {
  audioCache.clear();
  console.log('[Audio Cache] Cache cleared');
}

module.exports = { getLocalAudio, clearAudioCache };
