#!/bin/bash

##############################################################################
# CropWise - Development Machine Setup Script
# For macOS and Linux
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    else
        OS="unknown"
    fi
    echo $OS
}

##############################################################################
# Main Setup
##############################################################################

clear
echo -e "${GREEN}"
cat << "EOF"
   ____                       _    ____                  
  / ___| _ __ ___   __ _ _ __| |_ / ___|_ __ ___  _ __  
  \___ \| '_ ` _ \ / _` | '__| __| |   | '__/ _ \| '_ \ 
   ___) | | | | | | (_| | |  | |_| |___| | | (_) | |_) |
  |____/|_| |_| |_|\__,_|_|   \__|\____|_|  \___/| .__/ 
                                                  |_|    
  Development Machine Setup
EOF
echo -e "${NC}"

print_info "Detecting operating system..."
OS=$(detect_os)
print_success "OS detected: $OS"

if [ "$OS" = "unknown" ]; then
    print_error "Unsupported operating system"
    exit 1
fi

##############################################################################
# 1. Install Package Manager
##############################################################################

print_header "1. Setting up Package Manager"

if [ "$OS" = "macos" ]; then
    if ! command_exists brew; then
        print_info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        print_success "Homebrew installed"
    else
        print_success "Homebrew already installed"
    fi
elif [ "$OS" = "linux" ]; then
    print_info "Updating package list..."
    sudo apt update
    print_success "Package list updated"
fi

##############################################################################
# 2. Install Node.js
##############################################################################

print_header "2. Installing Node.js 18"

if ! command_exists node; then
    if [ "$OS" = "macos" ]; then
        brew install node@18
        brew link node@18
    elif [ "$OS" = "linux" ]; then
        # Install Node.js 18 via NodeSource
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    print_success "Node.js installed"
else
    NODE_VERSION=$(node -v)
    print_success "Node.js already installed: $NODE_VERSION"
fi

# Verify npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: v$NPM_VERSION"
fi

##############################################################################
# 3. Install Git
##############################################################################

print_header "3. Installing Git"

if ! command_exists git; then
    if [ "$OS" = "macos" ]; then
        brew install git
    elif [ "$OS" = "linux" ]; then
        sudo apt install -y git
    fi
    print_success "Git installed"
else
    GIT_VERSION=$(git --version)
    print_success "Git already installed: $GIT_VERSION"
fi

# Configure Git
print_info "Configuring Git..."
read -p "Enter your Git username: " git_username
read -p "Enter your Git email: " git_email

git config --global user.name "$git_username"
git config --global user.email "$git_email"
git config --global init.defaultBranch main
print_success "Git configured"

##############################################################################
# 4. Install Docker
##############################################################################

print_header "4. Installing Docker"

if ! command_exists docker; then
    if [ "$OS" = "macos" ]; then
        print_warning "Please install Docker Desktop manually from: https://www.docker.com/products/docker-desktop"
        print_info "After installing, run this script again"
    elif [ "$OS" = "linux" ]; then
        # Install Docker on Linux
        print_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_success "Docker installed"
        print_warning "Please log out and log back in for Docker permissions to take effect"
    fi
else
    DOCKER_VERSION=$(docker --version)
    print_success "Docker already installed: $DOCKER_VERSION"
fi

# Check Docker Compose
if command_exists docker && docker compose version >/dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version)
    print_success "Docker Compose installed: $COMPOSE_VERSION"
fi

##############################################################################
# 5. Install PostgreSQL
##############################################################################

print_header "5. Installing PostgreSQL 15"

if ! command_exists psql; then
    if [ "$OS" = "macos" ]; then
        brew install postgresql@15
        brew services start postgresql@15
    elif [ "$OS" = "linux" ]; then
        sudo apt install -y postgresql-15 postgresql-contrib-15
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    print_success "PostgreSQL installed"
else
    PSQL_VERSION=$(psql --version)
    print_success "PostgreSQL already installed: $PSQL_VERSION"
fi

##############################################################################
# 6. Install Redis
##############################################################################

print_header "6. Installing Redis"

if ! command_exists redis-cli; then
    if [ "$OS" = "macos" ]; then
        brew install redis
        brew services start redis
    elif [ "$OS" = "linux" ]; then
        sudo apt install -y redis-server
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    fi
    print_success "Redis installed"
else
    REDIS_VERSION=$(redis-cli --version)
    print_success "Redis already installed: $REDIS_VERSION"
fi

##############################################################################
# 7. Install Development Tools
##############################################################################

print_header "7. Installing Development Tools"

# Install VS Code
if ! command_exists code; then
    if [ "$OS" = "macos" ]; then
        brew install --cask visual-studio-code
    elif [ "$OS" = "linux" ]; then
        wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
        sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
        sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
        rm -f packages.microsoft.gpg
        sudo apt update
        sudo apt install -y code
    fi
    print_success "VS Code installed"
else
    print_success "VS Code already installed"
fi

# Install useful CLI tools
print_info "Installing useful CLI tools..."

if [ "$OS" = "macos" ]; then
    brew install jq curl wget
elif [ "$OS" = "linux" ]; then
    sudo apt install -y jq curl wget
fi

print_success "CLI tools installed"

##############################################################################
# 8. Install AWS CLI
##############################################################################

print_header "8. Installing AWS CLI"

if ! command_exists aws; then
    if [ "$OS" = "macos" ]; then
        brew install awscli
    elif [ "$OS" = "linux" ]; then
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    fi
    print_success "AWS CLI installed"
else
    AWS_VERSION=$(aws --version)
    print_success "AWS CLI already installed: $AWS_VERSION"
fi

##############################################################################
# 9. Clone Repository
##############################################################################

print_header "9. Cloning CropWise Repository"

if [ ! -d "cropwise" ]; then
    print_info "Enter repository URL (or press Enter for default):"
    read -p "URL [https://github.com/your-org/cropwise.git]: " repo_url
    repo_url=${repo_url:-https://github.com/your-org/cropwise.git}
    
    git clone $repo_url cropwise
    cd cropwise
    print_success "Repository cloned"
else
    print_warning "Repository already exists. Skipping clone."
    cd cropwise
fi

##############################################################################
# 10. Setup Backend
##############################################################################

print_header "10. Setting up Backend"

cd backend

if [ ! -f ".env" ]; then
    print_info "Creating .env file from example..."
    cp .env.example .env
    
    # Generate secrets
    print_info "Generating secrets..."
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    
    # Update .env file
    if [ "$OS" = "macos" ]; then
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i '' "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
    else
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env
    fi
    
    print_success ".env file created with generated secrets"
else
    print_warning ".env file already exists"
fi

print_info "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

print_info "Running database migrations..."
npm run migrate
print_success "Database migrations complete"

cd ..

##############################################################################
# 11. Setup Frontend
##############################################################################

print_header "11. Setting up Frontend"

cd frontend

if [ ! -f ".env" ]; then
    print_info "Creating .env file from example..."
    cp .env.example .env
    print_success ".env file created"
else
    print_warning ".env file already exists"
fi

print_info "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

cd ..

##############################################################################
# 12. Install VS Code Extensions
##############################################################################

print_header "12. Installing VS Code Extensions"

if command_exists code; then
    print_info "Installing recommended VS Code extensions..."
    
    code --install-extension dbaeumer.vscode-eslint
    code --install-extension esbenp.prettier-vscode
    code --install-extension ms-vscode.vscode-typescript-next
    code --install-extension bradlc.vscode-tailwindcss
    code --install-extension dsznajder.es7-react-js-snippets
    code --install-extension eamodio.gitlens
    code --install-extension ms-azuretools.vscode-docker
    
    print_success "VS Code extensions installed"
fi

##############################################################################
# Setup Complete!
##############################################################################

cd ..

print_header "✨ Setup Complete! ✨"

echo ""
print_success "Your development machine is ready for CropWise development!"
echo ""

print_info "Next steps:"
echo "  1. Start backend:  cd cropwise/backend && npm run dev"
echo "  2. Start frontend: cd cropwise/frontend && npm run dev"
echo "  3. Access frontend: http://localhost:5173"
echo "  4. Access backend:  http://localhost:8080"
echo ""

print_info "Installed tools:"
echo "  • Node.js $(node -v)"
echo "  • npm v$(npm -v)"
echo "  • Git $(git --version | cut -d' ' -f3)"
if command_exists docker; then
    echo "  • Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
fi
if command_exists psql; then
    echo "  • PostgreSQL $(psql --version | cut -d' ' -f3)"
fi
if command_exists redis-cli; then
    echo "  • Redis $(redis-cli --version | cut -d' ' -f2)"
fi
if command_exists aws; then
    echo "  • AWS CLI $(aws --version | cut -d' ' -f1 | cut -d'/' -f2)"
fi
if command_exists code; then
    echo "  • VS Code $(code --version | head -n1)"
fi
echo ""

print_info "Useful commands:"
echo "  • Run tests:       npm test"
echo "  • Run linter:      npm run lint"
echo "  • Build:           npm run build"
echo "  • Start Docker:    docker-compose up -d"
echo ""

print_info "Documentation:"
echo "  • Developer Guide: docs/DEVELOPER_GUIDE.md"
echo "  • Quick Reference: docs/QUICK_REFERENCE.md"
echo "  • Onboarding:      docs/TEAM_ONBOARDING.md"
echo ""

print_warning "Important:"
echo "  • Never commit the .env file"
echo "  • Create GitHub issues before PRs"
echo "  • Follow git commit conventions"
echo ""

print_success "Happy coding! 🚀"
echo ""

