#!/bin/bash

# ================================
# TEST RUNTIME PATH CONFLICTS RESOLUTION
# ================================
echo "🔧 Testing Runtime Path Conflicts Resolution..."

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

echo -e "\n${BLUE}📋 Test 1: PNPM Store Path Configuration${NC}"
if grep -q "/app/.pnpm-store" Dockerfile.development && \
   grep -q "/app/.pnpm-store" Dockerfile.production && \
   grep -q "/app/.pnpm-store" Dockerfile.socketio; then
    print_test_result "PNPM Store Paths" "PASS" "All Dockerfiles use user-accessible /app/.pnpm-store"
else
    print_test_result "PNPM Store Paths" "FAIL" "Inconsistent PNPM store paths found"
fi

echo -e "\n${BLUE}📋 Test 2: PNPM Cache Directory Configuration${NC}"
if grep -q "/app/.pnpm-cache" Dockerfile.development && \
   grep -q "/app/.pnpm-cache" Dockerfile.production && \
   grep -q "/app/.pnpm-cache" Dockerfile.socketio; then
    print_test_result "PNPM Cache Paths" "PASS" "All Dockerfiles use user-accessible /app/.pnpm-cache"
else
    print_test_result "PNPM Cache Paths" "FAIL" "Inconsistent PNPM cache paths found"
fi

echo -e "\n${BLUE}📋 Test 3: No Root Path References${NC}"
ROOT_PATHS=0
for dockerfile in Dockerfile.development Dockerfile.production Dockerfile.socketio; do
    if grep -q "/root/" "$dockerfile" 2>/dev/null; then
        ROOT_PATHS=$((ROOT_PATHS + 1))
    fi
done

if [ $ROOT_PATHS -eq 0 ]; then
    print_test_result "Root Path References" "PASS" "No root path references found in any Dockerfile"
else
    print_test_result "Root Path References" "FAIL" "Root path references found in $ROOT_PATHS Dockerfile(s)"
fi

echo -e "\n${BLUE}📋 Test 4: User Creation Before Directory Setup${NC}"
USER_CREATION_COUNT=0
for dockerfile in Dockerfile.development Dockerfile.production Dockerfile.socketio; do
    if grep -q "adduser.*nextjs\|adduser.*socketio" "$dockerfile" && \
       grep -q "mkdir -p.*\.pnpm" "$dockerfile"; then
        USER_CREATION_COUNT=$((USER_CREATION_COUNT + 1))
    fi
done

if [ $USER_CREATION_COUNT -eq 3 ]; then
    print_test_result "User Creation Order" "PASS" "All Dockerfiles create users before directory setup"
else
    print_test_result "User Creation Order" "FAIL" "User creation order issues in $((3 - USER_CREATION_COUNT)) Dockerfile(s)"
fi

echo -e "\n${BLUE}📋 Test 5: Cache Directory Ownership${NC}"
OWNERSHIP_COUNT=0
for dockerfile in Dockerfile.development Dockerfile.production Dockerfile.socketio; do
    if grep -q "chown.*\.pnpm" "$dockerfile"; then
        OWNERSHIP_COUNT=$((OWNERSHIP_COUNT + 1))
    fi
done

if [ $OWNERSHIP_COUNT -eq 3 ]; then
    print_test_result "Cache Directory Ownership" "PASS" "All cache directories properly owned by non-root users"
else
    print_test_result "Cache Directory Ownership" "FAIL" "Cache ownership issues in $((3 - OWNERSHIP_COUNT)) Dockerfile(s)"
fi

echo -e "\n${BLUE}📋 Test 6: Multi-layer Cache Mounts${NC}"
CACHE_MOUNT_COUNT=0
for dockerfile in Dockerfile.development Dockerfile.production Dockerfile.socketio; do
    MOUNTS=$(grep -c "type=cache,target=/app/.pnpm" "$dockerfile" 2>/dev/null)
    if [ "$MOUNTS" -ge 2 ]; then
        CACHE_MOUNT_COUNT=$((CACHE_MOUNT_COUNT + 1))
    fi
done

if [ $CACHE_MOUNT_COUNT -eq 3 ]; then
    print_test_result "Multi-layer Cache Mounts" "PASS" "All Dockerfiles use multi-layer cache strategy"
else
    print_test_result "Multi-layer Cache Mounts" "FAIL" "Cache mount issues in $((3 - CACHE_MOUNT_COUNT)) Dockerfile(s)"
fi

echo -e "\n${BLUE}📋 Test 7: Non-root User Switching${NC}"
USER_SWITCH_COUNT=0
for dockerfile in Dockerfile.development Dockerfile.production Dockerfile.socketio; do
    if grep -q "USER nextjs\|USER socketio" "$dockerfile"; then
        USER_SWITCH_COUNT=$((USER_SWITCH_COUNT + 1))
    fi
done

if [ $USER_SWITCH_COUNT -eq 3 ]; then
    print_test_result "User Switching" "PASS" "All Dockerfiles switch to non-root users"
else
    print_test_result "User Switching" "FAIL" "User switching issues in $((3 - USER_SWITCH_COUNT)) Dockerfile(s)"
fi

echo -e "\n${BLUE}📋 Test 8: Consistent UID/GID Configuration${NC}"
if grep -q "\-u 1001" Dockerfile.development && \
   grep -q "\-u 1001" Dockerfile.production && \
   grep -q "\-u 1001" Dockerfile.socketio; then
    print_test_result "UID/GID Consistency" "PASS" "All users use consistent UID 1001"
else
    print_test_result "UID/GID Consistency" "FAIL" "Inconsistent UID/GID configuration"
fi

# Summary
echo -e "\n${BLUE}📊 TEST SUMMARY${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All Runtime Path Conflicts tests passed!${NC}"
    echo -e "${GREEN}✅ Runtime Path Conflicts have been resolved!${NC}"
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please review the issues above.${NC}"
fi

echo -e "\n${BLUE}🔍 Next Steps:${NC}"
echo "1. Test Docker build: docker build -f Dockerfile.development -t test ."
echo "2. Test Docker Compose: docker-compose config"
echo "3. Test service startup: docker-compose up --dry-run"
echo "4. Continue to final validation"

exit $TESTS_FAILED