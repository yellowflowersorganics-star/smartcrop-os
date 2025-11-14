# 🐙 GitHub Repository Setup Guide

Complete guide to set up your SmartCrop repository on GitHub.

**Repository**: `https://github.com/yellowflowersorganics-star/smartcrop`

---

## ✅ Initial Setup Checklist

### 1. **Repository Settings**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/settings`

#### **General Settings**

- [ ] **Repository name**: `smartcrop`
- [ ] **Description**: Add project description
  ```
  🌱 Enterprise IoT-Powered Farm Management Platform - AI-ready, scalable smart agriculture software
  ```
- [ ] **Website**: Add your website URL (if you have one)
- [ ] **Topics**: Add relevant tags
  ```
  agriculture, iot, farming, esp32, mqtt, nodejs, react, postgresql, smart-farming, 
  precision-agriculture, mushroom-farming, vertical-farming, greenhouse, agtech
  ```
- [ ] **Features**:
  - ✅ **Wikis**: Enable for additional documentation
  - ✅ **Issues**: Enable for bug tracking
  - ✅ **Discussions**: Enable for community Q&A
  - ❌ **Projects**: Optional (enable if you want project boards)
  - ❌ **Sponsorships**: Optional

---

### 2. **Create `develop` Branch**

We follow GitFlow, so we need a `develop` branch:

```bash
# Create develop branch from main
git checkout -b develop
git push origin develop

# Set develop as default branch on GitHub (recommended)
# Go to Settings → Branches → Default branch → Change to 'develop'
```

**Why?**
- `main` = production-ready code
- `develop` = integration branch for features
- Feature branches merge to `develop`, releases merge to `main`

---

### 3. **Branch Protection Rules**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/settings/branches`

#### **Protect `main` Branch**

Click "Add rule" and configure:

**Branch name pattern**: `main`

**Settings to enable**:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **2**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional)
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Status checks to require (add after CI/CD is set up):
    - `Lint Code`
    - `Test Backend`
    - `Test Frontend`
    - `Build Backend`
    - `Build Frontend`
    - `Security Scan`

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (optional, recommended for security)

- ✅ **Require linear history** (optional, keeps history clean)

- ✅ **Include administrators** (apply rules to admins too)

- ✅ **Restrict who can push to matching branches**
  - Add team: `Maintainers` or specific users

- ✅ **Allow force pushes**: ❌ (disable)
- ✅ **Allow deletions**: ❌ (disable)

**Save changes**

#### **Protect `develop` Branch**

Click "Add rule" again:

**Branch name pattern**: `develop`

**Settings to enable**:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  
- ✅ **Require status checks to pass before merging**
  - Same checks as `main`

- ✅ **Require conversation resolution before merging**

- ✅ **Include administrators**

- ❌ **Allow force pushes**: Enable (allow rebasing)

**Save changes**

---

### 4. **GitHub Actions Secrets**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/settings/secrets/actions`

Click "New repository secret" for each:

#### **AWS Credentials (for CI/CD deployment)**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS key | For DEV/Staging deployment |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret | For DEV/Staging deployment |
| `AWS_ACCESS_KEY_ID_PROD` | Your AWS key (prod) | For Production deployment |
| `AWS_SECRET_ACCESS_KEY_PROD` | Your AWS secret (prod) | For Production deployment |

#### **CloudFront (for frontend deployment)**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFRONT_DEV_DISTRIBUTION_ID` | Your CF distribution ID | DEV frontend invalidation |
| `CLOUDFRONT_PROD_DISTRIBUTION_ID` | Your CF distribution ID | PROD frontend invalidation |

#### **API Keys**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VITE_API_URL` | https://api.yourdomain.com | Frontend API URL |
| `GOOGLE_CLIENT_ID` | Your Google OAuth ID | Google authentication |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret | Google authentication |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID | SMS/WhatsApp notifications |
| `TWILIO_AUTH_TOKEN` | Your Twilio token | SMS/WhatsApp notifications |

#### **Notifications**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SLACK_WEBHOOK_URL` | Your Slack webhook | Deployment notifications |

#### **Docker Hub (for Docker images)**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | Push Docker images |
| `DOCKERHUB_TOKEN` | Your Docker Hub token | Authentication |

---

### 5. **Enable GitHub Actions**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/actions`

GitHub Actions should be automatically enabled. Your workflows are already in:
- `.github/workflows/ci.yml` - CI/CD pipeline
- `.github/workflows/release.yml` - Release automation

**First Run**:
- Push a commit or create a PR to trigger the workflows
- Check the "Actions" tab to see if they run successfully
- Fix any errors by adding missing secrets or configurations

---

### 6. **Repository Labels**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/labels`

Add these labels for better issue/PR management:

#### **Type Labels**
- `bug` 🐛 - Something isn't working
- `enhancement` ✨ - New feature or request
- `documentation` 📚 - Documentation improvements
- `question` ❓ - Further information requested
- `duplicate` 👥 - Duplicate issue
- `invalid` ❌ - Invalid issue
- `wontfix` 🚫 - Won't be fixed

#### **Priority Labels**
- `priority: critical` 🔴 - Needs immediate attention
- `priority: high` 🟠 - High priority
- `priority: medium` 🟡 - Medium priority
- `priority: low` 🟢 - Low priority

#### **Status Labels**
- `status: in progress` 🔄 - Currently being worked on
- `status: blocked` 🚧 - Blocked by dependencies
- `status: needs review` 👀 - Needs code review
- `status: needs testing` 🧪 - Needs testing

#### **Area Labels**
- `area: backend` - Backend-related
- `area: frontend` - Frontend-related
- `area: iot` - IoT/Hardware-related
- `area: docs` - Documentation
- `area: ci/cd` - CI/CD pipeline

---

### 7. **Issue Templates**

Already created! ✅

Your issue templates are in:
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`

Verify they appear when creating a new issue:
`https://github.com/yellowflowersorganics-star/smartcrop/issues/new/choose`

---

### 8. **Pull Request Template**

Already created! ✅

Your PR template is in:
- `.github/PULL_REQUEST_TEMPLATE.md`

Verify it appears when creating a new PR.

---

### 9. **Repository About Section**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop`

Click the ⚙️ gear icon next to "About" and add:

**Description**:
```
🌱 Enterprise IoT-Powered Farm Management Platform - AI-ready, scalable smart agriculture software with ESP32 + MQTT + React + Node.js
```

**Website**: Your domain (if you have one)

**Topics**: (add all relevant tags)
```
agriculture, iot, farming, esp32, mqtt, nodejs, react, postgresql, 
smart-farming, precision-agriculture, mushroom-farming, vertical-farming, 
greenhouse, agtech, smart-agriculture, farm-management, crop-monitoring
```

**Check boxes**:
- [ ] ✅ Include in the home page

**Releases**: Will appear automatically when you create releases

---

### 10. **Create Initial Release**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/releases/new`

**Tag version**: `v1.0.0`

**Release title**: `SmartCrop v1.0.0 - Initial Release`

**Description**: Use content from `CHANGELOG.md` or:

```markdown
# 🌱 SmartCrop v1.0.0 - Initial Release

## 🎉 First Production Release!

SmartCrop is now production-ready! This is the first stable release of our enterprise IoT-powered farm management platform.

### ✨ Key Features

#### **Farm Management**
- Complete farm and zone management
- Multi-stage growing recipes
- Batch tracking from inoculation to harvest
- Harvest recording with quality grading
- Real-time analytics and reporting

#### **IoT Integration**
- Hierarchical ESP32 Master-Slave architecture
- MQTT broker integration
- Real-time environmental monitoring
- Equipment control (fans, lights, irrigation)
- Recipe execution with stage approval

#### **Operations Management**
- Inventory tracking with low stock alerts
- Task management with assignments
- Employee management with RBAC
- Labor tracking and cost analysis
- Quality control and defect tracking
- SOP management

#### **Advanced Features**
- Multi-channel notifications (Email, SMS, WhatsApp)
- Profitability analytics (ROI, profit margins)
- Mobile-responsive UI
- Google OAuth authentication
- Comprehensive API documentation

### 🚀 Getting Started

See our [Installation Guide](https://github.com/yellowflowersorganics-star/smartcrop/blob/main/docs/INSTALLATION.md)

### 📚 Documentation

- [User Guide](https://github.com/yellowflowersorganics-star/smartcrop/blob/main/docs/USER_GUIDE.md)
- [Admin Guide](https://github.com/yellowflowersorganics-star/smartcrop/blob/main/docs/ADMIN_GUIDE.md)
- [API Documentation](https://github.com/yellowflowersorganics-star/smartcrop/blob/main/docs/)

### 🐛 Found a bug?

Please [report it](https://github.com/yellowflowersorganics-star/smartcrop/issues/new?template=bug_report.md)

### 💬 Questions?

Check our [FAQ](https://github.com/yellowflowersorganics-star/smartcrop/blob/main/docs/FAQ.md) or [start a discussion](https://github.com/yellowflowersorganics-star/smartcrop/discussions)

---

**Full Changelog**: [View All Changes](https://github.com/yellowflowersorganics-star/smartcrop/blob/main/CHANGELOG.md)
```

**Check**: ✅ Set as the latest release

**Publish release**

---

### 11. **Enable Discussions**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/settings`

Scroll to "Features" → Check ✅ **Discussions**

Then set up categories:
- 💬 **General** - General discussion
- 💡 **Ideas** - Feature requests and ideas
- 🙏 **Q&A** - Questions and answers
- 🎉 **Show and tell** - Share your farm setup
- 📣 **Announcements** - Project announcements

---

### 12. **Add README Badges**

Already included in your README! ✅

Make sure they're visible:
- Version badge
- License badge
- Node.js badge
- PostgreSQL badge
- React badge

---

### 13. **Create Wiki (Optional)**

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/wiki`

Click "Create the first page"

**Suggested pages**:
- Home (overview)
- Installation
- Configuration
- Troubleshooting
- FAQ
- Hardware Setup
- Deployment

---

### 14. **Security Policy**

Create `.github/SECURITY.md`:

Visit: `https://github.com/yellowflowersorganics-star/smartcrop/security/policy`

Or create the file manually with:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email: **security@smartcrop.io**

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

We commit to:
- Acknowledge within 24 hours
- Provide status update within 7 days
- Fix critical issues within 48 hours
- Credit you in security advisory (if desired)

## Security Best Practices

See our [Security Guide](https://github.com/yellowflowersorganics-star/smartcrop/blob/main/docs/SECURITY_GUIDE.md)
```

---

### 15. **Code Owners (Optional)**

Create `.github/CODEOWNERS`:

```
# Global owners
* @your-github-username

# Backend
/backend/ @your-github-username

# Frontend
/frontend/ @your-github-username

# Documentation
/docs/ @your-github-username

# CI/CD
/.github/ @your-github-username

# IoT
/esp32-firmware/ @your-github-username
```

---

### 16. **Funding (Optional)**

Create `.github/FUNDING.yml`:

```yaml
# Sponsorship options
github: [your-github-username]
patreon: smartcropos
ko_fi: smartcropos
custom: ["https://smartcrop.io/donate"]
```

---

## 🎯 Post-Setup Tasks

### **Immediate Actions**

1. **Test CI/CD Pipeline**
   ```bash
   # Create a test branch
   git checkout -b test/ci-pipeline
   
   # Make a small change
   echo "# Test" >> README.md
   
   # Commit and push
   git add README.md
   git commit -m "test: trigger CI pipeline"
   git push origin test/ci-pipeline
   
   # Create PR and watch Actions tab
   ```

2. **Verify Branch Protection**
   - Try to push directly to `main` (should fail)
   - Create a PR and verify approval is required

3. **Test Issue Templates**
   - Create a test bug report
   - Create a test feature request
   - Verify templates work correctly

4. **Test Pull Request Template**
   - Create a test PR
   - Verify template appears with all sections

### **Communication**

1. **Announce Repository**
   - Share repository link with team
   - Post in relevant communities
   - Update your website/profile

2. **Social Media** (if applicable)
   - Twitter/X
   - LinkedIn
   - Reddit (r/homeautomation, r/farming)

### **Documentation**

1. **Update Links**
   - Verify all GitHub links work
   - Check external links
   - Test documentation navigation

2. **Screenshots**
   - Add screenshots to README
   - Update documentation images
   - Create GIFs for features

---

## ✅ Final Checklist

- [ ] Repository description and topics added
- [ ] `develop` branch created
- [ ] Branch protection rules configured
- [ ] GitHub Actions secrets added
- [ ] Labels created
- [ ] Issue and PR templates verified
- [ ] Initial release created (v1.0.0)
- [ ] Discussions enabled
- [ ] Security policy added
- [ ] README badges visible
- [ ] CI/CD pipeline tested
- [ ] Documentation links verified
- [ ] Team members invited (if applicable)

---

## 🆘 Troubleshooting

### **GitHub Actions not running?**

1. Check if Actions are enabled: Settings → Actions
2. Verify secrets are added correctly
3. Check workflow syntax (YAML)
4. Look for error messages in Actions tab

### **Branch protection not working?**

1. Ensure you're not an admin (admins can bypass rules)
2. Check "Include administrators" is enabled
3. Verify status checks are correctly named

### **Can't push to repository?**

1. Check your authentication (SSH key or token)
2. Verify you have write access
3. Ensure branch protection allows your push

---

## 📞 Need Help?

- **GitHub Docs**: https://docs.github.com
- **Community Forum**: https://github.community
- **Support**: support@github.com

---

**🎉 Congratulations! Your repository is now professionally set up!**

*Last updated: November 2025*

