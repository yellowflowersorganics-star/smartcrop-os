# 🔌 Phase 3: Third-Party Integrations

**Estimated Time**: 1-1.5 hours  
**Goal**: Set up authentication and communication integrations

---

## 📋 Phase Overview

This phase connects CropWise to essential third-party services:
- ✅ Google OAuth for user authentication
- ✅ Twilio for SMS notifications
- ✅ Slack for team notifications
- ✅ WhatsApp for customer communication

---

## 📊 Progress Tracker

Track your progress through this phase:

### Step 6: Google OAuth Setup
- [ ] **6.1**: Google Cloud project created
- [ ] **6.2**: OAuth consent screen configured
- [ ] **6.3**: OAuth 2.0 credentials created
- [ ] **6.4**: Redirect URIs added for all environments
- [ ] **6.5**: Client ID and Secret added to GitHub Secrets
- [ ] **6.6**: Google Sign-In tested on development

### Step 7: Communication Setup (Optional)
- [ ] **7.1**: Twilio account created
- [ ] **7.2**: Phone number purchased
- [ ] **7.3**: SMS notifications tested
- [ ] **7.4**: Slack webhook configured
- [ ] **7.5**: WhatsApp Business API applied
- [ ] **7.6**: All notification channels tested

**Phase Complete**: [ ] All checkboxes above are checked ✅

---

## 🎯 Steps in This Phase

### Step 6: Google OAuth Setup (Required)
**📄 Detailed Guide**: [`06-google-oauth-setup.md`](06-google-oauth-setup.md)  
**Time**: 20-30 minutes  
**Cost**: Free

**What you'll do:**
- Create Google Cloud project
- Configure OAuth consent screen
- Create OAuth 2.0 credentials
- Add authorized redirect URIs
- Test Google Sign-In

**Why Google OAuth?**
- Secure authentication without managing passwords
- Faster user registration
- Trusted by users
- Reduces development effort

**Redirect URIs needed:**
```
Development:
- http://localhost:5173/auth/google/callback
- http://localhost:3000/auth/google/callback

Staging:
- https://cropwise-stage-frontend.s3.ap-south-1.amazonaws.com/auth/google/callback
- https://cropwise-stage-alb-xxx.ap-south-1.elb.amazonaws.com/auth/google/callback

Production:
- https://app.cropwise.io/auth/google/callback
- https://api.cropwise.io/auth/google/callback
```

**Outputs:**
- ✅ Google Client ID
- ✅ Google Client Secret
- ✅ OAuth working on all environments

**GitHub Secrets to Add:**
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

**Quick Validation:**
```bash
# Start backend locally
cd backend
npm start

# Visit in browser
http://localhost:5173/login

# Click "Sign in with Google"
# Should redirect to Google login
# After login, should redirect back with user info
```

---

### Step 7: Communication Integrations (Optional)
**📄 Detailed Guide**: [`07-communication-setup.md`](07-communication-setup.md)  
**Time**: 45-60 minutes  
**Cost**: Variable (Pay-as-you-go)

**What you'll do:**
- Set up Twilio for SMS notifications
- Configure Slack webhooks
- Apply for WhatsApp Business API
- Test all notification channels

#### 7.1 Twilio SMS Setup

**Cost**: ~$1/month base + $0.0075 per SMS

**What it enables:**
- Emergency alerts to farm managers
- Task reminders
- Harvest notifications
- Low stock alerts

**Quick Setup:**
```bash
# 1. Create account at https://www.twilio.com/
# 2. Get phone number
# 3. Add to GitHub Secrets:

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Test:**
```bash
# Test SMS endpoint
curl -X POST http://localhost:3000/api/notifications/test-sms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919354484998",
    "message": "Test SMS from CropWise"
  }'
```

---

#### 7.2 Slack Integration

**Cost**: Free

**What it enables:**
- Team notifications for critical events
- Task assignments
- Deployment notifications
- Error alerts

**Quick Setup:**
```bash
# 1. Create Slack workspace (if needed)
# 2. Create Incoming Webhook at:
#    https://api.slack.com/apps → Create New App
#    → Incoming Webhooks → Add New Webhook
# 3. Add to GitHub Secrets:

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

**Test:**
```bash
# Test Slack notification
curl -X POST http://localhost:3000/api/notifications/test-slack \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test notification from CropWise",
    "channel": "#alerts"
  }'
```

---

#### 7.3 WhatsApp Business API

**Cost**: Free (Meta) + message costs (vary by country)

**What it enables:**
- Customer order updates
- Delivery notifications
- Quality reports
- Payment reminders

**Setup Process:**
```
1. Apply for WhatsApp Business API
   - Visit: https://business.whatsapp.com/
   - Or use Twilio WhatsApp: https://www.twilio.com/whatsapp

2. Verify business information
   - Business name
   - Business address
   - Business website

3. Get WhatsApp-enabled phone number
   - Must be different from personal WhatsApp

4. Configure webhook endpoints
   - Webhook URL: https://api.cropwise.io/webhooks/whatsapp
   - Verify token: (generate random string)

5. Add to GitHub Secrets:
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxx
   WHATSAPP_VERIFY_TOKEN=your-verify-token
```

**Note**: WhatsApp approval takes 1-3 business days.

---

## 🔐 Security Considerations

### Storing Credentials

**✅ DO:**
- Store all API keys in GitHub Secrets
- Use environment-specific credentials
- Rotate credentials every 90 days
- Use AWS Secrets Manager for production
- Enable 2FA on all third-party accounts

**❌ DON'T:**
- Commit credentials to git (ever!)
- Share credentials in Slack/email
- Use same credentials across environments
- Store in plain text .env files committed to git

### GitHub Secrets Organization

```
# Development
GOOGLE_CLIENT_ID_DEV
GOOGLE_CLIENT_SECRET_DEV
TWILIO_ACCOUNT_SID_DEV
TWILIO_AUTH_TOKEN_DEV

# Staging
GOOGLE_CLIENT_ID_STAGE
GOOGLE_CLIENT_SECRET_STAGE
TWILIO_ACCOUNT_SID_STAGE
TWILIO_AUTH_TOKEN_STAGE

# Production
GOOGLE_CLIENT_ID_PROD
GOOGLE_CLIENT_SECRET_PROD
TWILIO_ACCOUNT_SID_PROD
TWILIO_AUTH_TOKEN_PROD
```

---

## 💰 Cost Breakdown

**Monthly Costs (Estimated):**

| Service | Free Tier | Typical Usage | Monthly Cost |
|---------|-----------|---------------|--------------|
| **Google OAuth** | Unlimited | Unlimited | $0 |
| **Twilio SMS** | $15 credit | 100 SMS/month | ~$2 |
| **Slack** | Free plan | Unlimited messages | $0 |
| **WhatsApp** | Meta free | 1000 messages/month | ~$5 |
| **Total** | | | **~$7/month** |

**Cost Optimization:**
- Use free tiers where available
- Batch notifications to reduce SMS costs
- Use in-app notifications as primary method
- SMS/WhatsApp only for critical alerts

---

## 🔍 Troubleshooting

### Google OAuth: "redirect_uri_mismatch"
```
Error: redirect_uri_mismatch

Solution:
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Edit OAuth 2.0 Client ID
4. Add exact redirect URI from error message
5. Wait 5 minutes for changes to propagate
```

### Twilio: "Authentication Error"
```
Error: 20003 - Authenticate

Solution:
1. Verify TWILIO_ACCOUNT_SID is correct
2. Verify TWILIO_AUTH_TOKEN is correct
3. Check token hasn't been regenerated
4. Try creating new API key in Twilio console
```

### Slack: "invalid_payload"
```
Error: invalid_payload

Solution:
1. Check webhook URL is correct
2. Verify JSON payload format
3. Ensure Content-Type: application/json header
4. Test with curl first before app integration
```

### WhatsApp: "Template not approved"
```
Error: Message template not approved

Solution:
1. WhatsApp requires pre-approved message templates
2. Create templates in WhatsApp Manager
3. Wait for approval (24-48 hours)
4. Use approved template format exactly
```

---

## 📝 Phase Checklist

Before moving to Phase 4, verify:

- [ ] Google Sign-In button appears on login page
- [ ] Can login with Google account
- [ ] User profile shows Google avatar
- [ ] SMS notifications work (if enabled)
- [ ] Slack notifications appear in channel (if enabled)
- [ ] All credentials stored in GitHub Secrets
- [ ] No credentials in git history
- [ ] Tested on development environment

---

## 🎯 Next Steps

Once this phase is complete:

**→ Continue to [Phase 4: Production Deployment](PHASE-4-PRODUCTION-DEPLOYMENT.md)**

This will deploy to staging, production, and set up monitoring.

---

## 📚 Related Documentation

- [Security Guide](../operations/SECURITY_GUIDE.md)
- [Secrets Management](../operations/SECRETS_MANAGEMENT_GUIDE.md)
- [WhatsApp SMS Setup](../features/integrations/WHATSAPP_SMS_SETUP.md)
- [Google OAuth Checklist](../features/integrations/GOOGLE_OAUTH_CHECKLIST.md)

---

## 💡 Tips

**For Teams:**
- One person should handle all integrations
- Document credentials location (password manager)
- Set up shared Slack channel for testing
- Create test phone numbers for SMS testing

**For Solo Developers:**
- Start with Google OAuth only
- Add other integrations as needed
- Use free tiers initially
- Monitor usage to avoid surprise bills

**Testing Best Practices:**
- Test on development first
- Use test credentials for development
- Use real credentials only for production
- Set up rate limiting to avoid abuse
- Monitor API usage regularly

**Common Mistakes:**
- ❌ Using production credentials in development
- ❌ Not adding all redirect URIs
- ❌ Committing .env files
- ❌ Not rotating credentials regularly
- ❌ Sharing credentials via insecure channels

---

**Last Updated**: November 16, 2025  
**Phase Duration**: ~1-1.5 hours  
**Difficulty**: ⭐⭐ Medium  
**Prerequisites**: Phase 1 & 2 completed

