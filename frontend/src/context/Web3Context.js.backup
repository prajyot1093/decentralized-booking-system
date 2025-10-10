import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { getNetworkConfig, getContract, isSupportedNetwork, SUPPORTED_NETWORKS } from '../config/contracts.js';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [ticketContract, setTicketContract] = useState(null);
  const [transactions, setTransactions] = useState([]); // {hash, status: idle|pending|confirmed|error, summary}
  const [networkConfig, setNetworkConfig] = useState(null);
  const [isNetworkSupported, setIsNetworkSupported] = useState(false);
  const [contractEvents, setContractEvents] = useState([]); // Real-time events

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
  }, []);

  // Initialize contract when signer and chainId are available
  useEffect(() => {
    initializeContract();
  }, [signer, chainId]);

  // Initialize contract with network detection
  const initializeContract = async () => {
    if (!signer || !chainId) {
      setTicketContract(null);
      setNetworkConfig(null);
      setIsNetworkSupported(false);
      return;
    }

    try {
      // Check if network is supported
      const supported = await isSupportedNetwork(chainId);
      setIsNetworkSupported(supported);

      if (supported) {
        // Get network configuration
        const config = await getNetworkConfig(chainId);
        setNetworkConfig(config);

        // Initialize contract
        const contract = await getContract('TicketBookingSystem', signer, chainId);
        setTicketContract(contract);

        // Setup event listeners
        setupEventListeners(contract);
        
        console.log(`✅ Connected to ${config.network.name} - Contract: ${config.addresses.TicketBookingSystem}`);
        toast.success(`Connected to ${config.network.name}`);
      } else {
        setTicketContract(null);
        setNetworkConfig(null);
        toast.error(`Unsupported network. Please switch to: ${Object.values(SUPPORTED_NETWORKS).map(n => n.name).join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      setTicketContract(null);
      setNetworkConfig(null);
      setIsNetworkSupported(false);
      toast.error('Failed to connect to smart contract');
    }
  };

  // Track a transaction
  const trackTx = useCallback(async (txPromise, summary) => {
    try {
      const pendingIdx = Date.now();
      setTransactions(prev => [...prev, { id: pendingIdx, hash: null, status: 'pending', summary }]);
      const tx = await txPromise;
      setTransactions(prev => prev.map(t => t.id === pendingIdx ? { ...t, hash: tx.hash, status: 'mining' } : t));
      const receipt = await tx.wait();
      setTransactions(prev => prev.map(t => t.id === pendingIdx ? { ...t, status: receipt.status === 1 ? 'confirmed' : 'error' } : t));
      if (receipt.status === 1) toast.success(summary || 'Transaction confirmed'); else toast.error('Transaction failed');
      return receipt;
    } catch (err) {
      console.error('Tx error', err);
      toast.error(err?.shortMessage || err?.message || 'Transaction failed');
      setTransactions(prev => prev.filter(t => t.status !== 'confirmed'));
      throw err;
    }
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(address);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask to connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time event listeners
  const setupEventListeners = useCallback((contract) => {
    if (!contract) return;

    // Clear existing listeners
    contract.removeAllListeners();

    // Listen to ServiceCreated events
    contract.on('ServiceCreated', (serviceId, name, description, pricePerSeat, totalSeats, event) => {
      const eventData = {
        id: Date.now(),
        type: 'ServiceCreated',
        serviceId: serviceId.toString(),
        name,
        description,
        pricePerSeat: ethers.formatEther(pricePerSeat),
        totalSeats: totalSeats.toString(),
        blockNumber: event.log.blockNumber,
        transactionHash: event.log.transactionHash,
        timestamp: new Date().toISOString()
      };

      setContractEvents(prev => [eventData, ...prev.slice(0, 49)]); // Keep last 50 events
      toast.success(`New service created: ${name}`);
    });

    // Listen to SeatBooked events
    contract.on('SeatBooked', (serviceId, seatNumber, user, event) => {
      const eventData = {
        id: Date.now(),
        type: 'SeatBooked',
        serviceId: serviceId.toString(),
        seatNumber: seatNumber.toString(),
        user,
        blockNumber: event.log.blockNumber,
        transactionHash: event.log.transactionHash,
        timestamp: new Date().toISOString()
      };

      setContractEvents(prev => [eventData, ...prev.slice(0, 49)]);
      
      // Only show toast if it's the current user
      if (user.toLowerCase() === account?.toLowerCase()) {
        toast.success(`Seat ${seatNumber} booked successfully!`);
      }
    });

    // Listen to SeatCancelled events
    contract.on('SeatCancelled', (serviceId, seatNumber, user, event) => {
      const eventData = {
        id: Date.now(),
        type: 'SeatCancelled',
        serviceId: serviceId.toString(),
        seatNumber: seatNumber.toString(),
        user,
        blockNumber: event.log.blockNumber,
        transactionHash: event.log.transactionHash,
        timestamp: new Date().toISOString()
      };

      setContractEvents(prev => [eventData, ...prev.slice(0, 49)]);
      
      if (user.toLowerCase() === account?.toLowerCase()) {
        toast.success(`Seat ${seatNumber} cancelled successfully!`);
      }
    });

    console.log('🎧 Event listeners setup complete');
  }, [account]);

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      
      toast.success('Network switched successfully');
    } catch (error) {
      console.error('Error switching network:', error);
      
      // If network doesn't exist, try to add it
      if (error.code === 4902) {
        await addNetwork(targetChainId);
      } else {
        toast.error('Failed to switch network');
      }
    }
  };

  const addNetwork = async (chainId) => {
    const networkConfigs = {
      11155111: { // Sepolia
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      },
      80001: { // Mumbai
        chainId: '0x13881',
        chainName: 'Polygon Mumbai',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com']
      },
      137: { // Polygon
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com']
      }
    };

    const config = networkConfigs[chainId];
    if (!config) {
      toast.error('Network configuration not available');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });
      toast.success('Network added successfully');
    } catch (error) {
      console.error('Error adding network:', error);
      toast.error('Failed to add network');
    }
  };

  // Contract interaction methods
  const createService = async (name, description, pricePerSeat, totalSeats) => {
    if (!ticketContract) throw new Error('Contract not initialized');
    
    const priceInWei = ethers.parseEther(pricePerSeat.toString());
    return trackTx(
      ticketContract.createService(name, description, priceInWei, totalSeats),
      `Creating service: ${name}`
    );
  };

  const bookSeat = async (serviceId, seatNumber, paymentAmount) => {
    if (!ticketContract) throw new Error('Contract not initialized');
    
    const paymentInWei = ethers.parseEther(paymentAmount.toString());
    return trackTx(
      ticketContract.bookSeat(serviceId, seatNumber, { value: paymentInWei }),
      `Booking seat ${seatNumber} for service ${serviceId}`
    );
  };

  const cancelBooking = async (serviceId, seatNumber) => {
    if (!ticketContract) throw new Error('Contract not initialized');
    
    return trackTx(
      ticketContract.cancelBooking(serviceId, seatNumber),
      `Cancelling seat ${seatNumber} for service ${serviceId}`
    );
  };

  const getServiceDetails = async (serviceId) => {
    if (!ticketContract) throw new Error('Contract not initialized');
    
    const service = await ticketContract.services(serviceId);
    return {
      id: serviceId,
      name: service.name,
      description: service.description,
      pricePerSeat: ethers.formatEther(service.pricePerSeat),
      totalSeats: service.totalSeats.toString(),
      availableSeats: service.availableSeats.toString(),
      isActive: service.isActive
    };
  };

  const getSeatStatus = async (serviceId, seatNumber) => {
    if (!ticketContract) throw new Error('Contract not initialized');
    
    return await ticketContract.seatBookings(serviceId, seatNumber);
  };

  const getUserBookings = async (userAddress = account) => {
    if (!ticketContract || !userAddress) return [];
    
    try {
      // This would require additional contract methods or event filtering
      // For now, we'll return empty array and implement via events
      return [];
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
  };

  const getBalance = async () => {
    if (!provider || !account) return null;
    
    try {
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (ticketContract) {
        ticketContract.removeAllListeners();
      }
    };
  }, [ticketContract]);

  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = (chainId) => {
        window.location.reload(); // Simple reload to reinitialize everything
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value = {
    // Wallet state
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    chainId,
    
    // Contract state
    ticketContract,
    networkConfig,
    isNetworkSupported,
    contractEvents,
    
    // Transaction state
    transactions,
    
    // Wallet methods
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getBalance,
    formatAddress,
    
    // Contract methods
    createService,
    bookSeat,
    cancelBooking,
    getServiceDetails,
    getSeatStatus,
    getUserBookings,
    
    // Utility methods
    trackTx,
    initializeContract,
    
    // Network info
    supportedNetworks: SUPPORTED_NETWORKS
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};