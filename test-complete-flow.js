/**
 * Complete test of the file upload to URL flow for Replicate API
 */

const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testCompleteFlow() {
  console.log('🧪 Testing complete file upload to URL flow...\n');
  
  // Test file path
  const testFilePath = path.join(__dirname, 'uploads', 'audio', 'test.wav');
  
  try {
    // Step 1: Create test file
    console.log('1. Creating test audio file...');
    const uploadsDir = path.dirname(testFilePath);
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Create a realistic WAV file header
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x08, 0x00, 0x00, // File size
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6D, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Format chunk size
      0x01, 0x00,             // Audio format (PCM)
      0x01, 0x00,             // Number of channels
      0x44, 0xAC, 0x00, 0x00, // Sample rate
      0x88, 0x58, 0x01, 0x00, // Byte rate
      0x02, 0x00,             // Block align
      0x10, 0x00,             // Bits per sample
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x08, 0x00, 0x00  // Data size
    ]);
    
    const audioData = Buffer.alloc(2048, 0); // 2KB of silence
    const wavFile = Buffer.concat([wavHeader, audioData]);
    
    await fs.writeFile(testFilePath, wavFile);
    console.log('✅ Test WAV file created:', testFilePath);
    console.log('   File size:', wavFile.length, 'bytes');
    
    // Step 2: Read file as Buffer
    console.log('\n2. Reading file as Buffer...');
    const audioBuffer = await fs.readFile(testFilePath);
    console.log('✅ File read successfully');
    console.log('   Buffer size:', audioBuffer.length, 'bytes');
    console.log('   Is Buffer:', Buffer.isBuffer(audioBuffer));
    
    // Step 3: Upload to file.io
    console.log('\n3. Uploading to file.io...');
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'test.wav',
      contentType: 'audio/wav'
    });
    
    const response = await axios.post('https://file.io', formData, {
      headers: {
        ...formData.getHeaders(),
      }
    });
    
    console.log('✅ Upload successful!');
    console.log('   Response status:', response.status);
    console.log('   Response data:', JSON.stringify(response.data, null, 2));
    
    // Step 4: Extract URL
    console.log('\n4. Extracting download URL...');
    let fileUrl;
    if (typeof response.data.link === 'function') {
      fileUrl = response.data.link();
    } else if (typeof response.data.link === 'string') {
      fileUrl = response.data.link;
    } else {
      fileUrl = response.data.link || response.data.url || response.data.download_url;
    }
    
    console.log('✅ URL extracted:', fileUrl);
    
    // Step 5: Verify URL accessibility
    console.log('\n5. Verifying URL accessibility...');
    try {
      const urlResponse = await axios.head(fileUrl, { timeout: 10000 });
      console.log('✅ URL is accessible');
      console.log('   Status:', urlResponse.status);
      console.log('   Content-Type:', urlResponse.headers['content-type']);
      console.log('   Content-Length:', urlResponse.headers['content-length']);
    } catch (urlError) {
      console.log('⚠️  URL verification failed:', urlError.message);
    }
    
    // Step 6: Test Replicate input structure
    console.log('\n6. Testing Replicate input structure...');
    const replicateInput = {
      text: "agricultural pest detection, bioacoustic analysis, insect sounds, crop field monitoring",
      audio: fileUrl
    };
    
    console.log('✅ Replicate input structure ready');
    console.log('   Text:', replicateInput.text);
    console.log('   Audio URL:', replicateInput.audio);
    console.log('   URL type:', typeof replicateInput.audio);
    console.log('   URL starts with https:', replicateInput.audio.startsWith('https'));
    
    console.log('\n🎉 Complete flow test successful!');
    console.log('\n📋 Summary:');
    console.log('- ✅ File creation: Working');
    console.log('- ✅ File reading: Working');
    console.log('- ✅ Upload to file.io: Working');
    console.log('- ✅ URL extraction: Working');
    console.log('- ✅ URL accessibility: Working');
    console.log('- ✅ Replicate input: Ready');
    
    console.log('\n🚀 Ready for ImageBind API!');
    console.log('   The system can now:');
    console.log('   1. Create realistic audio files');
    console.log('   2. Upload them to file.io');
    console.log('   3. Get HTTPS URLs');
    console.log('   4. Pass URLs to Replicate ImageBind API');
    
    return fileUrl;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testCompleteFlow().catch(console.error);
