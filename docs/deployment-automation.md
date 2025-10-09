# Contract Deployment Automation

This document describes the comprehensive contract deployment and management system implemented in Commit 6.

## 🎯 Overview

The deployment automation system provides:
- **Multi-network deployment** support (localhost, Sepolia, Mumbai, Polygon, etc.)
- **Automated contract address injection** into frontend and backend
- **Network configuration management** with gas optimization
- **Deployment verification and validation**
- **Cross-platform CLI tools** for Windows and Unix systems

## 📁 File Structure

```
contracts/
├── scripts/
│   ├── deploy-multi-network.js     # Core deployment script
│   ├── inject-contracts.js         # Contract address injection
│   └── network-manager.js          # CLI management tool
├── deployments/                    # Generated deployment artifacts
│   └── [network]/
│       ├── deployment.json         # Network deployment record
│       └── TicketBookingSystem.json # Contract-specific data
└── hardhat.config.js              # Enhanced network configuration

frontend/
├── src/
│   ├── config/
│   │   ├── contracts.js            # Main contract configuration
│   │   └── contracts.[network].js  # Network-specific configs
│   └── abi/
│       └── TicketBookingSystem.json # Updated ABI files

backend/
└── src/
    └── config/
        ├── contracts.js            # Main backend contract config  
        └── contracts.[network].js  # Network-specific configs

# Cross-platform deployment scripts
deploy-contracts.sh                 # Unix/Linux/macOS script
deploy-contracts.bat               # Windows batch script
.env.example                       # Environment template
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# - Add PRIVATE_KEY for deployments
# - Add RPC URLs for target networks
# - Add API keys for contract verification
```

### 2. Deploy Contracts

#### Option A: Using Cross-Platform Scripts

**Unix/Linux/macOS:**
```bash
# Complete setup and deployment
./deploy-contracts.sh full-deploy localhost

# Individual commands
./deploy-contracts.sh setup         # Initial setup
./deploy-contracts.sh compile       # Compile contracts
./deploy-contracts.sh deploy sepolia # Deploy to Sepolia
```

**Windows:**
```cmd
REM Complete setup and deployment
deploy-contracts.bat full-deploy localhost

REM Individual commands
deploy-contracts.bat setup         REM Initial setup
deploy-contracts.bat compile       REM Compile contracts  
deploy-contracts.bat deploy sepolia REM Deploy to Sepolia
```

#### Option B: Using Network Manager CLI

```bash
cd contracts

# Deploy to specific network
node scripts/network-manager.js deploy localhost

# Deploy to all networks
node scripts/network-manager.js deploy-all

# Check deployment status
node scripts/network-manager.js status
```

#### Option C: Direct Deployment Scripts

```bash
cd contracts

# Deploy contracts
node scripts/deploy-multi-network.js --network hardhat

# Inject addresses into frontend/backend
node scripts/inject-contracts.js hardhat
```

## 🌐 Supported Networks

| Network | Chain ID | Purpose | Configuration Required |
|---------|----------|---------|----------------------|
| hardhat | 31337 | Development | None (built-in) |
| localhost | 31337 | Local node | Start `hardhat node` |
| sepolia | 11155111 | Ethereum testnet | RPC URL + Private Key |
| mumbai | 80001 | Polygon testnet | RPC URL + Private Key |
| polygon | 137 | Polygon mainnet | RPC URL + Private Key |
| mainnet | 1 | Ethereum mainnet | RPC URL + Private Key |

## 🛠️ Deployment Features

### 1. Multi-Network Deployment

The system automatically detects network configuration and optimizes gas settings:

```javascript
// Network-specific gas optimization
const NETWORKS = {
  sepolia: {
    gasPrice: "30000000000", // 30 gwei
    gasLimit: 8000000
  },
  polygon: {
    gasPrice: "30000000000", // 30 gwei  
    gasLimit: 10000000
  }
};
```

### 2. Automated Address Injection

After deployment, contract addresses are automatically injected into:

**Frontend (React):**
```javascript
// Auto-generated: frontend/src/config/contracts.hardhat.js
export const contractAddresses = {
  TicketBookingSystem: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

export const contractABIs = {
  TicketBookingSystem: [...] // Full ABI
};
```

**Backend (Node.js):**
```javascript
// Auto-generated: backend/src/config/contracts.hardhat.js
const contractAddresses = {
  TicketBookingSystem: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};
```

### 3. Network Detection & Configuration

The frontend automatically detects the connected network:

```javascript
import { getNetworkConfig, getContract } from './config/contracts.js';

// Automatically load config for current network
const config = await getNetworkConfig(chainId);
const contract = await getContract('TicketBookingSystem', signer, chainId);
```

### 4. Deployment Verification

Each deployment includes comprehensive verification:

- ✅ Contract deployment confirmation
- ✅ Owner verification
- ✅ Interface validation  
- ✅ Gas cost estimation
- ✅ Block explorer verification (optional)

## 📊 Deployment Artifacts

### Deployment Record (`deployments/[network]/deployment.json`)

```json
{
  "timestamp": "2024-01-09T23:11:47.000Z",
  "networks": {
    "hardhat": {
      "name": "Hardhat Local",
      "chainId": 31337,
      "rpcUrl": "http://127.0.0.1:8545",
      "blockNumber": 1
    }
  },
  "contracts": {
    "TicketBookingSystem": {
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "network": "hardhat",
      "chainId": 31337,
      "deploymentBlock": 1,
      "constructorArgs": [],
      "timestamp": "2024-01-09T23:11:47.000Z"
    }
  }
}
```

### Contract Artifact (`deployments/[network]/TicketBookingSystem.json`)

```json
{
  "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "abi": [...], // Full contract ABI
  "network": "hardhat",
  "chainId": 31337,
  "deploymentBlock": 1,
  "constructorArgs": [],
  "timestamp": "2024-01-09T23:11:47.000Z"
}
```

## 🔧 CLI Commands Reference

### Network Manager Commands

```bash
# Deployment
node scripts/network-manager.js deploy <network>
node scripts/network-manager.js deploy-all

# Local development
node scripts/network-manager.js start-node [--background]

# Verification  
node scripts/network-manager.js verify <network>

# Management
node scripts/network-manager.js status
node scripts/network-manager.js clean [network]
node scripts/network-manager.js inject [network]
```

### Cross-Platform Scripts

**Setup & Compilation:**
```bash
./deploy-contracts.sh setup      # Complete environment setup
./deploy-contracts.sh install    # Install dependencies
./deploy-contracts.sh compile    # Compile contracts
./deploy-contracts.sh test       # Run tests
```

**Local Development:**
```bash
./deploy-contracts.sh start-node [--background]  # Start local node
./deploy-contracts.sh stop-node                  # Stop local node
```

**Deployment:**
```bash
./deploy-contracts.sh deploy <network>        # Deploy to network
./deploy-contracts.sh full-deploy [network]   # Complete workflow
./deploy-contracts.sh deploy-all             # Deploy everywhere
```

**Management:**
```bash
./deploy-contracts.sh verify <network>    # Verify contracts
./deploy-contracts.sh inject [network]    # Inject addresses
./deploy-contracts.sh status             # Show status
./deploy-contracts.sh clean [network]    # Clean artifacts
```

## 🔐 Security & Best Practices

### 1. Private Key Management

**❌ Never do this:**
```bash
# DON'T commit private keys to git
PRIVATE_KEY=0x1234567890abcdef... 
```

**✅ Best practices:**
```bash
# Use environment variables
PRIVATE_KEY=your_key_here

# Generate dedicated deployment wallet
# Use hardware wallet for production
# Use different keys for different networks
```

### 2. Network Configuration

**Development:**
```bash
BLOCKCHAIN_NETWORK=localhost
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
```

**Production:**
```bash
BLOCKCHAIN_NETWORK=mainnet
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
AUTO_VERIFY=true
```

### 3. Gas Optimization

The system automatically optimizes gas usage:

- **Hardhat/Localhost:** 20 gwei (fast development)
- **Testnets:** 30 gwei (reliable confirmation)
- **Mainnet:** Auto-detection (market-based)

## 🚨 Troubleshooting

### Common Issues

**1. "Cannot connect to network localhost"**
```bash
# Start local node first
npx hardhat node
# or
./deploy-contracts.sh start-node --background
```

**2. "Insufficient funds"**
```bash
# Check deployer balance
# Get testnet ETH from faucets:
# Sepolia: https://sepoliafaucet.com
# Mumbai: https://faucet.polygon.technology
```

**3. "Network not configured"**
```bash
# Check hardhat.config.js network settings
# Verify .env file configuration  
# Ensure RPC URL is accessible
```

**4. Contract verification fails**
```bash
# Check API keys in .env
# Verify network supports verification
# Use manual verification as backup
```

### Debug Mode

Enable verbose logging:

```bash
# Add to .env
DEBUG=true
REPORT_GAS=true

# Run with debug output
node scripts/network-manager.js deploy sepolia
```

## 🔄 Integration Workflow

### 1. Development Cycle

```bash
# 1. Setup (once)
./deploy-contracts.sh setup

# 2. Development loop
./deploy-contracts.sh compile
./deploy-contracts.sh test
./deploy-contracts.sh deploy localhost

# 3. Integration test
./deploy-contracts.sh inject localhost
# Test frontend/backend integration
```

### 2. Testnet Deployment

```bash
# 1. Configure testnet
# Add SEPOLIA_RPC_URL and PRIVATE_KEY to .env

# 2. Deploy to testnet  
./deploy-contracts.sh deploy sepolia

# 3. Verify contracts
./deploy-contracts.sh verify sepolia

# 4. Update frontend config
./deploy-contracts.sh inject sepolia
```

### 3. Production Deployment

```bash
# 1. Security review
# - Audit contract code
# - Verify deployment scripts
# - Test on testnet first

# 2. Production deploy
./deploy-contracts.sh deploy mainnet

# 3. Verification & documentation
./deploy-contracts.sh verify mainnet
./deploy-contracts.sh status
```

## 📈 Next Steps

This deployment automation system enables:

1. **Real Contract Testing:** Frontend can now connect to deployed contracts
2. **Multi-Environment Support:** Seamless development → testnet → production flow
3. **Team Collaboration:** Shared deployment artifacts and configuration
4. **Production Readiness:** Automated verification and gas optimization

**Ready for Commit 7:** Advanced Features Implementation
- Real-time blockchain event listening
- Enhanced booking flow with deployed contracts
- Multi-network switching in frontend
- Production monitoring and analytics

---

## 📋 Summary

**✅ Completed in Commit 6:**
- Multi-network deployment system
- Automated contract address injection  
- Cross-platform CLI tools
- Network configuration management
- Deployment verification and validation
- Complete documentation and examples

The decentralized booking system now has a production-ready deployment infrastructure that supports the full development lifecycle from local testing to mainnet deployment.