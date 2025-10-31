// Custom start script to bypass host check
process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
process.env.GENERATE_SOURCEMAP = 'false';

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting React app with host check disabled...');

const child = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
    GENERATE_SOURCEMAP: 'false'
  }
});

child.on('close', (code) => {
  console.log(`React app exited with code ${code}`);
});

child.on('error', (error) => {
  console.error('Failed to start React app:', error);
});
