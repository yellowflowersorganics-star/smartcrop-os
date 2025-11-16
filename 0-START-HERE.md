# 🚀 CropWise - Start Here!

**Welcome to CropWise!** This is your **single entry point** for setting up the entire platform from scratch.

> **📌 Important**: Follow the steps in order. Each step builds on the previous one.

---

## 📖 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Prerequisites](#prerequisites)
3. [Setup Flow (Sequential)](#setup-flow-sequential)
4. [Documentation Structure](#documentation-structure)
5. [Need Help?](#need-help)

---

## 🎯 Quick Overview

**CropWise** is a comprehensive smart agriculture platform with:
- **Backend API** (Node.js/Express + PostgreSQL)
- **Frontend Web App** (React + Vite)
- **IoT Integration** (ESP32, MQTT, Node-RED)
- **AWS Cloud Deployment** (ECS, RDS, S3, CloudFront)
- **Third-party Integrations** (Google OAuth, Twilio, Slack, WhatsApp)

**Timeline**: Expect **4-6 hours** for complete setup (from scratch to production).

---

## ✅ Prerequisites

Before you begin, ensure you have:

### 1. **Accounts** (Required)
- [ ] GitHub account (for code repository)
- [ ] AWS account with billing enabled
- [ ] Google Cloud account (for OAuth)
- [ ] Domain name (optional, for production)

### 2. **Accounts** (Optional - for full features)
- [ ] Twilio account (SMS notifications)
- [ ] Slack workspace (team notifications)
- [ ] WhatsApp Business API (customer messaging)

### 3. **Local Development Tools**
- [ ] Git installed
- [ ] Node.js 18+ installed
- [ ] Docker Desktop installed
- [ ] PostgreSQL 15+ installed (or use Docker)
- [ ] Code editor (VS Code recommended)

### 4. **Skills Needed**
- Basic Git/GitHub knowledge
- Basic AWS console navigation
- Basic Node.js/React understanding
- Ability to run terminal commands

---

## 🛣️ Setup Flow (Sequential)

Follow these steps **in order**. Each step has a detailed guide.

### **Phase 1: Foundation (30 mins)**

#### **Step 1: GitHub Repository Setup**
📄 **Guide**: [`docs/setup/01-github-setup.md`](docs/setup/01-github-setup.md)

**What you'll do:**
- Create GitHub repository
- Set up branch protection rules
- Configure GitHub Secrets
- Set up GitHub Environments (dev, staging, prod)
- Create labels and issue templates

**Prerequisites**: GitHub account  
**Outputs**: Repository with protected branches, secrets configured

---

#### **Step 2: Local Development Environment**
📄 **Guide**: [`docs/setup/02-local-development.md`](docs/setup/02-local-development.md)

**What you'll do:**
- Clone the repository
- Install dependencies (Node.js, Docker, PostgreSQL)
- Set up local environment variables
- Run backend and frontend locally
- Verify local setup

**Prerequisites**: Step 1 completed  
**Outputs**: Working local development environment

---

### **Phase 2: Cloud Infrastructure (1-2 hours)**

#### **Step 3: AWS Account Setup**
📄 **Guide**: [`docs/setup/03-aws-account-setup.md`](docs/setup/03-aws-account-setup.md)

**What you'll do:**
- Create AWS account (if needed)
- Set up IAM users and policies
- Configure AWS CLI locally
- Enable billing alerts
- Set up cost monitoring

**Prerequisites**: AWS account with billing enabled  
**Outputs**: AWS CLI configured, IAM user created

---

#### **Step 4: AWS Infrastructure (Development)**
📄 **Guide**: [`docs/setup/04-aws-infrastructure-dev.md`](docs/setup/04-aws-infrastructure-dev.md)

**What you'll do:**
- Create ECR repositories (backend, frontend)
- Set up ECS cluster (development)
- Create Application Load Balancer
- Configure S3 + CloudFront for frontend
- Test development deployment

**Prerequisites**: Step 3 completed  
**Outputs**: Development environment on AWS

---

#### **Step 5: AWS Database Setup**
📄 **Guide**: [`docs/setup/05-aws-database-setup.md`](docs/setup/05-aws-database-setup.md)

**What you'll do:**
- Create RDS PostgreSQL instance (dev, stage, prod)
- Configure security groups
- Run database migrations
- Set up CloudWatch monitoring
- Configure automated backups

**Prerequisites**: Step 4 completed  
**Outputs**: PostgreSQL databases for all environments

---

### **Phase 3: Integrations (1-2 hours)**

#### **Step 6: Authentication Setup**
📄 **Guide**: [`docs/setup/06-google-oauth-setup.md`](docs/setup/06-google-oauth-setup.md)

**What you'll do:**
- Create Google Cloud project
- Configure OAuth consent screen
- Set up OAuth credentials
- Add redirect URIs for all environments
- Test Google Sign-In

**Prerequisites**: Google Cloud account  
**Outputs**: Google OAuth working on all environments

---

#### **Step 7: Communication Integrations** (Optional)
📄 **Guide**: [`docs/setup/07-communication-setup.md`](docs/setup/07-communication-setup.md)

**What you'll do:**
- Set up Twilio (SMS)
- Configure Slack webhooks
- Set up WhatsApp Business API
- Test notifications

**Prerequisites**: Twilio/Slack/WhatsApp accounts  
**Outputs**: SMS, Slack, WhatsApp notifications working

---

### **Phase 4: Production Deployment (30-60 mins)**

#### **Step 8: Staging Environment**
📄 **Guide**: [`docs/setup/08-staging-deployment.md`](docs/setup/08-staging-deployment.md)

**What you'll do:**
- Create staging AWS resources
- Deploy to staging via GitHub Actions
- Run end-to-end tests
- Verify staging environment

**Prerequisites**: Steps 1-7 completed  
**Outputs**: Fully functional staging environment

---

#### **Step 9: Production Environment**
📄 **Guide**: [`docs/setup/09-production-deployment.md`](docs/setup/09-production-deployment.md)

**What you'll do:**
- Create production AWS resources
- Configure custom domain (optional)
- Set up SSL certificates
- Deploy to production
- Configure monitoring and alerts

**Prerequisites**: Step 8 completed  
**Outputs**: Production-ready application

---

#### **Step 10: Monitoring & Security**
📄 **Guide**: [`docs/setup/10-monitoring-security.md`](docs/setup/10-monitoring-security.md)

**What you'll do:**
- Set up CloudWatch alarms
- Configure log aggregation
- Enable AWS WAF
- Set up cost alerts
- Configure backup automation

**Prerequisites**: Step 9 completed  
**Outputs**: Fully monitored and secured application

---

## 📁 Documentation Structure

Our documentation is organized into **logical categories**:

```
docs/
├── setup/              # 🔧 Sequential setup guides (START HERE!)
│   ├── 01-github-setup.md
│   ├── 02-local-development.md
│   ├── 03-aws-account-setup.md
│   ├── 04-aws-infrastructure-dev.md
│   ├── 05-aws-database-setup.md
│   ├── 06-google-oauth-setup.md
│   ├── 07-communication-setup.md
│   ├── 08-staging-deployment.md
│   ├── 09-production-deployment.md
│   └── 10-monitoring-security.md
│
├── development/        # 👨‍💻 Development guides
│   ├── DEVELOPER_GUIDE.md
│   ├── GIT_WORKFLOW.md
│   ├── TESTING_GUIDE.md
│   ├── CONTRIBUTING.md
│   └── TEAM_ONBOARDING.md
│
├── deployment/         # 🚀 Deployment & CI/CD
│   ├── DEPLOYMENT_GUIDE.md
│   ├── CICD_SETUP_GUIDE.md
│   ├── RELEASE_PROCESS.md
│   └── TROUBLESHOOTING.md
│
├── operations/         # ⚙️ Operations & maintenance
│   ├── ADMIN_GUIDE.md
│   ├── MONITORING_GUIDE.md
│   ├── BACKUP_RECOVERY.md
│   └── SECURITY_GUIDE.md
│
├── features/           # ✨ Feature-specific guides
│   ├── iot/
│   │   ├── IOT_INTEGRATION_GUIDE.md
│   │   ├── ESP32_ZONE_CONTROLLER_GUIDE.md
│   │   └── ESP_NOW_SETUP_GUIDE.md
│   ├── management/
│   │   ├── TASK_MANAGEMENT_GUIDE.md
│   │   ├── INVENTORY_MANAGEMENT_GUIDE.md
│   │   ├── LABOR_COST_TRACKING_GUIDE.md
│   │   └── QUALITY_CONTROL_GUIDE.md
│   └── integrations/
│       ├── WHATSAPP_SMS_SETUP.md
│       └── SLACK_INTEGRATION.md
│
├── reference/          # 📚 Quick references
│   ├── QUICK_REFERENCE.md
│   ├── API_REFERENCE.md
│   ├── FAQ.md
│   └── GLOSSARY.md
│
├── architecture/       # 🏗️ Architecture docs
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── DATABASE_SCHEMA.md
│   ├── IOT_ARCHITECTURE_V2.md
│   └── EDGE_GATEWAY.md
│
└── archive/            # 📦 Historical/deprecated docs
    └── (old documents)
```

---

## 🆘 Need Help?

### Common Scenarios

#### **"I'm a new developer joining the team"**
→ Go to [`docs/development/TEAM_ONBOARDING.md`](docs/development/TEAM_ONBOARDING.md)

#### **"I need to deploy a hotfix to production"**
→ Go to [`docs/deployment/RELEASE_PROCESS.md`](docs/deployment/RELEASE_PROCESS.md)

#### **"The application is down, I need to troubleshoot"**
→ Go to [`docs/deployment/TROUBLESHOOTING.md`](docs/deployment/TROUBLESHOOTING.md)

#### **"I need to understand the IoT architecture"**
→ Go to [`docs/features/iot/IOT_INTEGRATION_GUIDE.md`](docs/features/iot/IOT_INTEGRATION_GUIDE.md)

#### **"I need a quick command reference"**
→ Go to [`docs/reference/QUICK_REFERENCE.md`](docs/reference/QUICK_REFERENCE.md)

#### **"I want to contribute code"**
→ Go to [`docs/development/CONTRIBUTING.md`](docs/development/CONTRIBUTING.md)

---

## 🎯 Quick Access Links

### **For Project Setup** (You are here! 👋)
- Start with [Step 1: GitHub Setup](docs/setup/01-github-setup.md)

### **For Daily Development**
- [Developer Guide](docs/development/DEVELOPER_GUIDE.md)
- [Git Workflow](docs/development/GIT_WORKFLOW.md)
- [Quick Reference](docs/reference/QUICK_REFERENCE.md)

### **For Deployments**
- [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
- [CI/CD Setup](docs/deployment/CICD_SETUP_GUIDE.md)

### **For Admins**
- [Admin Guide](docs/operations/ADMIN_GUIDE.md)
- [Security Guide](docs/operations/SECURITY_GUIDE.md)

---

## 📊 Setup Progress Tracker

Use this checklist to track your progress:

- [ ] **Step 1**: GitHub repository configured
- [ ] **Step 2**: Local development environment working
- [ ] **Step 3**: AWS account and CLI configured
- [ ] **Step 4**: Development infrastructure on AWS
- [ ] **Step 5**: Databases configured (dev, stage, prod)
- [ ] **Step 6**: Google OAuth working
- [ ] **Step 7**: Communication integrations configured
- [ ] **Step 8**: Staging environment deployed and tested
- [ ] **Step 9**: Production environment deployed
- [ ] **Step 10**: Monitoring and security configured

---

## 🎉 What's Next?

Once you complete all 10 steps, you'll have:
- ✅ A fully functional local development environment
- ✅ Three AWS environments (dev, stage, prod)
- ✅ Automated CI/CD pipelines
- ✅ All integrations configured
- ✅ Monitoring and alerts set up
- ✅ A team-ready workflow with issue tracking

**Ready to begin?** → Start with [**Step 1: GitHub Setup**](docs/setup/01-github-setup.md)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](docs/development/CONTRIBUTING.md) before submitting pull requests.

---

**Last Updated**: November 16, 2025  
**Maintained by**: CropWise Team

