# 🏗️ Phase 1: Foundation Setup

**Estimated Time**: 1-1.5 hours  
**Goal**: Get your repository and local development environment ready

---

## 📋 Phase Overview

This phase establishes the foundation for your project:
- ✅ GitHub repository configured with proper workflows
- ✅ Local development environment running
- ✅ Team collaboration tools in place

---

## 📊 Progress Tracker

Track your progress through this phase:

- [ ] **Step 1.1**: GitHub repository created
- [ ] **Step 1.2**: Branch protection rules configured
- [ ] **Step 1.3**: GitHub secrets added
- [ ] **Step 1.4**: GitHub Actions workflows working
- [ ] **Step 2.1**: Node.js and dependencies installed
- [ ] **Step 2.2**: PostgreSQL database running locally
- [ ] **Step 2.3**: Backend API running (http://localhost:3000)
- [ ] **Step 2.4**: Frontend app running (http://localhost:5173)
- [ ] **Step 2.5**: Can create account and login locally

**Phase Complete**: [ ] All checkboxes above are checked ✅

---

## 🎯 Steps in This Phase

### Step 1: GitHub Repository Setup
**📄 Detailed Guide**: [`01-github-setup.md`](01-github-setup.md)  
**Time**: 30 minutes

**What you'll do:**
- Create/configure GitHub repository
- Set up branches (main, staging, develop)
- Configure branch protection rules
- Add GitHub secrets for all environments
- Set up GitHub Environments (dev, staging, prod)
- Create issue templates and labels

**Outputs:**
- ✅ Repository with protected branches
- ✅ GitHub secrets configured
- ✅ Issue-based workflow ready

**Quick Start:**
```bash
# Clone your repository
git clone https://github.com/yellowflowersorganics-star/cropwise.git
cd cropwise

# Create environment branches
git checkout -b develop
git push origin develop

git checkout -b staging
git push origin staging
```

**Validation:**
- Can create issues using templates
- Branch protection prevents direct commits to main
- GitHub Actions tab shows workflows

---

### Step 2: Local Development Environment
**📄 Detailed Guide**: [`02-local-development.md`](02-local-development.md)  
**Time**: 45 minutes

**What you'll do:**
- Install Node.js 18+, Git, Docker
- Set up PostgreSQL database
- Configure environment variables
- Start backend and frontend
- Verify everything works

**Outputs:**
- ✅ Backend API running on port 3000
- ✅ Frontend app running on port 5173
- ✅ Can register and login locally

**Quick Start:**
```bash
# Backend setup
cd backend
npm install
cp .env.example .env
npm run migrate
npm start

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Validation:**
- Visit http://localhost:5173
- Register a new account
- Login successfully
- See dashboard

---

## 🔍 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Find and kill the process
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Issue: PostgreSQL connection failed
```bash
# Check PostgreSQL is running
# Windows
Get-Service postgresql*

# Mac
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

### Issue: npm install fails
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Phase Checklist

Before moving to Phase 2, verify:

- [ ] GitHub repository accessible to all team members
- [ ] Branch protection rules prevent direct commits
- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Can create account and login
- [ ] Database migrations run successfully
- [ ] No console errors in browser

---

## 🎯 Next Steps

Once this phase is complete:

**→ Continue to [Phase 2: Cloud Infrastructure](PHASE-2-CLOUD-INFRASTRUCTURE.md)**

This will set up your AWS account and deploy development environment to the cloud.

---

## 📚 Related Documentation

- [Git Workflow Guide](../development/GIT_WORKFLOW.md)
- [Developer Guide](../development/DEVELOPER_GUIDE.md)
- [Troubleshooting Guide](../deployment/TROUBLESHOOTING.md)

---

## 💡 Tips

**For Teams:**
- Complete Step 1 first, then each developer can do Step 2 independently
- Share .env.example files in team chat (without sensitive values)
- Document any custom setup steps in team wiki

**For Solo Developers:**
- Take breaks between steps
- Test thoroughly before moving on
- Keep notes of any issues encountered

**Common Mistakes:**
- ❌ Skipping environment variable configuration
- ❌ Not verifying each step before continuing
- ❌ Using different Node.js versions across team
- ❌ Committing .env files to git

---

**Last Updated**: November 16, 2025  
**Phase Duration**: ~1-1.5 hours  
**Difficulty**: ⭐⭐ Medium

