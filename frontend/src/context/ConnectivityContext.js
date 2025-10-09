// Enhanced Error Handling and Connectivity Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const ConnectivityContext = createContext();

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};

export const ConnectivityProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, connected, disconnected
  const [lastHealthCheck, setLastHealthCheck] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errors, setErrors] = useState([]);

  // Check backend connectivity
  const checkBackendHealth = useCallback(async () => {
    try {
      await apiService.checkHealth();
      setBackendStatus('connected');
      setLastHealthCheck(new Date());
      setRetryCount(0);
      
      // Clear any previous backend errors
      setErrors(prev => prev.filter(err => err.type !== 'backend'));
      
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('disconnected');
      setRetryCount(prev => prev + 1);
      
      // Add backend error
      const backendError = {
        id: Date.now(),
        type: 'backend',
        message: 'Backend service unavailable',
        timestamp: new Date(),
        retry: checkBackendHealth,
      };
      
      setErrors(prev => {
        const filtered = prev.filter(err => err.type !== 'backend');
        return [...filtered, backendError];
      });
      
      return false;
    }
  }, []);

  // Add error to the error list
  const addError = useCallback((error) => {
    const errorObj = {
      id: Date.now(),
      type: error.type || 'generic',
      message: error.message,
      timestamp: new Date(),
      retry: error.retry || null,
    };
    
    setErrors(prev => [...prev, errorObj]);
    
    // Auto-remove error after 10 seconds if no retry function
    if (!errorObj.retry) {
      setTimeout(() => {
        setErrors(prev => prev.filter(err => err.id !== errorObj.id));
      }, 10000);
    }
  }, []);

  // Remove error by id
  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(err => err.id !== errorId));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🌐 Back online');
      
      // Remove offline errors
      setErrors(prev => prev.filter(err => err.type !== 'offline'));
      
      // Check backend health when back online
      setTimeout(checkBackendHealth, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('📡 You are offline');
      
      // Add offline error
      addError({
        type: 'offline',
        message: 'No internet connection',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addError, checkBackendHealth]);

  // Initial health check and periodic checks
  useEffect(() => {
    checkBackendHealth();

    // Set up periodic health checks (every 2 minutes)
    const interval = setInterval(checkBackendHealth, 120000);

    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Auto-retry backend connection with exponential backoff
  useEffect(() => {
    if (backendStatus === 'disconnected' && isOnline && retryCount < 5) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
      
      const timeout = setTimeout(() => {
        console.log(`Retrying backend connection (attempt ${retryCount + 1})`);
        checkBackendHealth();
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [backendStatus, isOnline, retryCount, checkBackendHealth]);

  // Show toast notifications for critical errors
  useEffect(() => {
    if (backendStatus === 'disconnected' && retryCount === 1) {
      toast.error('Backend service unavailable', {
        duration: 5000,
        id: 'backend-error',
      });
    }
  }, [backendStatus, retryCount]);

  const value = {
    // Connectivity status
    isOnline,
    backendStatus,
    lastHealthCheck,
    retryCount,
    isFullyConnected: isOnline && backendStatus === 'connected',
    
    // Error management
    errors,
    addError,
    removeError,
    clearErrors,
    
    // Manual actions
    checkHealth: checkBackendHealth,
  };

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
};