#!/bin/bash

# Quick Setup Script for TicketChain Development Environment
# Run this script to set up the complete development environment

echo "🎫 TicketChain Development Environment Setup"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm detected: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "Installing contract dependencies..."
cd contracts && npm install && cd ..

# Copy environment files
echo ""
echo "⚙️ Setting up environment variables..."

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from example"
else
    echo "✅ Frontend .env already exists"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
else
    echo "✅ Backend .env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the development environment:"
echo "   1. Start blockchain: cd contracts && npx hardhat node"
echo "   2. Deploy contracts: cd contracts && npx hardhat run scripts/deploy_tickets.js --network localhost"
echo "   3. Start backend: cd backend && npm start"
echo "   4. Start frontend: cd frontend && npm start"
echo ""
echo "Or use the quick command: npm run dev"
echo ""
echo "📖 For more information, see README.md and DEPLOYMENT.md"