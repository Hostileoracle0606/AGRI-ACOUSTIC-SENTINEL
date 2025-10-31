const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const Replicate = require('replicate');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
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

// In-memory storage for demonstration (in production, use a database)
let fieldData = {
  baseline: {},
  currentReadings: {
    // Sample current readings to demonstrate different field map flags and colors
    1: {
      timestamp: new Date().toISOString(),
      confidence: 0.85,
      pestTypes: [
        {
          type: 'bark_beetle',
          confidence: 0.82,
          severity: 0.78,
          description: 'Wood-boring clicks at 3.1 kHz'
        }
      ],
      acousticFeatures: {
        frequency: 3100,
        amplitude: 0.42,
        spectralCentroid: 2850,
        zeroCrossingRate: 0.28
      },
      baselineDeviation: 0.25,
      status: 'alert' // Red - Critical pest detection
    },
    2: {
      timestamp: new Date().toISOString(),
      confidence: 0.55,
      pestTypes: [],
      acousticFeatures: {
        frequency: 1800,
        amplitude: 0.35,
        spectralCentroid: 1650,
        zeroCrossingRate: 0.18
      },
      baselineDeviation: 0.15,
      status: 'warning' // Yellow - Elevated activity, no pests yet
    },
    3: {
      timestamp: new Date().toISOString(),
      confidence: 0.72,
      pestTypes: [
        {
          type: 'aphid',
          confidence: 0.68,
          severity: 0.65,
          description: 'Wing beats at 2.2 kHz'
        },
        {
          type: 'caterpillar',
          confidence: 0.55,
          severity: 0.52,
          description: 'Chewing sounds at 1.3 kHz'
        }
      ],
      acousticFeatures: {
        frequency: 2200,
        amplitude: 0.38,
        spectralCentroid: 1950,
        zeroCrossingRate: 0.22
      },
      baselineDeviation: 0.18,
      status: 'alert' // Red - Multiple pests detected
    },
    4: {
      timestamp: new Date().toISOString(),
      confidence: 0.15,
      pestTypes: [],
      acousticFeatures: {
        frequency: 1200,
        amplitude: 0.12,
        spectralCentroid: 1100,
        zeroCrossingRate: 0.08
      },
      baselineDeviation: 0.03,
      status: 'healthy' // Green - Normal baseline, healthy
    }
  },
  alerts: [
    // Sample alerts for demonstration
    {
      id: 'sample-alert-1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      microphoneId: 3,
      severity: 0.85,
      confidence: 0.92,
      pestTypes: [
        {
          type: 'bark_beetle',
          confidence: 0.88,
          severity: 0.85,
          description: 'Wood-boring clicks detected at 3.2 kHz'
        },
        {
          type: 'aphid',
          confidence: 0.76,
          severity: 0.72,
          description: 'Wing beat patterns at 2.1 kHz'
        }
      ],
      location: {
        lat: 40.7126,
        lng: -74.0058
      }
    },
    {
      id: 'sample-alert-2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      microphoneId: 1,
      severity: 0.68,
      confidence: 0.74,
      pestTypes: [
        {
          type: 'caterpillar',
          confidence: 0.71,
          severity: 0.68,
          description: 'Leaf chewing sounds at 1.5 kHz'
        }
      ],
      location: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    {
      id: 'sample-alert-3',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      microphoneId: 4,
      severity: 0.45,
      confidence: 0.52,
      pestTypes: [
        {
          type: 'grasshopper',
          confidence: 0.49,
          severity: 0.45,
          description: 'Stridulation chirps at 5.8 kHz'
        }
      ],
      location: {
        lat: 40.7128,
        lng: -74.0056
      }
    },
    {
      id: 'sample-alert-4',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      microphoneId: 2,
      severity: 0.91,
      confidence: 0.94,
      pestTypes: [
        {
          type: 'bark_beetle',
          confidence: 0.91,
          severity: 0.89,
          description: 'Multiple clicking patterns at 3.5 kHz'
        }
      ],
      location: {
        lat: 40.7130,
        lng: -74.0058
      }
    },
    {
      id: 'sample-alert-5',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      microphoneId: 1,
      severity: 0.58,
      confidence: 0.63,
      pestTypes: [
        {
          type: 'aphid',
          confidence: 0.61,
          severity: 0.58,
          description: 'Buzzing activity at 2.3 kHz'
        },
        {
          type: 'caterpillar',
          confidence: 0.55,
          severity: 0.52,
          description: 'Chewing sounds at 1.2 kHz'
        }
      ],
      location: {
        lat: 40.7128,
        lng: -74.0060
      }
    }
  ],
  fieldLayout: {
    microphones: [
      { id: 1, lat: 40.7128, lng: -74.0060, status: 'active' },
      { id: 2, lat: 40.7130, lng: -74.0058, status: 'active' },
      { id: 3, lat: 40.7126, lng: -74.0058, status: 'active' },
      { id: 4, lat: 40.7128, lng: -74.0056, status: 'active' }
    ],
    fieldBounds: {
      north: 40.7140,
      south: 40.7120,
      east: -74.0050,
      west: -74.0070
    }
  }
};

// Bioacoustic analysis using Replicate API with fallback
async function analyzeBioacoustics(audioFilePath) {
  try {
    console.log('Analyzing bioacoustics for:', audioFilePath);
    
    // Try to use real Replicate model first
    const { analyzeWithAudioClassifier } = require('./replicate-integration');
    return await analyzeWithAudioClassifier(audioFilePath);
    
  } catch (error) {
    console.error('Replicate API failed, using fallback analysis:', error.message);
    
    // Fallback: Use simulated analysis with realistic data
    return generateFallbackAnalysis(audioFilePath);
  }
}

    // Fallback analysis function
    function generateFallbackAnalysis(audioFilePath) {
      console.log('Using fallback analysis for:', audioFilePath);

      // Generate realistic acoustic features
      const acousticFeatures = {
        frequency: Math.random() * 2000 + 1000,
        amplitude: Math.random() * 0.5 + 0.1,
        spectralCentroid: Math.random() * 1000 + 500,
        zeroCrossingRate: Math.random() * 0.3 + 0.1
      };

      const analysisResult = {
        timestamp: new Date().toISOString(),
        confidence: Math.random() * 0.3 + 0.1,
        pestTypes: [],
        acousticFeatures: acousticFeatures,
        baselineDeviation: Math.random() * 0.2 + 0.05,
        transcription: "Audio analysis completed successfully",
        modelUsed: "ImageBind (Simulated)"
      };

  // Simulate pest detection (15% chance for demo)
  if (Math.random() < 0.15) {
    const pestTypes = ['bark_beetle', 'aphid', 'caterpillar', 'grasshopper'];
    const detectedPest = pestTypes[Math.floor(Math.random() * pestTypes.length)];
    
    analysisResult.pestTypes.push({
      type: detectedPest,
      confidence: Math.random() * 0.4 + 0.6,
      severity: Math.random() * 0.8 + 0.2,
      description: getPestDescription(detectedPest)
    });
    
    analysisResult.confidence = Math.random() * 0.3 + 0.7;
    analysisResult.baselineDeviation = Math.random() * 0.4 + 0.3;
  }

  return analysisResult;
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
    const audioFilePath = req.file.path;

    // Analyze the audio
    const analysis = await analyzeBioacoustics(audioFilePath);

    // Store the analysis result
    fieldData.currentReadings[microphoneId] = {
      ...analysis,
      microphoneId,
      audioFile: req.file.filename,
      location: fieldData.fieldLayout.microphones.find(m => m.id == microphoneId)
    };

    // Check for alerts
    if (analysis.pestTypes.length > 0) {
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

    // Emit real-time update
    io.emit('fieldUpdate', fieldData.currentReadings);

    res.json({
      success: true,
      analysis,
      microphoneId
    });

  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Error processing audio file' });
  }
});

app.get('/api/field-data', (req, res) => {
  res.json(fieldData);
});

app.get('/api/microphones', (req, res) => {
  res.json(fieldData.fieldLayout.microphones);
});

app.get('/api/alerts', (req, res) => {
  res.json(fieldData.alerts);
});

app.post('/api/establish-baseline', (req, res) => {
  const { microphoneId, duration } = req.body;
  
  // Simulate baseline establishment
  const baseline = {
    microphoneId,
    establishedAt: new Date().toISOString(),
    duration: duration || 168, // 1 week in hours
    acousticProfile: {
      averageFrequency: Math.random() * 1500 + 800,
      averageAmplitude: Math.random() * 0.3 + 0.1,
      spectralCentroid: Math.random() * 800 + 400,
      zeroCrossingRate: Math.random() * 0.2 + 0.05
    }
  };

  fieldData.baseline[microphoneId] = baseline;
  
  res.json({
    success: true,
    baseline
  });
});

// Simulate periodic audio collection
cron.schedule('*/30 * * * * *', () => {
  // Simulate audio collection from microphones every 30 seconds
  const microphoneId = Math.floor(Math.random() * 4) + 1;
  
  // Simulate analysis without actual audio file
  const mockAnalysis = {
    timestamp: new Date().toISOString(),
    confidence: Math.random() * 0.2 + 0.05,
    pestTypes: [],
    acousticFeatures: {
      frequency: Math.random() * 2000 + 1000,
      amplitude: Math.random() * 0.5 + 0.1,
      spectralCentroid: Math.random() * 1000 + 500,
      zeroCrossingRate: Math.random() * 0.3 + 0.1
    },
    baselineDeviation: Math.random() * 0.15 + 0.02
  };

  // Occasional pest detection simulation
  if (Math.random() < 0.05) { // 5% chance
    const pestTypes = ['bark_beetle', 'aphid', 'caterpillar'];
    const detectedPest = pestTypes[Math.floor(Math.random() * pestTypes.length)];
    
    mockAnalysis.pestTypes.push({
      type: detectedPest,
      confidence: Math.random() * 0.3 + 0.7,
      severity: Math.random() * 0.6 + 0.4
    });
    
    mockAnalysis.confidence = Math.random() * 0.2 + 0.8;
    mockAnalysis.baselineDeviation = Math.random() * 0.3 + 0.2;

    // Create alert
    const alert = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      microphoneId,
      pestTypes: mockAnalysis.pestTypes,
      severity: Math.max(...mockAnalysis.pestTypes.map(p => p.severity)),
      location: fieldData.fieldLayout.microphones.find(m => m.id == microphoneId),
      confidence: mockAnalysis.confidence
    };

    fieldData.alerts.unshift(alert);
    if (fieldData.alerts.length > 50) {
      fieldData.alerts = fieldData.alerts.slice(0, 50);
    }

    io.emit('newAlert', alert);
  }

  fieldData.currentReadings[microphoneId] = {
    ...mockAnalysis,
    microphoneId,
    location: fieldData.fieldLayout.microphones.find(m => m.id == microphoneId)
  };

  io.emit('fieldUpdate', fieldData.currentReadings);
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Agri-Acoustic Sentinel server running on port ${PORT}`);
});
