@echo off
REM Contract Deployment & Management Script for Windows
REM Provides easy commands for deploying and managing smart contracts

setlocal EnableDelayedExpansion

REM Contract directory
set "CONTRACTS_DIR=%~dp0contracts"
set "SCRIPTS_DIR=%CONTRACTS_DIR%\scripts"

REM Helper functions for colored output
:print_status
echo [INFO] %~1
exit /b

:print_success
echo [SUCCESS] %~1
exit /b

:print_warning
echo [WARNING] %~1
exit /b

:print_error
echo [ERROR] %~1
exit /b

REM Check if we're in the right directory
:check_directory
if not exist "%CONTRACTS_DIR%" (
    call :print_error "Contracts directory not found. Are you in the project root?"
    exit /b 1
)
exit /b 0

REM Install dependencies
:install_dependencies
call :print_status "Installing contract dependencies..."
cd /d "%CONTRACTS_DIR%"
call npm install
cd /d "%~dp0"
call :print_success "Dependencies installed"
exit /b 0

REM Compile contracts
:compile_contracts
call :print_status "Compiling smart contracts..."
cd /d "%CONTRACTS_DIR%"
call npx hardhat compile
cd /d "%~dp0"
call :print_success "Contracts compiled successfully"
exit /b 0

REM Run tests
:run_tests
call :print_status "Running contract tests..."
cd /d "%CONTRACTS_DIR%"
call npx hardhat test
cd /d "%~dp0"
call :print_success "All tests passed"
exit /b 0

REM Start local blockchain
:start_local_node
call :print_status "Starting local Hardhat network..."
cd /d "%CONTRACTS_DIR%"

if "%~1"=="--background" (
    call :print_status "Starting in background mode..."
    start /b npx hardhat node > hardhat-node.log 2>&1
    call :print_success "Local node started in background"
    call :print_status "Log file: %CONTRACTS_DIR%\hardhat-node.log"
) else (
    call npx hardhat node
)
cd /d "%~dp0"
exit /b 0

REM Stop local blockchain (basic implementation for Windows)
:stop_local_node
call :print_status "Stopping local Hardhat network..."
taskkill /f /im node.exe /fi "WINDOWTITLE eq *hardhat*" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_success "Local node stopped"
) else (
    call :print_warning "No Hardhat node processes found"
)
exit /b 0

REM Deploy to specific network
:deploy_to_network
if "%~1"=="" (
    call :print_error "Please specify a network: localhost, sepolia, mumbai, polygon"
    exit /b 1
)

call :print_status "Deploying contracts to %~1..."
cd /d "%CONTRACTS_DIR%"
call node scripts/network-manager.js deploy "%~1"
cd /d "%~dp0"
call :print_success "Deployment to %~1 completed"
exit /b 0

REM Deploy to all networks
:deploy_to_all
call :print_status "Deploying to all configured networks..."
cd /d "%CONTRACTS_DIR%"
call node scripts/network-manager.js deploy-all
cd /d "%~dp0"
call :print_success "Multi-network deployment completed"
exit /b 0

REM Verify contracts
:verify_contracts
if "%~1"=="" (
    call :print_error "Please specify a network for verification"
    exit /b 1
)

call :print_status "Verifying contracts on %~1..."
cd /d "%CONTRACTS_DIR%"
call node scripts/network-manager.js verify "%~1"
cd /d "%~dp0"
call :print_success "Contract verification completed"
exit /b 0

REM Show deployment status
:show_status
call :print_status "Checking deployment status..."
cd /d "%CONTRACTS_DIR%"
call node scripts/network-manager.js status
cd /d "%~dp0"
exit /b 0

REM Inject contract addresses
:inject_addresses
call :print_status "Injecting contract addresses..."
cd /d "%CONTRACTS_DIR%"

if "%~1"=="" (
    call node scripts/inject-contracts.js
) else (
    call node scripts/inject-contracts.js "%~1"
)

cd /d "%~dp0"
call :print_success "Contract addresses injected"
exit /b 0

REM Clean deployments
:clean_deployments
call :print_status "Cleaning deployment artifacts..."
cd /d "%CONTRACTS_DIR%"

if "%~1"=="" (
    call node scripts/network-manager.js clean
    call :print_success "All deployment artifacts cleaned"
) else (
    call node scripts/network-manager.js clean "%~1"
    call :print_success "Deployment artifacts for %~1 cleaned"
)

cd /d "%~dp0"
exit /b 0

REM Setup development environment
:setup_environment
call :print_status "Setting up development environment..."

REM Check if .env exists
if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        call :print_warning "Created .env from .env.example. Please configure your environment variables."
    ) else (
        call :print_warning "No .env.example found. Please create .env manually."
    )
)

REM Install dependencies
call :install_dependencies

REM Compile contracts
call :compile_contracts

call :print_success "Development environment setup complete"
exit /b 0

REM Complete deployment workflow
:full_deployment
set "network=%~1"
if "!network!"=="" set "network=localhost"

call :print_status "Starting full deployment workflow for !network!..."

REM Setup if needed
if not exist "%CONTRACTS_DIR%\package.json" (
    call :setup_environment
)

REM Compile contracts
call :compile_contracts

REM Run tests
call :run_tests

REM Deploy contracts
call :deploy_to_network "!network!"

REM Inject addresses
call :inject_addresses "!network!"

call :print_success "Full deployment workflow completed for !network!"
exit /b 0

REM Show help
:show_help
echo Contract Deployment ^& Management Script
echo.
echo Usage: %~nx0 ^<command^> [options]
echo.
echo Commands:
echo   setup                    Setup development environment
echo   install                  Install contract dependencies
echo   compile                  Compile smart contracts
echo   test                     Run contract tests
echo.
echo   start-node [--background] Start local Hardhat network
echo   stop-node                 Stop local Hardhat network
echo.
echo   deploy ^<network^>         Deploy contracts to specific network
echo   deploy-all              Deploy to all configured networks
echo   full-deploy [network]   Complete deployment workflow (default: localhost)
echo.
echo   verify ^<network^>        Verify contracts on block explorer
echo   inject [network]        Inject contract addresses into apps
echo   status                  Show deployment status
echo.
echo   clean [network]         Clean deployment artifacts
echo   help                    Show this help message
echo.
echo Networks: localhost, sepolia, mumbai, polygon, mainnet
echo.
echo Examples:
echo   %~nx0 setup                 # Initial setup
echo   %~nx0 start-node --background # Start local node
echo   %~nx0 full-deploy localhost  # Complete local deployment
echo   %~nx0 deploy sepolia        # Deploy to Sepolia testnet
echo   %~nx0 status               # Check deployment status
exit /b 0

REM Main script logic
call :check_directory
if !errorlevel! neq 0 exit /b 1

set "command=%~1"
if "!command!"=="" set "command=help"

if "!command!"=="setup" (
    call :setup_environment
) else if "!command!"=="install" (
    call :install_dependencies
) else if "!command!"=="compile" (
    call :compile_contracts
) else if "!command!"=="test" (
    call :run_tests
) else if "!command!"=="start-node" (
    call :start_local_node "%~2"
) else if "!command!"=="stop-node" (
    call :stop_local_node
) else if "!command!"=="deploy" (
    call :deploy_to_network "%~2"
) else if "!command!"=="deploy-all" (
    call :deploy_to_all
) else if "!command!"=="full-deploy" (
    call :full_deployment "%~2"
) else if "!command!"=="verify" (
    call :verify_contracts "%~2"
) else if "!command!"=="inject" (
    call :inject_addresses "%~2"
) else if "!command!"=="status" (
    call :show_status
) else if "!command!"=="clean" (
    call :clean_deployments "%~2"
) else if "!command!"=="help" (
    call :show_help
) else if "!command!"=="-h" (
    call :show_help
) else if "!command!"=="--help" (
    call :show_help
) else (
    call :print_error "Unknown command: !command!"
    echo.
    call :show_help
    exit /b 1
)