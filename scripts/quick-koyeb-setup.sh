#!/bin/bash

# 🚀 Quick Koyeb WebSocket Deployment Script
# One-command setup untuk deploy WebSocket server ke Koyeb

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}"
    echo "🚀 HafiPortrait WebSocket → Koyeb Deployment"
    echo "=============================================="
    echo -e "${NC}"
}

# Check if running from correct directory
check_directory() {
    if [ ! -d "ws" ] || [ ! -f "ws/package.json" ]; then
        print_error "Please run this script from the project root directory"
        print_error "Required: ws/ directory with WebSocket server files"
        exit 1
    fi
    print_success "✅ Project structure verified"
}

# Install Koyeb CLI if not exists
install_koyeb_cli() {
    if command -v koyeb &> /dev/null; then
        print_success "✅ Koyeb CLI already installed"
        return
    fi

    print_status "Installing Koyeb CLI..."
    curl -fsSL https://cli.koyeb.com/install.sh | sh
    
    # Add to PATH if needed
    if ! command -v koyeb &> /dev/null; then
        export PATH="$HOME/.koyeb:$PATH"
        echo 'export PATH="$HOME/.koyeb:$PATH"' >> ~/.bashrc
    fi
    
    print_success "✅ Koyeb CLI installed"
}

# Login to Koyeb
koyeb_login() {
    if koyeb auth current-user &> /dev/null; then
        print_success "✅ Already logged in to Koyeb"
        return
    fi

    print_status "Logging in to Koyeb..."
    print_warning "This will open your browser for authentication"
    read -p "Press Enter to continue..."
    
    koyeb auth login
    print_success "✅ Successfully logged in to Koyeb"
}

# Get Git repository URL
get_git_repo() {
    if ! git remote get-url origin &> /dev/null; then
        print_error "Git repository not found or origin not set"
        print_error "Please ensure you're in a Git repository with remote origin"
        exit 1
    fi
    
    GIT_REPO=$(git remote get-url origin)
    print_success "✅ Git repository: $GIT_REPO"
}

# Deploy to Koyeb
deploy_to_koyeb() {
    APP_NAME="hafiportrait-websocket"
    REGION="fra"  # Frankfurt
    INSTANCE_TYPE="nano"
    
    print_status "Deploying WebSocket server to Koyeb..."
    print_status "App: $APP_NAME | Region: $REGION | Instance: $INSTANCE_TYPE"
    
    # Check if app already exists
    if koyeb app get $APP_NAME &> /dev/null; then
        print_warning "App '$APP_NAME' already exists"
        read -p "Redeploy existing app? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Redeploying existing app..."
            koyeb app redeploy $APP_NAME
        else
            print_status "Skipping deployment"
            return
        fi
    else
        print_status "Creating new Koyeb app..."
        koyeb app create $APP_NAME \
            --git $GIT_REPO \
            --git-branch main \
            --git-build-command "cd ws && npm install" \
            --git-run-command "cd ws && npm start" \
            --ports 3001:http \
            --ports 3002:http \
            --env NODE_ENV=production \
            --env WS_PORT=3001 \
            --env HEALTH_PORT=3002 \
            --env HOST=0.0.0.0 \
            --env MAX_CONNECTIONS=1000 \
            --env HEARTBEAT_INTERVAL=30000 \
            --env PING_TIMEOUT=120000 \
            --env ENABLE_STATS_LOGGING=true \
            --env CORS_ORIGIN=* \
            --env LOG_LEVEL=info \
            --regions $REGION \
            --instance-type $INSTANCE_TYPE \
            --min-scale 1 \
            --max-scale 3
    fi
    
    print_success "✅ Deployment initiated"
}

# Wait for deployment
wait_for_deployment() {
    APP_NAME="hafiportrait-websocket"
    print_status "Waiting for deployment to complete..."
    
    for i in {1..30}; do
        sleep 10
        STATUS=$(koyeb app get $APP_NAME --output json | jq -r '.status' 2>/dev/null || echo "unknown")
        
        case $STATUS in
            "healthy")
                print_success "✅ Deployment completed successfully!"
                return 0
                ;;
            "error")
                print_error "❌ Deployment failed"
                print_status "Check logs: koyeb app logs $APP_NAME"
                return 1
                ;;
            *)
                print_status "Status: $STATUS (attempt $i/30)"
                ;;
        esac
    done
    
    print_warning "⚠️ Deployment timeout. Check manually: koyeb app get $APP_NAME"
    return 1
}

# Get app info and test
test_deployment() {
    APP_NAME="hafiportrait-websocket"
    
    # Get app domain
    APP_INFO=$(koyeb app get $APP_NAME --output json 2>/dev/null)
    if [ $? -ne 0 ]; then
        print_error "Failed to get app information"
        return 1
    fi
    
    DOMAIN=$(echo $APP_INFO | jq -r '.domains[0]' 2>/dev/null)
    if [ "$DOMAIN" = "null" ] || [ -z "$DOMAIN" ]; then
        print_error "No domain found for the app"
        return 1
    fi
    
    print_status "Testing deployment..."
    print_status "Domain: $DOMAIN"
    
    # Test health endpoint
    HEALTH_URL="https://$DOMAIN/health"
    print_status "Testing health endpoint: $HEALTH_URL"
    
    if curl -s -f "$HEALTH_URL" > /dev/null; then
        print_success "✅ Health check passed"
    else
        print_error "❌ Health check failed"
        return 1
    fi
    
    # Save WebSocket URL for Vercel
    WS_URL="wss://$DOMAIN/ws"
    echo "NEXT_PUBLIC_WS_URL=$WS_URL" > vercel-websocket-config.txt
    
    print_success "✅ WebSocket URL saved to vercel-websocket-config.txt"
    return 0
}

# Show summary
show_summary() {
    APP_NAME="hafiportrait-websocket"
    
    # Get app info
    APP_INFO=$(koyeb app get $APP_NAME --output json 2>/dev/null)
    if [ $? -eq 0 ]; then
        DOMAIN=$(echo $APP_INFO | jq -r '.domains[0]' 2>/dev/null)
        
        echo -e "${GREEN}"
        echo "🎉 Deployment Summary"
        echo "===================="
        echo -e "${NC}"
        echo -e "${CYAN}📱 App Name:${NC} $APP_NAME"
        echo -e "${CYAN}🌍 Domain:${NC} $DOMAIN"
        echo -e "${CYAN}🌐 WebSocket URL:${NC} wss://$DOMAIN/ws"
        echo -e "${CYAN}❤️ Health Check:${NC} https://$DOMAIN/health"
        echo -e "${CYAN}📊 Stats:${NC} https://$DOMAIN/stats"
        echo
        echo -e "${YELLOW}🔧 Management Commands:${NC}"
        echo -e "${CYAN}  koyeb app get $APP_NAME${NC}"
        echo -e "${CYAN}  koyeb app logs $APP_NAME${NC}"
        echo -e "${CYAN}  koyeb app redeploy $APP_NAME${NC}"
        echo
        echo -e "${YELLOW}📝 Next Steps for Vercel:${NC}"
        echo -e "${CYAN}1. Go to https://vercel.com/dashboard${NC}"
        echo -e "${CYAN}2. Select your project → Settings → Environment Variables${NC}"
        echo -e "${CYAN}3. Add: NEXT_PUBLIC_WS_URL = wss://$DOMAIN/ws${NC}"
        echo -e "${CYAN}4. Redeploy your Vercel application${NC}"
        echo
        echo -e "${GREEN}✅ WebSocket server is now live and ready!${NC}"
    fi
}

# Main execution
main() {
    print_header
    
    print_status "Step 1: Checking project structure..."
    check_directory
    
    print_status "Step 2: Installing Koyeb CLI..."
    install_koyeb_cli
    
    print_status "Step 3: Authenticating with Koyeb..."
    koyeb_login
    
    print_status "Step 4: Getting Git repository..."
    get_git_repo
    
    print_status "Step 5: Deploying to Koyeb..."
    deploy_to_koyeb
    
    print_status "Step 6: Waiting for deployment..."
    if wait_for_deployment; then
        print_status "Step 7: Testing deployment..."
        if test_deployment; then
            print_status "Step 8: Generating summary..."
            show_summary
        else
            print_error "Deployment test failed"
            exit 1
        fi
    else
        print_error "Deployment failed or timed out"
        exit 1
    fi
}

# Check if jq is installed (for JSON parsing)
if ! command -v jq &> /dev/null; then
    print_warning "jq not found. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v yum &> /dev/null; then
        sudo yum install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        print_error "Please install jq manually: https://stedolan.github.io/jq/"
        exit 1
    fi
fi

# Run main function
main "$@"