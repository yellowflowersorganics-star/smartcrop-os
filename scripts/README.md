# 🛠️ CropWise Scripts

**Utility scripts for development, deployment, and maintenance**

---

## 📋 Available Scripts

### 1. Development Machine Setup (Cross-Platform) ⭐

**`setup-dev-machine.py`** - Python script that works on Windows, macOS, and Linux

**What it does:**
- ✅ Detects your operating system automatically
- ✅ Installs all required tools (Node.js, Git, Docker, PostgreSQL, Redis, VS Code, AWS CLI)
- ✅ Clones the CropWise repository
- ✅ Sets up backend with database migrations
- ✅ Sets up frontend with dependencies
- ✅ Generates secure secrets automatically
- ✅ Installs VS Code extensions
- ✅ Creates helper scripts (start-dev.bat/sh)
- ✅ Takes 15-20 minutes total

**Requirements:**
- Python 3.7+ (usually pre-installed on macOS/Linux, download for Windows)
- Internet connection
- Administrator/sudo privileges

**Usage:**

**On macOS/Linux:**
```bash
# Download Python if needed
# macOS: brew install python3
# Linux: sudo apt install python3

# Run the script
python3 setup-dev-machine.py

# Or make it executable
chmod +x setup-dev-machine.py
./setup-dev-machine.py
```

**On Windows:**
```powershell
# Download Python from python.org if needed
# Or: choco install python

# Run PowerShell as Administrator
python setup-dev-machine.py

# Follow the prompts
```

**What you'll be asked:**
1. Git username
2. Git email
3. Repository URL (optional, has default)

**After completion:**
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`
- Or use helper script: `./start-dev.sh` (Unix) or `start-dev.bat` (Windows)

---

### 2. Documentation Analyzer

**`analyze-docs.js`** - Analyzes all documentation files

**What it does:**
- Scans all .md files in repository
- Identifies duplicates and overlaps
- Categorizes documentation
- Generates reorganization suggestions
- Creates JSON report

**Usage:**
```bash
node analyze-docs.js

# Output: docs-analysis-report.json
```

**Report includes:**
- File inventory with sizes and sections
- Duplicate content detection
- Category distribution
- Reorganization suggestions
- Documentation map

---

### 3. Secret Generation (Future)

**`generate-secrets.py`** - Generate secure secrets

**Usage:**
```python
python3 generate-secrets.py

# Output:
# JWT_SECRET=...
# SESSION_SECRET=...
# DB_PASSWORD=...
# ENCRYPTION_KEY=...
```

---

### 4. AWS Deployment Scripts

**Located in `aws/scripts/`:**
- `setup-infrastructure.sh` - Set up AWS infrastructure
- `deploy.sh` - Deploy to AWS

See [AWS Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)

---

## 📖 Detailed Documentation

### setup-dev-machine.py Features

**Cross-Platform Support:**
```python
# Automatically detects OS
os_type = platform.system()
# Returns: 'Windows', 'Darwin' (macOS), or 'Linux'

# Uses appropriate package manager:
# - macOS: Homebrew
# - Linux: apt
# - Windows: Chocolatey
```

**Smart Installation:**
- Checks if tools already installed
- Skips if present, shows version
- Only installs what's missing
- Handles OS-specific quirks

**Security:**
- Generates cryptographically secure secrets
- Uses Python's `secrets` module
- Base64 encoding for compatibility
- Never logs secrets to console

**Error Handling:**
- Graceful failure recovery
- Clear error messages
- Continues on non-critical errors
- Rollback on critical failures

---

## 🔧 Script Customization

### Modify Repository URL

Edit line 38 in `setup-dev-machine.py`:

```python
self.repo_url = "https://github.com/your-org/cropwise.git"
```

### Change Installation Directory

Edit line 39:

```python
self.project_dir = Path.home() / "cropwise"
# Change to: Path.home() / "Projects" / "cropwise"
```

### Add/Remove Tools

Find the installation method and comment it out:

```python
def run(self):
    self.install_package_manager()
    self.install_nodejs()
    self.install_git()
    # self.install_docker()  # Skip Docker
    self.install_postgresql()
    # self.install_redis()  # Skip Redis
    ...
```

### Skip VS Code Extensions

Comment out in `run()`:

```python
# self.install_vscode_extensions()
```

---

## 🐛 Troubleshooting

### Python not found (Windows)

```powershell
# Install Python
choco install python

# Or download from python.org
# Add to PATH during installation
```

### Permission denied (macOS/Linux)

```bash
# Make script executable
chmod +x setup-dev-machine.py

# Or run with python3
python3 setup-dev-machine.py
```

### Homebrew installation fails (macOS)

```bash
# Install Homebrew manually
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then run script again
python3 setup-dev-machine.py
```

### Chocolatey installation fails (Windows)

```powershell
# Install Chocolatey manually (as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then run script again
python setup-dev-machine.py
```

### Node.js installation fails

```bash
# Install Node.js manually

# macOS:
brew install node@18

# Linux:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Windows:
choco install nodejs-lts --version=18.19.0

# Then run script again
```

### Git clone fails

```bash
# Check SSH key
ssh -T git@github.com

# Or use HTTPS with token
git clone https://TOKEN@github.com/your-org/cropwise.git
```

---

## 🔍 Script Flow

```
Start
  │
  ├─> Check OS (Windows/macOS/Linux)
  ├─> Check Python version
  ├─> Check admin privileges (Windows)
  │
  ├─> Install Package Manager
  │   ├─ macOS: Homebrew
  │   ├─ Linux: apt update
  │   └─ Windows: Chocolatey
  │
  ├─> Install Node.js 18
  ├─> Install Git & configure
  ├─> Install Docker
  ├─> Install PostgreSQL 15
  ├─> Install Redis
  ├─> Install VS Code
  ├─> Install CLI tools (jq, curl, wget)
  ├─> Install AWS CLI
  │
  ├─> Clone Repository
  │   └─> Ask for repository URL
  │
  ├─> Setup Backend
  │   ├─> Create .env from example
  │   ├─> Generate secrets
  │   ├─> npm install
  │   └─> Run migrations
  │
  ├─> Setup Frontend
  │   ├─> Create .env from example
  │   └─> npm install
  │
  ├─> Install VS Code Extensions
  │
  ├─> Create Helper Scripts
  │   ├─ Windows: start-dev.bat
  │   └─ Unix: start-dev.sh
  │
  └─> Print Summary
      ├─> Installed tools
      ├─> Next steps
      └─> Documentation links
```

---

## 📊 Comparison: Python vs Shell Scripts

| Feature | Python Script | Shell Scripts |
|---------|--------------|---------------|
| **Cross-platform** | ✅ Single file | ❌ Need 2 files (.sh + .ps1) |
| **Maintenance** | ✅ Easy | ❌ Harder (2 files) |
| **Error handling** | ✅ Excellent | ⚠️ Basic |
| **Readability** | ✅ Very clear | ⚠️ Shell syntax varies |
| **Dependencies** | Python 3.7+ | Bash/PowerShell |
| **Speed** | ⚡ Fast | ⚡ Fast |
| **Debugging** | ✅ Easy | ⚠️ Harder |

---

## 🚀 Future Enhancements

### Planned Features

- [ ] **Uninstall script** - Remove all installed tools
- [ ] **Update script** - Update all tools to latest versions
- [ ] **Validate script** - Check if everything is working
- [ ] **Doctor script** - Diagnose common issues
- [ ] **Backup script** - Backup current setup
- [ ] **Restore script** - Restore from backup

### Coming Soon

```python
# validate-setup.py
# Checks if all tools are installed correctly

# update-tools.py
# Updates Node.js, npm, Docker, etc.

# doctor.py
# Diagnoses common setup issues

# backup-env.py
# Backs up .env files and configurations
```

---

## 📞 Getting Help

**Issues with scripts:**
- Check this README first
- Check troubleshooting section above
- Ask in #dev-help Slack channel
- Create GitHub issue with label `scripts`

**Contributing:**
- Fork repository
- Create feature branch
- Test on all platforms (Windows, macOS, Linux)
- Submit PR with tests

---

## 📝 Script Maintenance

### Testing New Changes

```bash
# Test on virtual machine or Docker container

# macOS: Use UTM or Parallels
# Linux: Use VirtualBox or Docker
# Windows: Use Hyper-V or VirtualBox

# Run script
python3 setup-dev-machine.py

# Verify:
# 1. All tools installed
# 2. Repository cloned
# 3. Backend/frontend working
# 4. No errors in output
```

### Adding New Tools

1. Add installation method to class
2. Call method in `run()`
3. Update README
4. Test on all platforms

Example:

```python
def install_redis(self):
    """Install Redis"""
    self.print_header("Installing Redis")
    
    if self.os_type == 'Darwin':
        self.run_command(['brew', 'install', 'redis'])
    elif self.os_type == 'Linux':
        self.run_command(['sudo', 'apt', 'install', '-y', 'redis'])
    elif self.os_type == 'Windows':
        self.print_warning("Use Docker for Redis on Windows")
```

---

## 🔖 Related Documentation

- [Developer Guide](../docs/DEVELOPER_GUIDE.md)
- [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)
- [Secrets Management](../docs/SECRETS_MANAGEMENT_GUIDE.md)
- [Team Onboarding](../docs/TEAM_ONBOARDING.md)

---

**Last Updated:** November 2024  
**Maintained by:** CropWise DevOps Team  
**Python Version:** 3.7+  
**Tested on:** Windows 11, macOS 14 (Sonoma), Ubuntu 22.04

