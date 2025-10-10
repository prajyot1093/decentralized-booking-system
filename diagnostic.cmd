@echo off
echo ===== COMPREHENSIVE SYSTEM DIAGNOSTIC =====

echo.
echo 1. Port Status:
powershell -Command "netstat -ano | Select-String ':300[01].*LISTENING'"

echo.
echo 2. Backend Health:
powershell -Command "try { $health = Invoke-RestMethod -Uri 'http://localhost:3001/api/health'; Write-Host '✓ Backend OK - Status:' $health.status } catch { Write-Host '✗ Backend Error:' $_.Exception.Message }"

echo.
echo 3. Services API:
powershell -Command "try { $services = Invoke-RestMethod -Uri 'http://localhost:3001/api/services'; Write-Host '✓ Services OK - Count:' $services.data.Count } catch { Write-Host '✗ Services Error:' $_.Exception.Message }"

echo.
echo 4. Frontend Accessibility:
powershell -Command "try { $frontend = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5; Write-Host '✓ Frontend OK - Status:' $frontend.StatusCode } catch { Write-Host '✗ Frontend Error:' $_.Exception.Message }"

echo.
echo 5. Running Node Processes:
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Select-Object Id,ProcessName | ForEach-Object { Write-Host '- Process:' $_.Id $_.ProcessName }"

echo.
echo ===== DIAGNOSTIC COMPLETE =====