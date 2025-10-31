// Script to create test audio files for bioacoustic analysis
const fs = require('fs');
const path = require('path');

console.log('🎵 Creating test audio files for Agri-Acoustic Sentinel...');

// Create test audio directory
const testAudioDir = path.join(__dirname, 'test-audio');
if (!fs.existsSync(testAudioDir)) {
  fs.mkdirSync(testAudioDir, { recursive: true });
}

// Create placeholder audio files with instructions
const testFiles = [
  {
    name: 'healthy-field-1.wav',
    description: 'Healthy crop field - rustling leaves, beneficial insects, normal ecosystem sounds'
  },
  {
    name: 'pest-detected-1.wav', 
    description: 'Field with bark beetle activity - wood-boring sounds, irregular clicking patterns'
  },
  {
    name: 'mixed-environment.wav',
    description: 'Mixed environment - some pest activity, wind, distant machinery'
  },
  {
    name: 'quiet-period.wav',
    description: 'Early morning quiet period - minimal activity, baseline conditions'
  }
];

// Create README with instructions
const readmeContent = `# Test Audio Files for Agri-Acoustic Sentinel

## 📁 Audio Files Needed

Place the following types of audio files in this directory:

### 1. Healthy Field Audio
- **File**: healthy-field-1.wav
- **Description**: Normal crop field sounds
- **Duration**: 10-30 seconds
- **Content**: Rustling leaves, beneficial insects, wind, normal ecosystem activity

### 2. Pest Detection Audio
- **File**: pest-detected-1.wav  
- **Description**: Field with pest activity
- **Duration**: 10-30 seconds
- **Content**: Bark beetle clicking, caterpillar chewing, aphid wing beats

### 3. Mixed Environment Audio
- **File**: mixed-environment.wav
- **Description**: Complex field environment
- **Duration**: 15-45 seconds
- **Content**: Multiple sound sources, some pest activity, background noise

### 4. Baseline Audio
- **File**: quiet-period.wav
- **Description**: Minimal activity period
- **Duration**: 20-60 seconds
- **Content**: Very low activity, good for establishing baseline

## 🎤 Recording Tips

### Equipment
- Use a good quality microphone (smartphone microphone works)
- Record in WAV format (16-bit, 44.1kHz)
- Keep recording device stable during recording

### Recording Conditions
- Record during different times of day
- Include various weather conditions
- Record from different field locations
- Keep recordings between 10-60 seconds

### Audio Quality
- Minimize wind noise (use wind shield if available)
- Avoid handling noise
- Keep consistent distance from sound sources
- Record in stereo if possible

## 🧪 Testing Instructions

1. Place audio files in this directory
2. Open Agri-Acoustic Sentinel dashboard
3. Go to "Audio Upload" tab
4. Upload each test file
5. Select appropriate microphone location
6. Analyze results and compare with expected outcomes

## 📊 Expected Results

- **Healthy Field**: Low confidence scores, no pest detection
- **Pest Detected**: Higher confidence scores, specific pest types identified
- **Mixed Environment**: Moderate confidence, multiple sound sources
- **Baseline**: Very low activity, minimal deviations

## 🔗 Where to Find Real Audio Samples

### Online Resources
1. **Freesound.org**: Search for "crop field", "insect sounds", "nature sounds"
2. **BBC Sound Effects**: Professional nature recordings
3. **YouTube**: Agricultural field recordings (convert to audio)
4. **Research Papers**: Academic studies often include audio samples

### Recording Your Own
1. **Local Farms**: Contact farmers for field access
2. **Botanical Gardens**: Often have diverse plant/insect life
3. **Parks**: Good for baseline environmental sounds
4. **Your Garden**: Start with small-scale testing

## 🎯 File Format Requirements

- **Format**: WAV, MP3, M4A, or FLAC
- **Size**: Maximum 10MB per file
- **Duration**: 10-60 seconds recommended
- **Quality**: Clear audio, minimal background noise

## 🚀 Quick Start

1. Download sample audio from online sources
2. Rename files to match the test file names above
3. Place in this directory
4. Start testing with the Agri-Acoustic Sentinel dashboard

Happy testing! 🎵🌾
`;

// Write README file
fs.writeFileSync(path.join(testAudioDir, 'README.md'), readmeContent);

console.log('✅ Test audio directory created: test-audio/');
console.log('📖 README file created with instructions');
console.log('🎵 Ready for test audio files!');

// Create sample file structure
testFiles.forEach(file => {
  const filePath = path.join(testAudioDir, file.name);
  const placeholderContent = `# Placeholder for ${file.name}

${file.description}

Replace this file with actual audio recording.

Expected format: WAV, MP3, M4A, or FLAC
Recommended duration: 10-60 seconds
Maximum size: 10MB
`;
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath + '.txt', placeholderContent);
    console.log(`📝 Created placeholder: ${file.name}.txt`);
  }
});

console.log('\n🎯 Next steps:');
console.log('1. Add real audio files to the test-audio/ directory');
console.log('2. Use the Audio Upload feature in the dashboard');
console.log('3. Test different microphone locations');
console.log('4. Compare results with expected outcomes');
