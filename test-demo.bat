@echo off
cls
echo ================================
echo   SYSTEM QUICK TEST
echo ================================
echo.

echo 🔍 Testing Backend Health...
timeout /t 2 /nobreak >nul
powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 5).Content } catch { 'Backend not responding' }"
echo.

echo 🔍 Testing Services API...
timeout /t 1 /nobreak >nul
powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:3001/api/services' -TimeoutSec 5).Content } catch { 'Services API not responding' }"
echo.

echo 🌐 Opening Frontend...
start http://localhost:3000

echo.
echo ✅ Test complete! Frontend should open automatically.
echo.
pause