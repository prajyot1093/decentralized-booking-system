# 🦊 **MetaMask Testnet Configuration Guide**

## 🌟 **SEPOLIA TESTNET (RECOMMENDED)**

### **✅ Why Sepolia?**
- 🔄 **Most stable** Ethereum testnet
- 💰 **Easy to get test ETH**
- 🏗️ **Best for DApp development**
- 🔗 **Widely supported**

### **📋 Sepolia Network Details:**
```
Network Name: Sepolia Test Network
RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
Chain ID: 11155111
Currency Symbol: SepoliaETH
Block Explorer: https://sepolia.etherscan.io
```

### **🔧 Auto-Add to MetaMask:**
1. **Visit**: https://chainlist.org/
2. **Search**: "Sepolia"
3. **Click**: "Add to MetaMask"
4. **Confirm** in MetaMask popup

---

## 🚀 **POLYGON MUMBAI (FAST & CHEAP)**

### **📋 Mumbai Network Details:**
```
Network Name: Polygon Mumbai
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
Block Explorer: https://mumbai.polygonscan.com
```

### **💡 Why Mumbai?**
- ⚡ **Super fast** transactions (2-5 seconds)
- 💸 **Nearly free** gas fees
- 🔗 **Polygon ecosystem**

---

## 🌊 **BINANCE SMART CHAIN TESTNET**

### **📋 BSC Testnet Details:**
```
Network Name: BSC Testnet
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Currency Symbol: tBNB
Block Explorer: https://testnet.bscscan.com
```

---

## 🎯 **QUICK SETUP METHODS:**

### **Method 1: Automatic (EASIEST)**
1. **Visit**: https://chainlist.org/
2. **Connect** MetaMask
3. **Search** for testnet name
4. **Click** "Add to MetaMask"
5. **Done!** ✅

### **Method 2: Manual Configuration**
1. **Open** MetaMask
2. **Click** network dropdown (top center)
3. **Click** "Add Network"
4. **Fill** network details
5. **Save**

---

## 💰 **GET TEST TOKENS (FAUCETS):**

### **🚰 Sepolia ETH Faucets:**
- **Alchemy**: https://sepoliafaucet.com/
- **Infura**: https://www.infura.io/faucet/sepolia
- **QuickNode**: https://faucet.quicknode.com/ethereum/sepolia

### **🚰 Polygon Mumbai MATIC:**
- **Official**: https://faucet.polygon.technology/
- **Alchemy**: https://mumbaifaucet.com/

### **🚰 BSC Testnet tBNB:**
- **Official**: https://testnet.binance.org/faucet-smart

---

## 🔧 **FOR YOUR BOOKING SYSTEM:**

### **Update Contract Configuration:**
After adding testnet, update your Hardhat config:

```javascript
// contracts/hardhat.config.js
networks: {
  sepolia: {
    url: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
    accounts: ["YOUR_PRIVATE_KEY"],
    chainId: 11155111
  }
}
```

### **Deploy to Testnet:**
```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy_tickets.js --network sepolia

# Get test ETH first from faucet
# Then deploy your booking contract
```

---

## ⚠️ **SECURITY TIPS:**

### **🔐 Important Notes:**
- ✅ **Never use real ETH** private keys for testnets
- ✅ **Create separate MetaMask account** for testing
- ✅ **Always verify** network before transactions
- ✅ **Use official faucets only**

### **🎯 Recommended Workflow:**
1. **Create** new MetaMask account for testing
2. **Add** Sepolia testnet
3. **Get** test ETH from faucet
4. **Deploy** contracts to testnet
5. **Test** your DApp with testnet

---

## 🎉 **READY FOR TESTNET DEPLOYMENT!**

Once you have testnet setup:
1. **Deploy contracts** to testnet
2. **Update frontend** with testnet contract addresses  
3. **Test booking functionality** with fake ETH
4. **Share testnet demo** with others!