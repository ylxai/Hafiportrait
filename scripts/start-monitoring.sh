#!/bin/bash

# HafiPortrait Monitoring Startup Script
# Menjalankan semua komponen monitoring sistem

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../logs"
PID_DIR="$SCRIPT_DIR/../pids"

# Ensure directories exist
mkdir -p "$LOG_DIR" "$PID_DIR"

# Function to check if process is running
is_running() {
    local pid_file=$1
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$pid_file"
            return 1
        fi
    fi
    return 1
}

# Function to start a monitoring service
start_service() {
    local service_name=$1
    local script_path=$2
    local pid_file="$PID_DIR/${service_name}.pid"
    local log_file="$LOG_DIR/${service_name}.log"
    
    if is_running "$pid_file"; then
        warning "$service_name is already running (PID: $(cat $pid_file))"
        return 0
    fi
    
    log "Starting $service_name..."
    
    # Start the service in background
    nohup node "$script_path" start > "$log_file" 2>&1 &
    local pid=$!
    
    # Save PID
    echo $pid > "$pid_file"
    
    # Wait a moment and check if it's still running
    sleep 2
    if is_running "$pid_file"; then
        success "$service_name started successfully (PID: $pid)"
        return 0
    else
        error "Failed to start $service_name"
        return 1
    fi
}

# Function to stop a monitoring service
stop_service() {
    local service_name=$1
    local pid_file="$PID_DIR/${service_name}.pid"
    
    if is_running "$pid_file"; then
        local pid=$(cat "$pid_file")
        log "Stopping $service_name (PID: $pid)..."
        
        kill "$pid"
        
        # Wait for graceful shutdown
        local count=0
        while is_running "$pid_file" && [[ $count -lt 10 ]]; do
            sleep 1
            ((count++))
        done
        
        if is_running "$pid_file"; then
            warning "Force killing $service_name..."
            kill -9 "$pid"
            rm -f "$pid_file"
        fi
        
        success "$service_name stopped"
    else
        warning "$service_name is not running"
    fi
}

# Function to show status of all services
show_status() {
    log "Monitoring Services Status:"
    echo
    
    local services=("health-monitor" "alert-manager")
    
    for service in "${services[@]}"; do
        local pid_file="$PID_DIR/${service}.pid"
        local log_file="$LOG_DIR/${service}.log"
        
        printf "%-20s" "$service:"
        
        if is_running "$pid_file"; then
            local pid=$(cat "$pid_file")
            local uptime=$(ps -o etime= -p "$pid" 2>/dev/null | tr -d ' ' || echo "unknown")
            echo -e "${GREEN}RUNNING${NC} (PID: $pid, Uptime: $uptime)"
        else
            echo -e "${RED}STOPPED${NC}"
        fi
        
        # Show last few log lines if service is running
        if is_running "$pid_file" && [[ -f "$log_file" ]]; then
            echo "  Last activity: $(tail -1 "$log_file" 2>/dev/null | cut -c1-80 || echo 'No recent activity')"
        fi
        echo
    done
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed or not in PATH"
        return 1
    fi
    
    # Check if required scripts exist
    local scripts=("enhanced-health-monitor.js" "alert-manager.js")
    for script in "${scripts[@]}"; do
        if [[ ! -f "$SCRIPT_DIR/$script" ]]; then
            error "Required script not found: $script"
            return 1
        fi
    done
    
    # Check environment variables
    local required_vars=("NEXT_PUBLIC_APP_URL")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error "Missing required environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    success "Prerequisites check passed"
    return 0
}

# Function to run health check
run_health_check() {
    log "Running health check..."
    
    if node "$SCRIPT_DIR/enhanced-health-monitor.js" check; then
        success "Health check passed"
        return 0
    else
        error "Health check failed"
        return 1
    fi
}

# Function to test alerts
test_alerts() {
    log "Testing alert system..."
    
    if node "$SCRIPT_DIR/alert-manager.js" send "test" "Monitoring system test alert" "info"; then
        success "Test alert sent successfully"
        return 0
    else
        error "Failed to send test alert"
        return 1
    fi
}

# Main command handling
case "${1:-start}" in
    start)
        log "Starting HafiPortrait Monitoring System..."
        
        if ! check_prerequisites; then
            exit 1
        fi
        
        # Start services
        start_service "health-monitor" "$SCRIPT_DIR/enhanced-health-monitor.js"
        
        # Wait a moment between services
        sleep 1
        
        success "Monitoring system started successfully"
        echo
        show_status
        ;;
        
    stop)
        log "Stopping HafiPortrait Monitoring System..."
        
        stop_service "health-monitor"
        
        success "Monitoring system stopped"
        ;;
        
    restart)
        log "Restarting HafiPortrait Monitoring System..."
        
        stop_service "health-monitor"
        sleep 2
        start_service "health-monitor" "$SCRIPT_DIR/enhanced-health-monitor.js"
        
        success "Monitoring system restarted"
        echo
        show_status
        ;;
        
    status)
        show_status
        ;;
        
    check)
        run_health_check
        ;;
        
    test-alerts)
        test_alerts
        ;;
        
    logs)
        local service=${2:-health-monitor}
        local log_file="$LOG_DIR/${service}.log"
        
        if [[ -f "$log_file" ]]; then
            log "Showing logs for $service (last 50 lines):"
            echo
            tail -50 "$log_file"
        else
            error "Log file not found: $log_file"
        fi
        ;;
        
    cleanup)
        log "Cleaning up monitoring system..."
        
        # Stop all services
        stop_service "health-monitor"
        
        # Clean up old logs (keep last 7 days)
        find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        find "$LOG_DIR" -name "*.json" -mtime +7 -delete 2>/dev/null || true
        
        success "Cleanup completed"
        ;;
        
    *)
        echo "Usage: $0 {start|stop|restart|status|check|test-alerts|logs [service]|cleanup}"
        echo
        echo "Commands:"
        echo "  start       - Start monitoring services"
        echo "  stop        - Stop monitoring services"
        echo "  restart     - Restart monitoring services"
        echo "  status      - Show status of all services"
        echo "  check       - Run health check"
        echo "  test-alerts - Send test alert"
        echo "  logs        - Show logs for service (default: health-monitor)"
        echo "  cleanup     - Stop services and clean old logs"
        exit 1
        ;;
esac