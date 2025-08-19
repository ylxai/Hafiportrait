#!/bin/bash

# CircleCI Environment Variables Bulk Import
# Usage: ./scripts/circleci-env-import.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 CircleCI Environment Variables Bulk Import${NC}"
echo ""

# Check if API token is provided
if [ -z "$CIRCLECI_TOKEN" ]; then
    echo -e "${RED}❌ Error: CIRCLECI_TOKEN environment variable not set${NC}"
    echo "Get your token from: https://app.circleci.com/settings/user/tokens"
    echo "Then run: export CIRCLECI_TOKEN=your_token_here"
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

# Environment variables to import
declare -A ENV_VARS=(
    ["DOCKER_USER"]="ylxai"
    ["DOCKER_PASS"]="dckr_pat_HZK-nYOS8TQCANnyGDA1Zxhfz3Q"
    ["SERVER_HOST"]="147.251.255.227"
    ["SERVER_USER"]="ubuntu"
    ["NODE_ENV"]="production"
    ["NEXT_PUBLIC_APP_URL"]="https://hafiportrait.photography"
    ["JWT_SECRET"]="hafiportrait-production-secure-2025"
    ["NEXT_PUBLIC_SUPABASE_URL"]="https://azspktldiblhrwebzmwq.supabase.co"
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDQwNDQsImV4cCI6MjA2OTUyMDA0NH0.uKHB4K9hxUDTc0ZkwidCJv_Ev-oa99AflFvrFt_8MG8"
    ["SUPABASE_SERVICE_ROLE_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk0NDA0NCwiZXhwIjoyMDY5NTIwMDQ0fQ.hk8vOgFoW3PJZxhw40sHiNyvNxbD4_c4x6fqBynvlmE"
    ["CLOUDFLARE_R2_ACCOUNT_ID"]="b14090010faed475102a62eca152b67f"
    ["CLOUDFLARE_R2_ACCESS_KEY_ID"]="51c66dbac26827b84132186428eb3492"
    ["CLOUDFLARE_R2_SECRET_ACCESS_KEY"]="65fe1143600bd9ef97a5c76b4ae924259779e0d0815ce44f09a1844df37fe3f1"
    ["CLOUDFLARE_R2_BUCKET_NAME"]="hafiportrait-photos"
    ["CLOUDFLARE_R2_PUBLIC_URL"]="https://photos.hafiportrait.photography"
)

# SSH Private Key (multiline)
SSH_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----"

echo -e "${YELLOW}📋 Importing ${#ENV_VARS[@]} environment variables...${NC}"
echo ""

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

# Import all environment variables
for name in "${!ENV_VARS[@]}"; do
    add_env_var "$name" "${ENV_VARS[$name]}"
done

# Add SSH private key separately
echo -n "Adding SSH_PRIVATE_KEY... "
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