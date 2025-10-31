import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import FieldMap from './components/FieldMap';
import AlertCenter from './components/AlertCenter';
import AudioUpload from './components/AudioUpload';
import BaselineManager from './components/BaselineManager';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fieldData, setFieldData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentReadings, setCurrentReadings] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'map', label: 'Field Map', icon: '🗺️' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'upload', label: 'Audio Upload', icon: '🎤' },
    { id: 'baseline', label: 'Baseline', icon: '📈' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard fieldData={fieldData} currentReadings={currentReadings} />;
      case 'map':
        return <FieldMap fieldData={fieldData} currentReadings={currentReadings} />;
      case 'alerts':
        return <AlertCenter alerts={alerts} />;
      case 'upload':
        return <AudioUpload />;
      case 'baseline':
        return <BaselineManager fieldData={fieldData} />;
      default:
        return <Dashboard fieldData={fieldData} currentReadings={currentReadings} />;
    }
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
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}></div>
            <span className="status-text">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {fieldData ? (
          renderActiveTab()
        ) : (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading field data...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Agri-Acoustic Sentinel - AI-powered bioacoustic pest detection</p>
        <p>Inspired by CIA's "Spy the Lie" methodology applied to agriculture</p>
      </footer>
    </div>
  );
}

export default App;
