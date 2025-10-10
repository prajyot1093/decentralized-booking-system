@echo off
echo ===== SYSTEM STATUS CHECK =====

echo.
echo 1. Backend Health Check:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/health'; Write-Host '✓ Backend OK - Status:' $response.status } catch { Write-Host '✗ Backend Error:' $_.Exception.Message }"

echo.
echo 2. Frontend Accessibility:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5; Write-Host '✓ Frontend OK - Status:' $response.StatusCode } catch { Write-Host '✗ Frontend Error:' $_.Exception.Message }"

echo.
echo 3. Services API:
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3001/api/services'; Write-Host '✓ Services API OK - Count:' $response.data.Length } catch { Write-Host '✗ Services API Error:' $_.Exception.Message }"

echo.
echo 4. Running Processes:
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Select-Object Id,ProcessName | ForEach-Object { Write-Host '- Node process:' $_.Id }"

echo.
echo ===== END STATUS CHECK =====