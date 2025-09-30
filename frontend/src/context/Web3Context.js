import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import TicketABI from '../abi/TicketBookingSystem.json';

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
  const TICKET_ADDRESS = process.env.REACT_APP_TICKET_ADDRESS || null; // set via .env

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (signer && TICKET_ADDRESS) {
      try {
        const contract = new ethers.Contract(TICKET_ADDRESS, TicketABI.abi, signer);
        setTicketContract(contract);
      } catch (e) {
        console.error('Failed to init ticket contract', e);
      }
    }
  }, [signer, TICKET_ADDRESS]);

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
      toast.error('Failed to switch network');
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

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getBalance,
    formatAddress,
    ticketContract,
    transactions,
    trackTx,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};