import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
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
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading audio devices…</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm text-text-muted">
          Detect and register audio input devices for field monitoring.
        </p>
      </div>

      {microphonePermission === false && (
        <div className="rounded-2xl border border-warning-500/40 bg-warning-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning-400" />
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-base font-semibold text-warning-400">Microphone Access Required</h4>
                <p className="text-sm text-text-muted">
                  Grant microphone access so the app can capture real-time audio streams from your device.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestMicrophonePermission}
                disabled={isRequestingPermission}
                className="btn btn-primary max-w-xs disabled:opacity-60"
              >
                {isRequestingPermission ? 'Requesting…' : 'Request Microphone Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {microphonePermission === true && (
        <div className="rounded-2xl border border-success-500/40 bg-success-500/10 p-4">
          <div className="flex items-center gap-2 text-sm text-success-400">
            <Mic className="h-5 w-5" />
            Microphone access granted
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="card-header">
            <h4 className="card-title flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Available Audio Devices
            </h4>
          </div>
          <div className="space-y-3">
            {audioDevices.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">No audio devices detected</p>
            ) : (
              audioDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-150/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Mic className="h-4 w-4 text-text-muted" />
                    <div>
                      <p className="text-sm font-semibold text-text">{device.label}</p>
                      <p className="text-xs text-text-muted">{device.platform} • {device.id}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterForm((prev) => ({ ...prev, deviceId: device.id, name: device.label }));
                      setShowRegisterForm(true);
                    }}
                    className="btn btn-primary px-3 py-1 text-xs"
                  >
                    Register
                  </button>
                </div>
              ))
            )}
            <button
              type="button"
              onClick={loadAudioDevices}
              className="btn btn-secondary w-full"
            >
              <Plus className="h-4 w-4" />
              Scan for More Devices
            </button>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="card-header">
            <h4 className="card-title flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Registered Microphones
            </h4>
          </div>
          <div className="space-y-3">
            {registeredMicrophones.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-text-muted">
                <Mic className="h-12 w-12 text-text-subtle/60" />
                <div className="space-y-1">
                  <p className="text-text">No microphones registered yet</p>
                  <p>Register an audio device to start monitoring.</p>
                </div>
              </div>
            ) : (
              registeredMicrophones.map((mic) => (
                <div
                  key={mic.id}
                  className="rounded-2xl border border-border-subtle bg-surface-150/70 px-4 py-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-text">
                      <Mic className="h-4 w-4 text-brand-300" />
                      <span className="font-semibold">{mic.name || `Microphone ${mic.id}`}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => unregisterMicrophone(mic.id)}
                      className="btn-ghost rounded-full p-2 text-danger-400 transition hover:bg-danger-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1 text-xs text-text-muted">
                    <p>Device: {mic.deviceInfo?.label || mic.deviceId}</p>
                    {mic.lat && mic.lng && (
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {mic.lat.toFixed(4)}, {mic.lng.toFixed(4)}
                      </p>
                    )}
                    {mic.registeredAt && (
                      <p className="text-text-subtle">
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

      {showRegisterForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-700 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRegisterForm(false);
              setRegisterForm({ deviceId: '', name: '', lat: '', lng: '' });
            }
          }}
        >
          <div
            className="modal-surface max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 space-y-1">
              <h3 className="text-lg font-semibold text-text">Register Microphone</h3>
              <p className="text-sm text-text-muted">
                Add a friendly name and optional coordinates for precise field tracking.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                  Device
                </label>
                <input type="text" value={registerForm.deviceId} disabled className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Microphone name"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={registerForm.lat}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, lat: e.target.value }))}
                    placeholder="40.7128"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={registerForm.lng}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, lng: e.target.value }))}
                    placeholder="-74.0060"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={() => {
                  setShowRegisterForm(false);
                  setRegisterForm({ deviceId: '', name: '', lat: '', lng: '' });
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={registerMicrophone}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MicrophoneManager;

