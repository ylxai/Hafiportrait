#!/bin/bash

# CircleCI Environment Variables Import from .env.circleci
# Usage: ./scripts/circleci-env-import-from-file.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 CircleCI Environment Variables Import from .env.circleci${NC}"
echo ""

# Check if API token is provided
if [ -z "$CIRCLECI_TOKEN" ]; then
    echo -e "${RED}❌ Error: CIRCLECI_TOKEN environment variable not set${NC}"
    echo "Get your token from: https://app.circleci.com/settings/user/tokens"
    echo "Then run: export CIRCLECI_TOKEN=your_token_here"
    exit 1
fi

# Check if .env.circleci exists
if [ ! -f ".env.circleci" ]; then
    echo -e "${RED}❌ Error: .env.circleci file not found${NC}"
    exit 1
fi

# Project details
PROJECT_ID="8e6dea5c-200e-47f2-9ab4-907802fbd103"
PROJECT_SLUG="circleci/52Qu7EFEDcWDsxzc2AToaE/Jb6Jm6LujS94M8MwfwVjYN"
GITHUB_SLUG="gh/ylxai/hafiportrait"
API_URL="https://circleci.com/api/v2/project/${PROJECT_SLUG}/envvar"
# Alternative API URLs:
# API_URL="https://circleci.com/api/v2/project/${GITHUB_SLUG}/envvar"
# API_URL="https://circleci.com/api/v2/project/${PROJECT_ID}/envvar"

echo -e "${YELLOW}📋 Reading variables from .env.circleci...${NC}"

# Function to add environment variable
add_env_var() {
    local name=$1
    local value=$2
    
    echo -n "Adding $name... "
    
    response=$(curl -s -X POST \
        -H "Circle-Token: $CIRCLECI_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$name\",\"value\":\"$value\"}" \
        "$API_URL")
    
    if echo "$response" | grep -q '"name"'; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
        echo "Error: $response"
    fi
}

# Read and import variables from .env.circleci
while IFS='=' read -r name value; do
    # Skip comments and empty lines
    if [[ $name =~ ^#.*$ ]] || [[ -z $name ]]; then
        continue
    fi
    
    # Remove quotes if present
    value=$(echo "$value" | sed 's/^"//;s/"$//')
    
    add_env_var "$name" "$value"
done < .env.circleci

# Add SSH private key separately (multiline)
echo -n "Adding SSH_PRIVATE_KEY... "
SSH_PRIVATE_KEY=$(cat ~/.ssh/id_rsa)
response=$(curl -s -X POST \
    -H "Circle-Token: $CIRCLECI_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"SSH_PRIVATE_KEY\",\"value\":\"$SSH_PRIVATE_KEY\"}" \
    "$API_URL")

if echo "$response" | grep -q '"name"'; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
    echo "Error: $response"
fi

echo ""
echo -e "${GREEN}🎉 Environment variables import completed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Go to CircleCI dashboard to verify"
echo "2. Push code to trigger build"
echo "3. Monitor deployment"