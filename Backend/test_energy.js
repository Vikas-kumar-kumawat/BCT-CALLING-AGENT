const fs = require('fs');

function getUlawEnergy(buffer) {
  let energy = 0;
  for (let i = 0; i < buffer.length; i++) {
    let mag = (~buffer[i]) & 0x7F;
    energy += mag;
  }
  return energy / buffer.length;
}

console.log('Testing u-law energy calculation...');
// Create a fake buffer of silence (0xFF)
const silenceBuf = Buffer.alloc(160, 0xFF);
console.log('Silence energy (0xFF):', getUlawEnergy(silenceBuf));

// Create a fake buffer of max amplitude (0x00)
const loudBuf = Buffer.alloc(160, 0x00);
console.log('Max energy (0x00):', getUlawEnergy(loudBuf));
