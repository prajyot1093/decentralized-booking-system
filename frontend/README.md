# Frontend README

## Decentralized Booking System - Frontend

A React-based frontend for the decentralized booking platform built with Material-UI and Web3 integration.

## Features

- **Web3 Wallet Integration** - Connect with MetaMask and other Web3 wallets
- **Property Browsing** - Search and filter available properties
- **Booking Management** - Create and manage property bookings
- **Property Listing** - List your own properties for rent
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Updates** - Live blockchain transaction status

## Tech Stack

- **React 18** - Modern React with hooks
- **Material-UI** - Professional UI components
- **Ethers.js** - Ethereum blockchain interaction
- **React Router** - Client-side routing
- **React Hot Toast** - Toast notifications

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Environment Setup

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Update the environment variables with your configuration

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.js       # Navigation component
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Properties.js   # Property listings
│   ├── BookingForm.js  # Booking interface
│   ├── MyBookings.js   # User bookings
│   └── MyProperties.js # Property management
├── context/            # React context providers
│   └── Web3Context.js  # Web3 state management
├── App.js             # Main application component
├── index.js           # Application entry point
└── index.css          # Global styles
```

## Web3 Integration

The frontend integrates with Ethereum-compatible blockchains:

- **MetaMask** - Primary wallet connection
- **Smart Contracts** - Direct blockchain interaction
- **Transaction Handling** - Real-time transaction status
- **Network Detection** - Multi-chain support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details