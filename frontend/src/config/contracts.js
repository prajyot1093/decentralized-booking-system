// Main contract configuration with network detection
// Auto-generated - do not modify manually

import { ethers } from 'ethers';

// Import network-specific configurations
const configs = {};

// Dynamically import available network configs
const importConfig = async (network) => {
  try {
    const config = await import(`./contracts.${network}.js`);
    return config.default;
  } catch (error) {
    console.warn(`No configuration found for network: ${network}`);
    return null;
  }
};

// Network detection and configuration loading
export const getNetworkConfig = async (chainId) => {
  const networkMap = {
    1: 'mainnet',
    11155111: 'sepolia', 
    137: 'polygon',
    80001: 'mumbai',
    31337: 'localhost'
  };
  
  const networkName = networkMap[chainId] || 'localhost';
  
  if (!configs[networkName]) {
    configs[networkName] = await importConfig(networkName);
  }
  
  return configs[networkName];
};

// Get contract instance with provider/signer
export const getContract = async (contractName, providerOrSigner, chainId) => {
  const config = await getNetworkConfig(chainId);
  
  if (!config || !config.addresses[contractName] || !config.abis[contractName]) {
    throw new Error(`Contract ${contractName} not found for chain ID ${chainId}`);
  }
  
  return new ethers.Contract(
    config.addresses[contractName],
    config.abis[contractName],
    providerOrSigner
  );
};

// Utility to check if network is supported
export const isSupportedNetwork = async (chainId) => {
  const config = await getNetworkConfig(chainId);
  return config !== null;
};

// Export network mapping for reference
export const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum Mainnet', shortName: 'mainnet' },
  11155111: { name: 'Sepolia Testnet', shortName: 'sepolia' },
  137: { name: 'Polygon Mainnet', shortName: 'polygon' },
  80001: { name: 'Polygon Mumbai', shortName: 'mumbai' },
  31337: { name: 'Localhost', shortName: 'localhost' }
};
