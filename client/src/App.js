import React, { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import FieldMap from './components/FieldMap';
import AudioUpload from './components/AudioUpload';
import BaselineManager from './components/BaselineManager';
import MicrophoneManager from './components/MicrophoneManager';
import { SOCKET_URL, API_BASE_URL } from './config/api';
import './App.css';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'baseline', label: 'Baseline Management' },
  { id: 'upload', label: 'Audio Upload' },
];

function App() {
  const [fieldData, setFieldData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentReadings, setCurrentReadings] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMicrophoneModal, setShowMicrophoneModal] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('Disconnected from server');
    });

    socket.on('fieldData', (data) => {
      setFieldData(data);
      setAlerts(data.alerts || []);
      setCurrentReadings(data.currentReadings || {});
    });

    socket.on('fieldUpdate', (readings) => {
      setCurrentReadings(readings);
    });

    socket.on('newAlert', (alert) => {
      setAlerts((prev) => [alert, ...prev.slice(0, 49)]);
    });

    socket.on('baselineUpdate', (data) => {
      if (fieldData && fieldData.baseline) {
        setFieldData((prev) => ({
          ...prev,
          baseline: {
            ...prev.baseline,
            [data.microphoneId]: data.baseline,
          },
        }));
      }
    });

    const loadDataManually = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/field-data`);
        if (response.ok) {
          const data = await response.json();
          setFieldData(data);
          setAlerts(data.alerts || []);
          setCurrentReadings(data.currentReadings || {});
          setConnectionStatus('connected');
          console.log('Data loaded manually');
        }
      } catch (error) {
        console.error('Failed to load data manually:', error);
        setConnectionStatus('disconnected');
      }
    };

    const timeoutId = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        loadDataManually();
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      socket.disconnect();
    };
  }, [connectionStatus, fieldData]);

  const handleMicrophoneRegistered = () => {
    fetch(`${API_BASE_URL}/api/field-data`)
      .then((res) => res.json())
      .then((data) => {
        setFieldData(data);
        setAlerts(data.alerts || []);
        setCurrentReadings(data.currentReadings || {});
      })
      .catch((err) => console.error('Failed to reload data:', err));
  };

  const statusLabel = useMemo(() => {
    if (connectionStatus === 'connected') return 'Connected';
    if (connectionStatus === 'connecting') return 'Connecting…';
    return 'Disconnected';
  }, [connectionStatus]);

  return (
    <div className="app-shell">
      <Toaster position="top-right" />

      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="brand-icon">🌾</div>
            <div className="brand-content">
              <h1 className="app-title">Agri-Acoustic Sentinel</h1>
              <p className="app-subtitle">AI-powered bioacoustic pest detection</p>
            </div>
          </div>

          <button
            type="button"
            className="connection-status"
            onClick={() => setShowMicrophoneModal(true)}
            title="Manage microphones"
          >
            <span className={`h-2 w-2 rounded-full status-indicator ${connectionStatus === 'connected' ? 'bg-success-500' : connectionStatus === 'connecting' ? 'bg-warning-400' : 'bg-danger-500'}`} />
            <span className="status-text">{statusLabel}</span>
          </button>
        </div>
      </header>

      <nav className="app-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`nav-tab ${activeTab === item.id ? 'nav-tab--active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        <div className="app-main__inner">
          {fieldData ? (
            activeTab === 'dashboard' ? (
              <div className="unified-view">
                <Dashboard fieldData={fieldData} currentReadings={currentReadings} />
                <FieldMap fieldData={fieldData} currentReadings={currentReadings} />
              </div>
            ) : activeTab === 'baseline' ? (
              <BaselineManager fieldData={fieldData} />
            ) : (
              <AudioUpload fieldData={fieldData} onUploadComplete={handleMicrophoneRegistered} />
            )
          ) : (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading field data…</p>
            </div>
          )}
        </div>
      </main>

      {showMicrophoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-700 px-6 py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMicrophoneModal(false);
            }
          }}
        >
          <div className="modal-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-text">Microphone Management</h2>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => setShowMicrophoneModal(false)}
              >
                Close
              </button>
            </div>
            <MicrophoneManager
              onMicrophoneRegistered={() => {
                handleMicrophoneRegistered();
                setShowMicrophoneModal(false);
              }}
            />
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>Agri-Acoustic Sentinel — AI-powered bioacoustic pest detection</p>
        <p>Inspired by CIA's "Spy the Lie" methodology applied to agriculture</p>
      </footer>
    </div>
  );
}

export default App;
