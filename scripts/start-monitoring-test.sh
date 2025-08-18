#!/bin/bash

# 🚀 Start Monitoring System Test Script
# Script untuk memulai dan menguji sistem monitoring HafiPortrait

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "\n${BOLD}${BLUE}🚀 $1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' {1..50})${NC}"
}

# Check if Node.js is running
check_server_running() {
    log_info "Checking if development server is running..."
    
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Development server is running"
        return 0
    else
        log_warning "Development server is not running"
        return 1
    fi
}

# Start development server
start_dev_server() {
    log_header "Starting Development Server"
    
    if check_server_running; then
        log_info "Server already running, skipping start"
        return 0
    fi
    
    log_info "Starting Next.js development server..."
    
    # Check if pnpm is available
    if command -v pnpm &> /dev/null; then
        log_info "Using pnpm to start server"
        pnpm dev &
        SERVER_PID=$!
    elif command -v npm &> /dev/null; then
        log_info "Using npm to start server"
        npm run dev &
        SERVER_PID=$!
    else
        log_error "Neither pnpm nor npm found"
        exit 1
    fi
    
    # Wait for server to start
    log_info "Waiting for server to start..."
    for i in {1..30}; do
        if check_server_running; then
            log_success "Development server started successfully"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    log_error "Failed to start development server"
    return 1
}

# Setup monitoring system
setup_monitoring() {
    log_header "Setting Up Monitoring System"
    
    # Check if setup script exists
    if [ ! -f "scripts/setup-monitoring.sh" ]; then
        log_error "Setup script not found: scripts/setup-monitoring.sh"
        return 1
    fi
    
    # Make setup script executable
    chmod +x scripts/setup-monitoring.sh
    
    # Run setup
    log_info "Running monitoring setup..."
    ./scripts/setup-monitoring.sh
    
    if [ $? -eq 0 ]; then
        log_success "Monitoring setup completed"
    else
        log_warning "Monitoring setup had some issues, continuing with tests"
    fi
}

# Start automated monitoring
start_automated_monitoring() {
    log_header "Starting Automated Monitoring"
    
    # Check if monitoring script exists
    if [ ! -f "scripts/automated-monitoring.js" ]; then
        log_error "Automated monitoring script not found"
        return 1
    fi
    
    # Check if monitoring is already running
    if pgrep -f "automated-monitoring.js" > /dev/null; then
        log_info "Automated monitoring already running"
        return 0
    fi
    
    # Start monitoring
    log_info "Starting automated monitoring..."
    node scripts/automated-monitoring.js &
    MONITORING_PID=$!
    
    # Wait a bit for monitoring to initialize
    sleep 5
    
    if pgrep -f "automated-monitoring.js" > /dev/null; then
        log_success "Automated monitoring started (PID: $MONITORING_PID)"
    else
        log_warning "Automated monitoring may not have started properly"
    fi
}

# Run comprehensive tests
run_tests() {
    log_header "Running Comprehensive Tests"
    
    # Make test script executable
    chmod +x scripts/test-monitoring-system.js
    
    # Run tests
    log_info "Executing test suite..."
    node scripts/test-monitoring-system.js
    
    TEST_EXIT_CODE=$?
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        log_success "All tests passed! 🎉"
    else
        log_error "Some tests failed. Check the output above for details."
    fi
    
    return $TEST_EXIT_CODE
}

# Test individual components
test_components() {
    log_header "Testing Individual Components"
    
    # Test API endpoints
    log_info "Testing API endpoints..."
    
    endpoints=(
        "/api/health"
        "/api/admin/monitoring?type=overview"
        "/api/admin/monitoring?type=metrics"
        "/api/admin/monitoring?type=health"
        "/api/admin/monitoring?type=alerts"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log_info "Testing: $endpoint"
        
        response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000$endpoint")
        
        if [ "$response" = "200" ]; then
            log_success "✅ $endpoint - OK"
        else
            log_error "❌ $endpoint - Status: $response"
        fi
    done
    
    # Test alert creation
    log_info "Testing alert creation..."
    
    alert_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"action":"test-alert"}' \
        -w "%{http_code}" \
        -o /dev/null \
        "http://localhost:3000/api/admin/monitoring")
    
    if [ "$alert_response" = "200" ]; then
        log_success "✅ Alert creation - OK"
    else
        log_error "❌ Alert creation - Status: $alert_response"
    fi
    
    # Test health check trigger
    log_info "Testing health check trigger..."
    
    health_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"action":"health-check"}' \
        -w "%{http_code}" \
        -o /dev/null \
        "http://localhost:3000/api/admin/monitoring")
    
    if [ "$health_response" = "200" ]; then
        log_success "✅ Health check trigger - OK"
    else
        log_error "❌ Health check trigger - Status: $health_response"
    fi
}

# Test admin dashboard
test_admin_dashboard() {
    log_header "Testing Admin Dashboard"
    
    log_info "Testing admin dashboard accessibility..."
    
    admin_response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000/admin")
    
    if [ "$admin_response" = "200" ]; then
        log_success "✅ Admin dashboard accessible"
    else
        log_error "❌ Admin dashboard not accessible - Status: $admin_response"
    fi
    
    log_info "Admin dashboard should now be available at:"
    log_info "🌐 http://localhost:3000/admin"
    log_info ""
    log_info "Navigate to: System & Monitoring to test monitoring features:"
    log_info "  📊 Real-time Monitor"
    log_info "  🚨 Alert Dashboard"
    log_info "  📈 Advanced Monitoring"
}

# Performance test
test_performance() {
    log_header "Testing Performance"
    
    log_info "Running performance tests..."
    
    # Test API response times
    for i in {1..5}; do
        start_time=$(date +%s%3N)
        curl -s "http://localhost:3000/api/admin/monitoring?type=overview" > /dev/null
        end_time=$(date +%s%3N)
        
        response_time=$((end_time - start_time))
        
        if [ $response_time -lt 1000 ]; then
            log_success "✅ API Response $i: ${response_time}ms (excellent)"
        elif [ $response_time -lt 3000 ]; then
            log_info "⚠️  API Response $i: ${response_time}ms (acceptable)"
        else
            log_warning "❌ API Response $i: ${response_time}ms (slow)"
        fi
    done
}

# Cleanup function
cleanup() {
    log_header "Cleanup"
    
    if [ ! -z "$SERVER_PID" ]; then
        log_info "Stopping development server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$MONITORING_PID" ]; then
        log_info "Stopping automated monitoring (PID: $MONITORING_PID)..."
        kill $MONITORING_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes
    pkill -f "automated-monitoring.js" 2>/dev/null || true
    
    log_info "Cleanup completed"
}

# Trap cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    log_header "HafiPortrait Monitoring System Test"
    log_info "Starting comprehensive monitoring system test..."
    
    # Step 1: Setup monitoring
    setup_monitoring
    
    # Step 2: Start development server
    start_dev_server
    
    # Step 3: Start automated monitoring
    start_automated_monitoring
    
    # Step 4: Wait for systems to stabilize
    log_info "Waiting for systems to stabilize..."
    sleep 10
    
    # Step 5: Test individual components
    test_components
    
    # Step 6: Test admin dashboard
    test_admin_dashboard
    
    # Step 7: Test performance
    test_performance
    
    # Step 8: Run comprehensive test suite
    run_tests
    
    TEST_SUCCESS=$?
    
    # Step 9: Show results
    log_header "Test Results Summary"
    
    if [ $TEST_SUCCESS -eq 0 ]; then
        log_success "🎉 All monitoring system tests passed!"
        log_success "System is ready for production deployment"
        
        echo ""
        log_info "Next steps:"
        log_info "1. Access admin dashboard: http://localhost:3000/admin"
        log_info "2. Test monitoring features manually"
        log_info "3. Configure notification channels"
        log_info "4. Deploy to production"
        
    else
        log_error "❌ Some tests failed"
        log_error "Please check the test output and fix issues before deployment"
        
        echo ""
        log_info "Troubleshooting:"
        log_info "1. Check logs in logs/monitoring/"
        log_info "2. Verify environment variables"
        log_info "3. Ensure all dependencies are installed"
        log_info "4. Run individual tests for debugging"
    fi
    
    # Keep server running for manual testing
    if [ $TEST_SUCCESS -eq 0 ]; then
        echo ""
        log_info "🚀 Systems are running for manual testing..."
        log_info "Press Ctrl+C to stop all services"
        
        # Wait indefinitely
        while true; do
            sleep 60
            if ! check_server_running; then
                log_warning "Development server stopped"
                break
            fi
        done
    fi
    
    return $TEST_SUCCESS
}

# Run main function
main "$@"