#!/bin/bash

# HafiPortrait Docker Environment Manager
# Usage: ./scripts/docker-manager.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  HafiPortrait Docker Manager${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

print_usage() {
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./scripts/docker-manager.sh [command]"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "  ${GREEN}dev${NC}        - Start development environment (port 3002/3003)"
    echo -e "  ${GREEN}prod${NC}       - Start production environment (port 3000/3001)"
    echo -e "  ${GREEN}both${NC}       - Start both dev and prod simultaneously"
    echo -e "  ${GREEN}stop${NC}       - Stop all containers"
    echo -e "  ${GREEN}restart${NC}    - Restart all containers"
    echo -e "  ${GREEN}logs${NC}       - Show logs for all containers"
    echo -e "  ${GREEN}status${NC}     - Show container status"
    echo -e "  ${GREEN}clean${NC}      - Clean up containers and images"
    echo -e "  ${GREEN}build${NC}      - Rebuild all images"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  ./scripts/docker-manager.sh dev     # Start development"
    echo "  ./scripts/docker-manager.sh prod    # Start production"
    echo "  ./scripts/docker-manager.sh both    # Start both environments"
}

start_dev() {
    echo -e "${BLUE}🚀 Starting Development Environment...${NC}"
    docker-compose up -d hafiportrait-dev
    echo -e "${GREEN}✅ Development started!${NC}"
    echo -e "${CYAN}📱 Next.js: http://147.251.255.227:3002${NC}"
    echo -e "${CYAN}🔌 Socket.IO: http://147.251.255.227:3003${NC}"
}

start_prod() {
    echo -e "${BLUE}🏭 Starting Production Environment...${NC}"
    docker-compose up -d hafiportrait-prod socketio-prod
    echo -e "${GREEN}✅ Production started!${NC}"
    echo -e "${CYAN}🌐 Next.js: http://147.251.255.227:3000${NC}"
    echo -e "${CYAN}📡 Socket.IO: http://147.251.255.227:3001${NC}"
}

start_both() {
    echo -e "${BLUE}🚀 Starting Both Environments...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Both environments started!${NC}"
    echo ""
    echo -e "${YELLOW}Development:${NC}"
    echo -e "${CYAN}📱 Next.js: http://147.251.255.227:3002${NC}"
    echo -e "${CYAN}🔌 Socket.IO: http://147.251.255.227:3003${NC}"
    echo ""
    echo -e "${YELLOW}Production:${NC}"
    echo -e "${CYAN}🌐 Next.js: http://147.251.255.227:3000${NC}"
    echo -e "${CYAN}📡 Socket.IO: http://147.251.255.227:3001${NC}"
}

stop_all() {
    echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ All containers stopped!${NC}"
}

restart_all() {
    echo -e "${YELLOW}🔄 Restarting all containers...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ All containers restarted!${NC}"
}

show_logs() {
    echo -e "${BLUE}📋 Showing container logs...${NC}"
    docker-compose logs -f --tail=50
}

show_status() {
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    echo -e "${CYAN}Development Next.js: http://147.251.255.227:3002${NC}"
    echo -e "${CYAN}Development Socket.IO: http://147.251.255.227:3003${NC}"
    echo -e "${CYAN}Production Next.js: http://147.251.255.227:3000${NC}"
    echo -e "${CYAN}Production Socket.IO: http://147.251.255.227:3001${NC}"
}

clean_up() {
    echo -e "${YELLOW}🧹 Cleaning up containers and images...${NC}"
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

build_all() {
    echo -e "${BLUE}🔨 Building all images...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Build completed!${NC}"
}

# Main script
print_header

case "${1:-}" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "both")
        start_both
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        restart_all
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_up
        ;;
    "build")
        build_all
        ;;
    *)
        print_usage
        exit 1
        ;;
esac