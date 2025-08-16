#!/bin/bash

echo "🔐 Setting up DSLR System credentials..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from DSLR-System directory${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Checking credential files...${NC}"

# Setup .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from template${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your actual credentials${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Setup Google Drive tokens
if [ ! -f "google-drive-tokens.json" ]; then
    if [ -f "google-drive-tokens.example.json" ]; then
        cp google-drive-tokens.example.json google-drive-tokens.json
        echo -e "${GREEN}✅ Created google-drive-tokens.json from template${NC}"
        echo -e "${YELLOW}⚠️  Please update google-drive-tokens.json with your actual tokens${NC}"
    else
        echo -e "${RED}❌ google-drive-tokens.example.json not found${NC}"
    fi
else
    echo -e "${GREEN}✅ google-drive-tokens.json already exists${NC}"
fi

# Create directories for credentials if they don't exist
mkdir -p Storage/tokens
mkdir -p Storage/credentials
mkdir -p Config
echo -e "${GREEN}✅ Created credential directories${NC}"

# Check if files are properly gitignored
echo -e "${BLUE}🔍 Checking .gitignore status...${NC}"

if git check-ignore google-drive-tokens.json >/dev/null 2>&1; then
    echo -e "${GREEN}✅ google-drive-tokens.json is properly gitignored${NC}"
else
    echo -e "${YELLOW}⚠️  google-drive-tokens.json is NOT gitignored${NC}"
    echo -e "${YELLOW}   Make sure to add it to .gitignore in project root${NC}"
fi

if git check-ignore .env >/dev/null 2>&1; then
    echo -e "${GREEN}✅ .env is properly gitignored${NC}"
else
    echo -e "${YELLOW}⚠️  .env is NOT gitignored${NC}"
    echo -e "${YELLOW}   Make sure to add it to .gitignore in project root${NC}"
fi

echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${YELLOW}1. Update .env with your environment variables${NC}"
echo -e "${YELLOW}2. Update google-drive-tokens.json with your Google Drive tokens${NC}"
echo -e "${YELLOW}3. Run authentication: node Storage/storage-optimization-cli.js auth${NC}"
echo -e "${YELLOW}4. Test connection: node Storage/storage-optimization-cli.js test${NC}"

echo -e "${GREEN}🎯 Setup completed!${NC}"