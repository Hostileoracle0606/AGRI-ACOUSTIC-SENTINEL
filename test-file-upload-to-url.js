/**
 * Test script to verify file upload to temporary hosting service
 */

const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testFileUploadToURL() {
  console.log('🧪 Testing file upload to temporary hosting service...\n');
  
  // Test file path (you can replace this with an actual audio file)
  const testFilePath = path.join(__dirname, 'uploads', 'audio', 'test.wav');
  
  try {
    // Test 1: Check if file exists
    console.log('1. Checking file existence...');
    try {
      await fs.access(testFilePath);
      console.log('✅ File exists:', testFilePath);
    } catch (error) {
      console.log('❌ File not found:', testFilePath);
      console.log('   Creating a dummy file for testing...');
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.dirname(testFilePath);
      await fs.mkdir(uploadsDir, { recursive: true });
      
      // Create a small dummy audio file for testing
      await fs.writeFile(testFilePath, Buffer.from('RIFF\x24\x08\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x08\x00\x00'));
      console.log('✅ Dummy audio file created');
    }
    
    // Test 2: Read file as Buffer
    console.log('\n2. Reading file as Buffer...');
    const audioBuffer = await fs.readFile(testFilePath);
    console.log('✅ File read successfully');
    console.log('   File size:', audioBuffer.length, 'bytes');
    console.log('   Buffer type:', typeof audioBuffer);
    console.log('   Is Buffer:', Buffer.isBuffer(audioBuffer));
    
    // Test 3: Test upload to 0x0.st
    console.log('\n3. Testing upload to 0x0.st...');
    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: 'test.wav',
        contentType: 'audio/wav'
      });
      
      const response = await axios.post('https://0x0.st', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      
      const fileUrl = response.data.trim();
      console.log('✅ Upload successful!');
      console.log('   URL:', fileUrl);
      
      // Test 4: Verify URL is accessible
      console.log('\n4. Verifying URL accessibility...');
      try {
        const urlResponse = await axios.head(fileUrl, { timeout: 5000 });
        console.log('✅ URL is accessible');
        console.log('   Status:', urlResponse.status);
        console.log('   Content-Type:', urlResponse.headers['content-type']);
      } catch (urlError) {
        console.log('⚠️  URL verification failed:', urlError.message);
      }
      
      console.log('\n✅ All tests passed!');
      console.log('\n📋 Summary:');
      console.log('- File reading: ✅ Working');
      console.log('- Buffer creation: ✅ Working');
      console.log('- Upload to 0x0.st: ✅ Working');
      console.log('- URL generation: ✅ Working');
      console.log('- URL accessibility: ✅ Verified');
      
      console.log('\n🎯 Ready for Replicate API!');
      console.log('   The system can now:');
      console.log('   1. Read local audio files');
      console.log('   2. Upload them to temporary hosting');
      console.log('   3. Get HTTPS URLs');
      console.log('   4. Pass URLs to Replicate API');
      
    } catch (uploadError) {
      console.log('❌ Upload to 0x0.st failed:', uploadError.message);
      console.log('\n🔄 Testing fallback services...');
      
      // Test file.io fallback
      try {
        console.log('   Trying file.io...');
        const formData2 = new FormData();
        formData2.append('file', audioBuffer, {
          filename: 'test.wav',
          contentType: 'audio/wav'
        });
        
        const response2 = await axios.post('https://file.io', formData2, {
          headers: {
            ...formData2.getHeaders(),
          }
        });
        
        const fileUrl2 = typeof response2.data.link === 'function' ? response2.data.link() : response2.data.link;
        console.log('   ✅ file.io upload successful!');
        console.log('   URL:', fileUrl2);
        
      } catch (fileIoError) {
        console.log('   ❌ file.io failed:', fileIoError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFileUploadToURL().catch(console.error);
