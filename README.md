# Decentralized Booking System 🏨⛓️

A blockchain-powered booking system built for hackathon competition, enabling decentralized property rentals with smart contract automation.

## 🚀 Project Overview

This project implements a decentralized booking system where:
- Property owners can list their accommodations
- Guests can book properties with cryptocurrency payments
- Smart contracts handle booking logic, payments, and disputes
- All transactions are transparent and immutable on the blockchain

## 🛠️ Tech Stack

### Blockchain Layer
- **Solidity** - Smart contract development
- **Hardhat/Truffle** - Development framework
- **Ethereum/Polygon** - Blockchain network
- **MetaMask** - Wallet integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database for off-chain data
- **Web3.js/Ethers.js** - Blockchain interaction

### Frontend
- **React.js** - User interface
- **Web3 React** - Blockchain connectivity
- **Material-UI/Tailwind** - UI components
- **IPFS** - Decentralized file storage

## 📁 Project Structure

```
decentralized-booking-system/
├── contracts/                 # Smart contracts
│   ├── BookingSystem.sol
│   ├── PropertyNFT.sol
│   └── PaymentHandler.sol
├── backend/                   # Node.js API
│   ├── src/
│   ├── tests/
│   └── package.json
├── frontend/                  # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/                      # Documentation
├── scripts/                   # Deployment scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MetaMask wallet
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd decentralized-booking-system

# Install dependencies for all modules
npm run install-all

# Set up environment variables
cp .env.example .env
```

### Development
```bash
# Start the development environment
npm run dev

# This will start:
# - Hardhat local blockchain (port 8545)
# - Backend API server (port 3001)
# - React frontend (port 3000)
```

## 🔧 Development Setup

1. **Smart Contracts**: Deploy to local network first
2. **Backend**: Configure Web3 provider and database
3. **Frontend**: Connect to MetaMask and backend API

## 👥 Team Collaboration

### Getting Started
1. Clone this repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `npm run install-all`
4. Start development: `npm run dev`

### Workflow
1. Pick a task from GitHub Issues
2. Create a feature branch
3. Develop and test your changes
4. Submit a Pull Request
5. Code review and merge

## 📋 Development Roadmap

### Phase 1: Core Infrastructure
- [ ] Smart contract architecture
- [ ] Basic booking functionality
- [ ] Payment handling
- [ ] Backend API setup

### Phase 2: Frontend Development
- [ ] User authentication (Web3)
- [ ] Property listing interface
- [ ] Booking flow
- [ ] Payment integration

### Phase 3: Advanced Features
- [ ] Dispute resolution
- [ ] Review system
- [ ] Multi-token support
- [ ] Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Goals

- Create a functional MVP within the hackathon timeline
- Demonstrate blockchain integration
- Showcase modern web development practices
- Build a user-friendly interface

---

**Built with ❤️ for the blockchain community**