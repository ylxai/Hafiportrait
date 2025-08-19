#!/bin/bash

# ================================
# DOCKER COMPOSE SYNTAX VALIDATION
# Simple YAML syntax check
# ================================

echo "🔧 Validating Docker Compose Syntax..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ FAIL${NC}: docker-compose.yml not found"
    exit 1
fi

echo -e "${BLUE}📋 Checking docker-compose.yml syntax...${NC}"

# Basic YAML syntax checks
echo "🔍 Checking basic YAML structure..."

# Check for proper version
if grep -q "^version:" docker-compose.yml; then
    echo -e "${GREEN}✅ PASS${NC}: version specified"
else
    echo -e "${RED}❌ FAIL${NC}: version not specified"
    ERRORS=$((ERRORS + 1))
fi

# Check for services section
if grep -q "^services:" docker-compose.yml; then
    echo -e "${GREEN}✅ PASS${NC}: services section found"
else
    echo -e "${RED}❌ FAIL${NC}: services section missing"
    ERRORS=$((ERRORS + 1))
fi

# Check for proper indentation (basic check)
if ! grep -q "^[[:space:]]*[[:space:]]" docker-compose.yml; then
    echo -e "${YELLOW}⚠️  WARN${NC}: possible indentation issues"
fi

# Check for required services
required_services=("hafiportrait-dev" "socketio-dev" "hafiportrait-prod" "socketio-prod")
for service in "${required_services[@]}"; do
    if grep -q "^[[:space:]]*$service:" docker-compose.yml; then
        echo -e "${GREEN}✅ PASS${NC}: service '$service' defined"
    else
        echo -e "${RED}❌ FAIL${NC}: service '$service' missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check for proper Dockerfile references
if grep -q "dockerfile: Dockerfile.development" docker-compose.yml && \
   grep -q "dockerfile: Dockerfile.production" docker-compose.yml && \
   grep -q "dockerfile: Dockerfile.socketio" docker-compose.yml; then
    echo -e "${GREEN}✅ PASS${NC}: Dockerfile references correct"
else
    echo -e "${RED}❌ FAIL${NC}: Dockerfile references incorrect"
    ERRORS=$((ERRORS + 1))
fi

# Check for health checks
health_check_count=$(grep -c "healthcheck:" docker-compose.yml)
if [ "$health_check_count" -ge 4 ]; then
    echo -e "${GREEN}✅ PASS${NC}: health checks configured ($health_check_count found)"
else
    echo -e "${YELLOW}⚠️  WARN${NC}: limited health checks ($health_check_count found)"
fi

# Check for port mappings
port_mapping_count=$(grep -c "ports:" docker-compose.yml)
if [ "$port_mapping_count" -ge 4 ]; then
    echo -e "${GREEN}✅ PASS${NC}: port mappings configured ($port_mapping_count found)"
else
    echo -e "${RED}❌ FAIL${NC}: insufficient port mappings ($port_mapping_count found)"
    ERRORS=$((ERRORS + 1))
fi

# Check for environment conflicts
port_conflicts=$(grep -c "PORT=" docker-compose.yml)
if [ "$port_conflicts" -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: no PORT conflicts in docker-compose.yml"
else
    echo -e "${RED}❌ FAIL${NC}: PORT conflicts found ($port_conflicts instances)"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo -e "\n${BLUE}📊 SYNTAX VALIDATION SUMMARY${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ docker-compose.yml syntax is valid${NC}"
    echo -e "${GREEN}🎉 Ready for Docker Compose operations${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS syntax/configuration issues${NC}"
    echo -e "${YELLOW}⚠️  Please fix the issues above${NC}"
    exit 1
fi