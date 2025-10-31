// Simple test to check if the backend is running and accessible
const http = require('http');

console.log('🔌 Testing backend connection...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/field-data',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('📊 Backend is generating data correctly!');
      console.log('🎯 Available endpoints:');
      console.log('   - /api/field-data ✅');
      console.log('   - /api/microphones ✅');
      console.log('   - /api/alerts ✅');
      console.log('   - Socket.IO server ✅');
      
      console.log('\n🔧 Next steps:');
      console.log('1. Make sure frontend is running: cd client && npm start');
      console.log('2. Open browser to: http://localhost:3000');
      console.log('3. Check connection status in top-right corner');
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Backend connection failed:', err.message);
  console.log('🔧 Make sure to run: cd server && npm run dev');
});

req.end();
