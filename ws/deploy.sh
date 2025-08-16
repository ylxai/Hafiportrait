#!/bin/bash

# HafiPortrait WebSocket Service Deployment Script
# Quick deployment untuk VPS Ubuntu/Debian

set -e

echo "🚀 HafiPortrait WebSocket Service Deployment"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found. Installing Docker..."
    
    # Update package index
    sudo apt update
    
    # Install required packages
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_warning "Please log out and log back in for Docker group changes to take effect"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Installing..."
    
    # Download Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
fi

# Create directories
print_status "Creating required directories..."
mkdir -p logs status

# Setup environment file
if [ ! -f .env ]; then
    print_status "Creating environment file..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before starting the service"
else
    print_status "Environment file already exists"
fi

# Setup firewall
print_status "Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 3001/tcp comment "WebSocket Server"
    sudo ufw allow 3002/tcp comment "Health Check"
    print_success "Firewall rules added for ports 3001 and 3002"
else
    print_warning "UFW not found. Please manually open ports 3001 and 3002"
fi

# Build and start services
print_status "Building and starting WebSocket service..."
docker-compose up -d --build

# Wait for service to start
print_status "Waiting for service to start..."
sleep 10

# Test the service
print_status "Testing WebSocket service..."
if node test-connection.js; then
    print_success "WebSocket service is running correctly!"
else
    print_error "WebSocket service test failed"
    print_status "Checking logs..."
    docker-compose logs websocket
    exit 1
fi

# Show status
print_status "Service status:"
docker-compose ps

print_status "Health check:"
curl -s http://localhost:3002/health | jq . || curl -s http://localhost:3002/health

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "  WebSocket URL: ws://$(curl -s ifconfig.me):3001/ws"
echo "  Health Check: http://$(curl -s ifconfig.me):3002/health"
echo "  Stats: http://$(curl -s ifconfig.me):3002/stats"
echo ""
echo "🔧 Management Commands:"
echo "  View logs: docker-compose logs -f websocket"
echo "  Restart: docker-compose restart websocket"
echo "  Stop: docker-compose down"
echo "  Update: git pull && docker-compose up -d --build"
echo ""
echo "🔗 For Vercel integration, set this environment variable:"
echo "  NEXT_PUBLIC_WS_URL=ws://$(curl -s ifconfig.me):3001/ws"