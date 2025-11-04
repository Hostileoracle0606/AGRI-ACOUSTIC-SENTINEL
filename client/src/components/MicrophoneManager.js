import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, Plus, Trash2, MapPin, Radio, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestMicrophoneAccess, checkMicrophonePermission } from '../utils/microphone-access';

const MicrophoneManager = ({ onMicrophoneRegistered }) => {
  const [audioDevices, setAudioDevices] = useState([]);
  const [registeredMicrophones, setRegisteredMicrophones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    deviceId: '',
    name: '',
    lat: '',
    lng: ''
  });
  const [microphonePermission, setMicrophonePermission] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    loadAudioDevices();
    loadRegisteredMicrophones();
    checkBrowserMicrophonePermission();
  }, []);

  const checkBrowserMicrophonePermission = async () => {
    const hasPermission = await checkMicrophonePermission();
    setMicrophonePermission(hasPermission);
  };

  const handleRequestMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    const result = await requestMicrophoneAccess();
    setMicrophonePermission(result.hasPermission);
    setIsRequestingPermission(false);
    
    if (result.success) {
      toast.success('Microphone access granted');
    } else {
      toast.error(result.message || 'Microphone access denied');
    }
  };

  const loadAudioDevices = async () => {
    try {
      setIsLoading(true);
      const browserDevices = [];
      
      // First, request permission to access devices
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        
        // Now enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        
        audioInputs.forEach((device, index) => {
          browserDevices.push({
            id: device.deviceId,
            label: device.label || `Microphone ${index + 1}`,
            platform: 'browser',
            type: 'audio'
          });
        });
        
        // Update permission state
        setMicrophonePermission(true);
      } catch (error) {
        console.warn('Browser device enumeration failed:', error);
        setMicrophonePermission(false);
      }
      
      // Only use browser-detected devices - these are guaranteed to be registerable
      // Server-side detection requires system dependencies that may not be available
      setAudioDevices(browserDevices);
      
      if (browserDevices.length === 0) {
        toast.error('No microphones detected. Please grant microphone permissions and ensure a microphone is connected.');
      }
    } catch (error) {
      console.error('Error loading audio devices:', error);
      toast.error('Failed to load audio devices');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegisteredMicrophones = async () => {
    try {
      const response = await axios.get('/api/microphones');
      setRegisteredMicrophones(response.data || []);
    } catch (error) {
      console.error('Error loading registered microphones:', error);
      toast.error('Failed to load registered microphones');
    }
  };

  const registerMicrophone = async () => {
    try {
      if (!registerForm.deviceId) {
        toast.error('Please select an audio device');
        return;
      }

      // Attempt registration first - this will trigger permission request if needed
      try {
        const response = await axios.post('/api/register-microphone', {
          deviceId: registerForm.deviceId,
          name: registerForm.name || undefined,
          lat: registerForm.lat ? parseFloat(registerForm.lat) : undefined,
          lng: registerForm.lng ? parseFloat(registerForm.lng) : undefined
        });

        toast.success('Microphone registered successfully');
        setShowRegisterForm(false);
        setRegisterForm({ deviceId: '', name: '', lat: '', lng: '' });
        loadRegisteredMicrophones();
        
        if (onMicrophoneRegistered) {
          onMicrophoneRegistered();
        }
      } catch (error) {
        // If registration fails due to permissions, request permission now
        if (error.response?.status === 403 || error.message?.includes('permission')) {
          setIsRequestingPermission(true);
          const result = await requestMicrophoneAccess();
          setIsRequestingPermission(false);
          setMicrophonePermission(result.hasPermission);
          
          if (result.hasPermission) {
            // Retry registration after permission granted
            const retryResponse = await axios.post('/api/register-microphone', {
              deviceId: registerForm.deviceId,
              name: registerForm.name || undefined,
              lat: registerForm.lat ? parseFloat(registerForm.lat) : undefined,
              lng: registerForm.lng ? parseFloat(registerForm.lng) : undefined
            });
            
            toast.success('Microphone registered successfully');
            setShowRegisterForm(false);
            setRegisterForm({ deviceId: '', name: '', lat: '', lng: '' });
            loadRegisteredMicrophones();
            
            if (onMicrophoneRegistered) {
              onMicrophoneRegistered();
            }
          } else {
            toast.error('Microphone access is required to register a microphone');
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error registering microphone:', error);
      toast.error(error.response?.data?.error || 'Failed to register microphone');
    }
  };

  const unregisterMicrophone = async (microphoneId) => {
    try {
      await axios.delete(`/api/microphones/${microphoneId}`);
      toast.success('Microphone unregistered');
      loadRegisteredMicrophones();
      
      if (onMicrophoneRegistered) {
        onMicrophoneRegistered();
      }
    } catch (error) {
      console.error('Error unregistering microphone:', error);
      toast.error('Failed to unregister microphone');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Loading audio devices...</p>
      </div>
    );
  }

  return (
    <div className="microphone-manager">
      <div className="card-header mb-6" style={{ border: 'none', paddingBottom: 0, marginBottom: 'var(--spacing-md)' }}>
        <p className="card-subtitle">Detect and register audio input devices for field monitoring</p>
      </div>

      {/* Browser Microphone Permission Alert */}
      {microphonePermission === false && (
        <div className="mb-6 p-4 rounded-lg" style={{
          background: 'rgba(255, 204, 0, 0.1)',
          border: '1px solid rgba(255, 204, 0, 0.3)'
        }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: 'var(--accent-yellow)' }} />
            <div className="flex-1">
              <h4 className="font-semibold mb-1" style={{ color: 'var(--accent-yellow)' }}>Microphone Access Required</h4>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                This application needs microphone access to record audio from your device. 
                Clicking the button below will trigger a system alert requesting permission.
              </p>
              <button
                onClick={handleRequestMicrophonePermission}
                disabled={isRequestingPermission}
                className="px-4 py-2 rounded-md disabled:opacity-50"
                style={{
                  background: 'var(--accent-yellow)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  cursor: isRequestingPermission ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isRequestingPermission) {
                    e.target.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              >
                {isRequestingPermission ? 'Requesting...' : 'Request Microphone Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {microphonePermission === true && (
        <div className="mb-6 p-4 rounded-lg" style={{
          background: 'rgba(48, 209, 88, 0.1)',
          border: '1px solid rgba(48, 209, 88, 0.3)'
        }}>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
            <p className="text-sm" style={{ color: 'var(--accent-green)' }}>Microphone access granted</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Devices List */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Available Audio Devices
            </h4>
          </div>
          <div className="space-y-3">
            {audioDevices.length === 0 ? (
              <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>No audio devices detected</p>
            ) : (
              audioDevices.map((device, index) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Mic className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{device.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{device.platform} • {device.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRegisterForm(prev => ({ ...prev, deviceId: device.id, name: device.label }));
                      setShowRegisterForm(true);
                    }}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--accent-blue)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--accent-blue-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--accent-blue)';
                    }}
                  >
                    Register
                  </button>
                </div>
              ))
            )}
            <button
              onClick={loadAudioDevices}
              className="w-full px-4 py-2 text-sm rounded-md flex items-center justify-center gap-2"
              style={{
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-card-hover)';
                e.target.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-card)';
                e.target.style.borderColor = 'var(--border-color)';
              }}
            >
              <Plus className="w-4 h-4" />
              Scan for More Devices
            </button>
          </div>
        </div>

        {/* Registered Microphones */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Registered Microphones
            </h4>
          </div>
          <div className="space-y-3">
            {registeredMicrophones.length === 0 ? (
              <div className="text-center py-8">
                <Mic className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No microphones registered yet</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>Register an audio device to start monitoring</p>
              </div>
            ) : (
              registeredMicrophones.map((mic) => (
                <div
                  key={mic.id}
                  className="p-4 rounded-lg"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{mic.name || `Microphone ${mic.id}`}</span>
                    </div>
                    <button
                      onClick={() => unregisterMicrophone(mic.id)}
                      className="p-1 rounded"
                      style={{
                        color: 'var(--accent-red)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 59, 48, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <p>Device: {mic.deviceInfo?.label || mic.deviceId}</p>
                    {mic.lat && mic.lng && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {mic.lat.toFixed(4)}, {mic.lng.toFixed(4)}
                      </p>
                    )}
                    {mic.registeredAt && (
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Registered: {new Date(mic.registeredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Register Form Modal */}
      {showRegisterForm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRegisterForm(false);
              setRegisterForm({ deviceId: '', name: '', lat: '', lng: '' });
            }
          }}
        >
          <div 
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Register Microphone</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Device
                </label>
                <input
                  type="text"
                  value={registerForm.deviceId}
                  disabled
                  className="w-full px-3 py-2 rounded-md"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Microphone name"
                  className="w-full px-3 py-2 rounded-md"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={registerForm.lat}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, lat: e.target.value }))}
                    placeholder="40.7128"
                    className="w-full px-3 py-2 rounded-md"
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={registerForm.lng}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, lng: e.target.value }))}
                    placeholder="-74.0060"
                    className="w-full px-3 py-2 rounded-md"
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRegisterForm(false);
                  setRegisterForm({ deviceId: '', name: '', lat: '', lng: '' });
                }}
                className="flex-1 px-4 py-2 rounded-md"
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--bg-card-hover)';
                  e.target.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.borderColor = 'var(--border-color)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={registerMicrophone}
                className="flex-1 px-4 py-2 rounded-md"
                style={{
                  background: 'var(--accent-blue)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--accent-blue-hover)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--accent-blue)';
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrophoneManager;

