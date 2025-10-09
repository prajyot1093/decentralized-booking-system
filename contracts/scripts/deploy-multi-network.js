const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Network configurations
const NETWORKS = {
  hardhat: {
    name: "Hardhat Local",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    gasPrice: "20000000000", // 20 gwei
    gasLimit: 6000000
  },
  localhost: {
    name: "Localhost",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    gasPrice: "20000000000",
    gasLimit: 6000000
  },
  sepolia: {
    name: "Sepolia Testnet",
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
    gasPrice: "30000000000", // 30 gwei
    gasLimit: 8000000
  },
  polygon: {
    name: "Polygon Mainnet",
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    gasPrice: "30000000000",
    gasLimit: 10000000
  },
  mumbai: {
    name: "Polygon Mumbai",
    chainId: 80001,
    rpcUrl: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
    gasPrice: "30000000000",
    gasLimit: 10000000
  }
};

class DeploymentManager {
  constructor() {
    this.deployedContracts = {};
    this.deploymentRecord = {
      timestamp: new Date().toISOString(),
      networks: {},
      contracts: {}
    };
  }

  async deployContract(contractName, constructorArgs = [], options = {}) {
    console.log(`🚀 Deploying ${contractName}...`);
    
    try {
      // Get contract factory
      const ContractFactory = await hre.ethers.getContractFactory(contractName);
      
      // Deploy with gas optimization
      const deploymentOptions = {
        gasLimit: options.gasLimit || NETWORKS[hre.network.name]?.gasLimit || 6000000,
        gasPrice: options.gasPrice || NETWORKS[hre.network.name]?.gasPrice || "20000000000"
      };

      console.log(`   Gas Limit: ${deploymentOptions.gasLimit}`);
      console.log(`   Gas Price: ${hre.ethers.formatUnits(deploymentOptions.gasPrice, 'gwei')} gwei`);

      const contract = await ContractFactory.deploy(...constructorArgs, deploymentOptions);
      
      // Wait for deployment
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      
      console.log(`✅ ${contractName} deployed to: ${address}`);
      
      // Store deployment info
      this.deployedContracts[contractName] = {
        address,
        contract,
        deploymentTransaction: contract.deploymentTransaction(),
        constructorArgs,
        timestamp: new Date().toISOString()
      };

      return contract;
    } catch (error) {
      console.error(`❌ Failed to deploy ${contractName}:`, error.message);
      throw error;
    }
  }

  async verifyDeployment(contractName) {
    if (!this.deployedContracts[contractName]) {
      throw new Error(`Contract ${contractName} not found in deployment record`);
    }

    const { contract, address } = this.deployedContracts[contractName];
    
    console.log(`🔍 Verifying ${contractName} deployment...`);
    
    try {
      // Basic deployment verification
      const code = await hre.ethers.provider.getCode(address);
      if (code === "0x") {
        throw new Error("Contract not deployed - no code at address");
      }

      // Contract-specific verification
      if (contractName === "TicketBookingSystem") {
        // Test basic contract functionality
        const owner = await contract.owner();
        console.log(`   Owner: ${owner}`);
        
        // Test a simple contract method
        try {
          // This will verify the contract is working without calling filters
          console.log(`   Contract interface: ${contract.interface.fragments.length} functions/events`);
        } catch (error) {
          console.warn(`   Interface check warning: ${error.message}`);
        }
      }

      console.log(`✅ ${contractName} verification passed`);
      return true;
    } catch (error) {
      console.error(`❌ Verification failed for ${contractName}:`, error.message);
      throw error;
    }
  }

  async estimateGasCosts() {
    console.log("\n📊 Gas Estimation Summary:");
    console.log("=".repeat(50));
    
    for (const [contractName, info] of Object.entries(this.deployedContracts)) {
      const tx = info.deploymentTransaction;
      const receipt = await tx.wait();
      
      const gasUsed = receipt.gasUsed;
      const gasPrice = tx.gasPrice;
      const cost = gasUsed * gasPrice;
      
      console.log(`${contractName}:`);
      console.log(`   Gas Used: ${gasUsed.toString()}`);
      console.log(`   Gas Price: ${hre.ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      console.log(`   Cost: ${hre.ethers.formatEther(cost)} ETH`);
      console.log("");
    }
  }

  generateDeploymentRecord() {
    const networkInfo = NETWORKS[hre.network.name] || { name: hre.network.name, chainId: "unknown" };
    
    this.deploymentRecord.networks[hre.network.name] = {
      ...networkInfo,
      timestamp: new Date().toISOString(),
      blockNumber: null // Will be set after deployment
    };

    for (const [contractName, info] of Object.entries(this.deployedContracts)) {
      this.deploymentRecord.contracts[contractName] = {
        address: info.address,
        network: hre.network.name,
        chainId: networkInfo.chainId,
        deploymentBlock: null, // Will be set from transaction receipt
        constructorArgs: info.constructorArgs,
        timestamp: info.timestamp
      };
    }

    return this.deploymentRecord;
  }

  async saveDeploymentArtifacts() {
    try {
      // Create deployments directory
      const deploymentsDir = path.join(__dirname, "..", "deployments");
      if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
      }

      // Save network-specific deployment info
      const networkDir = path.join(deploymentsDir, hre.network.name);
      if (!fs.existsSync(networkDir)) {
        fs.mkdirSync(networkDir, { recursive: true });
      }

      // Get current block number
      const blockNumber = await hre.ethers.provider.getBlockNumber();
      
      // Ensure network record exists
      if (!this.deploymentRecord.networks[hre.network.name]) {
        this.deploymentRecord.networks[hre.network.name] = {};
      }
      this.deploymentRecord.networks[hre.network.name].blockNumber = blockNumber;

      // Update contract deployment blocks
      for (const [contractName, info] of Object.entries(this.deployedContracts)) {
        const tx = info.deploymentTransaction;
        const receipt = await tx.wait();
        this.deploymentRecord.contracts[contractName].deploymentBlock = receipt.blockNumber;
      }

      // Save deployment record
      const deploymentFile = path.join(networkDir, "deployment.json");
      fs.writeFileSync(deploymentFile, JSON.stringify(this.deploymentRecord, null, 2));
      console.log(`💾 Deployment record saved: ${deploymentFile}`);

      // Save individual contract files
      for (const [contractName, info] of Object.entries(this.deployedContracts)) {
        const contractFile = path.join(networkDir, `${contractName}.json`);
        const contractData = {
          address: info.address,
          abi: info.contract.interface.formatJson(),
          network: hre.network.name,
          chainId: this.deploymentRecord.networks[hre.network.name].chainId,
          deploymentBlock: this.deploymentRecord.contracts[contractName].deploymentBlock,
          constructorArgs: info.constructorArgs,
          timestamp: info.timestamp
        };
        
        fs.writeFileSync(contractFile, JSON.stringify(contractData, null, 2));
        console.log(`💾 Contract artifact saved: ${contractFile}`);
      }

      return deploymentFile;
    } catch (error) {
      console.error("❌ Failed to save deployment artifacts:", error.message);
      throw error;
    }
  }
}

async function main() {
  console.log("\n🚀 Starting Multi-Network Contract Deployment");
  console.log("=" .repeat(60));
  
  const networkName = hre.network.name;
  const networkInfo = NETWORKS[networkName] || { name: networkName };
  
  console.log(`📡 Network: ${networkInfo.name} (${networkName})`);
  console.log(`⛓️  Chain ID: ${networkInfo.chainId || 'unknown'}`);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(deployerBalance)} ETH`);
  console.log("");

  // Check minimum balance for deployment
  const minBalance = hre.ethers.parseEther("0.01"); // 0.01 ETH minimum
  if (deployerBalance < minBalance && networkName !== "hardhat") {
    console.warn(`⚠️  Warning: Low balance. Minimum recommended: ${hre.ethers.formatEther(minBalance)} ETH`);
  }

  const deploymentManager = new DeploymentManager();

  try {
    // Deploy TicketBookingSystem
    console.log("📦 Deploying contracts...");
    const ticketBookingSystem = await deploymentManager.deployContract("TicketBookingSystem");

    // Verify deployments
    console.log("\n🔍 Verifying deployments...");
    await deploymentManager.verifyDeployment("TicketBookingSystem");

    // Show gas costs
    await deploymentManager.estimateGasCosts();

    // Generate deployment record
    console.log("📝 Generating deployment record...");
    deploymentManager.generateDeploymentRecord();

    // Save artifacts
    console.log("💾 Saving deployment artifacts...");
    const deploymentFile = await deploymentManager.saveDeploymentArtifacts();

    console.log("\n✅ Deployment completed successfully!");
    console.log(`📄 Deployment record: ${deploymentFile}`);
    
    // Summary
    console.log("\n📋 Deployment Summary:");
    console.log("=" .repeat(40));
    for (const [contractName, info] of Object.entries(deploymentManager.deployedContracts)) {
      console.log(`${contractName}: ${info.address}`);
    }

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { DeploymentManager, NETWORKS };