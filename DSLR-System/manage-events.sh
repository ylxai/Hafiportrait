#!/bin/bash
cd "$(dirname "$0")/Core"
if [ -f "dslr-hybrid-cli.js" ]; then
    echo "📋 Event Management:"
    node dslr-hybrid-cli.js list
else
    echo "❌ dslr-hybrid-cli.js not found"
fi
read -p "Press Enter to continue..."
