import Constants from 'expo-constants';

// Environment-aware API configuration
const getApiBase = () => {
  // Check if running in development mode
  if (__DEV__) {
    // Development configurations
    const { platform } = Constants.platform;
    
    if (platform?.ios) {
      return 'http://localhost:5000/api'; // iOS Simulator
    } else if (platform?.android) {
      return 'http://10.0.2.2:5000/api'; // Android Emulator
    } else {
      return 'http://localhost:5000/api'; // Web or other platforms
    }
  } else {
    // Production configuration
    return Constants.expoConfig?.extra?.apiUrl || 'https://api.arviscollection.com/api';
  }
};

export const API_BASE = getApiBase();

// Timeout configurations
export const API_TIMEOUT = 10000; // 10 seconds
export const UPLOAD_TIMEOUT = 30000; // 30 seconds for file uploads

// Development helper - get local IP for physical device testing
export const getLocalDeviceUrl = (ip) => `http://${ip}:5000/api`;

console.log('🌐 API Base URL:', API_BASE);