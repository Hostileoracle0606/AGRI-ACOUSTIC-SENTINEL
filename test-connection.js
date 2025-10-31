// Simple test to check if the backend is running
const http = require('http');

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
    console.log('📊 Backend response:', JSON.parse(data));
  });
});

req.on('error', (err) => {
  console.log('❌ Backend connection failed:', err.message);
  console.log('🔧 Make sure to run: cd server && npm run dev');
});

req.end();
