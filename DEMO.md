# Demo Script — TicketChain (60-90s)

This document contains the exact steps to run a short live demo (or follow along with a local Hardhat fallback). Use this as your script for judges.

Prerequisites
- MetaMask installed with a testnet account (Sepolia or configured testnet) and small test ETH from faucet.
- Frontend running at `http://localhost:3000` and backend (optional) at `http://localhost:3001`.

Local quick start commands

1. Start backend (optional indexer)

   cd backend
   node src/server.js

2. Start frontend

   cd frontend
   npm run start

Timed demo flow (60-90s)

0-15s: Landing & intro
- Show the TicketChain homepage, mention multi-modal (bus/train/movie), and the neon/anime theme toggle.

15-35s: Connect wallet & show services
- Click Connect (MetaMask); pick Sepolia account.
- Show the Tickets page with service cards. Mention that services are stored on-chain; backend indexer speeds listing.

35-70s: Seat selection + Booking
- Open a service card and click Book → seat map appears.
- Select 1–2 seats, click Confirm. Point out optimistic UI and TransactionPanel.
- Show the pending transaction in TransactionPanel and click the Etherscan link to show the testnet transaction (or a cached screenshot if slow).

70-90s: Wrap-up
- Show seats updated (booked) in the seat map; mention events update the UI in near real-time.
- Call out next steps: on-chain resale, loyalty composability, and planned UPI/fiat bridge in future phases.

Fallback (if testnet is down)
- Run a local Hardhat node and use the `scripts/seed.js` to list services and a local wallet to perform bookings. Use pre-recorded video if needed.

CLI reference (seed & run locally)

Deploy locally (Hardhat local node):

  # in contracts/
  npx hardhat node
  # in another terminal, deploy & seed
  npx hardhat run scripts/deploy.js --network localhost
  npx hardhat run scripts/seed.js --network localhost

Start backend & frontend (from repo root):

  cd backend && node src/server.js
  cd ../frontend && npm run start

Notes
- If you rely on a public testnet, keep Alchemy/Infura RPC keys in `.env` and have a pre-funded test account.
