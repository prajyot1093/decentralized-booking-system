// Real-time data hook for services
import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export const useRealTimeServices = (refreshInterval = 30000) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Fetch services function
  const fetchServices = useCallback(async (showToast = false) => {
    try {
      setError(null);
      const data = await apiService.getServices();
      
      if (mountedRef.current) {
        setServices(data || []);
        setLastUpdated(new Date());
        
        if (showToast) {
          toast.success('Services updated');
        }
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      if (mountedRef.current) {
        setError(err.message);
        if (showToast) {
          toast.error('Failed to update services');
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    fetchServices(true);
  }, [fetchServices]);

  // Setup auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchServices();

    // Setup interval for auto-refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchServices();
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchServices, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    services,
    loading,
    error,
    lastUpdated,
    refresh,
    isConnected: !error,
  };
};

export const useServiceDetails = (serviceId) => {
  const [service, setService] = useState(null);
  const [seats, setSeats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchServiceDetails = useCallback(async () => {
    if (!serviceId) return;

    try {
      setError(null);
      setLoading(true);

      const [serviceData, seatsData] = await Promise.all([
        apiService.getService(serviceId),
        apiService.getServiceSeats(serviceId),
      ]);

      if (mountedRef.current) {
        setService(serviceData);
        setSeats(seatsData);
      }
    } catch (err) {
      console.error('Failed to fetch service details:', err);
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetails();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchServiceDetails]);

  return {
    service,
    seats,
    loading,
    error,
    refresh: fetchServiceDetails,
  };
};

export const usePlatformStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setError(null);
        const data = await apiService.getPlatformStats();
        
        if (mounted) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch platform stats:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading, error };
};