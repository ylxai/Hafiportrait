#!/bin/bash

# 🧪 Test All - One Command Testing Suite
# Script untuk menjalankan semua test monitoring HafiPortrait dengan satu perintah

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

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs/monitoring"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"
}

log_header() {
    echo -e "\n${BOLD}${PURPLE}🧪 $1${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' {1..60})${NC}"
}

# Show banner
show_banner() {
    echo -e "${BOLD}${CYAN}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🧪 HafiPortrait Monitoring System Test Suite             ║
║                                                              ║
║    Comprehensive testing for all monitoring components      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Check system requirements
check_system_requirements() {
    log_header "System Requirements Check"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 18+"
        return 1
    fi
    
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        log_success "Node.js $NODE_VERSION ✓"
    else
        log_error "Node.js $NODE_VERSION (requires 18+)"
        return 1
    fi
    
    # Check package manager
    if command -v pnpm &> /dev/null; then
        log_success "pnpm found ✓"
        PKG_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        log_success "npm found ✓"
        PKG_MANAGER="npm"
    else
        log_error "No package manager found"
        return 1
    fi
    
    # Check curl
    if command -v curl &> /dev/null; then
        log_success "curl found ✓"
    else
        log_error "curl not found (required for API testing)"
        return 1
    fi
    
    return 0
}

# Install dependencies if needed
ensure_dependencies() {
    log_header "Dependencies Check"
    
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.pnpm/lock.yaml" ] && [ ! -f "package-lock.json" ]; then
        log_info "Installing dependencies..."
        
        if [ "$PKG_MANAGER" = "pnpm" ]; then
            pnpm install
        else
            npm install
        fi
        
        if [ $? -eq 0 ]; then
            log_success "Dependencies installed ✓"
        else
            log_error "Failed to install dependencies"
            return 1
        fi
    else
        log_success "Dependencies already installed ✓"
    fi
    
    return 0
}

# Run setup if needed
ensure_monitoring_setup() {
    log_header "Monitoring Setup Check"
    
    if [ ! -f "monitoring/config/monitoring.json" ]; then
        log_info "Running monitoring setup..."
        
        if [ -f "scripts/setup-monitoring.sh" ]; then
            chmod +x scripts/setup-monitoring.sh
            ./scripts/setup-monitoring.sh > "$LOG_DIR/setup.log" 2>&1
            
            if [ $? -eq 0 ]; then
                log_success "Monitoring setup completed ✓"
            else
                log_warning "Setup had issues, check $LOG_DIR/setup.log"
            fi
        else
            log_warning "Setup script not found, continuing..."
        fi
    else
        log_success "Monitoring already configured ✓"
    fi
    
    return 0
}

# Run file structure test
test_file_structure() {
    log_header "File Structure Test"
    
    REQUIRED_FILES=(
        "src/lib/alert-manager.ts"
        "src/lib/health-monitor.ts"
        "src/components/admin/alert-dashboard.tsx"
        "src/components/admin/real-time-monitor.tsx"
        "src/app/api/admin/monitoring/route.ts"
        "scripts/automated-monitoring.js"
        "scripts/test-monitoring-system.js"
    )
    
    local failed=0
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "unknown")
            log_success "$file ($size bytes) ✓"
        else
            log_error "$file missing ✗"
            ((failed++))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        log_success "All required files present ✓"
        return 0
    else
        log_error "$failed files missing ✗"
        return 1
    fi
}

# Start services
start_services() {
    log_header "Starting Services"
    
    # Check if development server is running
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Development server already running ✓"
    else
        log_info "Starting development server..."
        log_info "This may take 30-60 seconds, please wait..."
        
        if [ "$PKG_MANAGER" = "pnpm" ]; then
            pnpm dev > "$LOG_DIR/dev-server.log" 2>&1 &
        else
            npm run dev > "$LOG_DIR/dev-server.log" 2>&1 &
        fi
        
        SERVER_PID=$!
        log_info "Server process started (PID: $SERVER_PID)"
        
        # Wait for server to start with progress
        log_info "Waiting for server to be ready..."
        for i in {1..60}; do
            if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
                log_success "Development server ready after ${i}0 seconds (PID: $SERVER_PID) ✓"
                break
            fi
            
            # Show progress every 5 seconds
            if [ $((i % 5)) -eq 0 ]; then
                log_info "Still waiting... (${i}0 seconds elapsed)"
                # Check if process is still running
                if ! kill -0 $SERVER_PID 2>/dev/null; then
                    log_error "Server process died, check logs: $LOG_DIR/dev-server.log"
                    return 1
                fi
            fi
            sleep 2
        done
        
        if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_error "Failed to start development server after 120 seconds ✗"
            log_error "Check logs: $LOG_DIR/dev-server.log"
            log_error "Last few lines of server log:"
            tail -10 "$LOG_DIR/dev-server.log" 2>/dev/null || echo "No log file found"
            return 1
        fi
    fi
    
    # Check if monitoring is running
    if pgrep -f "automated-monitoring.js" > /dev/null; then
        log_success "Monitoring service already running ✓"
    else
        log_info "Starting monitoring service..."
        log_info "This should start quickly (5-10 seconds)..."
        
        node scripts/automated-monitoring.js > "$LOG_DIR/monitoring-service.log" 2>&1 &
        MONITORING_PID=$!
        log_info "Monitoring process started (PID: $MONITORING_PID)"
        
        # Wait for monitoring to initialize
        log_info "Waiting for monitoring service to initialize..."
        for i in {1..10}; do
            if pgrep -f "automated-monitoring.js" > /dev/null; then
                log_success "Monitoring service ready after ${i} seconds (PID: $MONITORING_PID) ✓"
                break
            fi
            
            if [ $i -eq 5 ]; then
                log_info "Still initializing... (5 seconds elapsed)"
            fi
            
            # Check if process died
            if ! kill -0 $MONITORING_PID 2>/dev/null; then
                log_error "Monitoring process died, check logs: $LOG_DIR/monitoring-service.log"
                return 1
            fi
            
            sleep 1
        done
        
        if ! pgrep -f "automated-monitoring.js" > /dev/null; then
            log_warning "Monitoring service may not have started properly"
            log_warning "Check logs: $LOG_DIR/monitoring-service.log"
            log_warning "Continuing with tests anyway..."
        fi
    fi
    
    return 0
}

# Run API tests
test_api_endpoints() {
    log_header "API Endpoints Test"
    
    local failed=0
    
    # Test endpoints
    ENDPOINTS=(
        "/api/health:Health Check"
        "/api/admin/monitoring?type=overview:Monitoring Overview"
        "/api/admin/monitoring?type=metrics:System Metrics"
        "/api/admin/monitoring?type=health:Health Status"
        "/api/admin/monitoring?type=alerts:Alerts Data"
    )
    
    for endpoint_info in "${ENDPOINTS[@]}"; do
        IFS=':' read -r endpoint description <<< "$endpoint_info"
        
        response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000$endpoint")
        
        if [ "$response" = "200" ]; then
            log_success "$description ✓"
        else
            log_error "$description (Status: $response) ✗"
            ((failed++))
        fi
    done
    
    # Test POST endpoints
    log_info "Testing POST endpoints..."
    
    # Test alert creation
    alert_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"action":"test-alert"}' \
        -w "%{http_code}" \
        -o /dev/null \
        "http://localhost:3000/api/admin/monitoring")
    
    if [ "$alert_response" = "200" ]; then
        log_success "Alert Creation ✓"
    else
        log_error "Alert Creation (Status: $alert_response) ✗"
        ((failed++))
    fi
    
    # Test health check trigger
    health_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"action":"health-check"}' \
        -w "%{http_code}" \
        -o /dev/null \
        "http://localhost:3000/api/admin/monitoring")
    
    if [ "$health_response" = "200" ]; then
        log_success "Health Check Trigger ✓"
    else
        log_error "Health Check Trigger (Status: $health_response) ✗"
        ((failed++))
    fi
    
    if [ $failed -eq 0 ]; then
        log_success "All API endpoints working ✓"
        return 0
    else
        log_error "$failed API endpoints failed ✗"
        return 1
    fi
}

# Run comprehensive tests
run_comprehensive_tests() {
    log_header "Comprehensive Test Suite"
    
    if [ -f "scripts/test-monitoring-system.js" ]; then
        log_info "Running comprehensive test suite..."
        
        chmod +x scripts/test-monitoring-system.js
        node scripts/test-monitoring-system.js > "$LOG_DIR/comprehensive-test.log" 2>&1
        
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            log_success "Comprehensive tests passed ✓"
        else
            log_error "Some comprehensive tests failed ✗"
            log_info "Check $LOG_DIR/comprehensive-test.log for details"
        fi
        
        return $exit_code
    else
        log_warning "Comprehensive test script not found"
        return 0
    fi
}

# Test admin dashboard
test_admin_dashboard() {
    log_header "Admin Dashboard Test"
    
    admin_response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000/admin")
    
    if [ "$admin_response" = "200" ]; then
        log_success "Admin dashboard accessible ✓"
    elif [ "$admin_response" = "307" ] || [ "$admin_response" = "302" ]; then
        log_success "Admin dashboard accessible (redirects to login) ✓"
        log_info "Status 307/302 is normal - redirects to login page"
    else
        log_error "Admin dashboard not accessible (Status: $admin_response) ✗"
        return 1
    fi
    
    log_info "Admin Dashboard: ${CYAN}http://localhost:3000/admin${NC}"
    log_info "Test these monitoring sections after login:"
    log_info "  📊 Real-time Monitor"
    log_info "  🚨 Alert Dashboard"
    log_info "  📈 Advanced Monitoring"
    
    return 0
}

# Performance test
test_performance() {
    log_header "Performance Test"
    
    log_info "Testing API response times..."
    
    local total_time=0
    local test_count=5
    local failed=0
    
    for i in $(seq 1 $test_count); do
        start_time=$(date +%s%3N)
        curl -s "http://localhost:3000/api/admin/monitoring?type=overview" > /dev/null
        end_time=$(date +%s%3N)
        
        response_time=$((end_time - start_time))
        total_time=$((total_time + response_time))
        
        if [ $response_time -lt 1000 ]; then
            log_success "Response $i: ${response_time}ms (excellent) ✓"
        elif [ $response_time -lt 3000 ]; then
            log_info "Response $i: ${response_time}ms (acceptable)"
        else
            log_warning "Response $i: ${response_time}ms (slow)"
            ((failed++))
        fi
    done
    
    local avg_time=$((total_time / test_count))
    log_info "Average response time: ${avg_time}ms"
    
    if [ $avg_time -lt 1000 ]; then
        log_success "Performance test passed (excellent) ✓"
        return 0
    elif [ $avg_time -lt 3000 ]; then
        log_success "Performance test passed (acceptable) ✓"
        return 0
    else
        log_error "Performance test failed (too slow) ✗"
        return 1
    fi
}

# Generate final report
generate_final_report() {
    log_header "Test Results Summary"
    
    local total_tests=7
    local passed_tests=$((total_tests - failed_tests))
    local success_rate=$((passed_tests * 100 / total_tests))
    
    echo -e "\n${BOLD}📊 Final Test Results:${NC}"
    echo -e "   Total Test Categories: $total_tests"
    echo -e "   ${GREEN}Passed: $passed_tests${NC}"
    echo -e "   ${RED}Failed: $failed_tests${NC}"
    echo -e "   Success Rate: ${success_rate}%"
    
    # Save detailed report
    cat > "$LOG_DIR/final-test-report.txt" << EOF
HafiPortrait Monitoring System - Final Test Report
==================================================
Date: $(date)
Test Categories: $total_tests
Passed: $passed_tests
Failed: $failed_tests
Success Rate: ${success_rate}%

Test Results:
- System Requirements: $([ $req_result -eq 0 ] && echo "PASSED" || echo "FAILED")
- Dependencies: $([ $dep_result -eq 0 ] && echo "PASSED" || echo "FAILED")
- File Structure: $([ $file_result -eq 0 ] && echo "PASSED" || echo "FAILED")
- Services: $([ $service_result -eq 0 ] && echo "PASSED" || echo "FAILED")
- API Endpoints: $([ $api_result -eq 0 ] && echo "PASSED" || echo "FAILED")
- Admin Dashboard: $([ $admin_result -eq 0 ] && echo "PASSED" || echo "FAILED")
- Performance: $([ $perf_result -eq 0 ] && echo "PASSED" || echo "FAILED")

Overall Status: $([ $success_rate -ge 80 ] && echo "READY FOR PRODUCTION" || echo "NEEDS FIXES")
EOF
    
    log_info "Detailed report saved to: $LOG_DIR/final-test-report.txt"
    
    if [ $success_rate -ge 80 ]; then
        echo -e "\n${GREEN}🎉 OVERALL RESULT: PASSED${NC}"
        echo -e "${GREEN}System is ready for production deployment!${NC}"
        
        echo -e "\n${CYAN}Next Steps:${NC}"
        echo -e "1. Manual testing: ${CYAN}http://localhost:3000/admin${NC}"
        echo -e "2. Configure notification channels"
        echo -e "3. Deploy to production"
        echo -e "4. Setup monitoring alerts"
        
        return 0
    else
        echo -e "\n${RED}❌ OVERALL RESULT: FAILED${NC}"
        echo -e "${RED}Please fix issues before production deployment${NC}"
        
        echo -e "\n${YELLOW}Troubleshooting:${NC}"
        echo -e "1. Check logs in: $LOG_DIR/"
        echo -e "2. Review failed test details above"
        echo -e "3. Fix issues and re-run tests"
        echo -e "4. Ensure all dependencies are installed"
        
        return 1
    fi
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
    
    # Kill any remaining processes
    pkill -f "automated-monitoring.js" 2>/dev/null || true
    
    log_info "Cleanup completed"
}

# Main execution
main() {
    # Initialize counters
    failed_tests=0
    
    # Show banner
    show_banner
    
    log_info "Starting comprehensive monitoring system test..."
    log_info "Logs will be saved to: $LOG_DIR/"
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Run all tests
    check_system_requirements
    req_result=$?
    [ $req_result -ne 0 ] && ((failed_tests++))
    
    ensure_dependencies
    dep_result=$?
    [ $dep_result -ne 0 ] && ((failed_tests++))
    
    ensure_monitoring_setup
    setup_result=$?
    
    test_file_structure
    file_result=$?
    [ $file_result -ne 0 ] && ((failed_tests++))
    
    start_services
    service_result=$?
    [ $service_result -ne 0 ] && ((failed_tests++))
    
    # Wait for services to stabilize
    log_info "Waiting for services to stabilize..."
    sleep 10
    
    test_api_endpoints
    api_result=$?
    [ $api_result -ne 0 ] && ((failed_tests++))
    
    test_admin_dashboard
    admin_result=$?
    [ $admin_result -ne 0 ] && ((failed_tests++))
    
    test_performance
    perf_result=$?
    [ $perf_result -ne 0 ] && ((failed_tests++))
    
    # Run comprehensive tests (optional, doesn't count towards main score)
    run_comprehensive_tests
    comp_result=$?
    
    # Generate final report
    generate_final_report
    final_result=$?
    
    # Keep services running if tests passed
    if [ $final_result -eq 0 ]; then
        echo -e "\n${GREEN}🚀 Services are running for manual testing...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
        
        # Wait indefinitely
        while true; do
            sleep 60
            # Check if server is still running
            if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
                log_warning "Development server stopped"
                break
            fi
        done
    fi
    
    return $final_result
}

# Run main function
main "$@"