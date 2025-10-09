#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Network Management CLI Tool
 * Handles deployment, verification, and configuration across multiple networks
 */

class NetworkManager {
  constructor() {
    this.contractsDir = path.join(__dirname, "..");
    this.deploymentDir = path.join(this.contractsDir, "deployments");
  }

  /**
   * Execute shell command with promise
   */
  execCommand(command, cwd = this.contractsDir) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\nSTDERR: ${stderr}`));
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  /**
   * Check if network is configured in Hardhat
   */
  isNetworkConfigured(network) {
    const configFile = path.join(this.contractsDir, "hardhat.config.js");
    if (!fs.existsSync(configFile)) {
      return false;
    }

    const config = fs.readFileSync(configFile, "utf8");
    return config.includes(`${network}:`);
  }

  /**
   * Deploy contracts to specific network
   */
  async deployToNetwork(network, options = {}) {
    console.log(`\n🚀 Deploying to network: ${network}`);
    console.log("=" .repeat(50));

    try {
      // Check network configuration
      if (!this.isNetworkConfigured(network) && network !== "hardhat") {
        throw new Error(`Network ${network} is not configured in hardhat.config.js`);
      }

      // Compile contracts first
      console.log("📦 Compiling contracts...");
      await this.execCommand("npx hardhat compile");
      console.log("✅ Contracts compiled successfully");

      // Deploy using multi-network script
      const deployCommand = `npx hardhat run scripts/deploy-multi-network.js --network ${network}`;
      console.log(`🔄 Running: ${deployCommand}`);
      
      const { stdout, stderr } = await this.execCommand(deployCommand);
      console.log(stdout);
      
      if (stderr) {
        console.warn("Warning:", stderr);
      }

      // Inject contracts into frontend/backend
      if (options.inject !== false) {
        console.log("\n🔄 Injecting contract addresses...");
        await this.execCommand(`node scripts/inject-contracts.js ${network}`);
      }

      console.log(`\n✅ Deployment to ${network} completed successfully!`);
      return true;

    } catch (error) {
      console.error(`\n❌ Deployment to ${network} failed:`, error.message);
      return false;
    }
  }

  /**
   * Start local Hardhat node
   */
  async startLocalNode(options = {}) {
    console.log("\n🌐 Starting local Hardhat network...");
    
    try {
      const nodeCommand = "npx hardhat node";
      console.log(`🔄 Running: ${nodeCommand}`);
      
      if (options.background) {
        // Start in background
        const { spawn } = require("child_process");
        const child = spawn("npx", ["hardhat", "node"], {
          cwd: this.contractsDir,
          detached: true,
          stdio: ["ignore", "pipe", "pipe"]
        });

        child.unref();
        console.log(`✅ Local node started in background (PID: ${child.pid})`);
        return child;
      } else {
        // Start in foreground (blocking)
        await this.execCommand(nodeCommand);
      }

    } catch (error) {
      console.error("❌ Failed to start local node:", error.message);
      throw error;
    }
  }

  /**
   * Deploy to multiple networks
   */
  async deployToMultipleNetworks(networks, options = {}) {
    console.log(`\n🌐 Deploying to ${networks.length} networks: ${networks.join(', ')}`);
    
    const results = {};
    
    for (const network of networks) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📡 Processing network: ${network}`);
      console.log(`${"=".repeat(60)}`);
      
      try {
        results[network] = await this.deployToNetwork(network, options);
        
        // Wait between deployments to avoid rate limits
        if (options.delay && networks.indexOf(network) < networks.length - 1) {
          console.log(`⏳ Waiting ${options.delay}ms before next deployment...`);
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
        
      } catch (error) {
        console.error(`❌ Failed to deploy to ${network}:`, error.message);
        results[network] = false;
        
        if (options.stopOnError) {
          console.error("🛑 Stopping deployment due to error");
          break;
        }
      }
    }

    // Summary
    console.log(`\n${"=".repeat(60)}`);
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log(`${"=".repeat(60)}`);
    
    const successful = Object.entries(results).filter(([_, success]) => success).map(([network]) => network);
    const failed = Object.entries(results).filter(([_, success]) => !success).map(([network]) => network);
    
    console.log(`✅ Successful deployments (${successful.length}): ${successful.join(', ') || 'None'}`);
    console.log(`❌ Failed deployments (${failed.length}): ${failed.join(', ') || 'None'}`);
    
    return results;
  }

  /**
   * Verify deployed contracts on Etherscan-like explorers
   */
  async verifyContracts(network, options = {}) {
    console.log(`\n🔍 Verifying contracts on ${network}...`);
    
    try {
      // Check if deployment exists
      const deploymentFile = path.join(this.deploymentDir, network, "deployment.json");
      if (!fs.existsSync(deploymentFile)) {
        throw new Error(`No deployment found for network: ${network}`);
      }

      const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      
      // Verify each contract
      for (const [contractName, contractInfo] of Object.entries(deployment.contracts)) {
        console.log(`🔍 Verifying ${contractName}...`);
        
        try {
          const verifyCommand = `npx hardhat verify --network ${network} ${contractInfo.address}`;
          console.log(`🔄 Running: ${verifyCommand}`);
          
          const { stdout, stderr } = await this.execCommand(verifyCommand);
          console.log(stdout);
          
          if (stderr && !stderr.includes("Already Verified")) {
            console.warn("Warning:", stderr);
          }
          
          console.log(`✅ ${contractName} verified successfully`);
          
        } catch (error) {
          if (error.message.includes("Already Verified")) {
            console.log(`ℹ️  ${contractName} is already verified`);
          } else {
            console.error(`❌ Failed to verify ${contractName}:`, error.message);
          }
        }
      }

      console.log(`\n✅ Contract verification completed for ${network}`);
      return true;

    } catch (error) {
      console.error(`\n❌ Contract verification failed for ${network}:`, error.message);
      return false;
    }
  }

  /**
   * Check deployment status across networks
   */
  getDeploymentStatus() {
    console.log("\n📊 Deployment Status Summary");
    console.log("=" .repeat(50));
    
    if (!fs.existsSync(this.deploymentDir)) {
      console.log("📭 No deployments found");
      return {};
    }

    const networks = fs.readdirSync(this.deploymentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const status = {};

    for (const network of networks) {
      const deploymentFile = path.join(this.deploymentDir, network, "deployment.json");
      
      if (fs.existsSync(deploymentFile)) {
        const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
        const contracts = Object.keys(deployment.contracts);
        
        status[network] = {
          timestamp: deployment.timestamp,
          contracts: contracts,
          chainId: deployment.networks[network]?.chainId,
          blockNumber: deployment.networks[network]?.blockNumber
        };

        console.log(`📡 ${network.toUpperCase()}`);
        console.log(`   Chain ID: ${status[network].chainId}`);
        console.log(`   Contracts: ${contracts.join(', ')}`);
        console.log(`   Deployed: ${new Date(deployment.timestamp).toLocaleString()}`);
        console.log(`   Block: ${status[network].blockNumber}`);
        console.log("");
      }
    }

    return status;
  }

  /**
   * Clean deployments for specific network or all
   */
  cleanDeployments(network = null) {
    if (network) {
      const networkDir = path.join(this.deploymentDir, network);
      if (fs.existsSync(networkDir)) {
        fs.rmSync(networkDir, { recursive: true, force: true });
        console.log(`🗑️  Cleaned deployments for ${network}`);
      } else {
        console.log(`ℹ️  No deployments found for ${network}`);
      }
    } else {
      if (fs.existsSync(this.deploymentDir)) {
        fs.rmSync(this.deploymentDir, { recursive: true, force: true });
        console.log("🗑️  Cleaned all deployments");
      } else {
        console.log("ℹ️  No deployments to clean");
      }
    }
  }
}

// CLI Interface
async function main() {
  const manager = new NetworkManager();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "deploy":
        const network = args[1];
        if (!network) {
          console.error("❌ Please specify a network: deploy <network>");
          process.exit(1);
        }
        await manager.deployToNetwork(network);
        break;

      case "deploy-all":
        const networks = ["localhost", "sepolia", "mumbai"];
        await manager.deployToMultipleNetworks(networks, { delay: 2000 });
        break;

      case "start-node":
        await manager.startLocalNode({ background: args.includes("--background") });
        break;

      case "verify":
        const verifyNetwork = args[1];
        if (!verifyNetwork) {
          console.error("❌ Please specify a network: verify <network>");
          process.exit(1);
        }
        await manager.verifyContracts(verifyNetwork);
        break;

      case "status":
        manager.getDeploymentStatus();
        break;

      case "clean":
        const cleanNetwork = args[1];
        manager.cleanDeployments(cleanNetwork);
        break;

      case "inject":
        const injectNetwork = args[1];
        if (injectNetwork) {
          await manager.execCommand(`node scripts/inject-contracts.js ${injectNetwork}`);
        } else {
          await manager.execCommand("node scripts/inject-contracts.js");
        }
        break;

      default:
        console.log(`
🚀 Network Manager CLI

Usage: node scripts/network-manager.js <command> [options]

Commands:
  deploy <network>     Deploy contracts to specific network
  deploy-all          Deploy to all configured networks  
  start-node          Start local Hardhat node
  verify <network>    Verify contracts on block explorer
  status              Show deployment status
  clean [network]     Clean deployment artifacts
  inject [network]    Inject contract addresses into apps

Examples:
  node scripts/network-manager.js deploy localhost
  node scripts/network-manager.js deploy-all
  node scripts/network-manager.js start-node --background
  node scripts/network-manager.js verify sepolia
  node scripts/network-manager.js status
  node scripts/network-manager.js clean localhost
  node scripts/network-manager.js inject
        `);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { NetworkManager };