# 🔐 GitHub Secrets Setup Guide

Complete guide to obtain and configure all required secrets for SmartCrop OS CI/CD pipeline.

**Repository**: https://github.com/yellowflowersorganics-star/smartcrop-os  
**Add Secrets At**: https://github.com/yellowflowersorganics-star/smartcrop-os/settings/secrets/actions

---

## 📋 Secrets Checklist

### ✅ Priority 1: Essential (Add Now)

- [ ] `VITE_API_URL` - Frontend API endpoint

### 🔶 Priority 2: AWS Deployment (Add When Deploying)

- [ ] `AWS_ACCESS_KEY_ID` - AWS access key for DEV
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret for DEV
- [ ] `AWS_ACCESS_KEY_ID_PROD` - AWS access key for PROD
- [ ] `AWS_SECRET_ACCESS_KEY_PROD` - AWS secret for PROD
- [ ] `CLOUDFRONT_DEV_DISTRIBUTION_ID` - CloudFront ID for DEV
- [ ] `CLOUDFRONT_PROD_DISTRIBUTION_ID` - CloudFront ID for PROD

### 🔷 Priority 3: Optional Features (Add As Needed)

- [ ] `GOOGLE_CLIENT_ID` - Google OAuth login
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `TWILIO_ACCOUNT_SID` - SMS/WhatsApp notifications
- [ ] `TWILIO_AUTH_TOKEN` - Twilio authentication
- [ ] `SLACK_WEBHOOK_URL` - Deployment notifications
- [ ] `DOCKERHUB_USERNAME` - Docker Hub publishing
- [ ] `DOCKERHUB_TOKEN` - Docker Hub authentication

---

## 🎯 Priority 1: Essential Secrets (Add Now)

### 1. `VITE_API_URL`

**What it is**: The URL where your backend API is running

**Values to use**:

```bash
# For local development:
VITE_API_URL=http://localhost:3000

# For production (when deployed):
VITE_API_URL=https://api.yourdomain.com

# For staging:
VITE_API_URL=https://api-staging.yourdomain.com
```

**How to add**:
1. Go to: https://github.com/yellowflowersorganics-star/smartcrop-os/settings/secrets/actions
2. Click "New repository secret"
3. Name: `VITE_API_URL`
4. Value: `http://localhost:3000` (for now, update later when deployed)
5. Click "Add secret"

---

## 🔶 Priority 2: AWS Secrets (For Deployment)

### 2. AWS Access Keys

**What they are**: Credentials to access AWS services for deployment

#### **Step 1: Create IAM User**

1. Go to AWS Console: https://console.aws.amazon.com/iam/
2. Click "Users" → "Add users"
3. User name: `smartcrop-cicd-dev`
4. Click "Next"
5. Select "Attach policies directly"
6. Add these policies:
   - `AmazonEC2ContainerRegistryFullAccess` (for ECR)
   - `AmazonECS_FullAccess` (for ECS)
   - `AmazonS3FullAccess` (for S3)
   - `CloudFrontFullAccess` (for CloudFront)
7. Click "Next" → "Create user"

#### **Step 2: Generate Access Key**

1. Click on the created user `smartcrop-cicd-dev`
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose use case: "Application running outside AWS"
6. Click "Next" → "Create access key"
7. **IMPORTANT**: Download the CSV or copy both:
   - Access key ID (starts with `AKIA...`)
   - Secret access key (long random string)

**Example values** (yours will be different):
```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### **Step 3: Create Production IAM User (Separate!)**

**For security, use separate credentials for production:**

1. Repeat Step 1 but name it: `smartcrop-cicd-prod`
2. Generate access key (Step 2)
3. Save these separately as:
   - `AWS_ACCESS_KEY_ID_PROD`
   - `AWS_SECRET_ACCESS_KEY_PROD`

#### **Add to GitHub Secrets**:

```
Name: AWS_ACCESS_KEY_ID
Value: AKIAIOSFODNN7EXAMPLE

Name: AWS_SECRET_ACCESS_KEY
Value: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

Name: AWS_ACCESS_KEY_ID_PROD
Value: AKIAPRODEXAMPLE123

Name: AWS_SECRET_ACCESS_KEY_PROD
Value: prodSecretKeyHere123
```

---

### 3. CloudFront Distribution IDs

**What they are**: IDs for invalidating CloudFront cache after frontend deployment

#### **How to get**:

1. Go to AWS CloudFront Console: https://console.aws.amazon.com/cloudfront/
2. You'll see a list of distributions
3. Copy the "ID" column value (looks like: `E1A2B3C4D5E6FG`)

**If you don't have CloudFront yet**:
- Skip this for now
- Add after setting up CloudFront for frontend hosting

#### **Add to GitHub Secrets**:

```
Name: CLOUDFRONT_DEV_DISTRIBUTION_ID
Value: E1A2B3C4D5E6FG

Name: CLOUDFRONT_PROD_DISTRIBUTION_ID
Value: E7H8I9J0K1L2MN
```

---

## 🔷 Priority 3: Optional Secrets

### 4. Google OAuth Credentials

**What they are**: Credentials for "Sign in with Google" feature

#### **How to get**:

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Click "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Name: `SmartCrop OS`
7. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   https://api.yourdomain.com/api/auth/google/callback
   ```
8. Click "Create"
9. Copy the **Client ID** and **Client Secret**

**Example**:
```
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

#### **Add to GitHub Secrets**:

```
Name: GOOGLE_CLIENT_ID
Value: 123456789-abc123def456.apps.googleusercontent.com

Name: GOOGLE_CLIENT_SECRET
Value: GOCSPX-abc123def456ghi789
```

---

### 5. Twilio Credentials (SMS/WhatsApp)

**What they are**: Credentials for sending SMS and WhatsApp notifications

#### **How to get**:

1. Sign up at: https://www.twilio.com/try-twilio
2. Verify your email and phone
3. Go to Console: https://console.twilio.com/
4. Find on dashboard:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
5. Note your Twilio phone number

**Example**:
```
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd
TWILIO_AUTH_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

#### **For WhatsApp**:

1. In Twilio Console, go to "Messaging" → "Try it out" → "Send a WhatsApp message"
2. Follow setup wizard
3. Your WhatsApp number will be: `+14155238886` (Twilio sandbox)

#### **Add to GitHub Secrets**:

```
Name: TWILIO_ACCOUNT_SID
Value: AC1234567890abcdef1234567890abcd

Name: TWILIO_AUTH_TOKEN
Value: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### 6. Slack Webhook (Deployment Notifications)

**What it is**: URL to send deployment notifications to your Slack channel

#### **How to get**:

1. Go to: https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. App Name: `SmartCrop CI/CD`
4. Choose your workspace
5. Click "Create App"
6. In sidebar, click "Incoming Webhooks"
7. Toggle "Activate Incoming Webhooks" to **On**
8. Scroll down, click "Add New Webhook to Workspace"
9. Choose channel (e.g., `#deployments`)
10. Click "Allow"
11. Copy the Webhook URL (starts with `https://hooks.slack.com/services/...`)

**Example**:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL_HERE
```

#### **Add to GitHub Secret**:

```
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL_HERE
```

#### **Test it**:

```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test notification from SmartCrop OS!"}'
```

---

### 7. Docker Hub Credentials

**What they are**: Credentials to push Docker images to Docker Hub

#### **How to get**:

1. Sign up at: https://hub.docker.com/signup
2. Verify your email
3. Go to: https://hub.docker.com/settings/security
4. Click "New Access Token"
5. Description: `SmartCrop CI/CD`
6. Access permissions: "Read, Write, Delete"
7. Click "Generate"
8. **Copy the token immediately** (you won't see it again!)

**Values**:
```
DOCKERHUB_USERNAME=your-docker-username
DOCKERHUB_TOKEN=dckr_pat_abc123def456ghi789jkl012mno345
```

#### **Add to GitHub Secrets**:

```
Name: DOCKERHUB_USERNAME
Value: your-docker-username

Name: DOCKERHUB_TOKEN
Value: dckr_pat_abc123def456ghi789jkl012mno345
```

---

## 📝 Complete Secrets Template

Copy this template and fill in your values:

```bash
# ============================================
# SmartCrop OS - GitHub Secrets
# ============================================

# Priority 1: Essential (Add Now)
# --------------------------------
VITE_API_URL=http://localhost:3000


# Priority 2: AWS Deployment
# ---------------------------
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_ACCESS_KEY_ID_PROD=
AWS_SECRET_ACCESS_KEY_PROD=
CLOUDFRONT_DEV_DISTRIBUTION_ID=
CLOUDFRONT_PROD_DISTRIBUTION_ID=


# Priority 3: Optional Features
# ------------------------------

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Slack Notifications
SLACK_WEBHOOK_URL=(your_webhook_url_here)

# Docker Hub
DOCKERHUB_USERNAME=
DOCKERHUB_TOKEN=
```

---

## 🚀 Adding Secrets to GitHub

### Method 1: Web Interface (Recommended)

1. Go to: https://github.com/yellowflowersorganics-star/smartcrop-os/settings/secrets/actions

2. For each secret:
   - Click "New repository secret"
   - Enter Name (exactly as shown above)
   - Enter Value (from your template)
   - Click "Add secret"

3. Repeat for all secrets you have values for

### Method 2: GitHub CLI (Faster for Multiple Secrets)

```bash
# Install GitHub CLI if not already: https://cli.github.com/

# Login
gh auth login

# Add secrets from file
gh secret set VITE_API_URL -b "http://localhost:3000"
gh secret set AWS_ACCESS_KEY_ID -b "AKIAIOSFODNN7EXAMPLE"
gh secret set AWS_SECRET_ACCESS_KEY -b "your_secret_here"

# Or from environment variable
export VITE_API_URL="http://localhost:3000"
gh secret set VITE_API_URL -b "$VITE_API_URL"
```

---

## ✅ Verification Checklist

After adding secrets:

- [ ] Navigate to GitHub Secrets page
- [ ] Verify all required secrets are listed
- [ ] Names match exactly (case-sensitive!)
- [ ] No typos in secret names
- [ ] Values are not visible (GitHub hides them)
- [ ] Count matches your requirements:
  - Minimum: 1 secret (VITE_API_URL)
  - For AWS: 7 secrets total
  - All optional: 13+ secrets total

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use separate AWS credentials for dev and prod
- ✅ Rotate secrets every 90 days
- ✅ Use least-privilege IAM policies
- ✅ Store secrets only in GitHub Secrets (never in code)
- ✅ Audit secret access regularly

### ❌ DON'T:
- ❌ Never commit secrets to git
- ❌ Never share secrets in plain text
- ❌ Never use the same credentials for dev and prod
- ❌ Never log secret values
- ❌ Never hardcode secrets in code

---

## 🔄 Updating Secrets

To update an existing secret:

1. Go to: https://github.com/yellowflowersorganics-star/smartcrop-os/settings/secrets/actions
2. Click on the secret name
3. Click "Update secret"
4. Enter new value
5. Click "Update secret"

---

## 🧪 Testing Secrets

After adding secrets, test that CI/CD can access them:

```bash
# Create a test branch
git checkout develop
git checkout -b test/secrets-check

# Make a small change
echo "" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify GitHub secrets are accessible"
git push origin test/secrets-check

# Create PR on GitHub
# Watch Actions tab - should not show "secret not found" errors
```

---

## 📊 Priority Matrix

### Add Right Now (5 minutes):
- ✅ `VITE_API_URL` - Required for frontend to work

### Add This Week (When deploying):
- 🔶 All AWS secrets (6 total)
- 🔶 CloudFront IDs (2 total)

### Add As Features Are Needed:
- 🔷 Google OAuth (when enabling Google login)
- 🔷 Twilio (when enabling SMS/WhatsApp)
- 🔷 Slack (when you want deployment notifications)
- 🔷 Docker Hub (when publishing images publicly)

---

## 🆘 Common Issues

### Issue: "Secret not found" in Actions

**Solution**: Verify secret name matches exactly (case-sensitive)

### Issue: AWS credentials not working

**Solution**: 
1. Check IAM user has correct permissions
2. Verify access key is active
3. Check for typos in secret values

### Issue: Google OAuth fails

**Solution**:
1. Verify redirect URI matches exactly
2. Check OAuth consent screen is configured
3. Ensure credentials are from correct project

---

## 📞 Need Help?

- **GitHub Secrets Docs**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **AWS IAM Guide**: https://docs.aws.amazon.com/IAM/latest/UserGuide/
- **Google OAuth Setup**: https://developers.google.com/identity/protocols/oauth2
- **Twilio Docs**: https://www.twilio.com/docs

---

## 🎯 Quick Start Summary

**Right Now (5 minutes)**:
```bash
# 1. Go to GitHub Secrets page
https://github.com/yellowflowersorganics-star/smartcrop-os/settings/secrets/actions

# 2. Add one secret:
Name: VITE_API_URL
Value: http://localhost:3000

# 3. Click "Add secret"
```

**This Week (When deploying to AWS)**:
- Create AWS IAM users
- Generate access keys
- Add 6 AWS-related secrets

**As Needed (When enabling features)**:
- Set up Google OAuth
- Configure Twilio
- Create Slack webhook
- Get Docker Hub token

---

**✅ Start with just `VITE_API_URL` and add others as you need them!**

*Last updated: November 2025*

