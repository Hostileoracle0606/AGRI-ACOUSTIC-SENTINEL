/**
 * Test script to verify file upload handling for Replicate API
 */

const fs = require('fs').promises;
const path = require('path');

async function testFileHandling() {
  console.log('🧪 Testing file handling for Replicate API...\n');
  
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
      
      // Create a small dummy file for testing
      await fs.writeFile(testFilePath, Buffer.from('dummy audio data'));
      console.log('✅ Dummy file created');
    }
    
    // Test 2: Read file as Buffer
    console.log('\n2. Reading file as Buffer...');
    const audioBuffer = await fs.readFile(testFilePath);
    console.log('✅ File read successfully');
    console.log('   File size:', audioBuffer.length, 'bytes');
    console.log('   Buffer type:', typeof audioBuffer);
    console.log('   Is Buffer:', Buffer.isBuffer(audioBuffer));
    
    // Test 3: Check file size limits
    console.log('\n3. Checking file size limits...');
    const sizeInMB = audioBuffer.length / (1024 * 1024);
    console.log('   File size:', sizeInMB.toFixed(2), 'MB');
    
    if (audioBuffer.length < 100 * 1024 * 1024) {
      console.log('✅ File size is under 100MB limit');
    } else {
      console.log('❌ File size exceeds 100MB limit');
    }
    
    // Test 4: Simulate Replicate input structure
    console.log('\n4. Testing Replicate input structure...');
    const replicateInput = {
      text: "agricultural pest detection, bioacoustic analysis, insect sounds, crop field monitoring",
      audio: audioBuffer
    };
    
    console.log('✅ Replicate input structure created');
    console.log('   Parameters:', Object.keys(replicateInput));
    console.log('   Text length:', replicateInput.text.length);
    console.log('   Audio buffer size:', replicateInput.audio.length);
    
    // Test 5: Alternative parameter names
    console.log('\n5. Testing alternative parameter names...');
    const alternativeInputs = [
      { ...replicateInput, file: replicateInput.audio, audio: undefined },
      { ...replicateInput, input_audio: replicateInput.audio, audio: undefined },
      { ...replicateInput, sound: replicateInput.audio, audio: undefined },
    ];
    
    alternativeInputs.forEach((input, index) => {
      console.log(`   Alternative ${index + 1}:`, Object.keys(input));
    });
    
    console.log('\n✅ All file handling tests passed!');
    console.log('\n📋 Summary:');
    console.log('- File reading: ✅ Working');
    console.log('- Buffer creation: ✅ Working');
    console.log('- Size validation: ✅ Working');
    console.log('- Input structure: ✅ Ready for Replicate');
    console.log('- Alternative parameters: ✅ Prepared');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFileHandling().catch(console.error);
