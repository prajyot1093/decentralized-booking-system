@echo off
REM Quick Setup Script for TicketChain Development Environment (Windows)
REM Run this script to set up the complete development environment

echo 🎫 TicketChain Development Environment Setup
echo =============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ and try again.
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    exit /b 1
)

echo ✅ npm detected
npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
echo Installing root dependencies...
npm install

echo Installing backend dependencies...
cd backend && npm install && cd ..

echo Installing frontend dependencies...
cd frontend && npm install && cd ..

echo Installing contract dependencies...
cd contracts && npm install && cd ..

REM Copy environment files
echo.
echo ⚙️ Setting up environment variables...

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env" >nul
    echo ✅ Created frontend/.env from example
) else (
    echo ✅ Frontend .env already exists
)

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo ✅ Created backend/.env from example
) else (
    echo ✅ Backend .env already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 To start the development environment:
echo    1. Start blockchain: cd contracts ^&^& npx hardhat node
echo    2. Deploy contracts: cd contracts ^&^& npx hardhat run scripts/deploy_tickets.js --network localhost
echo    3. Start backend: cd backend ^&^& npm start
echo    4. Start frontend: cd frontend ^&^& npm start
echo.
echo Or use the quick command: npm run dev
echo.
echo 📖 For more information, see README.md and DEPLOYMENT.md

pause