#!/bin/bash

# CropWise - Setup Script
# Automates the initial setup process

set -e

echo "🌱 CropWise Setup Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in Git Bash on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo -e "${YELLOW}Detected Windows environment${NC}"
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
fi

if ! command_exists docker; then
    echo -e "${YELLOW}⚠ Docker not found. Install Docker for easier setup.${NC}"
    USE_DOCKER=false
else
    echo -e "${GREEN}✓ Docker installed${NC}"
    USE_DOCKER=true
fi

echo ""
echo "Select setup mode:"
echo "1) Full setup with Docker (recommended)"
echo "2) Manual setup (requires PostgreSQL, Redis, MQTT broker)"
echo "3) Frontend only"
echo "4) Backend only"
read -p "Enter choice [1-4]: " SETUP_MODE

case $SETUP_MODE in
    1)
        echo ""
        echo "Starting Docker setup..."
        
        if [ ! -f .env ]; then
            echo "Creating .env file..."
            cp .env.example .env
            echo -e "${YELLOW}⚠ Please edit .env with your configuration${NC}"
        fi
        
        echo "Starting Docker containers..."
        docker-compose up -d
        
        echo ""
        echo -e "${GREEN}✓ Docker containers started successfully!${NC}"
        echo ""
        echo "Services available at:"
        echo "  - Frontend: http://localhost:8080"
        echo "  - Backend API: http://localhost:3000"
        echo "  - MQTT Broker: mqtt://localhost:1883"
        echo "  - Node-RED: http://localhost:1880"
        echo ""
        echo "Check logs with: docker-compose logs -f"
        ;;
        
    2)
        echo ""
        echo "Manual setup selected..."
        
        # Backend setup
        if [ ! -f .env ]; then
            cp .env.example .env
            echo -e "${YELLOW}⚠ Please edit .env with your database credentials${NC}"
            read -p "Press Enter to continue after editing .env..."
        fi
        
        echo "Setting up backend..."
        cd backend
        npm install
        
        echo "Setting up frontend..."
        cd ../frontend
        npm install
        
        echo ""
        echo -e "${GREEN}✓ Dependencies installed${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Ensure PostgreSQL, Redis, and MQTT broker are running"
        echo "2. Run migrations: cd backend && npm run migrate"
        echo "3. Start backend: cd backend && npm run dev"
        echo "4. Start frontend: cd frontend && npm run dev"
        ;;
        
    3)
        echo ""
        echo "Setting up frontend only..."
        cd frontend
        npm install
        
        if [ ! -f .env ]; then
            echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
        fi
        
        echo ""
        echo -e "${GREEN}✓ Frontend setup complete${NC}"
        echo "Start with: npm run dev"
        ;;
        
    4)
        echo ""
        echo "Setting up backend only..."
        cd backend
        npm install
        
        echo ""
        echo -e "${GREEN}✓ Backend setup complete${NC}"
        echo "Start with: npm run dev"
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
echo ""
echo "Next steps:"
echo "1. Create an account at http://localhost:8080/register"
echo "2. Create your first farm"
echo "3. Set up a zone with a crop recipe"
echo "4. Connect an ESP32 device"
echo ""
echo "For detailed instructions, see docs/GETTING_STARTED.md"

