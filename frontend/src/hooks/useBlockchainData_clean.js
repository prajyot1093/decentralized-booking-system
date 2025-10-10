import { useState, useEffect } from 'react';

// Mock data for development
const MOCK_SERVICES = [
  {
    id: 1,
    name: 'Movie Theater - Avengers',
    description: 'Premium movie experience',
    pricePerSeat: 12.50,
    totalSeats: 100,
    availableSeats: 75,
    type: 'entertainment',
    status: 'active'
  },
  {
    id: 2,
    name: 'Flight NYC-LA',
    description: 'Direct flight service',
    pricePerSeat: 299.00,
    totalSeats: 180,
    availableSeats: 45,
    type: 'transportation',
    status: 'active'
  },
  {
    id: 3,
    name: 'Concert - Rock Band',
    description: 'Live music concert',
    pricePerSeat: 85.00,
    totalSeats: 500,
    availableSeats: 120,
    type: 'entertainment',
    status: 'active'
  }
];

export const useBlockchainServices = () => {
  const [services, setServices] = useState(MOCK_SERVICES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = () => {
    setLoading(true);
    setTimeout(() => {
      setServices([...MOCK_SERVICES]);
      setLoading(false);
    }, 1000);
  };

  return {
    services,
    loading,
    error,
    refetch,
    isBlockchain: false
  };
};

export const useBlockchainBooking = () => {
  const bookSeat = async () => {
    throw new Error('Booking disabled in demo mode');
  };

  return {
    bookSeat,
    isBooking: false,
    isBlockchainMode: false
  };
};

export const useBlockchainServiceDetails = (serviceId) => {
  const [seatMap, setSeatMap] = useState({});
  const [loading, setLoading] = useState(false);

  return {
    seatMap,
    loading,
    isBlockchain: false
  };
};

export const useRealTimeData = () => {
  return {
    isConnected: false,
    lastUpdate: null,
    connectionStatus: 'demo'
  };
};