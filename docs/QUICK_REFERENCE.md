# 🚀 SmartCrop OS - Quick Reference Guide

## Git Workflow Cheat Sheet

### Daily Development

```bash
# Start your day - update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "feat: add my new feature"

# Push to your fork
git push origin feature/my-new-feature

# Create PR on GitHub (base: develop)
```

### Creating a Release

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update versions
# - backend/package.json → "version": "1.2.0"
# - frontend/package.json → "version": "1.2.0"
# - CHANGELOG.md → Add release notes

git add .
git commit -m "chore: bump version to 1.2.0"

# 3. Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# 4. Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 5. Delete release branch
git branch -d release/v1.2.0
```

### Emergency Hotfix

```bash
# 1. Create from main
git checkout main
git checkout -b hotfix/v1.2.1-critical-fix

# 2. Fix the bug
git add .
git commit -m "fix: resolve critical security issue"

# 3. Merge to main
git checkout main
git merge --no-ff hotfix/v1.2.1-critical-fix
git tag -a v1.2.1 -m "Hotfix 1.2.1"
git push origin main --tags

# 4. Merge to develop
git checkout develop
git merge --no-ff hotfix/v1.2.1-critical-fix
git push origin develop
```

---

## CI/CD Pipeline Flow

```
PR to develop → Lint + Test → Build → Deploy to DEV
                                     ↓
                            Automated Tests Pass
                                     ↓
PR to main    → Full Tests → Build → Deploy to STAGING
                                     ↓
                            Manual Approval Required
                                     ↓
                                Deploy to PRODUCTION
                                     ↓
                            Create GitHub Release
                                     ↓
                            Notify Team (Slack)
```

---

## Branch Strategy Overview

| Branch | Purpose | Deploys To | Protected |
|--------|---------|------------|-----------|
| `main` | Production | AWS Production | Yes (2 approvals) |
| `develop` | Development | AWS Development | Yes (1 approval) |
| `feature/*` | New features | Local only | No |
| `release/*` | Prepare release | AWS Staging | No |
| `hotfix/*` | Emergency fixes | Production | No |
| `bugfix/*` | Bug fixes | Development | No |

---

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance

### Examples:
```bash
feat(auth): add Google OAuth integration
fix(dashboard): resolve chart rendering bug
docs(api): update harvest endpoints
refactor(models): simplify batch logic
perf(query): optimize farm listing
```

---

## Pull Request Checklist

Before creating PR:
- [ ] Code follows style guide
- [ ] All tests pass locally
- [ ] New tests added
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No console.log()
- [ ] No linting errors

---

## Release Checklist

- [ ] All features merged to `develop`
- [ ] All tests passing
- [ ] Version numbers updated
- [ ] CHANGELOG.md updated
- [ ] Create `release/*` branch
- [ ] Deploy to staging
- [ ] QA testing complete
- [ ] Merge to `main`
- [ ] Tag release
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Merge back to `develop`

---

## Environment URLs

| Environment | URL | Branch | Auto-Deploy |
|-------------|-----|--------|-------------|
| **Local** | http://localhost:8080 | Any | No |
| **Development** | https://dev.smartcrop.io | `develop` | Yes |
| **Staging** | https://staging.smartcrop.io | `release/*` | Yes |
| **Production** | https://www.smartcrop.io | `main` | Manual approval |

---

## Useful Commands

```bash
# View branch structure
git log --all --decorate --oneline --graph

# List all branches
git branch -a

# Delete local branch
git branch -d feature/my-feature

# Delete remote branch
git push origin --delete feature/my-feature

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View commit history
git log --oneline

# Check diff before commit
git diff

# Stash changes temporarily
git stash
git stash pop

# Update branch with latest develop
git fetch origin
git rebase origin/develop
```

---

## CI/CD Environment Variables

Set these in GitHub Secrets:

### AWS Credentials
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`

### Deployment
- `CLOUDFRONT_DEV_DISTRIBUTION_ID`
- `CLOUDFRONT_PROD_DISTRIBUTION_ID`

### API Keys
- `VITE_API_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

### Notifications
- `SLACK_WEBHOOK_URL`

### Docker Hub
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

---

## Support Resources

- 📚 [Full Git Workflow](docs/GIT_WORKFLOW.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)
- 📝 [Changelog](CHANGELOG.md)
- 🚀 [AWS Deployment](DEPLOY_TO_AWS_NOW.md)
- 📊 [API Documentation](http://localhost:8080/api-docs)

---

## Team Contacts

- **Tech Lead**: [your-email@example.com]
- **DevOps**: devops@smartcrop.io
- **Support**: support@smartcrop.io
- **Security**: security@smartcrop.io

---

**Happy Coding! 🌱**

