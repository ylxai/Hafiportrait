#!/bin/bash

# Check which environment variables are missing in CircleCI
# Usage: ./scripts/check-missing-env-vars.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Checking Missing Environment Variables in CircleCI${NC}"
echo ""

# Check if API token is provided
if [ -z "$CIRCLECI_TOKEN" ]; then
    echo -e "${RED}❌ Error: CIRCLECI_TOKEN environment variable not set${NC}"
    echo "Get your token from: https://app.circleci.com/settings/user/tokens"
    echo "Then run: export CIRCLECI_TOKEN=your_token_here"
    exit 1
fi

# Project details
PROJECT_SLUG="circleci/52Qu7EFEDcWDsxzc2AToaE/Jb6Jm6LujS94M8MwfwVjYN"
API_URL="https://circleci.com/api/v2/project/${PROJECT_SLUG}/envvar"

echo -e "${YELLOW}📋 Getting current environment variables from CircleCI...${NC}"

# Get current variables from CircleCI
circleci_vars=$(curl -s -H "Circle-Token: $CIRCLECI_TOKEN" "$API_URL" | grep -o '"name":"[^"]*"' | sed 's/"name":"//g' | sed 's/"//g' | sort)

echo "Current variables in CircleCI:"
echo "$circleci_vars"
echo ""
echo "Total count: $(echo "$circleci_vars" | wc -l)"
echo ""

# Get variables from .env.circleci
echo -e "${YELLOW}📋 Variables in .env.circleci:${NC}"
local_vars=$(grep -v "^#" .env.circleci | grep -v "^$" | cut -d'=' -f1 | sort)

echo "$local_vars"
echo ""
echo "Total count: $(echo "$local_vars" | wc -l)"
echo ""

# Find missing variables
echo -e "${YELLOW}🔍 Missing variables in CircleCI:${NC}"
missing_vars=$(comm -23 <(echo "$local_vars") <(echo "$circleci_vars"))

if [ -z "$missing_vars" ]; then
    echo -e "${GREEN}✅ All variables are present in CircleCI!${NC}"
else
    echo -e "${RED}❌ Missing variables:${NC}"
    echo "$missing_vars"
    echo ""
    echo -e "${YELLOW}📝 To add missing variables, run:${NC}"
    echo "./scripts/circleci-env-import-from-file.sh"
fi