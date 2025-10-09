// Main backend contract configuration
// Auto-generated - do not modify manually

const path = require('path');

// Network detection based on environment
const getNetworkName = () => {
  return process.env.BLOCKCHAIN_NETWORK || 'localhost';
};

// Load network-specific configuration
const loadNetworkConfig = (network) => {
  try {
    const configFile = path.join(__dirname, `contracts.${network}.js`);
    return require(configFile);
  } catch (error) {
    console.warn(`No configuration found for network: ${network}`);
    return null;
  }
};

// Get current network configuration
const getNetworkConfig = () => {
  const network = getNetworkName();
  return loadNetworkConfig(network);
};

// Get contract address by name
const getContractAddress = (contractName) => {
  const config = getNetworkConfig();
  return config?.addresses[contractName] || null;
};

// Get contract ABI by name
const getContractABI = (contractName) => {
  const config = getNetworkConfig();
  return config?.abis[contractName] || null;
};

// Check if network is supported
const isSupportedNetwork = (network) => {
  return loadNetworkConfig(network) !== null;
};

module.exports = {
  getNetworkName,
  getNetworkConfig,
  getContractAddress,
  getContractABI,
  isSupportedNetwork,
  loadNetworkConfig
};
