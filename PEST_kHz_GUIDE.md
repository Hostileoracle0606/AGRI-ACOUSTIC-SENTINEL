# 🎵 Agri-Acoustic Sentinel: kHz Pest Detection Guide

## 📊 Pest kHz Thresholds for Audio Analysis

### 🐛 Bark Beetle Detection
- **Primary kHz Range**: **2.0 - 4.0 kHz**
- **Secondary Range**: 1.5 - 2.5 kHz (harmonics)
- **Amplitude Threshold**: 0.3 (moderate to high)
- **Pattern**: Rhythmic clicking
- **Description**: Wood-boring clicks, distinct tapping sounds
- **Demo Audio**: Record clicking sounds, wood tapping, or use a metronome app

### 🦗 Aphid Detection
- **Primary kHz Range**: **1.2 - 3.2 kHz**
- **Secondary Range**: 0.8 - 1.5 kHz (body vibrations)
- **Amplitude Threshold**: 0.2 (low to moderate)
- **Pattern**: Irregular buzzing
- **Description**: Wing beats and body vibrations
- **Demo Audio**: Record buzzing sounds, small motor, or electric toothbrush

### 🐛 Caterpillar Detection
- **Primary kHz Range**: **0.5 - 2.0 kHz**
- **Secondary Range**: 0.3 - 0.8 kHz (low-frequency munching)
- **Amplitude Threshold**: 0.15 (very low)
- **Pattern**: Continuous chewing
- **Description**: Leaf chewing sounds, low-frequency munching
- **Demo Audio**: Record paper tearing, soft crunching, or gentle chewing sounds

### 🦗 Grasshopper Detection
- **Primary kHz Range**: **3.0 - 8.0 kHz**
- **Secondary Range**: 2.0 - 4.0 kHz (lower harmonics)
- **Amplitude Threshold**: 0.4 (high)
- **Pattern**: Rhythmic chirping
- **Description**: Stridulation chirps, high-pitched rhythmic sounds
- **Demo Audio**: Record cricket sounds, high-pitched chirping, or use a tone generator

### 🌿 Healthy Ecosystem Baseline
- **Primary kHz Range**: **0.1 - 1.5 kHz**
- **Secondary Range**: 1.5 - 3.0 kHz (wind, leaves)
- **Amplitude Threshold**: 0.1 (very low baseline)
- **Pattern**: Random environmental
- **Description**: Natural field sounds, wind, rustling leaves
- **Demo Audio**: Record wind, leaves rustling, or quiet nature sounds

## 🎯 How to Create Demo Audio Files

### Method 1: Tone Generator Apps
1. **Download a tone generator app** (iOS/Android)
2. **Set frequency to target kHz range**:
   - Bark Beetle: 3 kHz tone
   - Aphid: 2 kHz tone
   - Caterpillar: 1 kHz tone
   - Grasshopper: 5 kHz tone
3. **Record for 10-30 seconds**
4. **Save as WAV or MP3**

### Method 2: Online Tone Generators
1. **Go to online tone generator** (e.g., onlinetonegenerator.com)
2. **Set frequency** to target range
3. **Record using computer microphone**
4. **Export as audio file**

### Method 3: Real Sound Recording
1. **Use smartphone microphone**
2. **Record actual sounds**:
   - Clicking pens for bark beetle
   - Buzzing electronics for aphid
   - Crunching paper for caterpillar
   - High-pitched whistling for grasshopper
3. **Keep recording 10-30 seconds**
4. **Ensure clear audio quality**

## 🧪 Testing Protocol

### Step 1: Prepare Test Audio
1. **Create 5 audio files**:
   - `bark-beetle-test.wav` (3 kHz tone)
   - `aphid-test.wav` (2 kHz tone)
   - `caterpillar-test.wav` (1 kHz tone)
   - `grasshopper-test.wav` (5 kHz tone)
   - `healthy-field-test.wav` (0.5 kHz tone)

### Step 2: Upload to System
1. **Start Agri-Acoustic Sentinel**:
   ```bash
   npm run dev
   ```
2. **Open dashboard**: `http://localhost:3000`
3. **Go to Audio Upload tab**
4. **Upload each test file**
5. **Select different microphone locations**

### Step 3: Analyze Results
**Expected Results**:

#### Bark Beetle Test (3 kHz):
- **Confidence**: 70-90%
- **kHz Range**: 2.0-4.0 kHz
- **Pest Type**: Bark Beetle detected
- **Severity**: High

#### Aphid Test (2 kHz):
- **Confidence**: 60-80%
- **kHz Range**: 1.2-3.2 kHz
- **Pest Type**: Aphid detected
- **Severity**: Medium

#### Caterpillar Test (1 kHz):
- **Confidence**: 50-70%
- **kHz Range**: 0.5-2.0 kHz
- **Pest Type**: Caterpillar detected
- **Severity**: Low-Medium

#### Grasshopper Test (5 kHz):
- **Confidence**: 80-95%
- **kHz Range**: 3.0-8.0 kHz
- **Pest Type**: Grasshopper detected
- **Severity**: High

#### Healthy Field Test (0.5 kHz):
- **Confidence**: 10-30%
- **kHz Range**: 0.1-1.5 kHz
- **Pest Type**: None detected
- **Status**: ✅ Healthy

## 🔬 Scientific Basis

### Frequency Analysis
- **Bark Beetles**: Create clicking sounds through stridulation (2-4 kHz)
- **Aphids**: Wing beats and body vibrations (1-3 kHz)
- **Caterpillars**: Chewing creates low-frequency sounds (0.5-2 kHz)
- **Grasshoppers**: Stridulation produces high-pitched chirps (3-8 kHz)

### Amplitude Thresholds
- **High Amplitude**: Grasshoppers, Bark Beetles (easily detected)
- **Medium Amplitude**: Aphids (moderate detection)
- **Low Amplitude**: Caterpillars (requires sensitive detection)

### Pattern Recognition
- **Rhythmic**: Bark Beetles, Grasshoppers (regular patterns)
- **Irregular**: Aphids (variable buzzing)
- **Continuous**: Caterpillars (steady chewing)
- **Random**: Healthy ecosystem (natural variation)

## 🎵 Demo Audio Creation Tools

### Free Tone Generators:
1. **Online**: onlinetonegenerator.com
2. **Mobile Apps**: Tone Generator, Frequency Generator
3. **Desktop**: Audacity (free audio editor)

### Recording Tips:
1. **Use good microphone** (smartphone works)
2. **Record in quiet environment**
3. **Keep duration 10-30 seconds**
4. **Export as WAV format** (best quality)
5. **Test different frequencies** within each range

## 🚀 Quick Demo Setup

1. **Create test audio files** using tone generator
2. **Start the system**: `npm run dev`
3. **Upload each file** to Audio Upload tab
4. **Compare results** with expected thresholds
5. **Demonstrate** how different frequencies trigger different pest detections

This system transforms complex bioacoustic analysis into an intuitive, kHz-based detection system that you can easily demonstrate with simple audio files! 🎯🎵
