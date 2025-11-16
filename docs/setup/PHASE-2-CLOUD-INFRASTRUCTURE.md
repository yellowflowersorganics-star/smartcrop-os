# ☁️ Phase 2: Cloud Infrastructure Setup

**Estimated Time**: 2-3 hours  
**Goal**: Set up AWS infrastructure for development environment

---

## 📋 Phase Overview

This phase sets up your cloud infrastructure:
- ✅ AWS account configured with IAM users
- ✅ Development infrastructure deployed (ECS, ECR, ALB)
- ✅ PostgreSQL databases for all environments (dev, staging, prod)
- ✅ CI/CD pipeline deploying to development

---

## 📊 Progress Tracker

Track your progress through this phase:

### Step 3: AWS Account Setup
- [ ] **3.1**: AWS account created/verified
- [ ] **3.2**: IAM user created with admin access
- [ ] **3.3**: AWS CLI installed and configured
- [ ] **3.4**: Billing alerts configured
- [ ] **3.5**: Cost monitoring dashboard created

### Step 4: AWS Infrastructure (Development)
- [ ] **4.1**: ECR repositories created (backend, frontend)
- [ ] **4.2**: ECS cluster created (cropwise-dev-cluster)
- [ ] **4.3**: Application Load Balancer configured
- [ ] **4.4**: S3 bucket + CloudFront for frontend
- [ ] **4.5**: First deployment to development successful

### Step 5: Database Setup
- [ ] **5.1**: Development RDS instance created
- [ ] **5.2**: Staging RDS instance created
- [ ] **5.3**: Production RDS instance created
- [ ] **5.4**: Security groups configured
- [ ] **5.5**: Database migrations run on all environments

**Phase Complete**: [ ] All checkboxes above are checked ✅

---

## 🎯 Steps in This Phase

### Step 3: AWS Account Setup
**📄 Detailed Guide**: [`03-aws-account-setup.md`](03-aws-account-setup.md)  
**Time**: 20 minutes  
**Cost**: Free (AWS Free Tier)

**What you'll do:**
- Create AWS account (if needed)
- Set up IAM user with appropriate permissions
- Install and configure AWS CLI
- Enable billing alerts
- Set up cost monitoring

**Outputs:**
- ✅ AWS account ready
- ✅ IAM user with programmatic access
- ✅ AWS CLI working locally
- ✅ Cost alerts configured

**Quick Validation:**
```bash
# Test AWS CLI
aws sts get-caller-identity

# Should show your AWS account ID and IAM user
```

**Cost Alert:**
- Set billing alarm for $50/month initially
- Adjust based on your budget

---

### Step 4: AWS Infrastructure (Development)
**📄 Detailed Guide**: [`04-aws-infrastructure-dev.md`](04-aws-infrastructure-dev.md)  
**Time**: 60-90 minutes  
**Cost**: ~$30-50/month (dev environment)

**What you'll do:**
- Create ECR repositories for Docker images
- Set up ECS Fargate cluster
- Configure Application Load Balancer
- Create S3 bucket for frontend hosting
- Set up CloudFront CDN
- Deploy first version to development

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│              CloudFront (CDN)                   │
│         Frontend: *.cloudfront.net              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                 S3 Bucket                       │
│         Static Frontend Files                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         Application Load Balancer               │
│        Backend: cropwise-dev-alb-xxx            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              ECS Fargate Cluster                │
│  ┌──────────────────────────────────────────┐   │
│  │  Backend Service (2 tasks)               │   │
│  │  - CPU: 256, Memory: 512MB               │   │
│  │  - Auto-scaling enabled                  │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Resource Naming:**
| Resource | Development | Staging | Production |
|----------|-------------|---------|------------|
| ECR Repo | cropwise-backend, cropwise-frontend | Same | Same |
| ECS Cluster | cropwise-dev-cluster | cropwise-stage-cluster | cropwise-prod-cluster |
| ALB | cropwise-dev-alb | cropwise-stage-alb | cropwise-prod-alb |
| S3 Bucket | cropwise-dev-frontend | cropwise-stage-frontend | cropwise-prod-frontend |

**Outputs:**
- ✅ Docker images in ECR
- ✅ Backend API accessible via ALB
- ✅ Frontend accessible via CloudFront
- ✅ Development environment fully functional

**Quick Validation:**
```bash
# Check ECR repositories
aws ecr describe-repositories --region ap-south-1

# Check ECS cluster
aws ecs describe-clusters --clusters cropwise-dev-cluster --region ap-south-1

# Check ALB
aws elbv2 describe-load-balancers --region ap-south-1 | grep cropwise-dev
```

---

### Step 5: AWS Database Setup
**📄 Detailed Guide**: [`05-aws-database-setup.md`](05-aws-database-setup.md)  
**Time**: 30-45 minutes  
**Cost**: ~$15-30/month per database

**What you'll do:**
- Create RDS PostgreSQL instance for development
- Create RDS PostgreSQL instance for staging
- Create RDS PostgreSQL instance for production
- Configure security groups for database access
- Set up automated backups
- Run database migrations

**Database Specifications:**

| Environment | Instance Class | Storage | Backups | Multi-AZ |
|-------------|---------------|---------|---------|----------|
| Development | db.t3.micro | 20GB | 7 days | No |
| Staging | db.t3.small | 50GB | 14 days | No |
| Production | db.t3.medium | 100GB | 30 days | Yes |

**Database Identifiers:**
- Development: `cropwise-dev-db`
- Staging: `cropwise-stage-db`
- Production: `cropwise-prod-db`

**Outputs:**
- ✅ Three PostgreSQL databases created
- ✅ Connection strings stored in GitHub Secrets
- ✅ Migrations run successfully
- ✅ Backups configured

**Quick Validation:**
```bash
# Test database connection
psql -h cropwise-dev-db.xxxxxx.ap-south-1.rds.amazonaws.com \
     -U cropwise_admin -d cropwise_dev

# Run migrations
cd backend
npm run migrate:dev
```

---

## 💰 Cost Breakdown

**Expected Monthly Costs (Development Only):**

| Service | Resource | Monthly Cost |
|---------|----------|--------------|
| ECS Fargate | 2 tasks @ 0.25 vCPU, 0.5GB | ~$15 |
| RDS PostgreSQL | db.t3.micro | ~$15 |
| ALB | Application Load Balancer | ~$20 |
| S3 + CloudFront | Frontend hosting + CDN | ~$5 |
| Data Transfer | Outbound data | ~$5 |
| **Total** | | **~$60/month** |

**All Environments (Dev + Staging + Production):**
- Development: ~$60/month
- Staging: ~$80/month
- Production: ~$150/month
- **Total**: ~$290/month

**Cost Optimization Tips:**
- Use t3.micro for development databases
- Stop development environment when not in use
- Set up auto-scaling to scale to zero overnight
- Use CloudWatch to monitor unused resources
- Delete old ECR images regularly

---

## 🔍 Troubleshooting

### Issue: AWS CLI not configured
```bash
# Configure AWS CLI
aws configure

# Enter your credentials:
# AWS Access Key ID: XXXXXXXXXXXXXXXXXXXX
# AWS Secret Access Key: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# Default region: ap-south-1
# Default output format: json
```

### Issue: ECR push fails
```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.ap-south-1.amazonaws.com
```

### Issue: ECS tasks failing to start
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster cropwise-dev-cluster \
  --tasks <task-id> \
  --region ap-south-1

# Check CloudWatch logs
aws logs tail /ecs/cropwise-dev-backend --follow --region ap-south-1
```

### Issue: RDS connection timeout
- Check security group allows inbound traffic on port 5432
- Check VPC and subnet configuration
- Verify database is publicly accessible (for dev) or in same VPC as ECS

### Issue: High AWS costs
```bash
# Check costs by service
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

---

## 📝 Phase Checklist

Before moving to Phase 3, verify:

- [ ] AWS CLI working with correct credentials
- [ ] Can push Docker images to ECR
- [ ] ECS tasks running and healthy
- [ ] ALB health checks passing
- [ ] Frontend accessible via CloudFront URL
- [ ] Backend API responding to requests
- [ ] All three databases created and accessible
- [ ] Database migrations run successfully
- [ ] GitHub Actions can deploy to development
- [ ] Billing alerts configured

---

## 🎯 Next Steps

Once this phase is complete:

**→ Continue to [Phase 3: Integrations](PHASE-3-INTEGRATIONS.md)**

This will set up Google OAuth for authentication and communication channels (Twilio, Slack, WhatsApp).

---

## 📚 Related Documentation

- [AWS Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](../deployment/TROUBLESHOOTING.md)
- [Architecture Overview](../architecture/ARCHITECTURE_OVERVIEW.md)

---

## 💡 Tips

**For Teams:**
- One person should complete AWS setup first
- Share AWS account credentials securely (use AWS Secrets Manager)
- Document any custom configurations
- Set up CloudWatch dashboards for team visibility

**For Solo Developers:**
- Start with development environment only
- Add staging/production later when needed
- Use AWS Free Tier where possible
- Set strict cost limits

**Security Best Practices:**
- Never commit AWS credentials to git
- Use IAM roles for ECS tasks (not hardcoded keys)
- Enable MFA on AWS root account
- Rotate IAM access keys every 90 days
- Use AWS Secrets Manager for sensitive data

**Common Mistakes:**
- ❌ Using same database for all environments
- ❌ Not setting cost alerts
- ❌ Making development database publicly accessible in production
- ❌ Not tagging AWS resources (makes cost tracking difficult)
- ❌ Forgetting to enable automated backups

---

**Last Updated**: November 16, 2025  
**Phase Duration**: ~2-3 hours  
**Difficulty**: ⭐⭐⭐ High  
**Prerequisites**: Phase 1 completed

