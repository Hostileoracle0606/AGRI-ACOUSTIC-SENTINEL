/**
 * Browser microphone access utilities
 * This triggers the browser/system alert for microphone permissions
 */

/**
 * Request microphone access from the browser
 * This will trigger the system alert: "This website is trying to access your microphone"
 */
export async function requestMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1
      } 
    });
    
    // Immediately stop the stream - we just needed permission
    stream.getTracks().forEach(track => track.stop());
    
    return { 
      success: true, 
      hasPermission: true,
      message: 'Microphone access granted' 
    };
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return { 
        success: false, 
        hasPermission: false,
        error: 'Microphone access denied',
        message: 'Please allow microphone access in your browser settings'
      };
    } else if (error.name === 'NotFoundError') {
      return { 
        success: false, 
        hasPermission: false,
        error: 'No microphone found',
        message: 'No microphone device detected'
      };
    } else {
      return { 
        success: false, 
        hasPermission: false,
        error: error.message,
        message: 'Failed to access microphone'
      };
    }
  }
}

/**
 * Check if microphone permission is already granted
 */
export async function checkMicrophonePermission() {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state === 'granted';
  } catch (error) {
    // Permissions API not supported, try to request access
    return false;
  }
}

/**
 * Start continuous audio recording from browser microphone
 */
export function startBrowserRecording(onAudioData, onError) {
  let mediaRecorder;
  let audioContext;
  let analyser;
  
  navigator.mediaDevices.getUserMedia({ 
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000,
      channelCount: 1
    } 
  })
  .then(stream => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    
    // Create MediaRecorder for recording
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    const chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      if (onAudioData) {
        onAudioData(blob);
      }
    };
    
    // Start recording
    mediaRecorder.start();
    
    // Send audio data every second
    const interval = setInterval(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.start();
      }
    }, 1000);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      stream.getTracks().forEach(track => track.stop());
      if (audioContext) {
        audioContext.close();
      }
    };
  })
  .catch(error => {
    if (onError) {
      onError(error);
    }
  });
}


