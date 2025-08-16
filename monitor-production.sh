#!/bin/bash

# HafiPortrait Production Environment Monitor
# Script untuk monitoring dan troubleshooting production environment

echo "🔍 HafiPortrait Production Environment Monitor"
echo "=============================================="

# Configuration
PRODUCTION_URL="https://hafiportrait.photography"
HEALTH_ENDPOINT="/api/health"
LOGIN_ENDPOINT="/api/auth/login"
TEST_ENDPOINT="/api/auth/test"

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

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}
    local data=${4:-""}
    
    echo ""
    print_status "INFO" "Testing $description..."
    echo "URL: $PRODUCTION_URL$endpoint"
    echo "Method: $method"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$PRODUCTION_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET \
            "$PRODUCTION_URL$endpoint")
    fi
    
    # Extract status code and body
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status Code: $status_code"
    
    if [ "$status_code" -eq 200 ]; then
        print_status "SUCCESS" "$description is working"
        echo "Response: $body" | head -c 200
        if [ ${#body} -gt 200 ]; then
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
    print_status "INFO" "Checking environment variables..."
    
    # Check if we can access environment info
    env_response=$(curl -s "$PRODUCTION_URL$HEALTH_ENDPOINT")
    
    if echo "$env_response" | grep -q "Missing environment variables"; then
        print_status "ERROR" "Missing environment variables detected"
        echo "$env_response"
    elif echo "$env_response" | grep -q '"environment":"healthy"'; then
        print_status "SUCCESS" "Environment variables are properly configured"
    else
        print_status "WARNING" "Environment status unclear"
        echo "$env_response"
    fi
}

# Function to test database connection
test_database() {
    echo ""
    print_status "INFO" "Testing database connection..."
    
    db_response=$(curl -s "$PRODUCTION_URL$HEALTH_ENDPOINT")
    
    if echo "$db_response" | grep -q '"database":"healthy"'; then
        print_status "SUCCESS" "Database connection is healthy"
    elif echo "$db_response" | grep -q '"database":"unhealthy"'; then
        print_status "ERROR" "Database connection failed"
        echo "$db_response"
    else
        print_status "WARNING" "Database status unclear"
        echo "$db_response"
    fi
}

# Function to test CORS
test_cors() {
    echo ""
    print_status "INFO" "Testing CORS configuration..."
    
    # Test preflight request
    cors_response=$(curl -s -X OPTIONS \
        -H "Origin: https://example.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -w "\n%{http_code}" \
        "$PRODUCTION_URL$LOGIN_ENDPOINT")
    
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

# Function to test login endpoint
test_login_endpoint() {
    echo ""
    print_status "INFO" "Testing login endpoint..."
    
    # Test with invalid credentials
    test_data='{"username":"test","password":"test"}'
    
    login_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        -w "\n%{http_code}" \
        "$PRODUCTION_URL$LOGIN_ENDPOINT")
    
    status_code=$(echo "$login_response" | tail -n1)
    body=$(echo "$login_response" | head -n -1)
    
    if [ "$status_code" -eq 401 ]; then
        print_status "SUCCESS" "Login endpoint is working (correctly rejected invalid credentials)"
    elif [ "$status_code" -eq 200 ]; then
        print_status "WARNING" "Login endpoint accepted invalid credentials (security issue)"
    else
        print_status "ERROR" "Login endpoint failed with status $status_code"
        echo "Response: $body"
    fi
}

# Function to check SSL certificate
check_ssl() {
    echo ""
    print_status "INFO" "Checking SSL certificate..."
    
    ssl_info=$(echo | openssl s_client -servername hafiportrait.photography -connect hafiportrait.photography:443 2>/dev/null | openssl x509 -noout -dates)
    
    if [ $? -eq 0 ]; then
        print_status "SUCCESS" "SSL certificate is valid"
        echo "Certificate info: $ssl_info"
    else
        print_status "ERROR" "SSL certificate check failed"
    fi
}

# Function to check response time
check_response_time() {
    echo ""
    print_status "INFO" "Checking response time..."
    
    start_time=$(date +%s%N)
    curl -s "$PRODUCTION_URL$HEALTH_ENDPOINT" > /dev/null
    end_time=$(date +%s%N)
    
    response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $response_time -lt 1000 ]; then
        print_status "SUCCESS" "Response time: ${response_time}ms (Good)"
    elif [ $response_time -lt 3000 ]; then
        print_status "WARNING" "Response time: ${response_time}ms (Slow)"
    else
        print_status "ERROR" "Response time: ${response_time}ms (Very slow)"
    fi
}

# Main monitoring function
main() {
    echo "Starting production environment monitoring..."
    echo "Production URL: $PRODUCTION_URL"
    echo "Timestamp: $(date)"
    echo ""
    
    # Run all tests
    test_endpoint "$HEALTH_ENDPOINT" "Health Check"
    check_env_vars
    test_database
    test_cors
    test_login_endpoint
    test_endpoint "$TEST_ENDPOINT" "Test API"
    check_ssl
    check_response_time
    
    echo ""
    echo "🎯 Monitoring completed!"
    echo ""
    echo "📋 Next steps if issues found:"
    echo "1. Check Vercel logs: vercel logs"
    echo "2. Check environment variables: vercel env ls"
    echo "3. Check database connection"
    echo "4. Review CORS configuration"
    echo "5. Test with valid credentials"
}

# Check if curl is available
if ! command -v curl &> /dev/null; then
    print_status "ERROR" "curl is not installed. Please install curl first."
    exit 1
fi

# Check if openssl is available for SSL check
if ! command -v openssl &> /dev/null; then
    print_status "WARNING" "openssl is not installed. SSL check will be skipped."
fi

# Run main function
main