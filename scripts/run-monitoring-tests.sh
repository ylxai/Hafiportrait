#!/bin/bash

# 🧪 Run Monitoring Tests - Interactive Test Runner
# Script untuk menjalankan test monitoring secara interaktif

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"
}

log_header() {
    echo -e "\n${BOLD}${PURPLE}🧪 $1${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' {1..60})${NC}"
}

log_step() {
    echo -e "\n${CYAN}📋 Step: $1${NC}"
    echo -e "${CYAN}$(printf '-%.0s' {1..40})${NC}"
}

# Progress indicator
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((current * width / total))
    
    printf "\r${BLUE}Progress: [${NC}"
    printf "%*s" $completed | tr ' ' '█'
    printf "%*s" $((width - completed)) | tr ' ' '░'
    printf "${BLUE}] %d%% (%d/%d)${NC}" $percentage $current $total
}

# Wait for user input
wait_for_user() {
    echo -e "\n${YELLOW}Press Enter to continue, or 'q' to quit...${NC}"
    read -r input
    if [[ "$input" == "q" || "$input" == "Q" ]]; then
        echo -e "${YELLOW}Test cancelled by user${NC}"
        exit 0
    fi
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"
    ((TOTAL_TESTS++))
    
    log_step "Checking Node.js version"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            log_success "Node.js $NODE_VERSION (compatible)"
        else
            log_error "Node.js $NODE_VERSION (requires 18+)"
            return 1
        fi
    else
        log_error "Node.js not found"
        return 1
    fi
    
    log_step "Checking package manager"
    if command -v pnpm &> /dev/null; then
        log_success "pnpm found"
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        log_success "npm found"
        PKG_MANAGER="npm"
    else
        log_error "No package manager found"
        return 1
    fi
    
    log_step "Checking required files"
    REQUIRED_FILES=(
        "package.json"
        "src/lib/alert-manager.ts"
        "src/lib/health-monitor.ts"
        "src/components/admin/alert-dashboard.tsx"
        "src/components/admin/real-time-monitor.tsx"
        "src/app/api/admin/monitoring/route.ts"
        "scripts/automated-monitoring.js"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_success "$file exists"
        else
            log_error "$file missing"
            return 1
        fi
    done
    
    return 0
}

# Install dependencies
install_dependencies() {
    log_header "Installing Dependencies"
    ((TOTAL_TESTS++))
    
    log_step "Installing packages"
    if [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        return 1
    fi
    
    return 0
}

# Setup monitoring system
setup_monitoring_system() {
    log_header "Setting Up Monitoring System"
    ((TOTAL_TESTS++))
    
    log_step "Running monitoring setup"
    if [ -f "scripts/setup-monitoring.sh" ]; then
        chmod +x scripts/setup-monitoring.sh
        ./scripts/setup-monitoring.sh
        
        if [ $? -eq 0 ]; then
            log_success "Monitoring system setup completed"
        else
            log_warning "Monitoring setup had issues, continuing..."
        fi
    else
        log_warning "Setup script not found, skipping..."
    fi
    
    return 0
}

# Start development server
start_development_server() {
    log_header "Starting Development Server"
    ((TOTAL_TESTS++))
    
    log_step "Checking if server is already running"
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Development server already running"
        return 0
    fi
    
    log_step "Starting Next.js development server"
    if [ "$PKG_MANAGER" = "pnpm" ]; then
        pnpm dev &
    else
        npm run dev &
    fi
    
    SERVER_PID=$!
    
    log_info "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "Development server started (PID: $SERVER_PID)"
            return 0
        fi
        sleep 2
        show_progress $i 30
    done
    
    log_error "Failed to start development server"
    return 1
}

# Start monitoring service
start_monitoring_service() {
    log_header "Starting Monitoring Service"
    ((TOTAL_TESTS++))
    
    log_step "Checking if monitoring is already running"
    if pgrep -f "automated-monitoring.js" > /dev/null; then
        log_success "Monitoring service already running"
        return 0
    fi
    
    log_step "Starting automated monitoring"
    node scripts/automated-monitoring.js &
    MONITORING_PID=$!
    
    sleep 5
    
    if pgrep -f "automated-monitoring.js" > /dev/null; then
        log_success "Monitoring service started (PID: $MONITORING_PID)"
    else
        log_warning "Monitoring service may not have started properly"
    fi
    
    return 0
}

# Test API endpoints
test_api_endpoints() {
    log_header "Testing API Endpoints"
    ((TOTAL_TESTS++))
    
    ENDPOINTS=(
        "/api/health:Health check"
        "/api/admin/monitoring?type=overview:Monitoring overview"
        "/api/admin/monitoring?type=metrics:System metrics"
        "/api/admin/monitoring?type=health:Health status"
        "/api/admin/monitoring?type=alerts:Alerts data"
    )
    
    for endpoint_info in "${ENDPOINTS[@]}"; do
        IFS=':' read -r endpoint description <<< "$endpoint_info"
        
        log_step "Testing $description"
        
        response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000$endpoint")
        
        if [ "$response" = "200" ]; then
            log_success "$description - OK (200)"
        else
            log_error "$description - Failed ($response)"
        fi
    done
    
    return 0
}

# Test POST endpoints
test_post_endpoints() {
    log_header "Testing POST Endpoints"
    ((TOTAL_TESTS++))
    
    log_step "Testing alert creation"
    alert_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"action":"test-alert"}' \
        -w "%{http_code}" \
        -o /dev/null \
        "http://localhost:3000/api/admin/monitoring")
    
    if [ "$alert_response" = "200" ]; then
        log_success "Alert creation - OK (200)"
    else
        log_error "Alert creation - Failed ($alert_response)"
    fi
    
    log_step "Testing health check trigger"
    health_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"action":"health-check"}' \
        -w "%{http_code}" \
        -o /dev/null \
        "http://localhost:3000/api/admin/monitoring")
    
    if [ "$health_response" = "200" ]; then
        log_success "Health check trigger - OK (200)"
    else
        log_error "Health check trigger - Failed ($health_response)"
    fi
    
    return 0
}

# Test admin dashboard
test_admin_dashboard() {
    log_header "Testing Admin Dashboard"
    ((TOTAL_TESTS++))
    
    log_step "Testing admin dashboard accessibility"
    admin_response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000/admin")
    
    if [ "$admin_response" = "200" ]; then
        log_success "Admin dashboard accessible (200)"
    else
        log_error "Admin dashboard not accessible ($admin_response)"
    fi
    
    log_info "Admin dashboard URL: ${CYAN}http://localhost:3000/admin${NC}"
    log_info "Test these monitoring sections manually:"
    log_info "  📊 Real-time Monitor"
    log_info "  🚨 Alert Dashboard"
    log_info "  📈 Advanced Monitoring"
    
    return 0
}

# Run comprehensive test suite
run_comprehensive_tests() {
    log_header "Running Comprehensive Test Suite"
    ((TOTAL_TESTS++))
    
    log_step "Executing automated test suite"
    
    if [ -f "scripts/test-monitoring-system.js" ]; then
        chmod +x scripts/test-monitoring-system.js
        node scripts/test-monitoring-system.js
        
        if [ $? -eq 0 ]; then
            log_success "Comprehensive test suite passed"
        else
            log_error "Some comprehensive tests failed"
        fi
    else
        log_warning "Comprehensive test script not found"
    fi
    
    return 0
}

# Performance testing
test_performance() {
    log_header "Testing Performance"
    ((TOTAL_TESTS++))
    
    log_step "Testing API response times"
    
    total_time=0
    test_count=5
    
    for i in $(seq 1 $test_count); do
        start_time=$(date +%s%3N)
        curl -s "http://localhost:3000/api/admin/monitoring?type=overview" > /dev/null
        end_time=$(date +%s%3N)
        
        response_time=$((end_time - start_time))
        total_time=$((total_time + response_time))
        
        if [ $response_time -lt 1000 ]; then
            log_success "Response $i: ${response_time}ms (excellent)"
        elif [ $response_time -lt 3000 ]; then
            log_info "Response $i: ${response_time}ms (acceptable)"
        else
            log_warning "Response $i: ${response_time}ms (slow)"
        fi
    done
    
    avg_time=$((total_time / test_count))
    log_info "Average response time: ${avg_time}ms"
    
    if [ $avg_time -lt 1000 ]; then
        log_success "Performance test passed (excellent)"
    elif [ $avg_time -lt 3000 ]; then
        log_success "Performance test passed (acceptable)"
    else
        log_error "Performance test failed (too slow)"
    fi
    
    return 0
}

# Generate test report
generate_test_report() {
    log_header "Test Results Summary"
    
    local success_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    echo -e "\n${BOLD}📊 Test Summary:${NC}"
    echo -e "   Total Tests: $TOTAL_TESTS"
    echo -e "   ${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "   ${RED}Failed: $FAILED_TESTS${NC}"
    echo -e "   Success Rate: ${success_rate}%"
    
    if [ $success_rate -ge 80 ]; then
        echo -e "\n${GREEN}🎉 Overall Result: PASSED${NC}"
        echo -e "${GREEN}System is ready for production!${NC}"
    else
        echo -e "\n${RED}❌ Overall Result: FAILED${NC}"
        echo -e "${RED}Please fix issues before deployment${NC}"
    fi
    
    # Save report
    cat > logs/monitoring/test-summary.txt << EOF
HafiPortrait Monitoring System Test Report
==========================================
Date: $(date)
Total Tests: $TOTAL_TESTS
Passed: $PASSED_TESTS
Failed: $FAILED_TESTS
Success Rate: ${success_rate}%
Status: $([ $success_rate -ge 80 ] && echo "PASSED" || echo "FAILED")
EOF
    
    log_info "Test report saved to: logs/monitoring/test-summary.txt"
    
    return $([ $success_rate -ge 80 ] && echo 0 || echo 1)
}

# Cleanup function
cleanup() {
    log_header "Cleanup"
    
    if [ ! -z "$SERVER_PID" ]; then
        log_info "Stopping development server..."
        kill $SERVER_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$MONITORING_PID" ]; then
        log_info "Stopping monitoring service..."
        kill $MONITORING_PID 2>/dev/null || true
    fi
    
    pkill -f "automated-monitoring.js" 2>/dev/null || true
    
    log_info "Cleanup completed"
}

# Interactive mode
interactive_mode() {
    log_header "Interactive Monitoring System Test"
    log_info "This will test the HafiPortrait monitoring system step by step"
    
    wait_for_user
    
    # Run tests step by step
    check_prerequisites && wait_for_user
    install_dependencies && wait_for_user
    setup_monitoring_system && wait_for_user
    start_development_server && wait_for_user
    start_monitoring_service && wait_for_user
    test_api_endpoints && wait_for_user
    test_post_endpoints && wait_for_user
    test_admin_dashboard && wait_for_user
    test_performance && wait_for_user
    run_comprehensive_tests && wait_for_user
    
    generate_test_report
}

# Automated mode
automated_mode() {
    log_header "Automated Monitoring System Test"
    log_info "Running all tests automatically..."
    
    check_prerequisites
    install_dependencies
    setup_monitoring_system
    start_development_server
    start_monitoring_service
    sleep 10  # Wait for systems to stabilize
    test_api_endpoints
    test_post_endpoints
    test_admin_dashboard
    test_performance
    run_comprehensive_tests
    
    generate_test_report
}

# Main function
main() {
    # Trap cleanup on exit
    trap cleanup EXIT
    
    echo -e "${BOLD}${BLUE}"
    echo "🧪 HafiPortrait Monitoring System Test Runner"
    echo "============================================="
    echo -e "${NC}"
    
    # Check command line arguments
    case "${1:-interactive}" in
        "auto"|"automated")
            automated_mode
            ;;
        "interactive"|"")
            interactive_mode
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [mode]"
            echo "Modes:"
            echo "  interactive  - Step-by-step testing (default)"
            echo "  auto        - Automated testing"
            echo "  help        - Show this help"
            exit 0
            ;;
        *)
            log_error "Unknown mode: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests completed successfully!${NC}"
        echo -e "${GREEN}Access admin dashboard: http://localhost:3000/admin${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop services${NC}"
        
        # Keep services running for manual testing
        while true; do
            sleep 60
        done
    else
        echo -e "\n${RED}❌ Tests failed. Check output above for details.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"