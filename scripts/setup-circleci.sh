#!/bin/bash

# 🚀 CircleCI Setup Script for HafiPortrait
# This script helps setup CircleCI environment variables and configuration

set -e

echo "🚀 HafiPortrait CircleCI Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if env-circleci.md exists
if [ ! -f "env-circleci.md" ]; then
    print_error "env-circleci.md file not found!"
    print_info "Please ensure env-circleci.md exists in the project root"
    exit 1
fi

print_status "Found env-circleci.md file"

# Check if .circleci/config.yml exists
if [ ! -f ".circleci/config.yml" ]; then
    print_error ".circleci/config.yml file not found!"
    print_info "Please ensure .circleci/config.yml exists"
    exit 1
fi

print_status "Found .circleci/config.yml file"

echo ""
echo "📋 CircleCI Setup Instructions:"
echo "==============================="

echo ""
print_info "1. Login to CircleCI"
echo "   🌐 Go to: https://circleci.com/"
echo "   📝 Login with your GitHub account"

echo ""
print_info "2. Add Your Project"
echo "   📁 Click 'Set Up Project' for your HafiPortrait repository"
echo "   🔗 Connect your GitHub repository"

echo ""
print_info "3. Configure Environment Variables"
echo "   ⚙️  Go to: Project Settings > Environment Variables"
echo "   📋 Add the following variables from env-circleci.md:"

echo ""
echo "   🔧 Core Application Variables:"
echo "   - NODE_ENV"
echo "   - NEXT_PUBLIC_ENV_MODE"
echo "   - NEXT_PUBLIC_APP_URL"
echo "   - NEXT_TELEMETRY_DISABLED"

echo ""
echo "   🔐 Authentication Secrets:"
echo "   - JWT_SECRET"
echo "   - SESSION_SECRET"

echo ""
echo "   📊 Supabase Configuration:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"

echo ""
echo "   ☁️  Cloudflare R2 Storage:"
echo "   - CLOUDFLARE_R2_ACCOUNT_ID"
echo "   - CLOUDFLARE_R2_ACCESS_KEY_ID"
echo "   - CLOUDFLARE_R2_SECRET_ACCESS_KEY"
echo "   - CLOUDFLARE_R2_BUCKET_NAME"
echo "   - CLOUDFLARE_R2_CUSTOM_DOMAIN"
echo "   - CLOUDFLARE_R2_PUBLIC_URL"
echo "   - CLOUDFLARE_R2_REGION"
echo "   - CLOUDFLARE_R2_ENDPOINT"

echo ""
echo "   📂 Google Drive Backup:"
echo "   - GOOGLE_DRIVE_CLIENT_ID"
echo "   - GOOGLE_DRIVE_CLIENT_SECRET"
echo "   - GOOGLE_DRIVE_REFRESH_TOKEN"
echo "   - GOOGLE_DRIVE_FOLDER_ID"
echo "   - GOOGLE_DRIVE_FOLDER_NAME"
echo "   - GOOGLE_DRIVE_SHARED_FOLDER"

echo ""
echo "   🧠 Smart Storage:"
echo "   - SMART_STORAGE_ENABLED"
echo "   - SMART_STORAGE_DEFAULT_TIER"
echo "   - SMART_STORAGE_PRIMARY"
echo "   - SMART_STORAGE_SECONDARY"
echo "   - SMART_STORAGE_TERTIARY"
echo "   - SMART_STORAGE_COMPRESSION_QUALITY"

echo ""
echo "   🔌 Socket.IO Configuration:"
echo "   - NEXT_PUBLIC_USE_SOCKETIO"
echo "   - NEXT_PUBLIC_SOCKETIO_URL"
echo "   - SOCKETIO_PORT"

echo ""
echo "   ⚡ Real-time Features:"
echo "   - ENABLE_WEBSOCKET"
echo "   - ENABLE_REAL_TIME_UPDATES"
echo "   - ENABLE_SOCKETIO_ROOMS"

echo ""
echo "   🌐 Security Configuration:"
echo "   - CORS_ORIGIN"
echo "   - ALLOWED_ORIGINS"
echo "   - NEXT_PUBLIC_ALLOW_ALL_ORIGINS"

echo ""
echo "   🚀 Cloudflare Deployment:"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ACCOUNT_ID"
echo "   - CLOUDFLARE_ZONE_ID"

echo ""
print_info "4. Trigger First Build"
echo "   🔄 Push a commit to main/master branch"
echo "   🏗️  CircleCI will automatically start the build process"

echo ""
print_info "5. Monitor Build Status"
echo "   📊 Check build status in CircleCI dashboard"
echo "   🔍 Review logs for any issues"

echo ""
print_warning "Important Notes:"
echo "=================="
echo "• Make sure all environment variables are correctly set"
echo "• Socket.IO server should be running on VPS (port 4001)"
echo "• Cloudflare Pages project should be created"
echo "• All secrets should be kept secure and not logged"

echo ""
print_status "CircleCI setup instructions completed!"
print_info "Next step: Follow the instructions above to configure CircleCI"

echo ""
echo "🔗 Useful Links:"
echo "================"
echo "• CircleCI Dashboard: https://circleci.com/dashboard"
echo "• Cloudflare Pages: https://dash.cloudflare.com/pages"
echo "• Socket.IO Health: http://147.251.255.227:4001/health"
echo "• Supabase Dashboard: https://supabase.com/dashboard"

echo ""
print_status "Setup script completed successfully! 🎉"