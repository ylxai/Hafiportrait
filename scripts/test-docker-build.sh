#!/bin/bash

# ================================
# HAFIPORTRAIT DOCKER BUILD TEST
# Test all optimized Docker images
# ================================

set -e  # Exit on any error

echo "🧪 TESTING ALL DOCKER IMAGES"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Setup volumes first
print_status "Setting up Docker volumes..."
./scripts/setup-docker-volumes.sh

echo ""
print_status "Starting Docker build tests..."

# Test 1: Build Development Image
echo ""
echo "================================"
print_status "🔨 Testing Dockerfile.development"
echo "================================"

if docker build -f Dockerfile.development -t hafiportrait-dev:test .; then
    print_success "✅ Dockerfile.development build successful"
else
    print_error "❌ Dockerfile.development build failed"
    exit 1
fi

# Test 2: Build Production Image
echo ""
echo "================================"
print_status "🏭 Testing Dockerfile.production"
echo "================================"

if docker build -f Dockerfile.production -t hafiportrait-prod:test .; then
    print_success "✅ Dockerfile.production build successful"
else
    print_error "❌ Dockerfile.production build failed"
    exit 1
fi

# Test 3: Build Socket.IO Image
echo ""
echo "================================"
print_status "🔌 Testing Dockerfile.socketio"
echo "================================"

if docker build -f Dockerfile.socketio -t socketio-prod:test .; then
    print_success "✅ Dockerfile.socketio build successful"
else
    print_error "❌ Dockerfile.socketio build failed"
    exit 1
fi

# Test 4: Docker Compose Build
echo ""
echo "================================"
print_status "🐳 Testing docker-compose build"
echo "================================"

if docker-compose build --no-cache; then
    print_success "✅ docker-compose build successful"
else
    print_error "❌ docker-compose build failed"
    exit 1
fi

# Test 5: Quick Container Start Test
echo ""
echo "================================"
print_status "🚀 Testing container startup"
echo "================================"

# Test development container
print_status "Testing development container startup..."
if timeout 60s docker-compose up -d hafiportrait-dev; then
    sleep 10
    if docker-compose ps hafiportrait-dev | grep -q "Up"; then
        print_success "✅ Development container started successfully"
        docker-compose down
    else
        print_error "❌ Development container failed to start properly"
        docker-compose logs hafiportrait-dev
        docker-compose down
        exit 1
    fi
else
    print_error "❌ Development container startup timeout"
    docker-compose down
    exit 1
fi

# Test production containers
print_status "Testing production containers startup..."
if timeout 90s docker-compose up -d hafiportrait-prod socketio-prod; then
    sleep 15
    if docker-compose ps hafiportrait-prod | grep -q "Up" && docker-compose ps socketio-prod | grep -q "Up"; then
        print_success "✅ Production containers started successfully"
        docker-compose down
    else
        print_error "❌ Production containers failed to start properly"
        docker-compose logs hafiportrait-prod
        docker-compose logs socketio-prod
        docker-compose down
        exit 1
    fi
else
    print_error "❌ Production containers startup timeout"
    docker-compose down
    exit 1
fi

# Cleanup test images
echo ""
print_status "🧹 Cleaning up test images..."
docker rmi hafiportrait-dev:test hafiportrait-prod:test socketio-prod:test 2>/dev/null || true

# Final summary
echo ""
echo "================================"
print_success "🎉 ALL DOCKER TESTS PASSED!"
echo "================================"
print_success "✅ Dockerfile.development - OK"
print_success "✅ Dockerfile.production - OK"
print_success "✅ Dockerfile.socketio - OK"
print_success "✅ docker-compose build - OK"
print_success "✅ Container startup - OK"

echo ""
print_status "📊 Final image sizes:"
docker images | grep -E "(hafiportrait|socketio)" | head -10

echo ""
print_status "🚀 Ready for production deployment!"
echo ""
print_status "Next commands:"
echo "  Development: docker-compose up hafiportrait-dev"
echo "  Production:  docker-compose up hafiportrait-prod"
echo "  All:         docker-compose up"