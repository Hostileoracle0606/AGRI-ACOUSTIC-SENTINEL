/**
 * Status check for Agri-Acoustic Sentinel system
 */

const http = require('http');
const fs = require('fs').promises;

async function checkServerStatus(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} is running on port ${port}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} is not running on port ${port}`);
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      console.log(`⏰ ${name} timeout on port ${port}`);
      req.destroy();
      resolve(false);
    });
  });
}

async function checkFiles() {
  console.log('📁 Checking project files...\n');
  
  const files = [
    'package.json',
    'server/package.json',
    'client/package.json',
    'server/index.js',
    'server/replicate-integration.js',
    'client/src/App.js'
  ];
  
  for (const file of files) {
    try {
      await fs.access(file);
      console.log(`✅ ${file}`);
    } catch (error) {
      console.log(`❌ ${file} - Missing!`);
    }
  }
}

async function main() {
  console.log('🔍 Agri-Acoustic Sentinel Status Check\n');
  
  // Check files
  await checkFiles();
  
  console.log('\n🌐 Checking server status...\n');
  
  // Check servers
  const serverRunning = await checkServerStatus(5000, 'Backend Server');
  const clientRunning = await checkServerStatus(3000, 'Frontend Server');
  
  console.log('\n📊 Summary:');
  console.log(`Backend: ${serverRunning ? '✅ Running' : '❌ Not running'}`);
  console.log(`Frontend: ${clientRunning ? '✅ Running' : '❌ Not running'}`);
  
  if (serverRunning && clientRunning) {
    console.log('\n🎉 System is ready!');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔧 Backend API: http://localhost:5000');
  } else {
    console.log('\n⚠️  System needs attention');
    if (!serverRunning) console.log('   - Start backend: npm run server');
    if (!clientRunning) console.log('   - Start frontend: npm run client');
  }
}

main().catch(console.error);
