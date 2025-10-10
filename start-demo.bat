@echo off
cls
echo ================================
echo  DECENTRALIZED BOOKING SYSTEM
echo        DEMO STARTUP
echo ================================
echo.

echo 🔧 Starting Backend Server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo 🌐 Starting Frontend Server...
cd /d "%~dp0frontend"  
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Both servers starting...
echo.
echo 📡 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo 💡 Mode: Demo (no blockchain required)
echo.
echo Wait 10-15 seconds then open: http://localhost:3000
echo.
pause