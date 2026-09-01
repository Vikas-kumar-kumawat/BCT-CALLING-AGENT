const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Setting up Python STT Environment ---');

function findSystemPython() {
  const candidates = process.platform === 'win32' 
    ? ['python', 'py', 'python3'] 
    : ['python3', 'python'];
    
  for (const cmd of candidates) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch (e) {}
  }
  return null;
}

const sysPython = findSystemPython();
if (!sysPython) {
  console.warn('⚠️ Python not found on system. Python STT will fallback to pure JS.');
  process.exit(0);
}

const venvDir = path.join(__dirname, '.venv');
const isWin = process.platform === 'win32';
const venvPython = isWin ? path.join(venvDir, 'Scripts', 'python.exe') : path.join(venvDir, 'bin', 'python');
const venvPip = isWin ? path.join(venvDir, 'Scripts', 'pip.exe') : path.join(venvDir, 'bin', 'pip');

try {
  if (!fs.existsSync(venvDir)) {
    console.log(`Creating virtual environment using ${sysPython}...`);
    execSync(`${sysPython} -m venv .venv`, { stdio: 'inherit' });
  }

  console.log('Installing SpeechRecognition in virtual environment...');
  execSync(`${venvPip} install SpeechRecognition`, { stdio: 'inherit' });
  console.log('✅ Python STT setup complete (venv)!');
} catch (err) {
  console.warn('⚠️ Virtual environment setup failed, trying direct pip install...', err.message);
  try {
    execSync(`${sysPython} -m pip install SpeechRecognition --user`, { stdio: 'inherit' });
    console.log('✅ Python STT setup complete (pip --user)!');
  } catch (e1) {
    try {
      execSync(`${sysPython} -m pip install SpeechRecognition --break-system-packages`, { stdio: 'inherit' });
      console.log('✅ Python STT setup complete (pip --break-system-packages)!');
    } catch (e2) {
      console.error('❌ Failed to install SpeechRecognition package:', e2.message);
    }
  }
}
