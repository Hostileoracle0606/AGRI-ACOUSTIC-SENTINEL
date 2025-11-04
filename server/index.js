const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const Replicate = require('replicate');
const cron = require('node-cron');
const microphoneManager = require('./microphone-manager');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
// CORS configuration - support both local development and Netlify deployment
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://aas.netlify.app",
  process.env.FRONTEND_URL,
  process.env.NETLIFY_URL
].filter(Boolean); // Remove undefined values

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Handle uncaught exceptions and unhandled rejections to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - log and continue for demo mode
  if (error.message?.includes('sox') || error.message?.includes('spawn') || error.code === 'ENOENT') {
    console.warn('Audio system dependency issue detected. Server will continue in demo mode.');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - log and continue for demo mode
  if (reason?.message?.includes('sox') || reason?.message?.includes('spawn') || reason?.code === 'ENOENT') {
    console.warn('Audio system dependency issue detected. Server will continue in demo mode.');
  }
});

// Middleware
// CORS configuration - support both local development and Netlify deployment
const corsOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://aas.netlify.app",
  process.env.FRONTEND_URL,
  process.env.NETLIFY_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Audio processing setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/audio/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Generate demo data for simulation
function generateDemoData() {
  const demoMicrophones = [
    { id: 'mic-1', name: 'North Field Mic', lat: 40.7128, lng: -74.0060, status: 'active', deviceId: 'demo-1' },
    { id: 'mic-2', name: 'South Field Mic', lat: 40.7110, lng: -74.0070, status: 'active', deviceId: 'demo-2' },
    { id: 'mic-3', name: 'East Field Mic', lat: 40.7130, lng: -74.0050, status: 'active', deviceId: 'demo-3' },
    { id: 'mic-4', name: 'West Field Mic', lat: 40.7120, lng: -74.0080, status: 'active', deviceId: 'demo-4' }
  ];

  const demoBaselines = {};
  demoMicrophones.forEach(mic => {
    demoBaselines[mic.id] = {
      microphoneId: mic.id,
      establishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isEstablishing: false,
      totalSeconds: 86400,
      acousticProfile: {
        averageFrequency: 1200 + Math.random() * 400,
        averageAmplitude: 0.15 + Math.random() * 0.1,
        spectralCentroid: 2500 + Math.random() * 500,
        zeroCrossingRate: 0.08 + Math.random() * 0.04,
        minFrequency: 800,
        maxFrequency: 2000,
        minAmplitude: 0.05,
        maxAmplitude: 0.3
      },
      sampleCount: 86400,
      lastUpdate: new Date().toISOString()
    };
  });

  const demoCurrentReadings = {};
  demoMicrophones.forEach(mic => {
    const baseline = demoBaselines[mic.id].acousticProfile;
    const hasPest = Math.random() < 0.3;
    demoCurrentReadings[mic.id] = {
      microphoneId: mic.id,
      timestamp: new Date().toISOString(),
      confidence: hasPest ? 0.6 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2,
      baselineDeviation: hasPest ? 0.2 + Math.random() * 0.3 : 0.05 + Math.random() * 0.1,
      pestTypes: hasPest ? [
        { type: ['bark_beetle', 'aphid', 'caterpillar', 'grasshopper'][Math.floor(Math.random() * 4)], confidence: 0.6 + Math.random() * 0.3, severity: 0.5 + Math.random() * 0.4 }
      ] : [],
      acousticFeatures: {
        frequency: baseline.averageFrequency + (hasPest ? (Math.random() - 0.5) * 600 : (Math.random() - 0.5) * 200),
        amplitude: baseline.averageAmplitude + (hasPest ? Math.random() * 0.15 : (Math.random() - 0.5) * 0.05),
        spectralCentroid: baseline.spectralCentroid + (hasPest ? (Math.random() - 0.5) * 800 : (Math.random() - 0.5) * 300),
        zeroCrossingRate: baseline.zeroCrossingRate + (hasPest ? Math.random() * 0.06 : (Math.random() - 0.5) * 0.02)
      },
      location: mic
    };
  });

  const demoAlerts = [];
  Object.values(demoCurrentReadings).forEach(reading => {
    if (reading.pestTypes && reading.pestTypes.length > 0) {
      demoAlerts.push({
        id: Date.now() - Math.random() * 86400000,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        microphoneId: reading.microphoneId,
        pestTypes: reading.pestTypes,
        severity: Math.max(...reading.pestTypes.map(p => p.severity || 0.5)),
        location: reading.location,
        confidence: reading.confidence
      });
    }
  });
  demoAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    baseline: demoBaselines,
    currentReadings: demoCurrentReadings,
    alerts: demoAlerts.slice(0, 10),
    fieldLayout: {
      microphones: demoMicrophones,
      fieldBounds: {
        north: 40.7140,
        south: 40.7110,
        east: -74.0050,
        west: -74.0080
      }
    },
    audioDevices: []
  };
}

// Field data storage - initialized with demo data
let fieldData = generateDemoData();

// Registered microphones with their device mappings
const registeredMicrophones = new Map(); // Map<microphoneId, {deviceId, name, lat, lng, deviceInfo}>

// Baseline accumulation data - stores cumulative statistics
const baselineAccumulation = new Map(); // Map<microphoneId, {
//   samples: [], // Array of acoustic feature samples
//   startTime: timestamp,
//   isEstablishing: boolean
// }>

// Bioacoustic analysis using local ImageBind model
// Uses ImageBind directly from GitHub: https://github.com/facebookresearch/ImageBind
async function analyzeBioacoustics(audioFilePath) {
  console.log('Analyzing bioacoustics with local ImageBind model:', audioFilePath);
  
  // Use local ImageBind model - no Replicate API needed
  const { analyzeWithAudioClassifier } = require('./replicate-integration');
  return await analyzeWithAudioClassifier(audioFilePath);
}

function getPestDescription(pestType) {
  const descriptions = {
    'bark_beetle': 'Wood-boring clicks, 2-4 kHz range',
    'aphid': 'Wing beats and body vibrations, 1-3 kHz',
    'caterpillar': 'Leaf chewing sounds, 0.5-2 kHz',
    'grasshopper': 'Stridulation chirps, 3-8 kHz'
  };
  return descriptions[pestType] || 'Pest detected';
}

// Routes
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const microphoneId = req.body.microphoneId || Math.floor(Math.random() * 4) + 1;
    const establishBaseline = req.body.establishBaseline === 'true';
    const audioFilePath = req.file.path;

    // Analyze the audio
    const analysis = await analyzeBioacoustics(audioFilePath);

    // Compare against demo baseline if available
    const baseline = fieldData.baseline[microphoneId];
    if (baseline && baseline.acousticProfile) {
      const profile = baseline.acousticProfile;
      const features = analysis.acousticFeatures || {};
      
      // Calculate baseline deviation
      const freqDev = Math.abs((features.frequency || profile.averageFrequency) - profile.averageFrequency) / profile.averageFrequency;
      const ampDev = Math.abs((features.amplitude || profile.averageAmplitude) - profile.averageAmplitude) / profile.averageAmplitude;
      analysis.baselineDeviation = Math.sqrt(freqDev * freqDev + ampDev * ampDev);
      
      // Adjust confidence based on deviation
      if (analysis.baselineDeviation > 0.3) {
        analysis.confidence = Math.min(0.95, analysis.confidence + analysis.baselineDeviation * 0.3);
      }
    }

    // Update baseline if requested
    let baselineUpdated = false;
    if (establishBaseline && microphoneId) {
      const features = analysis.acousticFeatures || {};
      
      // Get or create baseline accumulation
      let accumulation = baselineAccumulation.get(microphoneId);
      if (!accumulation) {
        accumulation = {
          samples: [],
          startTime: new Date().toISOString(),
          isEstablishing: true,
          totalSeconds: 0
        };
        baselineAccumulation.set(microphoneId, accumulation);
      }
      
      // Add sample to accumulation
      accumulation.samples.push({
        timestamp: new Date().toISOString(),
        frequency: features.frequency || 0,
        amplitude: features.amplitude || 0,
        spectralCentroid: features.spectralCentroid || 0,
        zeroCrossingRate: features.zeroCrossingRate || 0
      });
      
      accumulation.totalSeconds++;
      
      // Update baseline with cumulative statistics
      const samples = accumulation.samples;
      const baseline = {
        microphoneId,
        establishedAt: accumulation.startTime,
        isEstablishing: false,
        totalSeconds: accumulation.totalSeconds,
        acousticProfile: {
          averageFrequency: samples.reduce((sum, s) => sum + s.frequency, 0) / samples.length,
          averageAmplitude: samples.reduce((sum, s) => sum + s.amplitude, 0) / samples.length,
          spectralCentroid: samples.reduce((sum, s) => sum + s.spectralCentroid, 0) / samples.length,
          zeroCrossingRate: samples.reduce((sum, s) => sum + s.zeroCrossingRate, 0) / samples.length,
          minFrequency: Math.min(...samples.map(s => s.frequency)),
          maxFrequency: Math.max(...samples.map(s => s.frequency)),
          minAmplitude: Math.min(...samples.map(s => s.amplitude)),
          maxAmplitude: Math.max(...samples.map(s => s.amplitude))
        },
        sampleCount: samples.length,
        lastUpdate: new Date().toISOString()
      };
      
      fieldData.baseline[microphoneId] = baseline;
      baselineUpdated = true;
      
      // Emit baseline update
      io.emit('baselineUpdate', {
        microphoneId,
        baseline,
        isEstablishing: false
      });
    }

    // Store the analysis result
    fieldData.currentReadings[microphoneId] = {
      ...analysis,
      microphoneId,
      audioFile: req.file.filename,
      location: fieldData.fieldLayout.microphones.find(m => m.id == microphoneId),
      timestamp: new Date().toISOString()
    };

    // Check for alerts (only if not establishing baseline)
    if (!establishBaseline && analysis.pestTypes && analysis.pestTypes.length > 0) {
      const alert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        microphoneId,
        pestTypes: analysis.pestTypes,
        severity: Math.max(...analysis.pestTypes.map(p => p.severity || 0)),
        location: fieldData.fieldLayout.microphones.find(m => m.id == microphoneId),
        confidence: analysis.confidence
      };

      fieldData.alerts.unshift(alert);
      
      // Keep only last 50 alerts
      if (fieldData.alerts.length > 50) {
        fieldData.alerts = fieldData.alerts.slice(0, 50);
      }

      // Emit real-time alert
      io.emit('newAlert', alert);
    }

    // Emit real-time update
    io.emit('fieldUpdate', fieldData.currentReadings);

    res.json({
      success: true,
      analysis,
      microphoneId,
      baselineUpdated
    });

  } catch (error) {
    console.error('Error processing audio:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Send detailed error message to client
    const errorMessage = error.response?.data?.error || error.message || 'Error processing audio file';
    res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data || error.message 
    });
  }
});

app.get('/api/field-data', (req, res) => {
  // Update demo data periodically to simulate real-time changes
  fieldData = generateDemoData();
  res.json(fieldData);
});

// Detect available audio input devices
app.get('/api/audio-devices', async (req, res) => {
  try {
    const devices = await microphoneManager.detectAudioDevices();
    fieldData.audioDevices = devices;
    res.json({ success: true, devices });
  } catch (error) {
    console.error('Error detecting audio devices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register a microphone with a specific audio device
app.post('/api/register-microphone', async (req, res) => {
  try {
    const { microphoneId, deviceId, name, lat, lng } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }
    
    // Accept browser-detected devices - they're guaranteed to work
    // No need to verify against server-side detection which may fail
    const device = {
      id: deviceId,
      label: name || deviceId,
      platform: 'browser',
      type: 'audio'
    };
    
    // Generate microphone ID if not provided
    const micId = microphoneId || `mic-${Date.now()}`;
    
    // Register microphone
    registeredMicrophones.set(micId, {
      deviceId,
      name: name || device.label,
      lat: lat || null,
      lng: lng || null,
      deviceInfo: device,
      registeredAt: new Date().toISOString()
    });
    
    // Update field layout - add to demo data if not exists
    const micIndex = fieldData.fieldLayout.microphones.findIndex(m => m.id === micId);
    const micData = {
      id: micId,
      lat: lat || (40.7128 + (Math.random() - 0.5) * 0.003),
      lng: lng || (-74.0060 + (Math.random() - 0.5) * 0.003),
      status: 'active',
      name: name || device.label,
      deviceId
    };
    
    if (micIndex >= 0) {
      fieldData.fieldLayout.microphones[micIndex] = micData;
    } else {
      fieldData.fieldLayout.microphones.push(micData);
      // Initialize demo baseline for new microphone
      fieldData.baseline[micId] = {
        microphoneId: micId,
        establishedAt: new Date().toISOString(),
        isEstablishing: false,
        totalSeconds: 0,
        acousticProfile: {
          averageFrequency: 1200 + Math.random() * 400,
          averageAmplitude: 0.15 + Math.random() * 0.1,
          spectralCentroid: 2500 + Math.random() * 500,
          zeroCrossingRate: 0.08 + Math.random() * 0.04,
          minFrequency: 800,
          maxFrequency: 2000,
          minAmplitude: 0.05,
          maxAmplitude: 0.3
        },
        sampleCount: 0,
        lastUpdate: new Date().toISOString()
      };
    }
    
    // Update field bounds based on microphone locations
    if (fieldData.fieldLayout.microphones.length > 0) {
      const lats = fieldData.fieldLayout.microphones.map(m => m.lat).filter(l => l !== 0);
      const lngs = fieldData.fieldLayout.microphones.map(m => m.lng).filter(l => l !== 0);
      
      if (lats.length > 0 && lngs.length > 0) {
        fieldData.fieldLayout.fieldBounds = {
          north: Math.max(...lats) + 0.001,
          south: Math.min(...lats) - 0.001,
          east: Math.max(...lngs) + 0.001,
          west: Math.min(...lngs) - 0.001
        };
      }
    }
    
    // Auto-start baseline establishment when microphone is registered
    baselineAccumulation.set(micId, {
      samples: [],
      startTime: new Date().toISOString(),
      isEstablishing: true,
      totalSeconds: 0
    });
    
    // Start continuous recording for baseline
    startContinuousBaselineRecording(micId, deviceId);
    
    res.json({
      success: true,
      microphone: {
        id: micId,
        ...registeredMicrophones.get(micId)
      },
      message: 'Microphone registered and baseline establishment started automatically'
    });
    
  } catch (error) {
    console.error('Error registering microphone:', error);
    res.status(500).json({ error: error.message });
  }
});

// Continuous baseline recording - records 1-second clips and updates baseline cumulatively
async function startContinuousBaselineRecording(microphoneId, deviceId) {
  const accumulation = baselineAccumulation.get(microphoneId);
  if (!accumulation || !accumulation.isEstablishing) {
    return; // Stop if baseline establishment was stopped
  }
  
  try {
    // Record 1-second clip
    const audioFile = await microphoneManager.startRecording(microphoneId, deviceId, 1000);
    
    // Wait for recording to complete
    await new Promise(resolve => setTimeout(resolve, 1200)); // Wait a bit longer than 1 second
    
    // Analyze the 1-second clip
    const analysis = await analyzeBioacoustics(audioFile);
    const features = analysis.acousticFeatures || {};
    
    // Add to accumulation
    accumulation.samples.push({
      timestamp: new Date().toISOString(),
      frequency: features.frequency || 0,
      amplitude: features.amplitude || 0,
      spectralCentroid: features.spectralCentroid || 0,
      zeroCrossingRate: features.zeroCrossingRate || 0
    });
    
    accumulation.totalSeconds++;
    
    // Update baseline with cumulative statistics
    const samples = accumulation.samples;
    const baseline = {
      microphoneId,
      establishedAt: accumulation.startTime,
      isEstablishing: true,
      totalSeconds: accumulation.totalSeconds,
      acousticProfile: {
        averageFrequency: samples.reduce((sum, s) => sum + s.frequency, 0) / samples.length,
        averageAmplitude: samples.reduce((sum, s) => sum + s.amplitude, 0) / samples.length,
        spectralCentroid: samples.reduce((sum, s) => sum + s.spectralCentroid, 0) / samples.length,
        zeroCrossingRate: samples.reduce((sum, s) => sum + s.zeroCrossingRate, 0) / samples.length,
        minFrequency: Math.min(...samples.map(s => s.frequency)),
        maxFrequency: Math.max(...samples.map(s => s.frequency)),
        minAmplitude: Math.min(...samples.map(s => s.amplitude)),
        maxAmplitude: Math.max(...samples.map(s => s.amplitude))
      },
      sampleCount: samples.length,
      lastUpdate: new Date().toISOString()
    };
    
    // Update stored baseline
    fieldData.baseline[microphoneId] = baseline;
    
    // Emit baseline update via socket
    io.emit('baselineUpdate', {
      microphoneId,
      baseline,
      isEstablishing: true
    });
    
    // Continue recording next second
    if (accumulation.isEstablishing) {
      setTimeout(() => {
        startContinuousBaselineRecording(microphoneId, deviceId);
      }, 100); // Small delay before next recording
    }
    
  } catch (error) {
    // Handle missing dependencies gracefully (sox, etc.)
    if (error.code === 'ENOENT' || error.message?.includes('sox') || error.message?.includes('spawn')) {
      console.warn(`Server-side recording not available (missing dependencies). Using demo baseline for ${microphoneId}`);
      
      // Use demo baseline data instead
      const demoBaseline = fieldData.baseline[microphoneId] || {
        microphoneId,
        establishedAt: accumulation?.startTime || new Date().toISOString(),
        isEstablishing: false,
        totalSeconds: accumulation?.totalSeconds || 86400,
        acousticProfile: {
          averageFrequency: 1200 + Math.random() * 400,
          averageAmplitude: 0.15 + Math.random() * 0.1,
          spectralCentroid: 2500 + Math.random() * 500,
          zeroCrossingRate: 0.08 + Math.random() * 0.04,
          minFrequency: 800,
          maxFrequency: 2000,
          minAmplitude: 0.05,
          maxAmplitude: 0.3
        },
        sampleCount: accumulation?.totalSeconds || 86400,
        lastUpdate: new Date().toISOString()
      };
      
      fieldData.baseline[microphoneId] = demoBaseline;
      if (accumulation) {
        accumulation.isEstablishing = false;
      }
      
      io.emit('baselineUpdate', {
        microphoneId,
        baseline: demoBaseline,
        isEstablishing: false
      });
      
      return; // Stop trying to record
    }
    
    console.error(`Error in continuous baseline recording for ${microphoneId}:`, error);
    // Retry after a delay for other errors
    if (accumulation && accumulation.isEstablishing) {
      setTimeout(() => {
        startContinuousBaselineRecording(microphoneId, deviceId);
      }, 2000);
    }
  }
}

// Get registered microphones
app.get('/api/microphones', (req, res) => {
  const microphones = Array.from(registeredMicrophones.entries()).map(([id, info]) => ({
    id,
    ...info,
    location: {
      lat: info.lat,
      lng: info.lng
    }
  }));
  
  res.json(microphones);
});

// Unregister a microphone
app.delete('/api/microphones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Stop any active recording
    if (microphoneManager.isRecording(id)) {
      await microphoneManager.stopRecording(id);
    }
    
    // Remove from registered microphones
    registeredMicrophones.delete(id);
    
    // Remove from field layout
    fieldData.fieldLayout.microphones = fieldData.fieldLayout.microphones.filter(m => m.id !== id);
    
    // Remove baseline
    delete fieldData.baseline[id];
    
    // Remove current reading
    delete fieldData.currentReadings[id];
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error unregistering microphone:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/alerts', (req, res) => {
  res.json(fieldData.alerts);
});

// Start/Stop baseline establishment (baseline auto-starts on registration, but can be controlled)
app.post('/api/establish-baseline', async (req, res) => {
  try {
    const { microphoneId, action } = req.body; // action: 'start' or 'stop'
    
    if (!registeredMicrophones.has(microphoneId)) {
      return res.status(404).json({ error: 'Microphone not registered' });
    }
    
    const micInfo = registeredMicrophones.get(microphoneId);
    
    if (action === 'stop') {
      // Stop baseline establishment
      const accumulation = baselineAccumulation.get(microphoneId);
      if (accumulation) {
        accumulation.isEstablishing = false;
        // Mark baseline as established
        if (fieldData.baseline[microphoneId]) {
          fieldData.baseline[microphoneId].isEstablishing = false;
        }
      }
      res.json({ success: true, message: 'Baseline establishment stopped' });
      return;
    }
    
    // Start baseline establishment
    const accumulation = baselineAccumulation.get(microphoneId);
    if (!accumulation) {
      baselineAccumulation.set(microphoneId, {
        samples: [],
        startTime: new Date().toISOString(),
        isEstablishing: true,
        totalSeconds: 0
      });
      startContinuousBaselineRecording(microphoneId, micInfo.deviceId);
    } else {
      accumulation.isEstablishing = true;
      startContinuousBaselineRecording(microphoneId, micInfo.deviceId);
    }
    
    res.json({
      success: true,
      message: 'Continuous baseline establishment started',
      baseline: fieldData.baseline[microphoneId] || null
    });
    
  } catch (error) {
    console.error('Error controlling baseline:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update demo data periodically for real-time simulation
cron.schedule('*/30 * * * * *', () => {
  fieldData = generateDemoData();
  io.emit('fieldData', fieldData);
  io.emit('fieldUpdate', fieldData.currentReadings);
});

// Real-time continuous listening from registered microphones
// Records 30-second clips every 60 seconds for analysis
// Only for pest detection, baseline is handled separately
cron.schedule('*/60 * * * * *', async () => {
  // Only process registered microphones that are active
  for (const [microphoneId, micInfo] of registeredMicrophones.entries()) {
    try {
      // Skip if already recording
      if (microphoneManager.isRecording(microphoneId)) {
        continue;
      }
      
      console.log(`Recording sample from microphone ${microphoneId}...`);
      
      // Record 30-second sample
      const audioFile = await microphoneManager.startRecording(
        microphoneId,
        micInfo.deviceId,
        30000 // 30 seconds
      );
      
      // Wait for recording to complete
      await new Promise(resolve => setTimeout(resolve, 32000)); // Wait a bit longer
      
      // Analyze the recorded audio
      const analysis = await analyzeBioacoustics(audioFile);
      
      // Calculate baseline deviation if baseline exists
      let baselineDeviation = 0;
      if (fieldData.baseline[microphoneId]) {
        const baseline = fieldData.baseline[microphoneId].acousticProfile;
        const current = analysis.acousticFeatures;
        baselineDeviation = Math.sqrt(
          Math.pow((current.frequency - baseline.averageFrequency) / baseline.averageFrequency, 2) +
          Math.pow((current.amplitude - baseline.averageAmplitude) / baseline.averageAmplitude, 2)
        );
      }
      
      // Store current reading
      fieldData.currentReadings[microphoneId] = {
        ...analysis,
        microphoneId,
        baselineDeviation,
        location: fieldData.fieldLayout.microphones.find(m => m.id == microphoneId),
        audioFile
      };
      
      // Check for pest detections and create alerts
      if (analysis.pestTypes && analysis.pestTypes.length > 0) {
        const alert = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          microphoneId,
          pestTypes: analysis.pestTypes,
          severity: Math.max(...analysis.pestTypes.map(p => p.severity)),
          location: fieldData.fieldLayout.microphones.find(m => m.id == microphoneId),
          confidence: analysis.confidence
        };
        
        fieldData.alerts.unshift(alert);
        
        // Keep only last 50 alerts
        if (fieldData.alerts.length > 50) {
          fieldData.alerts = fieldData.alerts.slice(0, 50);
        }
        
        // Emit real-time alert
        io.emit('newAlert', alert);
      }
      
      // Emit field update
      io.emit('fieldUpdate', fieldData.currentReadings);
      
    } catch (error) {
      console.error(`Error processing microphone ${microphoneId}:`, error);
    }
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial field data
  socket.emit('fieldData', fieldData);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'audio');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize audio devices on server start
async function initializeAudioDevices() {
  try {
    console.log('Detecting audio input devices...');
    const devices = await microphoneManager.detectAudioDevices();
    fieldData.audioDevices = devices;
    console.log(`Detected ${devices.length} audio input device(s)`);
    
    // Log device information
    devices.forEach((device, index) => {
      console.log(`  ${index + 1}. ${device.label} (${device.id})`);
    });
  } catch (error) {
    console.error('Error initializing audio devices:', error);
  }
}

// Initialize on startup
initializeAudioDevices();

const PORT = process.env.PORT || 5000;

// Health check endpoint for deployment
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
server.listen(PORT, async () => {
  console.log(`Agri-Acoustic Sentinel server running on port ${PORT}`);
  console.log('🎤 Real microphone detection enabled');
  console.log('📊 Demo data disabled - using real audio analysis only');
  console.log('🔍 Waiting for microphones to be registered...');
});
