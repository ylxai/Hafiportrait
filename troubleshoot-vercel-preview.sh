#!/bin/bash

# Vercel Preview Troubleshooting Script
# Script untuk debugging masalah di Vercel preview environment

echo "🔍 Vercel Preview Troubleshooting Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to get preview URL
get_preview_url() {
    echo ""
    print_status "INFO" "Getting Vercel preview URL..."
    
    # Try to get the latest deployment
    preview_url=$(vercel ls 2>/dev/null | grep -E "preview|development" | head -1 | awk '{print $2}')
    
    if [ -n "$preview_url" ]; then
        echo "Preview URL: $preview_url"
        return 0
    else
        print_status "WARNING" "Could not automatically detect preview URL"
        echo "Please enter your preview URL manually:"
        read -p "Preview URL: " preview_url
        return 1
    fi
}

# Function to test endpoint
test_endpoint() {
    local base_url=$1
    local endpoint=$2
    local description=$3
    local method=${4:-GET}
    local data=${5:-""}
    
    echo ""
    print_status "INFO" "Testing $description..."
    echo "URL: $base_url$endpoint"
    echo "Method: $method"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$base_url$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET \
            "$base_url$endpoint")
    fi
    
    # Extract status code and body
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status Code: $status_code"
    
    if [ "$status_code" -eq 200 ]; then
        print_status "SUCCESS" "$description is working"
        echo "Response preview:"
        echo "$body" | head -c 300
        if [ ${#body} -gt 300 ]; then
            echo "..."
        fi
    else
        print_status "ERROR" "$description failed with status $status_code"
        echo "Response: $body"
    fi
}

# Function to check environment variables
check_env_vars() {
    echo ""
    print_status "INFO" "Checking environment variables for preview..."
    
    # List environment variables
    echo "Environment variables for preview:"
    vercel env ls | grep preview || echo "No preview environment variables found"
    
    echo ""
    echo "Environment variables for production:"
    vercel env ls | grep production || echo "No production environment variables found"
}

# Function to check deployment status
check_deployment() {
    echo ""
    print_status "INFO" "Checking deployment status..."
    
    # List recent deployments
    echo "Recent deployments:"
    vercel ls --limit=5
}

# Function to check logs
check_logs() {
    echo ""
    print_status "INFO" "Checking recent logs..."
    
    # Get recent logs
    echo "Recent logs (last 10 minutes):"
    vercel logs --since=10m || echo "No recent logs found"
}

# Function to test CORS
test_cors() {
    local base_url=$1
    
    echo ""
    print_status "INFO" "Testing CORS configuration..."
    
    # Test preflight request
    cors_response=$(curl -s -X OPTIONS \
        -H "Origin: $base_url" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -w "\n%{http_code}" \
        "$base_url/api/test-simple")
    
    status_code=$(echo "$cors_response" | tail -n1)
    headers=$(echo "$cors_response" | head -n -1)
    
    if [ "$status_code" -eq 200 ]; then
        print_status "SUCCESS" "CORS preflight request successful"
    else
        print_status "ERROR" "CORS preflight request failed with status $status_code"
    fi
    
    # Check for CORS headers
    if echo "$headers" | grep -q "Access-Control-Allow-Origin"; then
        print_status "SUCCESS" "CORS headers are present"
    else
        print_status "WARNING" "CORS headers not found"
    fi
}

# Function to provide recommendations
provide_recommendations() {
    echo ""
    print_status "INFO" "Recommendations for fixing preview issues:"
    echo ""
    echo "1. 🔧 Environment Variables:"
    echo "   - Set NEXT_PUBLIC_API_BASE_URL for preview"
    echo "   - Set ALLOWED_ORIGINS to include preview domain"
    echo "   - Ensure database credentials are set"
    echo ""
    echo "2. 🌐 CORS Configuration:"
    echo "   - Add preview domain to allowed origins"
    echo "   - Check vercel.json CORS headers"
    echo "   - Verify middleware CORS handling"
    echo ""
    echo "3. 🚀 Deployment:"
    echo "   - Redeploy with: vercel --prod"
    echo "   - Check build logs for errors"
    echo "   - Verify function deployment"
    echo ""
    echo "4. 🔍 Debugging:"
    echo "   - Use browser developer tools"
    echo "   - Check Network tab for failed requests"
    echo "   - Review console logs"
    echo "   - Test with /admin/test-login page"
}

# Main troubleshooting function
main() {
    echo "Starting Vercel preview troubleshooting..."
    echo "Timestamp: $(date)"
    echo ""
    
    # Get preview URL
    if get_preview_url; then
        echo "Using detected preview URL: $preview_url"
    else
        echo "Using manual preview URL: $preview_url"
    fi
    
    if [ -z "$preview_url" ]; then
        print_status "ERROR" "No preview URL provided. Exiting."
        exit 1
    fi
    
    # Run all tests
    test_endpoint "$preview_url" "/api/test-simple" "Simple Test API"
    test_endpoint "$preview_url" "/api/auth/test" "Auth Test API"
    test_endpoint "$preview_url" "/api/health" "Health Check API"
    
    # Test login endpoint with invalid credentials
    test_endpoint "$preview_url" "/api/auth/login" "Login API" "POST" '{"username":"test","password":"test"}'
    
    # Test CORS
    test_cors "$preview_url"
    
    # Check environment and deployment
    check_env_vars
    check_deployment
    check_logs
    
    # Provide recommendations
    provide_recommendations
    
    echo ""
    echo "🎯 Troubleshooting completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review the test results above"
    echo "2. Check browser console for errors"
    echo "3. Verify environment variables"
    echo "4. Test with valid credentials"
    echo "5. Check Vercel dashboard for deployment status"
}

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    print_status "ERROR" "Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_status "ERROR" "You are not logged in to Vercel. Please login first:"
    echo "   vercel login"
    exit 1
fi

# Check if curl is available
if ! command -v curl &> /dev/null; then
    print_status "ERROR" "curl is not installed. Please install curl first."
    exit 1
fi

# Run main function
main