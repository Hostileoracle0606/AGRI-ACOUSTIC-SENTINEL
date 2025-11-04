import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import FieldMap from './components/FieldMap';
import AudioUpload from './components/AudioUpload';
import BaselineManager from './components/BaselineManager';
import MicrophoneManager from './components/MicrophoneManager';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [fieldData, setFieldData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentReadings, setCurrentReadings] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMicrophoneModal, setShowMicrophoneModal] = useState(false);

  useEffect(() => {
    // Socket connection handlers
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
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);
    });

    socket.on('baselineUpdate', (data) => {
      // Update field data when baseline is updated
      if (fieldData && fieldData.baseline) {
        setFieldData(prev => ({
          ...prev,
          baseline: {
            ...prev.baseline,
            [data.microphoneId]: data.baseline
          }
        }));
      }
    });

    // Fallback: Load data manually if socket doesn't connect
    const loadDataManually = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/field-data');
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

    // Try manual loading after 3 seconds if no socket connection
    const timeoutId = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        loadDataManually();
      }
    }, 3000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      socket.disconnect();
    };
  }, [connectionStatus]);

  const handleMicrophoneRegistered = () => {
    // Reload field data when microphone is registered
    fetch('http://localhost:5000/api/field-data')
      .then(res => res.json())
      .then(data => {
        setFieldData(data);
        setAlerts(data.alerts || []);
        setCurrentReadings(data.currentReadings || {});
      })
      .catch(err => console.error('Failed to reload data:', err));
  };

  return (
    <div className="App">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="brand-icon">🌾</div>
            <div className="brand-content">
              <h1 className="app-title">Agri-Acoustic Sentinel</h1>
              <p className="app-subtitle">AI-powered bioacoustic pest detection</p>
            </div>
          </div>
          <div 
            className="connection-status" 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowMicrophoneModal(true)}
            title="Click to manage microphones"
          >
            <div className={`status-indicator ${connectionStatus}`}></div>
            <span className="status-text">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="app-nav" style={{ display: 'flex', gap: 'var(--spacing-xs)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            background: activeTab === 'dashboard' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'dashboard' ? 600 : 400,
            transition: 'all 0.15s ease-out'
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('baseline')}
          className={`nav-tab ${activeTab === 'baseline' ? 'active' : ''}`}
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            background: activeTab === 'baseline' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'baseline' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'baseline' ? 600 : 400,
            transition: 'all 0.15s ease-out'
          }}
        >
          Baseline Management
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            background: activeTab === 'upload' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'upload' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'upload' ? 600 : 400,
            transition: 'all 0.15s ease-out'
          }}
        >
          Audio Upload
        </button>
      </nav>

      {/* Main Content - iOS Style Unified View */}
      <main className="app-main">
        {fieldData ? (
          activeTab === 'dashboard' ? (
            <div className="unified-view">
              {/* Full Width Dashboard */}
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <Dashboard fieldData={fieldData} currentReadings={currentReadings} />
              </div>

              {/* Field Map - Full Width */}
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <FieldMap fieldData={fieldData} currentReadings={currentReadings} />
              </div>
            </div>
          ) : activeTab === 'baseline' ? (
            <BaselineManager fieldData={fieldData} />
          ) : activeTab === 'upload' ? (
            <AudioUpload fieldData={fieldData} onUploadComplete={handleMicrophoneRegistered} />
          ) : null
        ) : (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading field data...</p>
          </div>
        )}
      </main>

      {/* Microphone Management Modal */}
      {showMicrophoneModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-md)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMicrophoneModal(false);
            }
          }}
        >
          <div 
            className="card"
            style={{
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Microphone Management</h2>
              <button
                onClick={() => setShowMicrophoneModal(false)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
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

      {/* Footer */}
      <footer className="app-footer">
        <p>Agri-Acoustic Sentinel - AI-powered bioacoustic pest detection</p>
        <p>Inspired by CIA's "Spy the Lie" methodology applied to agriculture</p>
      </footer>
    </div>
  );
}

export default App;
