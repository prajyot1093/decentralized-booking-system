// API Service for Frontend-Backend Communication
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        
        // Handle common errors
        if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout - please try again');
        } else if (error.response?.status === 404) {
          toast.error('Resource not found');
        } else if (error.response?.status >= 500) {
          toast.error('Server error - please try again later');
        } else if (!error.response) {
          toast.error('Network error - check your connection');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend service unavailable');
    }
  }

  // Get all services with optional filters
  async getServices(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.origin) params.append('origin', filters.origin);
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await this.api.get(`/services?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch services');
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  }

  // Get specific service by ID
  async getService(serviceId) {
    try {
      const response = await this.api.get(`/services/${serviceId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Service not found');
    } catch (error) {
      console.error(`Failed to fetch service ${serviceId}:`, error);
      throw error;
    }
  }

  // Get seat availability for a service
  async getServiceSeats(serviceId) {
    try {
      const response = await this.api.get(`/services/${serviceId}/seats`);
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch seat information');
    } catch (error) {
      console.error(`Failed to fetch seats for service ${serviceId}:`, error);
      throw error;
    }
  }

  // Get platform statistics
  async getPlatformStats() {
    try {
      const response = await this.api.get('/services/stats');
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch platform statistics');
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
      throw error;
    }
  }

  // Get indexer status
  async getIndexerStatus() {
    try {
      const response = await this.api.get('/indexer/status');
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch indexer status');
    } catch (error) {
      console.error('Failed to fetch indexer status:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Service type mappings for frontend display
export const SERVICE_TYPES = {
  0: { name: 'Bus', icon: '🚌', color: '#ff6b35' },
  1: { name: 'Train', icon: '🚆', color: '#0077be' },
  2: { name: 'Movie', icon: '🎬', color: '#ff1744' },
  3: { name: 'Event', icon: '🎉', color: '#9c27b0' },
};

// Price formatting utility
export const formatPrice = (priceWei, currency = 'ETH') => {
  const eth = parseFloat(priceWei) / Math.pow(10, 18);
  return `${eth.toFixed(4)} ${currency}`;
};

// Time formatting utility
export const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Export default service
export default apiService;