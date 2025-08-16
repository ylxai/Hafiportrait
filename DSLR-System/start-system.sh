#!/bin/bash
echo "🚀 Starting DSLR System..."
cd "$(dirname "$0")/Core"

# Check if event is set
if node dslr-hybrid-cli.js current > /dev/null 2>&1; then
    echo "✅ Active event found"
    echo "🔄 Starting auto-upload service..."
    node dslr-auto-upload-service.js
else
    echo "⚠️ No active event set"
    echo "💡 Quick setup: node dslr-hybrid-cli.js quick 'Event Name' 2025-01-15"
    echo "📋 List events: node dslr-hybrid-cli.js list"
fi
