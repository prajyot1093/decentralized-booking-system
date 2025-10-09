#!/bin/bash

# Contract Deployment & Management Script
# Provides easy commands for deploying and managing smart contracts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contract directory
CONTRACTS_DIR="$(dirname "$0")/contracts"
SCRIPTS_DIR="$CONTRACTS_DIR/scripts"

# Helper function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -d "$CONTRACTS_DIR" ]; then
        print_error "Contracts directory not found. Are you in the project root?"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing contract dependencies..."
    cd "$CONTRACTS_DIR"
    npm install
    cd ..
    print_success "Dependencies installed"
}

# Compile contracts
compile_contracts() {
    print_status "Compiling smart contracts..."
    cd "$CONTRACTS_DIR"
    npx hardhat compile
    cd ..
    print_success "Contracts compiled successfully"
}

# Run tests
run_tests() {
    print_status "Running contract tests..."
    cd "$CONTRACTS_DIR"
    npx hardhat test
    cd ..
    print_success "All tests passed"
}

# Start local blockchain
start_local_node() {
    print_status "Starting local Hardhat network..."
    cd "$CONTRACTS_DIR"
    
    if [ "$1" == "--background" ]; then
        print_status "Starting in background mode..."
        npx hardhat node > hardhat-node.log 2>&1 &
        echo $! > hardhat-node.pid
        print_success "Local node started in background (PID: $(cat hardhat-node.pid))"
        print_status "Log file: $CONTRACTS_DIR/hardhat-node.log"
    else
        npx hardhat node
    fi
    cd ..
}

# Stop local blockchain
stop_local_node() {
    cd "$CONTRACTS_DIR"
    if [ -f "hardhat-node.pid" ]; then
        PID=$(cat hardhat-node.pid)
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            rm -f hardhat-node.pid
            print_success "Local node stopped (PID: $PID)"
        else
            print_warning "Node process not found (PID: $PID)"
            rm -f hardhat-node.pid
        fi
    else
        print_warning "No PID file found. Node may not be running."
    fi
    cd ..
}

# Deploy to specific network
deploy_to_network() {
    local network=$1
    
    if [ -z "$network" ]; then
        print_error "Please specify a network: localhost, sepolia, mumbai, polygon"
        exit 1
    fi
    
    print_status "Deploying contracts to $network..."
    cd "$CONTRACTS_DIR"
    node scripts/network-manager.js deploy "$network"
    cd ..
    print_success "Deployment to $network completed"
}

# Deploy to all networks
deploy_to_all() {
    print_status "Deploying to all configured networks..."
    cd "$CONTRACTS_DIR"
    node scripts/network-manager.js deploy-all
    cd ..
    print_success "Multi-network deployment completed"
}

# Verify contracts
verify_contracts() {
    local network=$1
    
    if [ -z "$network" ]; then
        print_error "Please specify a network for verification"
        exit 1
    fi
    
    print_status "Verifying contracts on $network..."
    cd "$CONTRACTS_DIR"
    node scripts/network-manager.js verify "$network"
    cd ..
    print_success "Contract verification completed"
}

# Show deployment status
show_status() {
    print_status "Checking deployment status..."
    cd "$CONTRACTS_DIR"
    node scripts/network-manager.js status
    cd ..
}

# Inject contract addresses
inject_addresses() {
    local network=$1
    
    print_status "Injecting contract addresses..."
    cd "$CONTRACTS_DIR"
    
    if [ -z "$network" ]; then
        node scripts/inject-contracts.js
    else
        node scripts/inject-contracts.js "$network"
    fi
    
    cd ..
    print_success "Contract addresses injected"
}

# Clean deployments
clean_deployments() {
    local network=$1
    
    print_status "Cleaning deployment artifacts..."
    cd "$CONTRACTS_DIR"
    
    if [ -z "$network" ]; then
        node scripts/network-manager.js clean
        print_success "All deployment artifacts cleaned"
    else
        node scripts/network-manager.js clean "$network"
        print_success "Deployment artifacts for $network cleaned"
    fi
    
    cd ..
}

# Setup development environment
setup_environment() {
    print_status "Setting up development environment..."
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Created .env from .env.example. Please configure your environment variables."
        else
            print_warning "No .env.example found. Please create .env manually."
        fi
    fi
    
    # Install dependencies
    install_dependencies
    
    # Compile contracts
    compile_contracts
    
    print_success "Development environment setup complete"
}

# Complete deployment workflow
full_deployment() {
    local network=${1:-localhost}
    
    print_status "Starting full deployment workflow for $network..."
    
    # Setup if needed
    if [ ! -f "$CONTRACTS_DIR/package.json" ]; then
        setup_environment
    fi
    
    # Compile contracts
    compile_contracts
    
    # Run tests
    run_tests
    
    # Deploy contracts
    deploy_to_network "$network"
    
    # Inject addresses
    inject_addresses "$network"
    
    print_success "Full deployment workflow completed for $network"
}

# Show help
show_help() {
    echo -e "${BLUE}Contract Deployment & Management Script${NC}"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  setup                    Setup development environment"
    echo "  install                  Install contract dependencies"
    echo "  compile                  Compile smart contracts"
    echo "  test                     Run contract tests"
    echo ""
    echo "  start-node [--background] Start local Hardhat network"
    echo "  stop-node                 Stop local Hardhat network"
    echo ""
    echo "  deploy <network>         Deploy contracts to specific network"
    echo "  deploy-all              Deploy to all configured networks"
    echo "  full-deploy [network]   Complete deployment workflow (default: localhost)"
    echo ""
    echo "  verify <network>        Verify contracts on block explorer"
    echo "  inject [network]        Inject contract addresses into apps"
    echo "  status                  Show deployment status"
    echo ""
    echo "  clean [network]         Clean deployment artifacts"
    echo "  help                    Show this help message"
    echo ""
    echo "Networks: localhost, sepolia, mumbai, polygon, mainnet"
    echo ""
    echo "Examples:"
    echo "  $0 setup                 # Initial setup"
    echo "  $0 start-node --background # Start local node"
    echo "  $0 full-deploy localhost  # Complete local deployment"
    echo "  $0 deploy sepolia        # Deploy to Sepolia testnet"
    echo "  $0 status               # Check deployment status"
}

# Main script logic
main() {
    check_directory
    
    case "${1:-help}" in
        "setup")
            setup_environment
            ;;
        "install")
            install_dependencies
            ;;
        "compile")
            compile_contracts
            ;;
        "test")
            run_tests
            ;;
        "start-node")
            start_local_node "$2"
            ;;
        "stop-node")
            stop_local_node
            ;;
        "deploy")
            deploy_to_network "$2"
            ;;
        "deploy-all")
            deploy_to_all
            ;;
        "full-deploy")
            full_deployment "$2"
            ;;
        "verify")
            verify_contracts "$2"
            ;;
        "inject")
            inject_addresses "$2"
            ;;
        "status")
            show_status
            ;;
        "clean")
            clean_deployments "$2"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"