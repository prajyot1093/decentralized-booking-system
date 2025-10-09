#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Contract Address Injection Utility
 * Automatically injects deployed contract addresses into frontend configuration
 */

class ContractInjector {
  constructor() {
    this.contractsDir = path.join(__dirname, "..", "deployments");
    this.frontendDir = path.join(__dirname, "..", "..", "frontend");
    this.backendDir = path.join(__dirname, "..", "..", "backend");
  }

  /**
   * Get all deployed contracts for a specific network
   */
  getDeployedContracts(network) {
    const networkDir = path.join(this.contractsDir, network);
    
    if (!fs.existsSync(networkDir)) {
      throw new Error(`No deployments found for network: ${network}`);
    }

    const deploymentFile = path.join(networkDir, "deployment.json");
    if (!fs.existsSync(deploymentFile)) {
      throw new Error(`No deployment record found for network: ${network}`);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const contracts = {};

    // Load individual contract files for full ABI
    for (const contractName of Object.keys(deployment.contracts)) {
      const contractFile = path.join(networkDir, `${contractName}.json`);
      if (fs.existsSync(contractFile)) {
        contracts[contractName] = JSON.parse(fs.readFileSync(contractFile, "utf8"));
      }
    }

    return {
      deployment,
      contracts,
      network: deployment.networks[network]
    };
  }

  /**
   * Generate environment-specific configuration
   */
  generateConfig(network, deploymentData) {
    const { deployment, contracts, network: networkInfo } = deploymentData;
    
    const config = {
      // Network information
      network: {
        name: networkInfo.name,
        chainId: networkInfo.chainId,
        rpcUrl: networkInfo.rpcUrl
      },
      
      // Contract addresses
      contracts: {},
      
      // Deployment metadata
      deployment: {
        timestamp: deployment.timestamp,
        blockNumber: networkInfo.blockNumber
      }
    };

    // Add contract addresses and ABIs
    for (const [contractName, contractData] of Object.entries(contracts)) {
      config.contracts[contractName] = {
        address: contractData.address,
        abi: JSON.parse(contractData.abi),
        deploymentBlock: contractData.deploymentBlock
      };
    }

    return config;
  }

  /**
   * Inject into frontend React app
   */
  injectFrontend(network, config) {
    console.log(`📱 Injecting contracts into frontend (${network})...`);
    
    // Create/update contract configuration file
    const configDir = path.join(this.frontendDir, "src", "config");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Network-specific config file
    const configFile = path.join(configDir, `contracts.${network}.js`);
    const configContent = `// Auto-generated contract configuration for ${network}
// Generated at: ${new Date().toISOString()}

export const networkConfig = ${JSON.stringify(config.network, null, 2)};

export const contractAddresses = {
${Object.entries(config.contracts).map(([name, data]) => 
  `  ${name}: "${data.address}"`
).join(',\n')}
};

export const contractABIs = {
${Object.entries(config.contracts).map(([name, data]) => 
  `  ${name}: ${JSON.stringify(data.abi, null, 2)}`
).join(',\n')}
};

export const deploymentInfo = ${JSON.stringify(config.deployment, null, 2)};

// Default export for easy importing
export default {
  network: networkConfig,
  addresses: contractAddresses,
  abis: contractABIs,
  deployment: deploymentInfo
};
`;

    fs.writeFileSync(configFile, configContent);
    console.log(`   ✅ Frontend config saved: ${configFile}`);

    // Update main contracts.js to include network detection
    this.updateFrontendMainConfig();

    // Update existing ABI files if they exist
    this.updateExistingABIFiles(config.contracts);
  }

  /**
   * Update main frontend contracts configuration
   */
  updateFrontendMainConfig() {
    const configDir = path.join(this.frontendDir, "src", "config");
    const mainConfigFile = path.join(configDir, "contracts.js");
    
    const mainConfigContent = `// Main contract configuration with network detection
// Auto-generated - do not modify manually

import { ethers } from 'ethers';

// Import network-specific configurations
const configs = {};

// Dynamically import available network configs
const importConfig = async (network) => {
  try {
    const config = await import(\`./contracts.\${network}.js\`);
    return config.default;
  } catch (error) {
    console.warn(\`No configuration found for network: \${network}\`);
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
    throw new Error(\`Contract \${contractName} not found for chain ID \${chainId}\`);
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
`;

    fs.writeFileSync(mainConfigFile, mainConfigContent);
    console.log(`   ✅ Main frontend config updated: ${mainConfigFile}`);
  }

  /**
   * Update existing ABI files in src/abi/
   */
  updateExistingABIFiles(contracts) {
    const abiDir = path.join(this.frontendDir, "src", "abi");
    
    for (const [contractName, contractData] of Object.entries(contracts)) {
      const abiFile = path.join(abiDir, `${contractName}.json`);
      
      const abiData = {
        contractName,
        abi: contractData.abi,
        address: contractData.address,
        deploymentBlock: contractData.deploymentBlock,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(abiFile, JSON.stringify(abiData, null, 2));
      console.log(`   ✅ ABI file updated: ${abiFile}`);
    }
  }

  /**
   * Inject into backend Node.js app
   */
  injectBackend(network, config) {
    console.log(`🔧 Injecting contracts into backend (${network})...`);
    
    // Create/update backend contract configuration
    const configDir = path.join(this.backendDir, "src", "config");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Network-specific backend config
    const configFile = path.join(configDir, `contracts.${network}.js`);
    const configContent = `// Auto-generated contract configuration for ${network} (Backend)
// Generated at: ${new Date().toISOString()}

const networkConfig = ${JSON.stringify(config.network, null, 2)};

const contractAddresses = {
${Object.entries(config.contracts).map(([name, data]) => 
  `  ${name}: "${data.address}"`
).join(',\n')}
};

const contractABIs = {
${Object.entries(config.contracts).map(([name, data]) => 
  `  ${name}: ${JSON.stringify(data.abi, null, 2)}`
).join(',\n')}
};

const deploymentInfo = ${JSON.stringify(config.deployment, null, 2)};

module.exports = {
  network: networkConfig,
  addresses: contractAddresses,
  abis: contractABIs,
  deployment: deploymentInfo
};
`;

    fs.writeFileSync(configFile, configContent);
    console.log(`   ✅ Backend config saved: ${configFile}`);

    // Update backend main config
    this.updateBackendMainConfig();
  }

  /**
   * Update main backend contracts configuration
   */
  updateBackendMainConfig() {
    const configDir = path.join(this.backendDir, "src", "config");
    const mainConfigFile = path.join(configDir, "contracts.js");
    
    const mainConfigContent = `// Main backend contract configuration
// Auto-generated - do not modify manually

const path = require('path');

// Network detection based on environment
const getNetworkName = () => {
  return process.env.BLOCKCHAIN_NETWORK || 'localhost';
};

// Load network-specific configuration
const loadNetworkConfig = (network) => {
  try {
    const configFile = path.join(__dirname, \`contracts.\${network}.js\`);
    return require(configFile);
  } catch (error) {
    console.warn(\`No configuration found for network: \${network}\`);
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
`;

    fs.writeFileSync(mainConfigFile, mainConfigContent);
    console.log(`   ✅ Main backend config updated: ${mainConfigFile}`);
  }

  /**
   * Main injection method
   */
  inject(network, options = {}) {
    console.log(`\n🔄 Injecting contracts for network: ${network}`);
    console.log("=" .repeat(50));

    try {
      // Get deployment data
      const deploymentData = this.getDeployedContracts(network);
      const config = this.generateConfig(network, deploymentData);

      // Inject into frontend if enabled
      if (options.frontend !== false) {
        this.injectFrontend(network, config);
      }

      // Inject into backend if enabled
      if (options.backend !== false) {
        this.injectBackend(network, config);
      }

      console.log(`\n✅ Contract injection completed for ${network}`);
      
      return {
        network,
        config,
        deploymentData
      };

    } catch (error) {
      console.error(`\n❌ Contract injection failed for ${network}:`, error.message);
      throw error;
    }
  }

  /**
   * Inject for all available networks
   */
  injectAll(options = {}) {
    console.log("\n🌐 Injecting contracts for all available networks...");
    
    const results = [];
    const networkDirs = fs.readdirSync(this.contractsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const network of networkDirs) {
      try {
        const result = this.inject(network, options);
        results.push(result);
      } catch (error) {
        console.warn(`⚠️  Skipping ${network}: ${error.message}`);
      }
    }

    console.log(`\n✅ Processed ${results.length} networks: ${results.map(r => r.network).join(', ')}`);
    return results;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const network = args[0];
  
  const options = {
    frontend: !args.includes('--no-frontend'),
    backend: !args.includes('--no-backend')
  };

  const injector = new ContractInjector();

  if (network) {
    injector.inject(network, options);
  } else {
    injector.injectAll(options);
  }
}

module.exports = { ContractInjector };