#!/bin/bash

# Rovodev Performance Optimizer
# Script untuk monitoring dan fine-tuning otomatis

echo "🚀 Rovodev Performance Optimizer"
echo "================================="

# Function untuk menjalankan monitoring
run_monitor() {
    echo "📊 Running performance monitor..."
    node rovodev-performance-monitor.js
    echo ""
}

# Function untuk menjalankan auto-tuning
run_tuner() {
    echo "🔧 Running config auto-tuner..."
    node rovodev-config-tuner.js
    echo ""
}

# Function untuk show status
show_status() {
    echo "📋 Current config status..."
    node rovodev-config-tuner.js status
    echo ""
}

# Function untuk continuous monitoring
continuous_monitor() {
    echo "👀 Starting continuous monitoring (Ctrl+C to stop)..."
    echo "Will monitor every 60 seconds and auto-tune if needed."
    echo ""
    
    while true; do
        echo "$(date): Running performance check..."
        
        # Run monitor
        node rovodev-performance-monitor.js > /tmp/monitor-output.txt 2>&1
        
        # Check if metrics file exists and is recent
        if [ -f "/home/ubuntu/.rovodev/performance-metrics.json" ]; then
            # Check if metrics are less than 5 minutes old
            if [ $(find /home/ubuntu/.rovodev/performance-metrics.json -mmin -5) ]; then
                echo "✅ Fresh metrics found, checking for tuning opportunities..."
                
                # Run tuner
                node rovodev-config-tuner.js > /tmp/tuner-output.txt 2>&1
                
                # Check if config was changed
                if grep -q "Config tuning completed" /tmp/tuner-output.txt; then
                    echo "🎯 Config was auto-tuned! Consider restarting Rovodev session."
                    cat /tmp/tuner-output.txt
                else
                    echo "✅ No tuning needed - config is optimal."
                fi
            fi
        else
            echo "⚠️  No recent metrics found."
        fi
        
        echo "Sleeping for 60 seconds..."
        echo ""
        sleep 60
    done
}

# Function untuk quick optimization
quick_optimize() {
    echo "⚡ Quick optimization..."
    
    # Run monitor first
    run_monitor
    
    # Then run tuner
    run_tuner
    
    echo "✅ Quick optimization completed!"
    echo "💡 Restart Rovodev session to apply any changes."
}

# Main menu
case "$1" in
    "monitor")
        run_monitor
        ;;
    "tune")
        run_tuner
        ;;
    "status")
        show_status
        ;;
    "watch")
        continuous_monitor
        ;;
    "quick")
        quick_optimize
        ;;
    "help"|"")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  monitor    Run performance monitoring"
        echo "  tune       Run config auto-tuning"
        echo "  status     Show current config status"
        echo "  watch      Continuous monitoring (60s intervals)"
        echo "  quick      Quick monitor + tune"
        echo "  help       Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 quick           # Quick optimization"
        echo "  $0 monitor         # One-time monitoring"
        echo "  $0 tune            # Auto-tune config"
        echo "  $0 watch           # Continuous monitoring"
        echo ""
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac