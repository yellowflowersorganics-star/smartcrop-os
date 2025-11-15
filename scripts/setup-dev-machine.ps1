<# 
.SYNOPSIS
    CropWise - Development Machine Setup Script for Windows
.DESCRIPTION
    This script sets up a Windows development machine with all required tools for CropWise
.NOTES
    Run as Administrator
    PowerShell 5.1 or later required
#>

#Requires -RunAsAdministrator

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-ColorOutput "========================================" "Cyan"
    Write-ColorOutput $Message "Cyan"
    Write-ColorOutput "========================================" "Cyan"
    Write-Host ""
}

# Function to check if command exists
function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

##############################################################################
# Main Setup
##############################################################################

Clear-Host
Write-ColorOutput @"
   ____                       _    ____                  
  / ___| _ __ ___   __ _ _ __| |_ / ___|_ __ ___  _ __  
  \___ \| '_ `` _ \ / _`` | '__| __| |   | '__/ _ \| '_ \ 
   ___) | | | | | | (_| | |  | |_| |___| | | (_) | |_) |
  |____/|_| |_| |_|\__,_|_|   \__|\____|_|  \___/| .__/ 
                                                  |_|    
  Development Machine Setup - Windows
"@ "Green"

Write-Info "Starting CropWise development environment setup..."

##############################################################################
# 1. Install Chocolatey
##############################################################################

Write-Header "1. Setting up Chocolatey Package Manager"

if (!(Test-CommandExists choco)) {
    Write-Info "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Success "Chocolatey installed"
} else {
    Write-Success "Chocolatey already installed"
    choco upgrade chocolatey -y
}

##############################################################################
# 2. Install Node.js
##############################################################################

Write-Header "2. Installing Node.js 18"

if (!(Test-CommandExists node)) {
    Write-Info "Installing Node.js 18..."
    choco install nodejs-lts --version=18.19.0 -y
    refreshenv
    Write-Success "Node.js installed"
} else {
    $nodeVersion = node -v
    Write-Success "Node.js already installed: $nodeVersion"
}

# Verify npm
if (Test-CommandExists npm) {
    $npmVersion = npm -v
    Write-Success "npm installed: v$npmVersion"
}

##############################################################################
# 3. Install Git
##############################################################################

Write-Header "3. Installing Git"

if (!(Test-CommandExists git)) {
    Write-Info "Installing Git..."
    choco install git -y
    refreshenv
    Write-Success "Git installed"
} else {
    $gitVersion = git --version
    Write-Success "Git already installed: $gitVersion"
}

# Configure Git
Write-Info "Configuring Git..."
$gitUsername = Read-Host "Enter your Git username"
$gitEmail = Read-Host "Enter your Git email"

git config --global user.name $gitUsername
git config --global user.email $gitEmail
git config --global init.defaultBranch main
git config --global core.autocrlf true
Write-Success "Git configured"

##############################################################################
# 4. Install Docker Desktop
##############################################################################

Write-Header "4. Installing Docker Desktop"

if (!(Test-CommandExists docker)) {
    Write-Info "Installing Docker Desktop..."
    choco install docker-desktop -y
    Write-Success "Docker Desktop installed"
    Write-Warning "Please restart your computer after installation completes"
} else {
    $dockerVersion = docker --version
    Write-Success "Docker already installed: $dockerVersion"
}

##############################################################################
# 5. Install PostgreSQL
##############################################################################

Write-Header "5. Installing PostgreSQL 15"

if (!(Test-CommandExists psql)) {
    Write-Info "Installing PostgreSQL 15..."
    choco install postgresql15 --params '/Password:postgres' -y
    refreshenv
    Write-Success "PostgreSQL installed"
    Write-Info "Default password: postgres (change this!)"
} else {
    Write-Success "PostgreSQL already installed"
}

##############################################################################
# 6. Install Redis (via WSL2 or Docker)
##############################################################################

Write-Header "6. Redis Setup"

Write-Warning "Redis on Windows requires either:"
Write-Info "  Option 1: Run via Docker (recommended)"
Write-Info "  Option 2: Install via WSL2"
Write-Info "  Option 3: Use Redis Cloud (free tier)"
Write-Host ""
Write-Info "For Docker: docker run -d -p 6379:6379 redis:7-alpine"

##############################################################################
# 7. Install Development Tools
##############################################################################

Write-Header "7. Installing Development Tools"

# Install VS Code
if (!(Test-CommandExists code)) {
    Write-Info "Installing Visual Studio Code..."
    choco install vscode -y
    refreshenv
    Write-Success "VS Code installed"
} else {
    Write-Success "VS Code already installed"
}

# Install useful tools
Write-Info "Installing useful CLI tools..."
choco install jq curl wget -y
Write-Success "CLI tools installed"

##############################################################################
# 8. Install Windows Terminal (Optional but recommended)
##############################################################################

Write-Header "8. Installing Windows Terminal"

try {
    winget install --id Microsoft.WindowsTerminal -e
    Write-Success "Windows Terminal installed"
} catch {
    Write-Warning "Windows Terminal installation skipped"
}

##############################################################################
# 9. Install AWS CLI
##############################################################################

Write-Header "9. Installing AWS CLI"

if (!(Test-CommandExists aws)) {
    Write-Info "Installing AWS CLI..."
    choco install awscli -y
    refreshenv
    Write-Success "AWS CLI installed"
} else {
    $awsVersion = aws --version
    Write-Success "AWS CLI already installed: $awsVersion"
}

##############################################################################
# 10. Clone Repository
##############################################################################

Write-Header "10. Cloning CropWise Repository"

$projectPath = "$HOME\Projects"
if (!(Test-Path $projectPath)) {
    New-Item -ItemType Directory -Path $projectPath | Out-Null
}

Set-Location $projectPath

if (!(Test-Path "cropwise")) {
    $repoUrl = Read-Host "Enter repository URL (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        $repoUrl = "https://github.com/your-org/cropwise.git"
    }
    
    Write-Info "Cloning repository..."
    git clone $repoUrl cropwise
    Set-Location cropwise
    Write-Success "Repository cloned"
} else {
    Write-Warning "Repository already exists. Skipping clone."
    Set-Location cropwise
}

##############################################################################
# 11. Setup Backend
##############################################################################

Write-Header "11. Setting up Backend"

Set-Location backend

if (!(Test-Path ".env")) {
    Write-Info "Creating .env file from example..."
    Copy-Item .env.example .env
    
    # Generate secrets
    Write-Info "Generating secrets..."
    $jwtSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
    $sessionSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    
    # Update .env file
    $envContent = Get-Content .env
    $envContent = $envContent -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret"
    $envContent = $envContent -replace 'SESSION_SECRET=.*', "SESSION_SECRET=$sessionSecret"
    $envContent | Set-Content .env
    
    Write-Success ".env file created with generated secrets"
} else {
    Write-Warning ".env file already exists"
}

Write-Info "Installing backend dependencies..."
npm install
Write-Success "Backend dependencies installed"

Write-Info "Running database migrations..."
npm run migrate
Write-Success "Database migrations complete"

Set-Location ..

##############################################################################
# 12. Setup Frontend
##############################################################################

Write-Header "12. Setting up Frontend"

Set-Location frontend

if (!(Test-Path ".env")) {
    Write-Info "Creating .env file from example..."
    Copy-Item .env.example .env
    Write-Success ".env file created"
} else {
    Write-Warning ".env file already exists"
}

Write-Info "Installing frontend dependencies..."
npm install
Write-Success "Frontend dependencies installed"

Set-Location ..

##############################################################################
# 13. Install VS Code Extensions
##############################################################################

Write-Header "13. Installing VS Code Extensions"

if (Test-CommandExists code) {
    Write-Info "Installing recommended VS Code extensions..."
    
    $extensions = @(
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "dsznajder.es7-react-js-snippets",
        "eamodio.gitlens",
        "ms-azuretools.vscode-docker",
        "ms-vscode.powershell"
    )
    
    foreach ($extension in $extensions) {
        code --install-extension $extension
    }
    
    Write-Success "VS Code extensions installed"
}

##############################################################################
# 14. Create Startup Scripts
##############################################################################

Write-Header "14. Creating Startup Scripts"

# Create start-dev.bat
$startDevBat = @"
@echo off
echo Starting CropWise Development Environment...
echo.

start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ CropWise is starting!
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to open browser...
pause > nul

start http://localhost:5173
"@

Set-Content -Path "start-dev.bat" -Value $startDevBat
Write-Success "Created start-dev.bat"

##############################################################################
# Setup Complete!
##############################################################################

Write-Header "✨ Setup Complete! ✨"

Write-Host ""
Write-Success "Your Windows development machine is ready for CropWise development!"
Write-Host ""

Write-Info "Next steps:"
Write-Host "  1. Restart your computer if Docker was just installed"
Write-Host "  2. Start backend:  cd backend && npm run dev"
Write-Host "  3. Start frontend: cd frontend && npm run dev"
Write-Host "  4. Or use:         .\start-dev.bat"
Write-Host "  5. Access frontend: http://localhost:5173"
Write-Host "  6. Access backend:  http://localhost:8080"
Write-Host ""

Write-Info "Installed tools:"
if (Test-CommandExists node) {
    $nodeVersion = node -v
    Write-Host "  • Node.js $nodeVersion"
}
if (Test-CommandExists npm) {
    $npmVersion = npm -v
    Write-Host "  • npm v$npmVersion"
}
if (Test-CommandExists git) {
    $gitVersion = (git --version).Split(" ")[2]
    Write-Host "  • Git $gitVersion"
}
if (Test-CommandExists docker) {
    $dockerVersion = (docker --version).Split(" ")[2].TrimEnd(",")
    Write-Host "  • Docker $dockerVersion"
}
if (Test-CommandExists psql) {
    Write-Host "  • PostgreSQL 15"
}
if (Test-CommandExists aws) {
    $awsVersion = (aws --version).Split(" ")[0].Split("/")[1]
    Write-Host "  • AWS CLI $awsVersion"
}
if (Test-CommandExists code) {
    Write-Host "  • VS Code"
}
Write-Host ""

Write-Info "Useful commands:"
Write-Host "  • Run tests:       npm test"
Write-Host "  • Run linter:      npm run lint"
Write-Host "  • Build:           npm run build"
Write-Host "  • Start Docker:    docker-compose up -d"
Write-Host ""

Write-Info "Documentation:"
Write-Host "  • Developer Guide: docs\DEVELOPER_GUIDE.md"
Write-Host "  • Quick Reference: docs\QUICK_REFERENCE.md"
Write-Host "  • Onboarding:      docs\TEAM_ONBOARDING.md"
Write-Host ""

Write-Warning "Important:"
Write-Host "  • Never commit the .env file"
Write-Host "  • Create GitHub issues before PRs"
Write-Host "  • Follow git commit conventions"
Write-Host ""

Write-Success "Happy coding! 🚀"
Write-Host ""

Write-Info "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

