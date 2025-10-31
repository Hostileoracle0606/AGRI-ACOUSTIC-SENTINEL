/**
 * Demo Audio Generator for Agri-Acoustic Sentinel
 * Creates test audio files with specific kHz frequencies for pest detection
 */

const fs = require('fs');
const path = require('path');

console.log('🎵 Creating demo audio files for pest detection testing...');

// Create demo audio directory
const demoAudioDir = path.join(__dirname, 'demo-audio');
if (!fs.existsSync(demoAudioDir)) {
  fs.mkdirSync(demoAudioDir, { recursive: true });
}

// Pest frequency specifications
const pestAudioSpecs = [
  {
    name: 'bark-beetle-demo.wav',
    frequency: 3000, // 3 kHz - within 2-4 kHz range
    duration: 15,
    description: 'Bark Beetle: 3 kHz clicking sound (2-4 kHz range)',
    expectedResult: 'High confidence, Bark Beetle detected'
  },
  {
    name: 'aphid-demo.wav', 
    frequency: 2000, // 2 kHz - within 1.2-3.2 kHz range
    duration: 15,
    description: 'Aphid: 2 kHz buzzing sound (1.2-3.2 kHz range)',
    expectedResult: 'Medium confidence, Aphid detected'
  },
  {
    name: 'caterpillar-demo.wav',
    frequency: 1000, // 1 kHz - within 0.5-2.0 kHz range
    duration: 15,
    description: 'Caterpillar: 1 kHz chewing sound (0.5-2.0 kHz range)',
    expectedResult: 'Medium confidence, Caterpillar detected'
  },
  {
    name: 'grasshopper-demo.wav',
    frequency: 5000, // 5 kHz - within 3.0-8.0 kHz range
    duration: 15,
    description: 'Grasshopper: 5 kHz chirping sound (3.0-8.0 kHz range)',
    expectedResult: 'High confidence, Grasshopper detected'
  },
  {
    name: 'healthy-field-demo.wav',
    frequency: 500, // 0.5 kHz - within 0.1-1.5 kHz range
    duration: 15,
    description: 'Healthy Field: 0.5 kHz natural sound (0.1-1.5 kHz range)',
    expectedResult: 'Low confidence, No pests detected'
  }
];

// Create instruction file
const instructions = `# Demo Audio Files for Agri-Acoustic Sentinel

## 📁 Audio Files Created

${pestAudioSpecs.map(spec => `
### ${spec.name}
- **Frequency**: ${spec.frequency} Hz (${spec.frequency/1000} kHz)
- **Duration**: ${spec.duration} seconds
- **Description**: ${spec.description}
- **Expected Result**: ${spec.expectedResult}
`).join('')}

## 🎯 How to Use These Files

### Step 1: Start the System
\`\`\`bash
npm run dev
\`\`\`

### Step 2: Open Dashboard
- Go to: http://localhost:3000
- Navigate to "Audio Upload" tab

### Step 3: Test Each File
1. **Upload bark-beetle-demo.wav**
   - Expected: High confidence (70-90%)
   - Pest: Bark Beetle detected
   - kHz Range: 2.0-4.0 kHz

2. **Upload aphid-demo.wav**
   - Expected: Medium confidence (60-80%)
   - Pest: Aphid detected
   - kHz Range: 1.2-3.2 kHz

3. **Upload caterpillar-demo.wav**
   - Expected: Medium confidence (50-70%)
   - Pest: Caterpillar detected
   - kHz Range: 0.5-2.0 kHz

4. **Upload grasshopper-demo.wav**
   - Expected: High confidence (80-95%)
   - Pest: Grasshopper detected
   - kHz Range: 3.0-8.0 kHz

5. **Upload healthy-field-demo.wav**
   - Expected: Low confidence (10-30%)
   - Pest: None detected
   - Status: Healthy ecosystem

## 🔬 kHz Detection Thresholds

| Pest Type | kHz Range | Demo Frequency | Expected Confidence |
|-----------|-----------|----------------|-------------------|
| Bark Beetle | 2.0-4.0 | 3.0 kHz | 70-90% |
| Aphid | 1.2-3.2 | 2.0 kHz | 60-80% |
| Caterpillar | 0.5-2.0 | 1.0 kHz | 50-70% |
| Grasshopper | 3.0-8.0 | 5.0 kHz | 80-95% |
| Healthy Field | 0.1-1.5 | 0.5 kHz | 10-30% |

## 🎵 Creating Your Own Test Audio

### Using Tone Generator Apps:
1. **Download tone generator app** (iOS/Android)
2. **Set frequency** to target kHz value
3. **Record for 10-30 seconds**
4. **Save as WAV or MP3**

### Using Online Tools:
1. **Go to onlinetonegenerator.com**
2. **Set frequency** to target value
3. **Record using computer microphone**
4. **Export as audio file**

### Using Real Sounds:
1. **Bark Beetle**: Clicking pen, tapping wood
2. **Aphid**: Buzzing electronics, electric toothbrush
3. **Caterpillar**: Paper tearing, soft crunching
4. **Grasshopper**: High-pitched whistling, cricket sounds
5. **Healthy Field**: Wind, leaves rustling

## 🚀 Demo Presentation Tips

1. **Start with healthy field** to show baseline
2. **Upload each pest file** one by one
3. **Explain the kHz ranges** for each pest
4. **Show confidence scores** and how they change
5. **Demonstrate real-time updates** on dashboard
6. **Use field map** to show spatial detection

## 📊 Expected Dashboard Results

After uploading test files, you should see:
- **Real-time confidence updates**
- **Pest type identification**
- **kHz range analysis**
- **Severity assessments**
- **Alert generation** for high-confidence detections

This demonstrates how the AI model uses kHz frequency analysis to detect and classify agricultural pests! 🎯🌾
`;

// Write instructions
fs.writeFileSync(path.join(demoAudioDir, 'README.md'), instructions);

// Create placeholder files (since we can't generate actual audio without additional libraries)
pestAudioSpecs.forEach(spec => {
  const placeholderContent = `# Placeholder for ${spec.name}

## Audio Specifications
- **Frequency**: ${spec.frequency} Hz (${spec.frequency/1000} kHz)
- **Duration**: ${spec.duration} seconds
- **Description**: ${spec.description}
- **Expected Result**: ${spec.expectedResult}

## How to Create This File

### Option 1: Tone Generator App
1. Download a tone generator app
2. Set frequency to ${spec.frequency} Hz
3. Record for ${spec.duration} seconds
4. Save as ${spec.name}

### Option 2: Online Generator
1. Go to onlinetonegenerator.com
2. Set frequency to ${spec.frequency} Hz
3. Record using computer microphone
4. Export as WAV file

### Option 3: Real Sound Recording
${getRealSoundInstructions(spec.name)}

## Testing Instructions
1. Start Agri-Acoustic Sentinel: npm run dev
2. Open dashboard: http://localhost:3000
3. Go to Audio Upload tab
4. Upload this file
5. Check results match expected outcome

Expected: ${spec.expectedResult}
`;

  const filePath = path.join(demoAudioDir, spec.name + '.txt');
  fs.writeFileSync(filePath, placeholderContent);
  console.log(`📝 Created placeholder: ${spec.name}.txt`);
});

function getRealSoundInstructions(fileName) {
  const instructions = {
    'bark-beetle-demo.wav': 'Record clicking sounds: clicking pen, tapping wood, or metronome app',
    'aphid-demo.wav': 'Record buzzing sounds: electric toothbrush, small motor, or electronics buzzing',
    'caterpillar-demo.wav': 'Record low-frequency sounds: paper tearing, soft crunching, or gentle chewing',
    'grasshopper-demo.wav': 'Record high-pitched sounds: whistling, cricket sounds, or high-frequency tones',
    'healthy-field-demo.wav': 'Record natural sounds: wind, leaves rustling, or quiet nature sounds'
  };
  return instructions[fileName] || 'Record appropriate sound for this frequency range';
}

console.log('\n✅ Demo audio directory created: demo-audio/');
console.log('📖 Instructions file created: demo-audio/README.md');
console.log('📝 Placeholder files created for each pest type');
console.log('\n🎯 Next steps:');
console.log('1. Create actual audio files using tone generators');
console.log('2. Place them in the demo-audio/ directory');
console.log('3. Start the system: npm run dev');
console.log('4. Test each file in the Audio Upload tab');
console.log('5. Compare results with expected kHz thresholds!');
