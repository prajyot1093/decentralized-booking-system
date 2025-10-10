@echo off
echo Testing Restored System...
echo.
echo 1. Checking Hardhat node (8545)...
netstat -ano | find ":8545" > nul && echo "✓ Hardhat running" || echo "✗ Hardhat not found"

echo.
echo 2. Checking backend API (3001)...
netstat -ano | find ":3001" > nul && echo "✓ Backend running" || echo "✗ Backend not found"

echo.
echo 3. Testing health endpoint...
powershell -Command "try { $r = Invoke-WebRequest 'http://localhost:3001/api/health' -UseBasicParsing; Write-Host '✓ Health check:' $r.StatusCode } catch { Write-Host '✗ Health failed:' $_.Exception.Message }"

echo.
echo 4. Testing services API...
powershell -Command "try { $r = Invoke-WebRequest 'http://localhost:3001/api/services' -UseBasicParsing; $j = $r.Content | ConvertFrom-Json; Write-Host '✓ Services API:' $j.total 'services found' } catch { Write-Host '✗ Services failed:' $_.Exception.Message }"

echo.
echo 5. Checking frontend (3000)...
netstat -ano | find ":3000" > nul && echo "✓ Frontend running" || echo "✗ Frontend not found"

echo.
echo ===== RESTORATION COMPLETE =====