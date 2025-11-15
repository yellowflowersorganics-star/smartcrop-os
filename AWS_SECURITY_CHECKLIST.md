# 🔒 AWS Secrets Security Checklist

## ✅ Current Status: SECURE

**Last Audit**: November 14, 2025  
**Result**: No AWS credentials found in repository

---

## 🎯 Quick Security Check

Run these commands anytime to verify your secrets are safe:

### 1. Check if .env files are ignored
```powershell
git check-ignore backend/.env frontend/.env
```
**Expected**: Should list both files (means they're ignored ✓)

### 2. Search git history for AWS keys
```powershell
git log --all --full-history -S "AKIA" --source --pretty=format:"%h %s"
```
**Expected**: Only documentation commits (safe) or nothing

### 3. Verify no secrets in staged files
```powershell
git diff --cached | Select-String -Pattern "AKIA","AWS_SECRET"
```
**Expected**: Nothing or only documentation files

---

## 🚨 If You Accidentally Commit Secrets

### IMMEDIATE ACTIONS (Within 5 minutes):

#### Step 1: Rotate/Invalidate Credentials IMMEDIATELY
```bash
# Go to AWS IAM Console
https://console.aws.amazon.com/iam/home#/security_credentials

# Delete or deactivate the exposed Access Key
# Create new credentials
```

#### Step 2: Check AWS Account Activity
```bash
# Go to CloudTrail
https://console.aws.amazon.com/cloudtrail

# Look for suspicious API calls in last 24 hours
# Check for unauthorized resources (EC2 instances, etc.)
```

#### Step 3: Remove from Git History

**Option A: If just pushed (last commit)**
```powershell
# Remove from last commit
git reset HEAD~1
git add .
git commit -m "docs: Update documentation"
git push --force-with-lease
```

**Option B: If in deeper history**
```powershell
# Use BFG Repo-Cleaner (faster than git-filter-branch)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove credentials file
java -jar bfg.jar --delete-files .env

# Or replace text
java -jar bfg.jar --replace-text passwords.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (CAUTION)
git push --force --all
```

**Option C: GitHub Secret Scanning Alert**
- GitHub may automatically detect and alert you
- Follow their remediation steps
- Credentials may be automatically disabled by AWS

---

## ✅ Proper Secrets Management

### For Local Development

**1. Use .env files (never commit them)**
```bash
# backend/.env
DATABASE_URL=postgresql://localhost:5432/cropwise
JWT_SECRET=your-local-secret
# NO AWS credentials here!
```

**2. For AWS credentials, use AWS CLI profiles instead**
```bash
# Windows: C:\Users\<USERNAME>\.aws\credentials
# Linux/Mac: ~/.aws/credentials

[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = your-secret-key
region = us-east-1

[production]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = different-secret-key
region = us-east-1
```

**3. Use the credentials in code**
```javascript
// backend/config/aws.js
const AWS = require('aws-sdk');

// This will automatically use credentials from ~/.aws/credentials
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1'
});
```

### For GitHub Actions (CI/CD)

**Store secrets in GitHub Secrets:**
https://github.com/yellowflowersorganics-star/cropwise/settings/secrets/actions

**Required secrets:**
- `AWS_ACCESS_KEY_ID` - Development environment
- `AWS_SECRET_ACCESS_KEY` - Development environment
- `AWS_ACCESS_KEY_ID_PROD` - Production environment
- `AWS_SECRET_ACCESS_KEY_PROD` - Production environment
- `AWS_REGION` - Your AWS region

**In your workflow files:**
```yaml
# .github/workflows/deploy.yml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_REGION: ${{ secrets.AWS_REGION }}
```

### For Production Deployment

**Best Practice: Use IAM Roles instead of Access Keys**

For EC2/ECS/Lambda:
```yaml
# CloudFormation/Terraform
Resources:
  AppRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Effect: Allow
            Principal:
              Service: ec2.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

---

## 🔄 Regular Maintenance

### Weekly
- [ ] Review GitHub Actions secrets (still needed?)
- [ ] Check AWS CloudTrail for unusual activity

### Monthly
- [ ] Run security audit (commands above)
- [ ] Review IAM users and their last activity
- [ ] Remove unused access keys

### Every 90 Days
- [ ] Rotate AWS access keys
- [ ] Update GitHub secrets with new keys
- [ ] Test that old keys are properly deactivated

---

## 🛠️ Useful Tools

### 1. git-secrets (Prevent committing secrets)
```powershell
# Install
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
./install.ps1

# Setup in your repo
cd C:\Users\praghav\cropwise
git secrets --install
git secrets --register-aws
```

### 2. TruffleHog (Scan for secrets in history)
```powershell
# Install
pip install truffleHog

# Scan repo
trufflehog --regex --entropy=True https://github.com/yellowflowersorganics-star/cropwise
```

### 3. GitHub Secret Scanning
- **Already enabled** for public repos automatically
- For private repos: Settings → Security → Code security and analysis → Secret scanning

---

## 📞 Emergency Contacts

**If AWS credentials are compromised:**
1. **AWS Support**: https://console.aws.amazon.com/support/
2. **AWS Abuse**: abuse@amazonaws.com
3. **AWS Trust & Safety**: https://aws.amazon.com/premiumsupport/knowledge-center/report-aws-abuse/

**Immediate Actions:**
1. Deactivate compromised credentials in IAM
2. Review CloudTrail logs for unauthorized access
3. Check for unexpected resources (EC2, S3, Lambda)
4. Enable AWS GuardDuty for threat detection
5. Set up billing alerts for unusual charges

---

## 📚 Additional Resources

- **SECRETS_SETUP_GUIDE.md** - How to properly set up secrets
- **AWS IAM Best Practices**: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **AWS Security**: https://aws.amazon.com/security/

---

## ✅ Your Current Setup (SECURE)

- ✓ `.gitignore` properly configured
- ✓ `.env` files not committed
- ✓ No AWS credentials in git history
- ✓ Documentation uses placeholder keys only
- ✓ `.cursorignore` protecting .env files

**Status**: 🟢 **ALL CLEAR - NO ACTION NEEDED**

---

**Last Updated**: November 14, 2025  
**Next Audit**: December 14, 2025

