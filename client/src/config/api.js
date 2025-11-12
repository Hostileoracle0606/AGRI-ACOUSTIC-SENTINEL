// API configuration for different environments
// NOTE: In production we never fall back to window.location.origin automatically.
// Doing so caused the deployed Netlify build to call itself instead of the
// separate backend, which manifested as endless buffering. We now require an
// explicit backend URL via environment variables and log a helpful warning if
// it is missing.

const normalizeUrl = (url) => url?.replace(/\/$/, '');

const resolveFromEnv = () => {
  return (
    normalizeUrl(process.env.REACT_APP_API_BASE_URL) ||
    normalizeUrl(process.env.REACT_APP_API_URL) ||
    normalizeUrl(process.env.REACT_APP_BACKEND_URL)
  );
};

const resolveFromWindowConfig = (key = 'apiBaseUrl') => {
  if (typeof window === 'undefined') return undefined;
  const runtimeConfig = window.__APP_CONFIG__?.[key];
  return normalizeUrl(runtimeConfig);
};

const getApiUrl = () => {
  const envUrl = resolveFromEnv();
  if (envUrl) {
    return envUrl;
  }

  const runtimeUrl = resolveFromWindowConfig('apiBaseUrl');
  if (runtimeUrl) {
    return runtimeUrl;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5000';
  }

  console.warn(
    '[api-config] No API base URL configured. Set REACT_APP_API_BASE_URL (or REACT_APP_BACKEND_URL) to your deployed backend.'
  );
  return `${window.location.origin}`;
};

const getSocketUrl = () => {
  const envUrl = (
    normalizeUrl(process.env.REACT_APP_SOCKET_BASE_URL) ||
    normalizeUrl(process.env.REACT_APP_SOCKET_URL) ||
    resolveFromEnv()
  );
  if (envUrl) {
    return envUrl;
  }

  const runtimeUrl = resolveFromWindowConfig('socketUrl') || resolveFromWindowConfig('apiBaseUrl');
  if (runtimeUrl) {
    return runtimeUrl;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5000';
  }

  console.warn(
    '[api-config] No Socket base URL configured. Re-using window.origin – set REACT_APP_SOCKET_BASE_URL for cross-origin deployments.'
  );
  return `${window.location.origin}`;
};

export const API_BASE_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

