// API configuration for different environments
const getApiUrl = () => {
  // Check if we're in production and have an API URL set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000';
};

const getSocketUrl = () => {
  // Check if we have a socket URL set
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  
  // Default to localhost for development
  return process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

