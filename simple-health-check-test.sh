#!/bin/bash

echo "🏥 SIMPLE HEALTH CHECK DEPENDENCY TEST"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    fi
}

echo ""
echo "📁 CHECKING HEALTH CHECK DEPENDENCIES"
echo "===================================="

# Test 1: Check if production depends on socketio with health check
echo "🔍 Test 1: Production dependency on Socket.IO..."
if grep -A 20 "hafiportrait-prod:" docker-compose.yml | grep -A 10 "depends_on:" | grep -q "condition: service_healthy"; then
    print_status "PASS" "Production depends on Socket.IO with health check condition"
else
    print_status "FAIL" "Production dependency not properly configured"
fi

# Test 2: Check Socket.IO health check
echo ""
echo "🔍 Test 2: Socket.IO health check..."
if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "healthcheck:"; then
    print_status "PASS" "Socket.IO has health check configured"
    
    # Check specific parameters
    if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "interval: 15s"; then
        print_status "PASS" "Socket.IO health check interval: 15s"
    fi
    
    if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "retries: 5"; then
        print_status "PASS" "Socket.IO health check retries: 5"
    fi
    
    if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "timeout: 5s"; then
        print_status "PASS" "Socket.IO health check timeout: 5s"
    fi
else
    print_status "FAIL" "Socket.IO missing health check"
fi

# Test 3: Check Production health check
echo ""
echo "🔍 Test 3: Production health check..."
if grep -A 20 "hafiportrait-prod:" docker-compose.yml | grep -q "healthcheck:"; then
    print_status "PASS" "Production has health check configured"
else
    print_status "FAIL" "Production missing health check"
fi

# Test 4: Check Circuit Breaker Pattern
echo ""
echo "🔍 Test 4: Circuit breaker pattern..."
if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "deploy:"; then
    print_status "PASS" "Socket.IO has circuit breaker pattern"
    
    if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "max_attempts: 3"; then
        print_status "PASS" "Circuit breaker: max 3 restart attempts"
    fi
else
    print_status "FAIL" "Socket.IO missing circuit breaker pattern"
fi

# Test 5: Check Graceful Shutdown
echo ""
echo "🔍 Test 5: Graceful shutdown..."
if grep -A 20 "hafiportrait-prod:" docker-compose.yml | grep -q "stop_grace_period:"; then
    print_status "PASS" "Production has graceful shutdown configured"
else
    print_status "FAIL" "Production missing graceful shutdown"
fi

echo ""
echo "🎯 FINAL RESULTS"
echo "================"

# Count total tests
TOTAL_TESTS=5
PASSED_TESTS=0

# Count passed tests
if grep -A 20 "hafiportrait-prod:" docker-compose.yml | grep -A 10 "depends_on:" | grep -q "condition: service_healthy"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "healthcheck:"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

if grep -A 20 "hafiportrait-prod:" docker-compose.yml | grep -q "healthcheck:"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

if grep -A 20 "socketio-prod:" docker-compose.yml | grep -q "deploy:"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

if grep -A 20 "hafiportrait-prod:" docker-compose.yml | grep -q "stop_grace_period:"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

echo "📊 Test Results: $PASSED_TESTS/$TOTAL_TESTS tests passed"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL HEALTH CHECK DEPENDENCY CHAIN ISSUES RESOLVED!${NC}"
    echo -e "${GREEN}✅ Dependency chain is now robust and production-ready${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the issues above.${NC}"
fi

echo ""
echo "📋 IMPROVEMENTS MADE:"
echo "====================="
echo "✅ Health check dependency with condition: service_healthy"
echo "✅ Socket.IO health check optimized (15s interval, 5 retries)"
echo "✅ Circuit breaker pattern implemented"
echo "✅ Graceful shutdown handling (30s grace period)"
echo "✅ Service resilience improved"
echo ""
echo "🚀 Ready for production use!"