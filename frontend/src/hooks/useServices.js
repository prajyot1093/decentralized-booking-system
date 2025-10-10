import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useEventCacheInvalidation } from './useContractEvents';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY = 2000; // 2 seconds

/**
 * Custom hook for managing services data with API and RPC fallback
 */
export const useServices = (web3Context) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null); // 'api' | 'rpc' | 'cache'
  const [lastFetch, setLastFetch] = useState(null);

  const { contract, provider, account } = web3Context || {};

  // Fetch services from API
  const fetchFromAPI = useCallback(async () => {
    try {
      console.log('Fetching services from API...');
      const response = await axios.get(`${API_BASE_URL}/services`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        const apiServices = response.data.data || [];
        setServices(apiServices);
        setDataSource('api');
        setError(null);
        
        // Cache the data
        const cacheData = {
          services: apiServices,
          timestamp: Date.now(),
          source: 'api'
        };
        localStorage.setItem('services_cache', JSON.stringify(cacheData));
        
        return true;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.warn('API fetch failed:', err.message);
      return false;
    }
  }, []);

  // Fetch services directly from contract (RPC fallback)
  const fetchFromRPC = useCallback(async () => {
    if (!contract || !provider) {
      console.warn('Contract or provider not available for RPC fallback');
      return false;
    }

    try {
      console.log('Falling back to RPC...');
      // This is a simplified version - in real implementation, 
      // you'd iterate through service IDs or use events
      const rpcServices = [];
      
      // Try to fetch first few services (demo implementation)
      for (let i = 1; i <= 10; i++) {
        try {
          const service = await contract.getService(i);
          if (service && service.isActive) {
            rpcServices.push({
              id: i,
              serviceType: service.serviceType,
              provider: service.provider,
              name: service.name,
              origin: service.origin,
              destination: service.destination,
              startTime: Number(service.startTime),
              basePriceWei: service.basePriceWei.toString(),
              totalSeats: Number(service.totalSeats),
              isActive: service.isActive
            });
          }
        } catch (serviceErr) {
          // Service doesn't exist, continue
          if (i > 3 && rpcServices.length === 0) {
            // No services found after trying first 3
            break;
          }
        }
      }

      if (rpcServices.length > 0) {
        setServices(rpcServices);
        setDataSource('rpc');
        setError(null);
        
        // Cache RPC data too
        const cacheData = {
          services: rpcServices,
          timestamp: Date.now(),
          source: 'rpc'
        };
        localStorage.setItem('services_cache', JSON.stringify(cacheData));
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.warn('RPC fetch failed:', err.message);
      return false;
    }
  }, [contract, provider]);

  // Load from cache
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem('services_cache');
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
      
      if (!isExpired && cacheData.services) {
        console.log('Loading services from cache...');
        setServices(cacheData.services);
        setDataSource('cache');
        setError(null);
        return true;
      } else {
        // Clean expired cache
        localStorage.removeItem('services_cache');
      }
    } catch (err) {
      console.warn('Cache load failed:', err);
      localStorage.removeItem('services_cache');
    }
    
    return false;
  }, []);

  // Main fetch function with fallback chain
  const fetchServices = useCallback(async (force = false) => {
    if (!force && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
      return; // Skip if recently fetched
    }

    setLoading(true);
    setError(null);

    // Try cache first (if not forcing refresh)
    if (!force && loadFromCache()) {
      setLoading(false);
      setLastFetch(Date.now());
      return;
    }

    // Try API first
    const apiSuccess = await fetchFromAPI();
    if (apiSuccess) {
      setLoading(false);
      setLastFetch(Date.now());
      return;
    }

    // Fallback to RPC
    const rpcSuccess = await fetchFromRPC();
    if (rpcSuccess) {
      setLoading(false);
      setLastFetch(Date.now());
      return;
    }

    // Final fallback to cache (even if expired)
    if (loadFromCache()) {
      setError('Using cached data - network unavailable');
    } else {
      setServices([]);
      setError('Unable to load services. Please check your connection and try again.');
    }

    setLoading(false);
    setLastFetch(Date.now());
  }, [fetchFromAPI, fetchFromRPC, loadFromCache, lastFetch]);

  // Refresh services (force fetch)
  const refreshServices = useCallback(() => {
    return fetchServices(true);
  }, [fetchServices]);

  // Initial load
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Auto-refresh when web3 context changes
  useEffect(() => {
    if (contract && provider && account) {
      // Refresh when wallet connects or changes
      setTimeout(() => fetchServices(true), 1000);
    }
  }, [contract, provider, account, fetchServices]);

  // Event-based cache invalidation
  useEventCacheInvalidation({
    contract,
    provider,
    enabled: !!(contract && provider),
    onInvalidateServices: useCallback((eventType, eventData) => {
      console.log(`Services cache invalidated by ${eventType}:`, eventData);
      // Force refresh services data
      fetchServices(true);
    }, [fetchServices]),
    onInvalidateSeats: useCallback((eventType, eventData) => {
      console.log(`Seats cache invalidated by ${eventType}:`, eventData);
      // Clear seats cache for affected service
      if (eventData.serviceId) {
        localStorage.removeItem(`seats_cache_${eventData.serviceId}`);
      }
    }, [])
  });

  return {
    services,
    loading,
    error,
    dataSource,
    refreshServices,
    fetchServices
  };
};

/**
 * Hook for fetching seat data for a specific service with cache invalidation
 */
export const useServiceSeats = (serviceId, web3Context) => {
  const [seatData, setSeatData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { contract, provider } = web3Context || {};

  const fetchSeats = useCallback(async (force = false) => {
    if (!serviceId) return;

    // Check cache first (if not forcing)
    if (!force) {
      try {
        const cached = localStorage.getItem(`seats_cache_${serviceId}`);
        if (cached) {
          const cacheData = JSON.parse(cached);
          const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
          
          if (!isExpired) {
            setSeatData(cacheData.data);
            setError(null);
            return;
          }
        }
      } catch (err) {
        console.warn('Seats cache error:', err);
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/services/${serviceId}/seats`, {
        timeout: 5000
      });

      if (response.data && response.data.success) {
        const seatData = response.data.data;
        setSeatData(seatData);
        setError(null);

        // Cache the data
        try {
          localStorage.setItem(`seats_cache_${serviceId}`, JSON.stringify({
            data: seatData,
            timestamp: Date.now()
          }));
        } catch (cacheErr) {
          console.warn('Failed to cache seat data:', cacheErr);
        }
      } else {
        throw new Error('Invalid seat data response');
      }
    } catch (err) {
      console.error('Failed to fetch seat data:', err);
      setError(err.message);
      setSeatData(null);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  // Event-based invalidation for this specific service
  useEventCacheInvalidation({
    contract,
    provider,
    enabled: !!(contract && provider && serviceId),
    onInvalidateSeats: useCallback((eventType, eventData) => {
      // Only refresh if event affects this service
      if (eventData.serviceId === serviceId) {
        console.log(`Refreshing seats for service ${serviceId} due to ${eventType}`);
        fetchSeats(true);
      }
    }, [serviceId, fetchSeats])
  });

  useEffect(() => {
    if (serviceId) {
      fetchSeats();
    }
  }, [serviceId, fetchSeats]);

  return {
    seatData,
    loading,
    error,
    refreshSeats: () => fetchSeats(true)
  };
};