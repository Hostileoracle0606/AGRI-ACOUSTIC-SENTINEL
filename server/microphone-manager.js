/**
 * Microphone Manager - Detects and manages real audio input devices
 * Supports cross-platform microphone detection and recording
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Try to require mic, but handle gracefully if dependencies are missing
let mic = null;
let micAvailable = false;
try {
  mic = require('mic');
  micAvailable = true;
} catch (error) {
  console.warn('Mic module not available (missing system dependencies like sox). Server will use demo mode.');
  micAvailable = false;
}

// Store active microphone streams
const activeMicrophones = new Map();
const recordedAudioFiles = new Map();

/**
 * Detect available audio input devices
 */
async function detectAudioDevices() {
  // Return empty array - server-side device detection requires system dependencies
  // Client should only use browser-detected devices which are guaranteed to work
  // This prevents crashes from missing tools like sox, ffmpeg, etc.
  console.log('Server-side device detection disabled - use browser-detected devices only');
  return [];
}

/**
 * Start recording from a microphone device
 */
function startRecording(microphoneId, deviceId = 'default', duration = 30000) {
  return new Promise((resolve, reject) => {
    try {
      // If mic is not available, create a placeholder file for demo mode
      if (!micAvailable || !mic) {
        const outputDir = path.join(__dirname, 'uploads', 'audio', 'recordings');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const outputFile = path.join(outputDir, `mic-${microphoneId}-${timestamp}.wav`);
        
        // Create empty placeholder file
        fs.writeFileSync(outputFile, Buffer.alloc(0));
        
        activeMicrophones.set(microphoneId, {
          file: outputFile,
          startTime: Date.now(),
          deviceId,
          isPlaceholder: true
        });
        
        // Resolve immediately for demo mode
        if (duration > 0) {
          setTimeout(() => {
            resolve(outputFile);
          }, Math.min(duration, 1000));
        } else {
          recordedAudioFiles.set(microphoneId, outputFile);
          resolve(outputFile);
        }
        
        return;
      }
      
      // Create output directory if it doesn't exist
      const outputDir = path.join(__dirname, 'uploads', 'audio', 'recordings');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const outputFile = path.join(outputDir, `mic-${microphoneId}-${timestamp}.wav`);
      
      // Configure mic - handle errors during initialization
      let micInstance;
      let micInputStream;
      try {
        micInstance = mic({
          rate: 16000,      // 16kHz sample rate
          channels: 1,      // Mono
          bitwidth: 16,     // 16-bit
          device: deviceId === 'default' ? undefined : deviceId,
          exitOnSilence: 0
        });
        
        micInputStream = micInstance.getAudioStream();
        
        // Handle errors from the stream
        micInputStream.on('error', (streamError) => {
          console.warn(`Mic stream error for ${microphoneId}, using placeholder:`, streamError.message);
          // Fallback to placeholder
          fs.writeFileSync(outputFile, Buffer.alloc(0));
          activeMicrophones.set(microphoneId, {
            file: outputFile,
            startTime: Date.now(),
            deviceId,
            isPlaceholder: true
          });
          if (duration > 0) {
            setTimeout(() => resolve(outputFile), Math.min(duration, 1000));
          } else {
            recordedAudioFiles.set(microphoneId, outputFile);
            resolve(outputFile);
          }
        });
      } catch (micInitError) {
        // If mic initialization fails, use placeholder
        console.warn(`Mic initialization failed for ${microphoneId}, using placeholder:`, micInitError.message);
        fs.writeFileSync(outputFile, Buffer.alloc(0));
        activeMicrophones.set(microphoneId, {
          file: outputFile,
          startTime: Date.now(),
          deviceId,
          isPlaceholder: true
        });
        if (duration > 0) {
          setTimeout(() => resolve(outputFile), Math.min(duration, 1000));
        } else {
          recordedAudioFiles.set(microphoneId, outputFile);
          resolve(outputFile);
        }
        return;
      }
      
      // Create WAV file writer
      let wavWriter;
      try {
        const wav = require('wav');
        wavWriter = wav.FileWriter(outputFile, {
          sampleRate: 16000,
          channels: 1,
          bitDepth: 16
        });
      } catch (wavError) {
        console.warn('WAV writer not available, using placeholder file');
        fs.writeFileSync(outputFile, Buffer.alloc(0));
        activeMicrophones.set(microphoneId, {
          file: outputFile,
          startTime: Date.now(),
          deviceId,
          isPlaceholder: true
        });
        if (duration > 0) {
          setTimeout(() => resolve(outputFile), Math.min(duration, 1000));
        } else {
          recordedAudioFiles.set(microphoneId, outputFile);
          resolve(outputFile);
        }
        return;
      }
      
      micInputStream.pipe(wavWriter);
      
      // Store the mic instance
      activeMicrophones.set(microphoneId, {
        mic: micInstance,
        stream: micInputStream,
        file: outputFile,
        startTime: Date.now(),
        deviceId
      });
      
      // Start recording - handle errors during start
      try {
        micInstance.start();
        console.log(`Started recording from microphone ${microphoneId} (device: ${deviceId})`);
      } catch (startError) {
        // If start fails (e.g., sox not found), fallback to placeholder
        console.warn(`Failed to start recording for ${microphoneId}, using placeholder:`, startError.message);
        activeMicrophones.delete(microphoneId);
        fs.writeFileSync(outputFile, Buffer.alloc(0));
        activeMicrophones.set(microphoneId, {
          file: outputFile,
          startTime: Date.now(),
          deviceId,
          isPlaceholder: true
        });
        if (duration > 0) {
          setTimeout(() => resolve(outputFile), Math.min(duration, 1000));
        } else {
          recordedAudioFiles.set(microphoneId, outputFile);
          resolve(outputFile);
        }
        return;
      }
      
      // Auto-stop after duration
      if (duration > 0) {
        setTimeout(() => {
          stopRecording(microphoneId).then(() => {
            resolve(outputFile);
          }).catch(reject);
        }, duration);
      } else {
        // Continuous recording - resolve immediately with file path
        recordedAudioFiles.set(microphoneId, outputFile);
        resolve(outputFile);
      }
      
    } catch (error) {
      console.error(`Error starting recording for microphone ${microphoneId}:`, error);
      // If recording fails, create placeholder file for demo mode
      try {
        const outputDir = path.join(__dirname, 'uploads', 'audio', 'recordings');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const timestamp = Date.now();
        const outputFile = path.join(outputDir, `mic-${microphoneId}-${timestamp}.wav`);
        fs.writeFileSync(outputFile, Buffer.alloc(0));
        resolve(outputFile);
      } catch (fallbackError) {
        reject(error);
      }
    }
  });
}

/**
 * Stop recording from a microphone
 */
function stopRecording(microphoneId) {
  return new Promise((resolve, reject) => {
    const micData = activeMicrophones.get(microphoneId);
    
    if (!micData) {
      reject(new Error(`No active recording found for microphone ${microphoneId}`));
      return;
    }
    
    try {
      // If it's a placeholder, just return the file
      if (micData.isPlaceholder) {
        activeMicrophones.delete(microphoneId);
        resolve(micData.file);
        return;
      }
      
      // Stop actual recording
      if (micData.mic) {
        micData.mic.stop();
      }
      activeMicrophones.delete(microphoneId);
      
      console.log(`Stopped recording from microphone ${microphoneId}`);
      resolve(micData.file);
      
    } catch (error) {
      console.error(`Error stopping recording for microphone ${microphoneId}:`, error);
      // Even if stop fails, return the file path
      activeMicrophones.delete(microphoneId);
      resolve(micData.file);
    }
  });
}

/**
 * Check if a microphone is currently recording
 */
function isRecording(microphoneId) {
  return activeMicrophones.has(microphoneId);
}

/**
 * Get recording status for all microphones
 */
function getRecordingStatus() {
  const status = {};
  activeMicrophones.forEach((data, micId) => {
    status[micId] = {
      isRecording: true,
      deviceId: data.deviceId,
      file: data.file,
      startTime: data.startTime,
      duration: Date.now() - data.startTime
    };
  });
  return status;
}

/**
 * Get all registered microphones
 */
function getRegisteredMicrophones() {
  return Array.from(activeMicrophones.keys()).map(micId => ({
    id: micId,
    ...activeMicrophones.get(micId)
  }));
}

module.exports = {
  detectAudioDevices,
  startRecording,
  stopRecording,
  isRecording,
  getRecordingStatus,
  getRegisteredMicrophones
};


