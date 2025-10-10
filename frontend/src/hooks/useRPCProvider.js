import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

/**
 * Hook for managing RPC provider with fallback logic
 */
export const useRPCProvider = (initialRpcUrls = [], targetChainId = null) => {
  const [provider, setProvider] = useState(null);
  const [currentRpcUrl, setCurrentRpcUrl] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const rpcUrlsRef = useRef(initialRpcUrls);
  const currentIndexRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  // Default RPC URLs if none provided
  const defaultRpcUrls = {
    1: ['https://eth-mainnet.g.alchemy.com/v2/demo', 'https://cloudflare-eth.com'],
    5: ['https://eth-goerli.g.alchemy.com/v2/demo'],
    11155111: ['https://eth-sepolia.g.alchemy.com/v2/demo', 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    137: ['https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com'],
    80001: ['https://rpc-mumbai.maticvigil.com'],
    31337: ['http://localhost:8545', 'http://127.0.0.1:8545']
  };

  // Get RPC URLs for the target chain
  const getRpcUrls = useCallback(() => {
    if (rpcUrlsRef.current && rpcUrlsRef.current.length > 0) {
      return rpcUrlsRef.current;
    }
    
    if (targetChainId && defaultRpcUrls[targetChainId]) {
      return defaultRpcUrls[targetChainId];
    }
    
    // Fallback to common RPCs
    return [
      'https://cloudflare-eth.com',
      'https://eth-mainnet.g.alchemy.com/v2/demo'
    ];
  }, [targetChainId]);

  // Test RPC connection
  const testRpcConnection = useCallback(async (rpcUrl) => {
    try {
      const testProvider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test with timeout
      const blockNumberPromise = testProvider.getBlockNumber();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      await Promise.race([blockNumberPromise, timeoutPromise]);
      
      // If we have a target chain ID, verify it matches
      if (targetChainId) {
        const network = await testProvider.getNetwork();
        if (Number(network.chainId) !== targetChainId) {
          throw new Error(`Chain ID mismatch: expected ${targetChainId}, got ${network.chainId}`);
        }
      }
      
      return testProvider;
    } catch (error) {
      console.warn(`RPC ${rpcUrl} failed:`, error.message);
      throw error;
    }
  }, [targetChainId]);

  // Connect to next available RPC
  const connectToNextRpc = useCallback(async () => {
    const rpcUrls = getRpcUrls();
    const maxAttempts = rpcUrls.length;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const rpcIndex = (currentIndexRef.current + attempt) % rpcUrls.length;
      const rpcUrl = rpcUrls[rpcIndex];
      
      try {
        console.log(`Attempting to connect to RPC ${rpcIndex + 1}/${rpcUrls.length}: ${rpcUrl}`);
        
        const newProvider = await testRpcConnection(rpcUrl);
        
        setProvider(newProvider);
        setCurrentRpcUrl(rpcUrl);
        setIsConnected(true);
        setError(null);
        currentIndexRef.current = rpcIndex;
        
        console.log(`Successfully connected to RPC: ${rpcUrl}`);
        return newProvider;
        
      } catch (error) {
        console.warn(`RPC connection failed for ${rpcUrl}:`, error.message);
        setError(error.message);
      }
    }
    
    // All RPCs failed
    setProvider(null);
    setCurrentRpcUrl(null);
    setIsConnected(false);
    setError('All RPC endpoints failed. Please check your internet connection.');
    
    return null;
  }, [getRpcUrls, testRpcConnection]);

  // Reconnect with exponential backoff
  const scheduleReconnect = useCallback((delay = 5000) => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect to RPC...');
      connectToNextRpc();
    }, delay);
  }, [connectToNextRpc]);

  // Handle provider errors
  const setupProviderErrorHandling = useCallback((provider) => {
    if (!provider) return;

    provider.on('error', (error) => {
      console.error('Provider error:', error);
      setError(error.message);
      setIsConnected(false);
      
      // Try next RPC on error
      currentIndexRef.current = (currentIndexRef.current + 1) % getRpcUrls().length;
      scheduleReconnect();
    });

    // Monitor connection with periodic health checks
    const healthCheck = setInterval(async () => {
      try {
        await provider.getBlockNumber();
        if (!isConnected) {
          setIsConnected(true);
          setError(null);
        }
      } catch (error) {
        console.warn('Health check failed:', error.message);
        setIsConnected(false);
        setError(error.message);
        scheduleReconnect();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(healthCheck);
      provider.removeAllListeners('error');
    };
  }, [isConnected, getRpcUrls, scheduleReconnect]);

  // Initialize provider
  const initializeProvider = useCallback(async () => {
    const provider = await connectToNextRpc();
    if (provider) {
      const cleanup = setupProviderErrorHandling(provider);
      return cleanup;
    }
  }, [connectToNextRpc, setupProviderErrorHandling]);

  // Update RPC URLs
  const updateRpcUrls = useCallback((newRpcUrls) => {
    rpcUrlsRef.current = newRpcUrls;
    currentIndexRef.current = 0;
    initializeProvider();
  }, [initializeProvider]);

  // Force reconnect
  const forceReconnect = useCallback(() => {
    if (provider) {
      provider.removeAllListeners();
    }
    initializeProvider();
  }, [provider, initializeProvider]);

  // Initialize on mount
  useEffect(() => {
    let cleanup;
    
    initializeProvider().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeProvider]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (provider) {
        provider.removeAllListeners();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [provider]);

  return {
    provider,
    currentRpcUrl,
    isConnected,
    error,
    updateRpcUrls,
    forceReconnect,
    availableRpcUrls: getRpcUrls()
  };
};

/**
 * Hook for network switching functionality
 */
export const useNetworkSwitch = () => {
  const [switching, setSwitching] = useState(false);

  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) {
      throw new Error('No wallet detected. Please install MetaMask.');
    }

    setSwitching(true);
    
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
    } catch (switchError) {
      // Network might need to be added
      if (switchError.code === 4902) {
        // Network not added to wallet
        const networkConfigs = {
          11155111: {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'SepoliaETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          },
          80001: {
            chainId: '0x13881',
            chainName: 'Mumbai Testnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com']
          }
        };

        if (networkConfigs[targetChainId]) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfigs[targetChainId]],
          });
        } else {
          throw new Error('Network configuration not found');
        }
      } else {
        throw switchError;
      }
    } finally {
      setSwitching(false);
    }
  }, []);

  return {
    switchNetwork,
    switching
  };
};