import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

const loadRuntimeConfig = async () => {
  const configUrl = `${process.env.PUBLIC_URL || ''}/app-config.json`;
  try {
    const response = await fetch(configUrl, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status !== 404) {
        console.warn('[runtime-config] Failed to load app-config.json:', response.status, response.statusText);
      }
      return;
    }
    const config = await response.json();
    if (config && typeof config === 'object') {
      window.__APP_CONFIG__ = config;
      console.info('[runtime-config] Loaded application configuration');
    }
  } catch (error) {
    console.warn('[runtime-config] Unable to load app-config.json', error);
  }
};

loadRuntimeConfig().finally(renderApp);
