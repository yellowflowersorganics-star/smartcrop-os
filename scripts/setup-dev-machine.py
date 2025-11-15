#!/usr/bin/env python3
"""
CropWise - Cross-Platform Development Machine Setup Script

This script works on Windows, macOS, and Linux to set up a complete
development environment for CropWise.

Requirements: Python 3.7+

Usage:
    python3 setup-dev-machine.py
    OR
    python setup-dev-machine.py (Windows)
"""

import os
import sys
import platform
import subprocess
import secrets
import base64
import json
import shutil
from pathlib import Path
from typing import Optional, List, Dict

# ANSI color codes for output
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    
    @staticmethod
    def strip_if_windows():
        """Remove colors on Windows if not supported"""
        if platform.system() == 'Windows':
            # Check if Windows Terminal or modern console
            if os.environ.get('WT_SESSION') is None and os.environ.get('TERM') is None:
                for attr in dir(Colors):
                    if not attr.startswith('_') and attr != 'strip_if_windows':
                        setattr(Colors, attr, '')

Colors.strip_if_windows()

class DevSetup:
    def __init__(self):
        self.os_type = platform.system()  # 'Windows', 'Darwin', 'Linux'
        self.is_admin = self.check_admin()
        self.repo_url = "https://github.com/your-org/cropwise.git"
        self.project_dir = Path.home() / "cropwise"
        
    def check_admin(self) -> bool:
        """Check if script is running with admin/root privileges"""
        if self.os_type == 'Windows':
            try:
                import ctypes
                return ctypes.windll.shell32.IsUserAnAdmin() != 0
            except:
                return False
        else:
            return os.geteuid() == 0
    
    def print_header(self, text: str):
        """Print a formatted header"""
        print(f"\n{Colors.BLUE}{'=' * 60}{Colors.RESET}")
        print(f"{Colors.BLUE}{Colors.BOLD}{text}{Colors.RESET}")
        print(f"{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")
    
    def print_info(self, text: str):
        """Print info message"""
        print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")
    
    def print_success(self, text: str):
        """Print success message"""
        print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")
    
    def print_warning(self, text: str):
        """Print warning message"""
        print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")
    
    def print_error(self, text: str):
        """Print error message"""
        print(f"{Colors.RED}❌ {text}{Colors.RESET}")
    
    def command_exists(self, command: str) -> bool:
        """Check if a command exists in PATH"""
        return shutil.which(command) is not None
    
    def run_command(self, command: List[str], shell: bool = False, 
                   check: bool = True, capture_output: bool = False) -> Optional[subprocess.CompletedProcess]:
        """Run a shell command"""
        try:
            if capture_output:
                result = subprocess.run(
                    command, 
                    shell=shell, 
                    check=check, 
                    capture_output=True,
                    text=True
                )
                return result
            else:
                subprocess.run(command, shell=shell, check=check)
                return None
        except subprocess.CalledProcessError as e:
            self.print_error(f"Command failed: {' '.join(command)}")
            if capture_output:
                self.print_error(f"Error: {e.stderr}")
            return None
        except FileNotFoundError:
            self.print_error(f"Command not found: {command[0]}")
            return None
    
    def get_version(self, command: List[str]) -> str:
        """Get version of installed tool"""
        try:
            result = subprocess.run(
                command, 
                capture_output=True, 
                text=True, 
                check=False
            )
            return result.stdout.strip() or result.stderr.strip()
        except:
            return "unknown"
    
    def install_package_manager(self):
        """Install appropriate package manager for the OS"""
        self.print_header("1. Setting up Package Manager")
        
        if self.os_type == 'Darwin':  # macOS
            if not self.command_exists('brew'):
                self.print_info("Installing Homebrew...")
                install_cmd = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
                self.run_command(install_cmd, shell=True)
                self.print_success("Homebrew installed")
            else:
                self.print_success("Homebrew already installed")
                self.run_command(['brew', 'update'])
        
        elif self.os_type == 'Linux':
            self.print_info("Updating package list...")
            self.run_command(['sudo', 'apt', 'update'])
            self.print_success("Package list updated")
        
        elif self.os_type == 'Windows':
            if not self.command_exists('choco'):
                self.print_info("Installing Chocolatey...")
                self.print_warning("This requires PowerShell with admin privileges")
                
                # Create PowerShell script to install Chocolatey
                ps_script = """
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
"""
                with open('install_choco.ps1', 'w') as f:
                    f.write(ps_script)
                
                self.run_command(['powershell', '-ExecutionPolicy', 'Bypass', '-File', 'install_choco.ps1'])
                os.remove('install_choco.ps1')
                self.print_success("Chocolatey installed")
            else:
                self.print_success("Chocolatey already installed")
    
    def install_nodejs(self):
        """Install Node.js 18"""
        self.print_header("2. Installing Node.js 18")
        
        if not self.command_exists('node'):
            self.print_info("Installing Node.js 18...")
            
            if self.os_type == 'Darwin':
                self.run_command(['brew', 'install', 'node@18'])
                self.run_command(['brew', 'link', 'node@18'])
            elif self.os_type == 'Linux':
                # Install Node.js 18 via NodeSource
                self.run_command(['curl', '-fsSL', 'https://deb.nodesource.com/setup_18.x', '-o', '/tmp/nodesource_setup.sh'])
                self.run_command(['sudo', 'bash', '/tmp/nodesource_setup.sh'])
                self.run_command(['sudo', 'apt', 'install', '-y', 'nodejs'])
            elif self.os_type == 'Windows':
                self.run_command(['choco', 'install', 'nodejs-lts', '--version=18.19.0', '-y'])
            
            self.print_success("Node.js installed")
        else:
            version = self.get_version(['node', '-v'])
            self.print_success(f"Node.js already installed: {version}")
        
        # Verify npm
        if self.command_exists('npm'):
            version = self.get_version(['npm', '-v'])
            self.print_success(f"npm installed: v{version}")
    
    def install_git(self):
        """Install Git"""
        self.print_header("3. Installing Git")
        
        if not self.command_exists('git'):
            self.print_info("Installing Git...")
            
            if self.os_type == 'Darwin':
                self.run_command(['brew', 'install', 'git'])
            elif self.os_type == 'Linux':
                self.run_command(['sudo', 'apt', 'install', '-y', 'git'])
            elif self.os_type == 'Windows':
                self.run_command(['choco', 'install', 'git', '-y'])
            
            self.print_success("Git installed")
        else:
            version = self.get_version(['git', '--version'])
            self.print_success(f"Git already installed: {version}")
        
        # Configure Git
        self.print_info("Configuring Git...")
        git_username = input("Enter your Git username: ")
        git_email = input("Enter your Git email: ")
        
        self.run_command(['git', 'config', '--global', 'user.name', git_username])
        self.run_command(['git', 'config', '--global', 'user.email', git_email])
        self.run_command(['git', 'config', '--global', 'init.defaultBranch', 'main'])
        
        if self.os_type == 'Windows':
            self.run_command(['git', 'config', '--global', 'core.autocrlf', 'true'])
        
        self.print_success("Git configured")
    
    def install_docker(self):
        """Install Docker"""
        self.print_header("4. Installing Docker")
        
        if not self.command_exists('docker'):
            if self.os_type == 'Darwin':
                self.print_warning("Please install Docker Desktop manually from:")
                self.print_info("https://www.docker.com/products/docker-desktop")
                input("Press Enter after installing Docker Desktop...")
            
            elif self.os_type == 'Linux':
                self.print_info("Installing Docker...")
                # Download and run Docker installation script
                self.run_command(['curl', '-fsSL', 'https://get.docker.com', '-o', '/tmp/get-docker.sh'])
                self.run_command(['sudo', 'sh', '/tmp/get-docker.sh'])
                self.run_command(['sudo', 'usermod', '-aG', 'docker', os.getenv('USER')])
                self.print_success("Docker installed")
                self.print_warning("Please log out and log back in for Docker permissions")
            
            elif self.os_type == 'Windows':
                self.print_info("Installing Docker Desktop...")
                self.run_command(['choco', 'install', 'docker-desktop', '-y'])
                self.print_success("Docker Desktop installed")
                self.print_warning("Please restart your computer after installation")
        else:
            version = self.get_version(['docker', '--version'])
            self.print_success(f"Docker already installed: {version}")
    
    def install_postgresql(self):
        """Install PostgreSQL 15"""
        self.print_header("5. Installing PostgreSQL 15")
        
        if not self.command_exists('psql'):
            self.print_info("Installing PostgreSQL 15...")
            
            if self.os_type == 'Darwin':
                self.run_command(['brew', 'install', 'postgresql@15'])
                self.run_command(['brew', 'services', 'start', 'postgresql@15'])
            elif self.os_type == 'Linux':
                self.run_command(['sudo', 'apt', 'install', '-y', 'postgresql-15', 'postgresql-contrib-15'])
                self.run_command(['sudo', 'systemctl', 'start', 'postgresql'])
                self.run_command(['sudo', 'systemctl', 'enable', 'postgresql'])
            elif self.os_type == 'Windows':
                self.run_command(['choco', 'install', 'postgresql15', '--params', "'/Password:postgres'", '-y'])
                self.print_info("Default PostgreSQL password: postgres (please change this!)")
            
            self.print_success("PostgreSQL installed")
        else:
            version = self.get_version(['psql', '--version'])
            self.print_success(f"PostgreSQL already installed: {version}")
    
    def install_redis(self):
        """Install Redis"""
        self.print_header("6. Installing Redis")
        
        if self.os_type == 'Windows':
            self.print_warning("Redis on Windows requires either:")
            self.print_info("  Option 1: Run via Docker (recommended)")
            self.print_info("  Option 2: Install via WSL2")
            self.print_info("  Option 3: Use Redis Cloud (free tier)")
            self.print_info("\nFor Docker: docker run -d -p 6379:6379 redis:7-alpine")
            return
        
        if not self.command_exists('redis-cli'):
            self.print_info("Installing Redis...")
            
            if self.os_type == 'Darwin':
                self.run_command(['brew', 'install', 'redis'])
                self.run_command(['brew', 'services', 'start', 'redis'])
            elif self.os_type == 'Linux':
                self.run_command(['sudo', 'apt', 'install', '-y', 'redis-server'])
                self.run_command(['sudo', 'systemctl', 'start', 'redis-server'])
                self.run_command(['sudo', 'systemctl', 'enable', 'redis-server'])
            
            self.print_success("Redis installed")
        else:
            version = self.get_version(['redis-cli', '--version'])
            self.print_success(f"Redis already installed: {version}")
    
    def install_dev_tools(self):
        """Install development tools"""
        self.print_header("7. Installing Development Tools")
        
        # Install VS Code
        if not self.command_exists('code'):
            self.print_info("Installing VS Code...")
            
            if self.os_type == 'Darwin':
                self.run_command(['brew', 'install', '--cask', 'visual-studio-code'])
            elif self.os_type == 'Linux':
                # Install VS Code on Linux
                self.run_command(['wget', '-qO-', 'https://packages.microsoft.com/keys/microsoft.asc', '|', 
                                'gpg', '--dearmor', '>', '/tmp/packages.microsoft.gpg'], shell=True)
                self.run_command(['sudo', 'install', '-o', 'root', '-g', 'root', '-m', '644', 
                                '/tmp/packages.microsoft.gpg', '/etc/apt/trusted.gpg.d/'])
                self.run_command(['sudo', 'sh', '-c', 
                    'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'])
                self.run_command(['sudo', 'apt', 'update'])
                self.run_command(['sudo', 'apt', 'install', '-y', 'code'])
            elif self.os_type == 'Windows':
                self.run_command(['choco', 'install', 'vscode', '-y'])
            
            self.print_success("VS Code installed")
        else:
            self.print_success("VS Code already installed")
        
        # Install CLI tools
        self.print_info("Installing useful CLI tools...")
        
        if self.os_type == 'Darwin':
            self.run_command(['brew', 'install', 'jq', 'curl', 'wget'])
        elif self.os_type == 'Linux':
            self.run_command(['sudo', 'apt', 'install', '-y', 'jq', 'curl', 'wget'])
        elif self.os_type == 'Windows':
            self.run_command(['choco', 'install', 'jq', 'curl', 'wget', '-y'])
        
        self.print_success("CLI tools installed")
    
    def install_aws_cli(self):
        """Install AWS CLI"""
        self.print_header("8. Installing AWS CLI")
        
        if not self.command_exists('aws'):
            self.print_info("Installing AWS CLI...")
            
            if self.os_type == 'Darwin':
                self.run_command(['brew', 'install', 'awscli'])
            elif self.os_type == 'Linux':
                self.run_command(['curl', 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip', 
                                '-o', '/tmp/awscliv2.zip'])
                self.run_command(['unzip', '/tmp/awscliv2.zip', '-d', '/tmp/'])
                self.run_command(['sudo', '/tmp/aws/install'])
            elif self.os_type == 'Windows':
                self.run_command(['choco', 'install', 'awscli', '-y'])
            
            self.print_success("AWS CLI installed")
        else:
            version = self.get_version(['aws', '--version'])
            self.print_success(f"AWS CLI already installed: {version}")
    
    def clone_repository(self):
        """Clone CropWise repository"""
        self.print_header("9. Cloning CropWise Repository")
        
        if not self.project_dir.exists():
            repo_url = input(f"Enter repository URL (or press Enter for default):\n[{self.repo_url}]: ").strip()
            if not repo_url:
                repo_url = self.repo_url
            
            self.print_info(f"Cloning repository to {self.project_dir}...")
            self.run_command(['git', 'clone', repo_url, str(self.project_dir)])
            self.print_success("Repository cloned")
        else:
            self.print_warning(f"Repository already exists at {self.project_dir}")
    
    def generate_secret(self, length: int = 32) -> str:
        """Generate a secure random secret"""
        random_bytes = secrets.token_bytes(length)
        return base64.b64encode(random_bytes).decode('utf-8')
    
    def setup_backend(self):
        """Setup backend"""
        self.print_header("10. Setting up Backend")
        
        backend_dir = self.project_dir / 'backend'
        os.chdir(backend_dir)
        
        env_file = backend_dir / '.env'
        if not env_file.exists():
            self.print_info("Creating .env file from example...")
            shutil.copy(backend_dir / '.env.example', env_file)
            
            # Generate secrets
            self.print_info("Generating secrets...")
            jwt_secret = self.generate_secret(48)
            session_secret = self.generate_secret(32)
            
            # Update .env file
            with open(env_file, 'r') as f:
                env_content = f.read()
            
            env_content = env_content.replace('JWT_SECRET=', f'JWT_SECRET={jwt_secret}')
            env_content = env_content.replace('SESSION_SECRET=', f'SESSION_SECRET={session_secret}')
            
            with open(env_file, 'w') as f:
                f.write(env_content)
            
            self.print_success(".env file created with generated secrets")
        else:
            self.print_warning(".env file already exists")
        
        self.print_info("Installing backend dependencies...")
        self.run_command(['npm', 'install'])
        self.print_success("Backend dependencies installed")
        
        self.print_info("Running database migrations...")
        self.run_command(['npm', 'run', 'migrate'])
        self.print_success("Database migrations complete")
    
    def setup_frontend(self):
        """Setup frontend"""
        self.print_header("11. Setting up Frontend")
        
        frontend_dir = self.project_dir / 'frontend'
        os.chdir(frontend_dir)
        
        env_file = frontend_dir / '.env'
        if not env_file.exists():
            self.print_info("Creating .env file from example...")
            shutil.copy(frontend_dir / '.env.example', env_file)
            self.print_success(".env file created")
        else:
            self.print_warning(".env file already exists")
        
        self.print_info("Installing frontend dependencies...")
        self.run_command(['npm', 'install'])
        self.print_success("Frontend dependencies installed")
    
    def install_vscode_extensions(self):
        """Install VS Code extensions"""
        self.print_header("12. Installing VS Code Extensions")
        
        if self.command_exists('code'):
            self.print_info("Installing recommended VS Code extensions...")
            
            extensions = [
                'dbaeumer.vscode-eslint',
                'esbenp.prettier-vscode',
                'ms-vscode.vscode-typescript-next',
                'bradlc.vscode-tailwindcss',
                'dsznajder.es7-react-js-snippets',
                'eamodio.gitlens',
                'ms-azuretools.vscode-docker',
                'ms-python.python'
            ]
            
            for ext in extensions:
                self.run_command(['code', '--install-extension', ext], check=False)
            
            self.print_success("VS Code extensions installed")
    
    def create_helper_scripts(self):
        """Create helper scripts"""
        self.print_header("13. Creating Helper Scripts")
        
        if self.os_type == 'Windows':
            # Create start-dev.bat
            bat_content = """@echo off
echo Starting CropWise Development Environment...
echo.

start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo CropWise is starting!
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause
"""
            with open(self.project_dir / 'start-dev.bat', 'w') as f:
                f.write(bat_content)
            self.print_success("Created start-dev.bat")
        else:
            # Create start-dev.sh
            sh_content = """#!/bin/bash
echo "Starting CropWise Development Environment..."
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CropWise is starting!"
echo ""
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
"""
            script_path = self.project_dir / 'start-dev.sh'
            with open(script_path, 'w') as f:
                f.write(sh_content)
            os.chmod(script_path, 0o755)
            self.print_success("Created start-dev.sh")
    
    def print_summary(self):
        """Print setup summary"""
        self.print_header("✨ Setup Complete! ✨")
        
        print()
        self.print_success("Your development machine is ready for CropWise development!")
        print()
        
        self.print_info("Next steps:")
        if self.os_type == 'Windows':
            print("  1. Start development: .\\start-dev.bat")
        else:
            print("  1. Start development: ./start-dev.sh")
        print("  2. Or manually:")
        print("     - Backend:  cd backend && npm run dev")
        print("     - Frontend: cd frontend && npm run dev")
        print("  3. Access frontend: http://localhost:5173")
        print("  4. Access backend:  http://localhost:8080")
        print()
        
        self.print_info("Installed tools:")
        tools = {
            'node': ['node', '-v'],
            'npm': ['npm', '-v'],
            'git': ['git', '--version'],
            'docker': ['docker', '--version'],
            'psql': ['psql', '--version'],
            'redis-cli': ['redis-cli', '--version'],
            'aws': ['aws', '--version'],
            'code': ['code', '--version']
        }
        
        for name, cmd in tools.items():
            if self.command_exists(cmd[0]):
                version = self.get_version(cmd)
                print(f"  • {name}: {version.split()[0] if version else 'installed'}")
        print()
        
        self.print_info("Documentation:")
        print("  • Developer Guide: docs/DEVELOPER_GUIDE.md")
        print("  • Quick Reference: docs/QUICK_REFERENCE.md")
        print("  • Onboarding:      docs/TEAM_ONBOARDING.md")
        print()
        
        self.print_warning("Important:")
        print("  • Never commit the .env file")
        print("  • Create GitHub issues before PRs")
        print("  • Follow git commit conventions")
        print()
        
        self.print_success("Happy coding! 🚀")
        print()
    
    def run(self):
        """Run the complete setup process"""
        # Print banner
        print(f"{Colors.GREEN}")
        print("""
   ____                       _    ____                  
  / ___| _ __ ___   __ _ _ __| |_ / ___|_ __ ___  _ __  
  \___ \| '_ ` _ \ / _` | '__| __| |   | '__/ _ \| '_ \ 
   ___) | | | | | | (_| | |  | |_| |___| | | (_) | |_) |
  |____/|_| |_| |_|\__,_|_|   \__|\____|_|  \___/| .__/ 
                                                  |_|    
  Development Machine Setup - Cross-Platform (Python)
        """)
        print(f"{Colors.RESET}")
        
        self.print_info(f"Detected OS: {self.os_type}")
        self.print_info(f"Python version: {sys.version.split()[0]}")
        
        # Check Python version
        if sys.version_info < (3, 7):
            self.print_error("Python 3.7+ is required")
            sys.exit(1)
        
        # Check admin privileges on Windows
        if self.os_type == 'Windows' and not self.is_admin:
            self.print_warning("This script should be run as Administrator on Windows")
            response = input("Continue anyway? (y/N): ").lower()
            if response != 'y':
                sys.exit(0)
        
        try:
            # Run setup steps
            self.install_package_manager()
            self.install_nodejs()
            self.install_git()
            self.install_docker()
            self.install_postgresql()
            self.install_redis()
            self.install_dev_tools()
            self.install_aws_cli()
            self.clone_repository()
            self.setup_backend()
            self.setup_frontend()
            self.install_vscode_extensions()
            self.create_helper_scripts()
            self.print_summary()
            
        except KeyboardInterrupt:
            print()
            self.print_warning("Setup interrupted by user")
            sys.exit(1)
        except Exception as e:
            print()
            self.print_error(f"Setup failed: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

def main():
    """Main entry point"""
    setup = DevSetup()
    setup.run()

if __name__ == "__main__":
    main()

