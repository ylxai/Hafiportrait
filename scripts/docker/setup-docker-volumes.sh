#!/bin/bash

# ================================
# HAFIPORTRAIT DOCKER VOLUMES SETUP
# Create optimized volume directories
# ================================

echo "🚀 Setting up Docker volumes for HafiPortrait..."

# Create volume directories
mkdir -p ./docker-volumes/node_modules
mkdir -p ./docker-volumes/next_cache
mkdir -p ./docker-volumes/pnpm_store

# Set proper permissions
chmod 755 ./docker-volumes
chmod 755 ./docker-volumes/node_modules
chmod 755 ./docker-volumes/next_cache
chmod 755 ./docker-volumes/pnpm_store

# Create .gitignore for volumes
cat > ./docker-volumes/.gitignore << 'EOF'
# Docker volume contents
*
!.gitignore
EOF

echo "✅ Docker volumes setup completed!"
echo "📁 Created directories:"
echo "   - ./docker-volumes/node_modules"
echo "   - ./docker-volumes/next_cache"
echo "   - ./docker-volumes/pnpm_store"
echo ""
echo "🔧 Next steps:"
echo "   1. Run: docker-compose build --no-cache"
echo "   2. Run: docker-compose up hafiportrait-dev (for development)"
echo "   3. Run: docker-compose up hafiportrait-prod (for production)"