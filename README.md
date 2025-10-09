# TicketChain — Decentralized Multi‑Modal Ticketing (Prototype)

> A hackathon prototype for decentralized ticket booking across bus, train, and movie events. Built with React (MUI), Hardhat smart contracts, and an optional Node.js indexer/API.

This repository contains a frontend UI, Solidity smart contracts, and a minimal backend skeleton used to index on‑chain services for faster listing and seat occupancy checks. The project is intentionally designed to be demoable on public testnets (Sepolia / Polygon testnets) and locally via Hardhat.

Status: **Real-Time Blockchain Integration Complete** — Full end-to-end blockchain connectivity with live event listening, multi-network support, and intelligent API fallback. All UI features implemented with real contract interactions.

----------------------------------------------------------------------

## Tech stack
- Frontend: React 18, Material UI v5, react-hot-toast, ethers.js (v6)
- Smart contracts: Solidity, Hardhat
- Backend: Node.js, Express (optional indexer / API)
- Dev tools: Hardhat, ESLint, Jest (tests to be added), GitHub Actions (CI)

----------------------------------------------------------------------

## Quick start (local development)
These steps assume you have Node.js (16+), npm, and Git installed.

1. Clone the repo

	git clone <your-repo-url>
	cd "Decentralized booking system"

2. Install dependencies for top-level packages (frontend and backend)

	# Frontend
	cd frontend
	npm install

	# Backend
	cd ../backend
	npm install

3. Frontend (development)

	cd frontend
	npm run start

	Open http://localhost:3000 in your browser.

4. Backend (development)

	cd backend
	# make sure .env is configured if you use RPC keys
	node src/server.js

	The backend will listen on the port from .env (default 3001). Health: `GET /api/health`.

----------------------------------------------------------------------

## Environment variables
Create a `.env` file in `frontend` and `backend` if you plan to run against testnet RPC or a real indexer. Example keys used by the codebase:

Frontend (`frontend/.env`)
- REACT_APP_TICKET_ADDRESS=0x...   # deployed TicketBookingSystem contract address (testnet)
- REACT_APP_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/<KEY>  # optional
- REACT_APP_PERF_MODE=1            # optional performance mode to reduce heavy effects

Backend (`backend/.env`)
- PORT=3001
- FRONTEND_URL=http://localhost:3000
- RPC_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/<KEY>  # for event listener (optional)

Note: Do not commit private keys or secrets to the repo.

----------------------------------------------------------------------

## Quick Demo (3-step script)
This is the minimal demo flow to show in 60–90 seconds during a hackathon presentation.

1. Connect wallet (MetaMask) in the frontend.
2. Select a service (Bus / Train / Movie) and open the seat map.
3. Pick seats, click Book → watch TransactionPanel update, open the transaction on Etherscan (testnet) to show the on‑chain result.

See `DEMO.md` for a more detailed timed script and exact CLI commands (local & seeded testnet).

----------------------------------------------------------------------

## Project structure (key folders)
- `frontend/` — React app, components, theme, pages
- `contracts/` — Solidity contracts and Hardhat config
- `backend/` — Express API and indexer skeleton
- `docs/` — supporting diagrams and documentation

----------------------------------------------------------------------

## ✅ Completed Features (Commit 7)

### 🔗 Real-Time Blockchain Integration
- **Multi-network contract integration** with automatic address injection
- **Live event listening** for ServiceCreated, SeatBooked, SeatCancelled events
- **Network detection & switching** with MetaMask integration
- **Smart fallback strategy** - blockchain-first with graceful API fallback
- **Enhanced Web3Context** with real contract interactions
- **Blockchain data hooks** with comprehensive error handling
- **Real-time UI updates** based on contract events

### 🎫 Enhanced Components
- **BlockchainServices** page with service creation and live event feed
- **Enhanced SeatMap** showing real-time blockchain booking status
- **Network status indicators** and connection management
- **Progressive enhancement** - works without wallet, enhanced with wallet

### 🌐 Multi-Network Support
- **Localhost** (Hardhat node) for development
- **Sepolia** testnet for staging
- **Ethereum Mainnet** for production
- **Polygon** (mainnet and Mumbai testnet)
- **Automatic network addition** and configuration

## 🎯 Next Steps & Roadmap

### Commit 8: Advanced Booking Features
- Escrow payments and automatic refunds
- Booking confirmations and receipts
- Multi-token payment support (USDC, DAI)
- Batch booking operations

### Commit 9: Production Monitoring
- Gas cost optimization and estimation
- Transaction failure recovery
- Performance analytics and monitoring
- Error tracking and notifications

### Commit 10: Enhanced UX Features
- Booking history and analytics
- Social features and reviews
- Advanced filtering and search
- Mobile app development

----------------------------------------------------------------------

If you need a scripted demo or a public deployment (Vercel / Render), follow `DEMO.md` and `docs/deploy.md` (coming soon).

Thanks — good luck with your hackathon!

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