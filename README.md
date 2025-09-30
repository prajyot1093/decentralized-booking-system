# TicketChain – Multi-Modal Decentralized Booking ��🏨⛓️

Originally a property rental dApp, now pivoted to a unified on-chain platform for Bus, Train & Movie ticket booking (while retaining property stays module).

## 🚀 Project Overview

This MVP now supports two verticals:
1. Property stays (legacy `DecentralizedBookingSystem.sol`)
2. Multi-modal ticketing via `TicketBookingSystem.sol` (bus / train / movie shows)

Core capabilities:
- Service providers list routes/shows with seat counts & base price
- Users purchase specific seats (bitmap-tracked) on-chain
- Refunds allowed until 15 minutes before departure/show
- Provider withdrawal (simplified MVP earnings model)
- Wallet-based authentication (non-custodial)

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

## 📁 Project Structure (Updated)

```
decentralized-booking-system/
├── contracts/
│   ├── contracts/
│   │   ├── DecentralizedBookingSystem.sol   # Property stays
│   │   └── TicketBookingSystem.sol          # Bus/Train/Movie tickets
│   └── scripts/
│       └── deploy_tickets.js                # Seeds demo services
├── frontend/
│   ├── src/
│   │   ├── pages/Tickets.js                 # Ticket UI
│   │   ├── abi/TicketBookingSystem.json     # ABI placeholder
│   │   └── context/Web3Context.js           # Contract wiring
├── backend/ (planned)
└── README.md
```

## 🚀 Quick Start (Frontend Only)

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

### Start Frontend Only
```bash
npm install
cd contracts && npm install && cd ..
cd frontend && npm install && cd ..
npm start
```

### Local Ticket Contract Deployment
```bash
cd contracts
npx hardhat compile
npx hardhat node   # (keep running in one terminal)
npx hardhat run scripts/deploy_tickets.js --network localhost
```
Copy deployed address → create `frontend/.env`:
```
REACT_APP_TICKET_ADDRESS=0xYourDeployedContract
```
Restart frontend.

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

## 📋 Development Roadmap (Revised)

### Phase 1: Core Infrastructure
- [x] Property booking contract
- [x] Ticket booking contract (bus/train/movie)
- [x] Seat bitmap mechanism
- [ ] Backend API (off-chain indexing)

### Phase 2: Frontend Development
- [x] Wallet auth
- [x] Property pages
- [x] Ticket vertical UI (basic)
- [ ] Seat map UI
- [ ] Service listing form (bus/train/movie)

### Phase 3: Advanced Features
- [ ] On-chain enumeration helper for services
- [ ] Ticket transfer / resale
- [ ] Dynamic pricing / surge model
- [ ] Multi-token / stablecoin support
- [ ] Off-chain caching/indexing service

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

## 📊 Project Status

✅ Property booking contract  
✅ Ticket booking contract  
✅ Wallet integration  
✅ Basic ticket UI  
✅ Seed deployment script  
🔄 Seat selection UI  
🔄 Contract tests  
🔄 Backend API  
⏳ Deployment  

## 🎯 Live Demo

Once deployed, the live demo will be available at:
- **Frontend**: TBD
- **Smart Contracts**: TBD (Testnet)

## 📈 Future Enhancements

- Multi-token payment support
- Dispute resolution system
- Property reviews and ratings
- Mobile app development
- Integration with IPFS for image storage

---

**Built with ❤️ for the blockchain community**