import React, { createContext, useContext, useState } from 'react';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  // Simplified state for demo mode
  const [account] = useState(null);
  const [isConnected] = useState(false);
  const [isLoading] = useState(false);
  const [isNetworkSupported] = useState(true);
  const [networkConfig] = useState({ network: { name: 'Demo Mode' } });
  const [contractEvents] = useState([]);

  // Mock functions
  const connectWallet = async () => {
    console.log('Wallet connection disabled in demo mode');
    return false;
  };

  const switchNetwork = async () => {
    console.log('Network switching disabled in demo mode');
    return false;
  };

  const createService = async () => {
    console.log('Service creation disabled in demo mode');
    throw new Error('Demo mode - blockchain features disabled');
  };

  const bookSeats = async () => {
    console.log('Seat booking disabled in demo mode');
    throw new Error('Demo mode - blockchain features disabled');
  };

  const getBalance = async () => {
    return '0';
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const addTransaction = () => {
    console.log('Transaction tracking disabled in demo mode');
  };

  const value = {
    // State
    account,
    isConnected,
    isLoading,
    chainId: null,
    isNetworkSupported,
    networkConfig,
    contractEvents,
    transactions: [],

    // Functions
    connectWallet,
    switchNetwork,
    createService,
    bookSeats,
    getBalance,
    formatAddress,
    addTransaction
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};