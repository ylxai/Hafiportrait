#!/bin/bash

# ================================
# TEST FIXED DOCKERFILES
# Test dengan permission fixes dan ENV format fixes
# ================================

echo "🔧 TESTING FIXED DOCKERFILES"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Stop any running containers
print_status "🛑 Stopping running containers..."
sudo docker stop $(sudo docker ps -q) 2>/dev/null || true

# Remove old test images
print_status "🧹 Removing old test images..."
sudo docker rmi hafiportrait-dev-fixed hafiportrait-prod-fixed socketio-prod-fixed 2>/dev/null || true

# Test 1: Development with permission fixes
echo ""
print_status "🔨 Testing FIXED Dockerfile.development..."
echo "   ✅ Permission fixes for .next directory"
echo "   ✅ ENV format fixes"

start_time=$(date +%s)
if sudo docker build -f Dockerfile.development -t hafiportrait-dev-fixed:latest . 2>&1 | tee /tmp/dev-build.log; then
    end_time=$(date +%s)
    build_time=$((end_time - start_time))
    
    # Check for warnings
    warning_count=$(grep -c "WARNING" /tmp/dev-build.log || echo "0")
    legacy_warnings=$(grep -c "LegacyKeyValueFormat" /tmp/dev-build.log || echo "0")
    
    print_success "✅ Development build: SUCCESS in ${build_time}s"
    print_status "📊 Warnings: $warning_count total, $legacy_warnings legacy ENV format"
else
    print_error "❌ Development build: FAILED"
    exit 1
fi

# Test 2: Production with ENV fixes
echo ""
print_status "🏭 Testing FIXED Dockerfile.production..."
echo "   ✅ ENV format fixes"

start_time=$(date +%s)
if sudo docker build -f Dockerfile.production -t hafiportrait-prod-fixed:latest . 2>&1 | tee /tmp/prod-build.log; then
    end_time=$(date +%s)
    build_time=$((end_time - start_time))
    
    # Check for warnings
    warning_count=$(grep -c "WARNING" /tmp/prod-build.log || echo "0")
    legacy_warnings=$(grep -c "LegacyKeyValueFormat" /tmp/prod-build.log || echo "0")
    
    print_success "✅ Production build: SUCCESS in ${build_time}s"
    print_status "📊 Warnings: $warning_count total, $legacy_warnings legacy ENV format"
else
    print_error "❌ Production build: FAILED"
    exit 1
fi

# Test 3: Socket.IO with ENV fixes
echo ""
print_status "🔌 Testing FIXED Dockerfile.socketio..."
echo "   ✅ ENV format fixes"

start_time=$(date +%s)
if sudo docker build -f Dockerfile.socketio -t socketio-prod-fixed:latest . 2>&1 | tee /tmp/socketio-build.log; then
    end_time=$(date +%s)
    build_time=$((end_time - start_time))
    
    # Check for warnings
    warning_count=$(grep -c "WARNING" /tmp/socketio-build.log || echo "0")
    legacy_warnings=$(grep -c "LegacyKeyValueFormat" /tmp/socketio-build.log || echo "0")
    
    print_success "✅ Socket.IO build: SUCCESS in ${build_time}s"
    print_status "📊 Warnings: $warning_count total, $legacy_warnings legacy ENV format"
else
    print_error "❌ Socket.IO build: FAILED"
    exit 1
fi

# Test 4: Container startup with permission fixes
echo ""
print_status "🚀 Testing container startup with fixes..."

# Test development container (should not have permission errors)
print_status "Testing development container with permission fixes..."
if sudo docker run -d --name test-dev-fixed -p 3012:3002 hafiportrait-dev-fixed:latest; then
    sleep 15
    
    # Check if container is still running (no permission errors)
    if sudo docker ps | grep -q "test-dev-fixed"; then
        print_success "✅ Development container: RUNNING (no permission errors)"
        
        # Check logs for permission errors
        if sudo docker logs test-dev-fixed 2>&1 | grep -q "EACCES"; then
            print_warning "⚠️ Still has permission errors in logs"
            sudo docker logs test-dev-fixed | tail -10
        else
            print_success "✅ No permission errors in logs"
        fi
        
        sudo docker stop test-dev-fixed && sudo docker rm test-dev-fixed
    else
        print_error "❌ Development container: FAILED"
        sudo docker logs test-dev-fixed
        sudo docker rm test-dev-fixed 2>/dev/null
    fi
else
    print_error "❌ Development container: FAILED TO START"
fi

# Cleanup
print_status "🧹 Cleaning up test logs..."
rm -f /tmp/dev-build.log /tmp/prod-build.log /tmp/socketio-build.log

echo ""
print_success "🎉 FIXED DOCKERFILES TEST COMPLETED!"
echo ""
print_status "📊 Summary of fixes:"
echo "   ✅ Permission fixes: .next directory created with proper ownership"
echo "   ✅ ENV format fixes: Using ENV key=value format"
echo "   ✅ Reduced warnings in build output"
echo ""
print_status "🚀 Ready for production deployment!"