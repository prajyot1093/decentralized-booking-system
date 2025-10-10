// Production API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://decentralized-booking-api.railway.app'
    : 'http://localhost:3001'
  );

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  HEALTH: `${API_BASE_URL}/api/health`,
  SERVICES: `${API_BASE_URL}/api/services`,
  BOOK_SERVICE: (serviceId) => `${API_BASE_URL}/api/services/${serviceId}/book`
};

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// App configuration
export const APP_CONFIG = {
  name: 'Decentralized Booking System',
  version: '1.0.0',
  mode: IS_PRODUCTION ? 'production' : 'demo',
  features: {
    blockchain: false, // Disabled in current build
    realTimeUpdates: true,
    mockData: true
  }
};

console.log('🚀 App Environment:', {
  mode: process.env.NODE_ENV,
  apiUrl: API_BASE_URL,
  features: APP_CONFIG.features
});