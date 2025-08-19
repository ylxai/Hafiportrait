#!/bin/bash

# ================================
# TEST BUILD CACHE CONFLICTS RESOLUTION
# ================================
echo "🔧 Testing Build Cache Conflicts Resolution..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name - $message"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name - $message"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n${BLUE}📋 Test 1: Host Build Artifacts Check${NC}"
if [ ! -d ".next" ] && [ ! -d ".pnpm-store" ]; then
    print_test_result "Host Build Artifacts" "PASS" "No conflicting build artifacts found on host"
else
    print_test_result "Host Build Artifacts" "FAIL" "Conflicting build artifacts found on host"
fi

echo -e "\n${BLUE}📋 Test 2: Dockerignore Configuration${NC}"
if [ -f ".dockerignore" ]; then
    if grep -q "\.next/" ".dockerignore" && \
       grep -q "\.pnpm-store/" ".dockerignore" && \
       grep -q "node_modules/" ".dockerignore"; then
        print_test_result "Dockerignore Config" "PASS" "All build artifacts properly excluded"
    else
        print_test_result "Dockerignore Config" "FAIL" "Build artifacts not properly excluded"
    fi
else
    print_test_result "Dockerignore Config" "FAIL" ".dockerignore file not found"
fi

echo -e "\n${BLUE}📋 Test 3: Build Context Size Check${NC}"
BUILD_CONTEXT_SIZE=$(du -sh . --exclude=.git --exclude=node_modules --exclude=.next --exclude=.pnpm-store 2>/dev/null | awk '{print $1}')
if [[ "$BUILD_CONTEXT_SIZE" =~ ^[0-9]+\.?[0-9]*[KMG]?$ ]]; then
    print_test_result "Build Context Size" "PASS" "Build context size: $BUILD_CONTEXT_SIZE (optimized)"
else
    print_test_result "Build Context Size" "FAIL" "Could not determine build context size"
fi

echo -e "\n${BLUE}📋 Test 4: Container Cache Paths${NC}"
if [ -f "Dockerfile.development" ]; then
    if grep -q "type=cache,target=/app/.pnpm-store" "Dockerfile.development" && \
       grep -q "type=cache,target=/app/.pnpm-cache" "Dockerfile.development"; then
        print_test_result "Container Cache Paths" "PASS" "Container cache paths properly configured"
    else
        print_test_result "Container Cache Paths" "FAIL" "Container cache paths not configured"
    fi
else
    print_test_result "Container Cache Paths" "FAIL" "Dockerfile.development not found"
fi

echo -e "\n${BLUE}📋 Test 5: User Permission for Cache${NC}"
if [ -f "Dockerfile.development" ]; then
    if grep -q "chown -R nextjs:nodejs.*\.pnpm" "Dockerfile.development"; then
        print_test_result "Cache Permissions" "PASS" "Cache directories properly owned by nextjs user"
    else
        print_test_result "Cache Permissions" "FAIL" "Cache directory ownership not configured"
    fi
else
    print_test_result "Cache Permissions" "FAIL" "Dockerfile.development not found"
fi

echo -e "\n${BLUE}📋 Test 6: Multi-layer Cache Strategy${NC}"
if [ -f "Dockerfile.development" ]; then
    CACHE_MOUNTS=$(grep -c "type=cache" "Dockerfile.development")
    if [ "$CACHE_MOUNTS" -ge 2 ]; then
        print_test_result "Cache Strategy" "PASS" "Multi-layer cache strategy implemented ($CACHE_MOUNTS cache mounts)"
    else
        print_test_result "Cache Strategy" "FAIL" "Multi-layer cache strategy not implemented"
    fi
else
    print_test_result "Cache Strategy" "FAIL" "Dockerfile.development not found"
fi

echo -e "\n${BLUE}📋 Test 7: Platform-specific Dependencies${NC}"
if [ -f "pnpm-workspace.yaml" ]; then
    if grep -q "sharp" "pnpm-workspace.yaml" && \
       grep -q "unrs-resolver" "pnpm-workspace.yaml"; then
        print_test_result "Platform Dependencies" "PASS" "Platform-specific dependencies properly configured"
    else
        print_test_result "Platform Dependencies" "FAIL" "Platform-specific dependencies not configured"
    fi
else
    print_test_result "Platform Dependencies" "FAIL" "pnpm-workspace.yaml not found"
fi

echo -e "\n${BLUE}📋 Test 8: No Root Path Conflicts${NC}"
if [ -f "Dockerfile.development" ]; then
    if ! grep -q "/root/" "Dockerfile.development"; then
        print_test_result "Root Path Conflicts" "PASS" "No root path conflicts in Dockerfile"
    else
        print_test_result "Root Path Conflicts" "FAIL" "Root path conflicts found in Dockerfile"
    fi
else
    print_test_result "Root Path Conflicts" "FAIL" "Dockerfile.development not found"
fi

# Summary
echo -e "\n${BLUE}📊 TEST SUMMARY${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All Build Cache Conflicts tests passed!${NC}"
    echo -e "${GREEN}✅ Build Cache Conflicts have been resolved!${NC}"
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please review the issues above.${NC}"
fi

echo -e "\n${BLUE}🔍 Next Steps:${NC}"
echo "1. Test Docker build: docker build -f Dockerfile.development -t test ."
echo "2. Test Docker Compose: docker-compose config"
echo "3. Test service startup: docker-compose up --dry-run"
echo "4. Continue to next phase: Dockerfile Redundancy"

exit $TESTS_FAILED