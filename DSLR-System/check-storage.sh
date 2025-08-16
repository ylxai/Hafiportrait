#!/bin/bash
cd "$(dirname "$0")/Storage"
if [ -f "storage-optimization-cli.js" ]; then
    echo "📊 Storage Status:"
    node storage-optimization-cli.js status
else
    echo "❌ storage-optimization-cli.js not found"
fi
read -p "Press Enter to continue..."
