#!/bin/bash

echo "🔍 CHECKING DOCKER BUILD CONTEXT SIZE"
echo "======================================"

# Check what would be sent to Docker (excluding .dockerignore)
echo "📁 Files that would be sent to Docker:"
echo "----------------------------------------"

# Create temporary directory for build context simulation
TEMP_DIR=$(mktemp -d)
echo "📂 Temporary directory: $TEMP_DIR"

# Copy files excluding .dockerignore patterns
echo "📋 Copying files (excluding .dockerignore)..."
rsync -av --exclude-from=.dockerignore . "$TEMP_DIR/" 2>/dev/null || \
cp -r . "$TEMP_DIR/" 2>/dev/null

# Calculate size
echo ""
echo "📊 BUILD CONTEXT SIZE ANALYSIS:"
echo "--------------------------------"

# Total size
TOTAL_SIZE=$(du -sh "$TEMP_DIR" 2>/dev/null | cut -f1)
echo "📦 Total build context size: $TOTAL_SIZE"

# Breakdown by directory/file
echo ""
echo "📁 Size breakdown:"
du -sh "$TEMP_DIR"/* 2>/dev/null | sort -hr | head -10

# Check for large files
echo ""
echo "🔍 Large files (>1MB):"
find "$TEMP_DIR" -type f -size +1M 2>/dev/null | head -10

# Cleanup
rm -rf "$TEMP_DIR"
echo ""
echo "✅ Build context check completed!"
echo "💡 If size > 100MB, there might be .dockerignore issues"