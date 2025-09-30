# Deployment Guide

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 16+
- npm or yarn
- Git
- MetaMask or Web3 wallet

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/prajyot1093/decentralized-booking-system.git
cd decentralized-booking-system
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

4. **Start development environment**
```bash
npm run dev
```

This will start:
- Hardhat local blockchain (port 8545)
- Backend API server (port 3001)
- React frontend (port 3000)

### Production Deployment

#### Frontend (Vercel/Netlify)

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

3. **Environment Variables**
Set these in your deployment platform:
- `REACT_APP_API_URL`
- `REACT_APP_CONTRACT_ADDRESS`
- `REACT_APP_CHAIN_ID`

#### Backend (Railway/Heroku)

1. **Prepare for deployment**
```bash
cd backend
npm install
```

2. **Set environment variables**
- `DATABASE_URL`
- `JWT_SECRET`
- `RPC_URL`

#### Smart Contracts (Testnet)

1. **Deploy to testnet**
```bash
cd contracts
npx hardhat run scripts/deploy.js --network goerli
```

2. **Update frontend with contract address**

### Testing

```bash
# Test smart contracts
cd contracts && npm test

# Test backend
cd backend && npm test

# Test frontend
cd frontend && npm test
```

### Monitoring

- Frontend: Browser console for errors
- Backend: Server logs
- Blockchain: Etherscan for transactions

### Troubleshooting

#### Common Issues

1. **Wallet not connecting**
   - Ensure MetaMask is installed
   - Check network configuration
   - Clear browser cache

2. **Transaction failures**
   - Check gas fees
   - Verify contract addresses
   - Ensure sufficient balance

3. **API errors**
   - Verify backend is running
   - Check CORS settings
   - Validate environment variables

### Support

For deployment issues:
1. Check the logs
2. Verify environment variables
3. Test on local environment first
4. Contact support via GitHub issues