#!/bin/bash
cd "$(dirname "$0")/Storage"
if [ -f "storage-optimization-cli.js" ]; then
    echo "🧪 System Test:"
    node storage-optimization-cli.js test
else
    echo "❌ storage-optimization-cli.js not found"
fi
read -p "Press Enter to continue..."
