# 🔄 GitHub Actions Workflows

**Complete CI/CD automation for CropWise**

---

## 📋 Overview

This directory contains all GitHub Actions workflows that automate testing, building, deploying, and maintaining CropWise.

---

## 🚀 Workflows

### 1. PR Issue Validator (`pr-issue-validator.yml`)

**Purpose:** Ensures every Pull Request is linked to a GitHub issue

**Triggers:**
- PR opened
- PR edited
- PR synchronized
- PR reopened

**What it does:**
- Checks PR title and description for issue references
- Validates issue exists in repository
- Posts helpful comment with instructions
- Adds labels: `has-issue` or `needs-issue`
- Sets commit status check

**Required patterns:**
```
Closes #123
Fixes #456
Resolves #789
Related to #999
```

**Status:** ✅ REQUIRED - PR cannot be merged without this check passing

---

### 2. Enhanced CI/CD Pipeline (`enhanced-ci.yml`)

**Purpose:** Comprehensive continuous integration and delivery

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**

#### Code Quality
- ESLint for backend and frontend
- Code formatting checks
- Unused dependency detection

#### Security Scanning
- Trivy vulnerability scanner
- npm audit for dependencies
- Secret detection with TruffleHog
- Uploads results to GitHub Security

#### Backend Tests
- Unit tests with Jest
- Integration tests with PostgreSQL
- Code coverage reporting to Codecov
- Redis integration testing

#### Frontend Tests
- Unit tests with Vitest
- Component tests with React Testing Library
- Code coverage reporting

#### E2E Tests (Optional)
- Full application testing
- Docker Compose environment
- Playwright tests

#### Build Checks
- Docker image builds
- Frontend production build
- Build size analysis

#### Dependency Review
- Security vulnerability detection
- License compliance
- Dependency changes review

#### Performance Checks
- Lighthouse CI for frontend
- Performance budgets
- Build size monitoring

#### PR Automation
- Automatic size labeling (XS, S, M, L, XL)
- CI results summary comment
- Status check aggregation

**Status:** ✅ All jobs must pass for PR approval

---

### 3. Original CI/CD Pipeline (`ci.yml`)

**Purpose:** Core CI/CD with deployment to AWS

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
- Lint code
- Run tests
- Build Docker images
- Deploy to development (develop branch)
- Deploy to staging (release branches)
- Deploy to production (main branch)
- Send Slack notifications

**Environments:**
- **Development:** Auto-deploy on push to `develop`
- **Staging:** Auto-deploy on push to `release/*`
- **Production:** Auto-deploy on push to `main` (requires approval)

---

### 4. Release Workflow (`release.yml`)

**Purpose:** Automated release management

**Triggers:**
- Push tags matching `v*` (e.g., `v1.0.0`)

**What it does:**
- Creates GitHub Release with changelog
- Builds and pushes Docker images to registry
- Deploys to production
- Updates documentation
- Sends notifications to Slack

---

### 5. Setup Labels (`setup-labels.yml`)

**Purpose:** Sync repository labels

**Triggers:**
- Manual workflow dispatch
- Push to main (if `.github/labels.yml` changes)

**Label Categories:**
- **PR Status:** needs-issue, has-issue
- **Type:** bug, feature, enhancement, documentation
- **Priority:** critical, high, medium, low
- **Status:** in-progress, blocked, needs-review, ready-to-merge
- **Component:** backend, frontend, database, iot, devops
- **Size:** XS, S, M, L, XL
- **Special:** good first issue, help wanted, breaking-change

---

## 🔐 Required Secrets

### Production Deployment

```bash
AWS_ACCESS_KEY_ID_PROD          # AWS access key for production
AWS_SECRET_ACCESS_KEY_PROD      # AWS secret key for production
AWS_ACCESS_KEY_ID               # AWS access key for dev/staging
AWS_SECRET_ACCESS_KEY           # AWS secret key for dev/staging
```

### Docker Registry

```bash
DOCKERHUB_USERNAME              # Docker Hub username
DOCKERHUB_TOKEN                 # Docker Hub access token
```

### Notifications

```bash
SLACK_WEBHOOK_URL               # Slack webhook for notifications
```

### Optional

```bash
CLOUDFRONT_PROD_DISTRIBUTION_ID # CloudFront distribution ID
CLOUDFRONT_DEV_DISTRIBUTION_ID  # CloudFront dev distribution ID
SENTRY_DSN                      # Sentry error tracking
CODECOV_TOKEN                   # Codecov integration
VITE_API_URL                    # Frontend API URL
```

### Setting Secrets

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

---

## 📊 Status Badges

Add these badges to your README.md:

```markdown
[![CI/CD Pipeline](https://github.com/your-org/cropwise/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/your-org/cropwise/actions)
[![Enhanced CI](https://github.com/your-org/cropwise/workflows/Enhanced%20CI/CD%20Pipeline/badge.svg)](https://github.com/your-org/cropwise/actions)
[![Security Scan](https://github.com/your-org/cropwise/workflows/Security%20Scan/badge.svg)](https://github.com/your-org/cropwise/actions)
[![codecov](https://codecov.io/gh/your-org/cropwise/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/cropwise)
```

---

## 🔧 Setup Instructions

### 1. Enable GitHub Actions

Actions are enabled by default for new repositories. If disabled:

1. Go to **Settings → Actions → General**
2. Select "Allow all actions and reusable workflows"
3. Click **Save**

### 2. Configure Branch Protection

**For `main` branch:**

1. Go to **Settings → Branches**
2. Click **Add rule** or edit existing rule
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
     - Required approvals: 2
   - ✅ Require status checks to pass before merging
     - Required checks:
       - `PR Issue Validation`
       - `All CI Checks Passed`
       - `Code Quality`
       - `Security Scan`
       - `Backend Tests`
       - `Frontend Tests`
   - ✅ Require conversation resolution before merging
   - ✅ Require linear history
   - ✅ Do not allow bypassing the above settings
   - ❌ Allow force pushes (keep disabled)
   - ❌ Allow deletions (keep disabled)
5. Click **Create** or **Save changes**

**For `develop` branch:**

Same as above, but:
- Required approvals: 1
- Allow admin bypass (for emergencies)

### 3. Run Initial Label Sync

1. Go to **Actions** tab
2. Select "Setup Repository Labels" workflow
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow**

This creates all the required labels in your repository.

### 4. Test PR Issue Validation

1. Create a test branch
2. Make a small change
3. Create PR **without** referencing an issue
4. Check that validation fails with helpful comment
5. Edit PR description to add `Closes #123` (use a real issue)
6. Check that validation passes

### 5. Configure AWS Credentials

Add AWS secrets for deployment:

```bash
# Development/Staging AWS account
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...

# Production AWS account (separate for security)
AWS_ACCESS_KEY_ID_PROD=AKIA...
AWS_SECRET_ACCESS_KEY_PROD=wJalr...
```

### 6. Configure Slack Notifications

1. Create Slack incoming webhook
2. Add secret: `SLACK_WEBHOOK_URL`
3. Test by triggering a deployment

---

## 🚀 Usage Guide

### Creating a Pull Request

1. **Create Issue First** (Required!)
   ```bash
   # Go to GitHub Issues → New Issue
   # Fill out issue template
   # Note the issue number (e.g., #123)
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   # Make changes...
   git commit -m "feat: your feature"
   git push origin feature/your-feature
   ```

3. **Create PR**
   - Go to GitHub → Pull Requests → New PR
   - **IMPORTANT:** In PR description, add:
     ```markdown
     Closes #123
     ```
   - Fill out PR template
   - Create PR

4. **Wait for Checks**
   - ✅ PR Issue Validation (instant)
   - ✅ Code Quality (~2 min)
   - ✅ Security Scan (~3 min)
   - ✅ Tests (~5 min)
   - ✅ Build Checks (~3 min)

5. **Request Review**
   - All checks pass
   - Request review from team
   - Address feedback

6. **Merge**
   - After approval + all checks pass
   - Use "Squash and merge"
   - Delete branch

### Manual Deployment

**Deploy to Development:**

```bash
git push origin develop
# Automatically deploys to dev environment
```

**Deploy to Production:**

```bash
# Method 1: Merge to main
git checkout main
git merge develop
git push origin main

# Method 2: Create release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Monitoring Workflows

**View All Workflows:**
- Go to **Actions** tab
- See status of all running/completed workflows

**View Specific Workflow:**
- Click on workflow name
- See all runs
- Click on a run to see details

**View Logs:**
- Click on a workflow run
- Click on a job
- Expand steps to see logs

**Download Artifacts:**
- In workflow run details
- Scroll to "Artifacts" section
- Download build artifacts, test results, etc.

---

## 🐛 Troubleshooting

### Issue: "PR Issue Validation" fails

**Problem:** PR doesn't reference a GitHub issue

**Solution:**
1. Edit PR description
2. Add one of these patterns:
   ```
   Closes #123
   Fixes #456
   Resolves #789
   Related to #999
   ```
3. Save PR description
4. Check will automatically re-run

### Issue: Tests fail in CI but pass locally

**Possible causes:**
1. **Environment differences**
   - Check Node.js version matches
   - Check database version
   - Check timezone settings

2. **Missing environment variables**
   - Add to workflow file under `env:`

3. **Database state**
   - CI uses fresh database each time
   - Local might have stale data

**Solution:**
```bash
# Test in clean environment locally
rm -rf node_modules
npm install
npm test
```

### Issue: Build fails with "out of memory"

**Solution:**

Add to workflow file:

```yaml
env:
  NODE_OPTIONS: --max-old-space-size=4096
```

### Issue: Deployment stuck or fails

**Check:**
1. AWS credentials are correct
2. AWS services are running
3. Security group rules allow access
4. ECS service has capacity

**View logs:**
```bash
aws logs tail /ecs/cropwise-backend --follow
```

### Issue: Secrets not working

**Check:**
1. Secrets are set in repository settings
2. Secret names match exactly (case-sensitive)
3. No extra spaces in secret values
4. Secrets are available in correct environment

---

## 📈 Performance

**Typical CI/CD Times:**

| Job | Time |
|-----|------|
| PR Issue Validation | < 10 seconds |
| Code Quality | 2-3 minutes |
| Security Scan | 3-4 minutes |
| Backend Tests | 4-5 minutes |
| Frontend Tests | 2-3 minutes |
| Build | 5-7 minutes |
| **Total (parallel)** | **~8-10 minutes** |
| Deployment | 10-15 minutes |

**Optimization tips:**
- Use `npm ci` instead of `npm install`
- Enable caching for node_modules
- Run jobs in parallel where possible
- Use matrix strategy for multi-version testing

---

## 🔒 Security

### Security Best Practices

1. **Never commit secrets**
   - Use GitHub Secrets
   - Use AWS Secrets Manager
   - Use environment variables

2. **Limit secret access**
   - Use environment-specific secrets
   - Rotate secrets regularly
   - Use least privilege IAM roles

3. **Review security alerts**
   - Check Dependabot alerts
   - Check Trivy scan results
   - Check npm audit output

4. **Keep dependencies updated**
   - Review and merge Dependabot PRs
   - Update Node.js version regularly
   - Update actions to latest versions

---

## 📚 Additional Resources

### Official Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Script Action](https://github.com/actions/github-script)

### Useful Actions
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
- [docker/build-push-action](https://github.com/docker/build-push-action)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)

### Tutorials
- [GitHub Actions Tutorial](https://docs.github.com/en/actions/learn-github-actions)
- [CI/CD Best Practices](https://docs.github.com/en/actions/guides/about-continuous-integration)

---

## 🆘 Getting Help

**Issues with workflows:**
1. Check workflow logs in Actions tab
2. Ask in #devops Slack channel
3. Review this documentation
4. Check GitHub Actions documentation

**Need to modify workflows:**
1. Create issue describing change
2. Create PR with workflow changes
3. Test in your fork first
4. Request review from DevOps team

---

**Last Updated:** November 2024  
**Maintained by:** CropWise DevOps Team  
**Contact:** devops@cropwise.io

