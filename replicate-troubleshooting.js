/**
 * Replicate API Troubleshooting Script
 * This script helps diagnose Replicate API issues
 */

const Replicate = require('replicate');

console.log('🔍 Diagnosing Replicate API Issues...\n');

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'your_token_here',
});

async function testReplicateAPI() {
  console.log('1. Testing API Token...');
  
  try {
    // Test basic API access
    const models = await replicate.models.list();
    console.log('✅ API Token is valid');
    console.log(`📊 Found ${models.results.length} models available`);
    
    // Test specific models
    await testSpecificModels();
    
  } catch (error) {
    console.log('❌ API Token issue:', error.message);
    
    if (error.message.includes('401')) {
      console.log('🔧 Solution: Check your API token in .env file');
    } else if (error.message.includes('403')) {
      console.log('🔧 Solution: Upgrade to Pro account or check permissions');
    } else if (error.message.includes('429')) {
      console.log('🔧 Solution: Rate limit exceeded, wait and try again');
    }
  }
}

async function testSpecificModels() {
  console.log('\n2. Testing specific models...');
  
  const modelsToTest = [
    {
      name: 'openai/whisper:latest',
      description: 'OpenAI Whisper (should work)'
    },
    {
      name: 'meta/musicgen:latest', 
      description: 'Meta MusicGen'
    },
    {
      name: 'stability-ai/stable-diffusion:latest',
      description: 'Stable Diffusion'
    }
  ];
  
  for (const model of modelsToTest) {
    try {
      console.log(`\n🧪 Testing: ${model.name}`);
      
      // Try to get model info
      const modelInfo = await replicate.models.get(model.name);
      console.log(`✅ ${model.description} - Available`);
      console.log(`   Latest version: ${modelInfo.latest_version?.id || 'Unknown'}`);
      
    } catch (error) {
      console.log(`❌ ${model.description} - Failed: ${error.message}`);
    }
  }
}

async function testSimplePrediction() {
  console.log('\n3. Testing simple prediction...');
  
  try {
    // Test with a simple text-to-text model
    const output = await replicate.run(
      "replicate/hello-world:latest",
      {
        input: {
          text: "Hello from Agri-Acoustic Sentinel!"
        }
      }
    );
    
    console.log('✅ Simple prediction works:', output);
    
  } catch (error) {
    console.log('❌ Simple prediction failed:', error.message);
  }
}

// Run diagnostics
async function runDiagnostics() {
  await testReplicateAPI();
  await testSimplePrediction();
  
  console.log('\n📋 Summary:');
  console.log('If all tests fail, check:');
  console.log('1. API token is correct in .env file');
  console.log('2. Account has sufficient credits');
  console.log('3. Model names are correct');
  console.log('4. Internet connection is working');
}

runDiagnostics().catch(console.error);
