# 🚀 Phase 4: Production Deployment

**Estimated Time**: 2-3 hours  
**Goal**: Deploy to staging and production with full monitoring

---

## 📋 Phase Overview

This final phase takes you to production:
- ✅ Staging environment deployed and tested
- ✅ Production environment deployed
- ✅ Monitoring and alerts configured
- ✅ Security hardening complete
- ✅ Ready for real users!

---

## 📊 Progress Tracker

Track your progress through this phase:

### Step 8: Staging Deployment
- [ ] **8.1**: Staging AWS infrastructure created
- [ ] **8.2**: Staging database configured
- [ ] **8.3**: GitHub Actions deploys to staging
- [ ] **8.4**: Staging environment smoke tested
- [ ] **8.5**: End-to-end tests passing on staging

### Step 9: Production Deployment
- [ ] **9.1**: Production AWS infrastructure created
- [ ] **9.2**: Production database configured
- [ ] **9.3**: Custom domain configured (optional)
- [ ] **9.4**: SSL certificates installed
- [ ] **9.5**: GitHub Actions deploys to production
- [ ] **9.6**: Production smoke tested

### Step 10: Monitoring & Security
- [ ] **10.1**: CloudWatch alarms configured
- [ ] **10.2**: Log aggregation set up
- [ ] **10.3**: AWS WAF enabled
- [ ] **10.4**: Backup automation verified
- [ ] **10.5**: Security checklist completed
- [ ] **10.6**: Cost monitoring dashboards created

**Phase Complete**: [ ] All checkboxes above are checked ✅

---

## 🎯 Steps in This Phase

### Step 8: Staging Environment Deployment
**📄 Detailed Guide**: [`08-staging-deployment.md`](08-staging-deployment.md)  
**Time**: 45-60 minutes  
**Cost**: ~$80/month

**What you'll do:**
- Create staging AWS resources (ECS, ALB, S3, CloudFront)
- Configure staging RDS database
- Set up GitHub Actions workflow for staging
- Run automated tests on staging
- Verify staging environment

**Why Staging?**
- Test changes before production
- QA validation environment
- Integration testing
- Performance testing
- Team review environment

**Staging Specifications:**

| Resource | Configuration |
|----------|--------------|
| ECS Cluster | cropwise-stage-cluster |
| Task Size | CPU: 512, Memory: 1024MB |
| Tasks | Min: 1, Max: 3 |
| RDS Instance | db.t3.small, 50GB |
| ALB | cropwise-stage-alb |
| S3/CloudFront | cropwise-stage-frontend |

**Deployment Workflow:**
```
┌──────────────────┐
│  Pull Request    │
│  to 'staging'    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Code Review    │  ← Team approval required
│   + Tests Pass   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Merge to        │
│  'staging'       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  GitHub Actions  │  ← Auto-deploy triggered
│  Build & Deploy  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Deploy to       │
│  AWS Staging     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Run E2E Tests   │  ← Automated testing
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Slack           │  ← Team notified
│  Notification    │
└──────────────────┘
```

**Outputs:**
- ✅ Staging environment fully functional
- ✅ Accessible at staging URL
- ✅ Automated tests passing
- ✅ Ready for QA testing

**Quick Validation:**
```bash
# Check staging deployment
curl https://cropwise-stage-alb-xxx.ap-south-1.elb.amazonaws.com/health

# Expected response:
# {"status": "ok", "environment": "staging"}

# Test frontend
# Visit: https://d1234567890abc.cloudfront.net
```

---

### Step 9: Production Environment Deployment
**📄 Detailed Guide**: [`09-production-deployment.md`](09-production-deployment.md)  
**Time**: 60-90 minutes  
**Cost**: ~$150/month

**What you'll do:**
- Create production AWS resources
- Configure production RDS database (Multi-AZ)
- Set up custom domain (optional)
- Install SSL certificates
- Deploy to production
- Configure DNS

**Production Specifications:**

| Resource | Configuration |
|----------|--------------|
| ECS Cluster | cropwise-prod-cluster |
| Task Size | CPU: 1024, Memory: 2048MB |
| Tasks | Min: 2, Max: 10 |
| RDS Instance | db.t3.medium, 100GB, Multi-AZ |
| ALB | cropwise-prod-alb |
| S3/CloudFront | cropwise-prod-frontend |
| Domain | app.cropwise.io, api.cropwise.io |
| SSL | AWS Certificate Manager |

**Deployment Workflow:**
```
┌──────────────────┐
│  Pull Request    │
│  to 'main'       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Staging Tests   │  ← Must pass on staging first
│  Verified        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Code Review     │  ← 2+ approvals required
│  + Manager OK    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Merge to        │
│  'main'          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  GitHub Actions  │  ← Manual approval step
│  Approval Gate   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Build & Deploy  │
│  to Production   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Health Checks   │  ← Automated verification
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Slack + Email   │  ← Deployment notification
│  Notification    │
└──────────────────┘
```

**Custom Domain Setup** (Optional):

If you own a domain (e.g., cropwise.io):

```bash
# 1. Request SSL certificate in AWS Certificate Manager
#    - Domain: *.cropwise.io
#    - Validation: DNS validation

# 2. Add DNS records in your domain registrar
#    Type: CNAME
#    Name: _xxxxxxxxxxxxxxxxxxxxx.cropwise.io
#    Value: _yyyyyyyyyyyyyyyyyyyyyy.acm-validations.aws

# 3. Create Route53 hosted zone (optional)
aws route53 create-hosted-zone \
  --name cropwise.io \
  --caller-reference $(date +%s)

# 4. Add A records pointing to CloudFront and ALB
#    Frontend: app.cropwise.io → CloudFront distribution
#    Backend: api.cropwise.io → ALB
```

**DNS Records:**
```
A     app.cropwise.io     → d1234567890abc.cloudfront.net
A     api.cropwise.io     → cropwise-prod-alb-xxx.ap-south-1.elb.amazonaws.com
CNAME www.cropwise.io     → app.cropwise.io
```

**Outputs:**
- ✅ Production environment live
- ✅ Accessible at custom domain (or AWS URLs)
- ✅ HTTPS enabled
- ✅ High availability (Multi-AZ)
- ✅ Ready for real users!

---

### Step 10: Monitoring & Security
**📄 Detailed Guide**: [`10-monitoring-security.md`](10-monitoring-security.md)  
**Time**: 45-60 minutes  
**Cost**: ~$10-20/month

**What you'll do:**
- Set up CloudWatch alarms
- Configure log aggregation
- Enable AWS WAF (Web Application Firewall)
- Set up automated backups
- Configure cost alerts
- Complete security checklist

#### 10.1 CloudWatch Alarms

**Critical Alarms to Set Up:**

```bash
# 1. High CPU Usage
aws cloudwatch put-metric-alarm \
  --alarm-name cropwise-prod-high-cpu \
  --alarm-description "ECS CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# 2. Database Connections
aws cloudwatch put-metric-alarm \
  --alarm-name cropwise-prod-db-connections \
  --alarm-description "RDS connections > 80%" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# 3. High Error Rate
aws cloudwatch put-metric-alarm \
  --alarm-name cropwise-prod-5xx-errors \
  --alarm-description "5xx errors > 10/min" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

**Recommended Alarms:**
- ECS CPU > 80%
- ECS Memory > 80%
- ALB 5xx errors > 10/min
- ALB 4xx errors > 100/min
- RDS CPU > 80%
- RDS Storage < 10GB free
- RDS connections > 80% of max
- Lambda errors > 5/min

---

#### 10.2 Log Aggregation

**CloudWatch Log Groups:**
```
/ecs/cropwise-prod-backend
/ecs/cropwise-prod-frontend
/aws/lambda/cropwise-prod-*
/aws/rds/instance/cropwise-prod-db/error
```

**Log Retention:**
- Development: 7 days
- Staging: 14 days
- Production: 30 days (or longer for compliance)

**Log Insights Queries:**

```sql
-- Find all errors in last hour
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

-- Find slow API requests
fields @timestamp, request_uri, response_time
| filter response_time > 1000
| sort response_time desc

-- Count errors by endpoint
fields request_uri
| filter status_code >= 500
| stats count() by request_uri
```

---

#### 10.3 AWS WAF (Web Application Firewall)

**Protection Rules:**
```bash
# Create Web ACL
aws wafv2 create-web-acl \
  --name cropwise-prod-waf \
  --scope REGIONAL \
  --region ap-south-1 \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

**Recommended Rules:**
- ✅ Rate limiting (max 2000 requests per IP per 5 minutes)
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Known bad inputs
- ✅ Geo-blocking (block specific countries if needed)

**Cost**: ~$5/month + $0.60 per million requests

---

#### 10.4 Backup Strategy

**RDS Automated Backups:**
- Development: 7 days retention
- Staging: 14 days retention
- Production: 30 days retention
- Backup window: 03:00-04:00 UTC (off-peak hours)

**S3 Versioning:**
```bash
# Enable versioning on S3 buckets
aws s3api put-bucket-versioning \
  --bucket cropwise-prod-frontend \
  --versioning-configuration Status=Enabled
```

**Database Manual Snapshots:**
```bash
# Create manual snapshot before major changes
aws rds create-db-snapshot \
  --db-instance-identifier cropwise-prod-db \
  --db-snapshot-identifier cropwise-prod-pre-deployment-$(date +%Y%m%d)
```

---

## 💰 Total Cost Breakdown

**Monthly Costs (All Environments):**

| Environment | ECS | RDS | ALB | S3/CF | Other | Total |
|-------------|-----|-----|-----|-------|-------|-------|
| Development | $15 | $15 | $20 | $5 | $5 | **$60** |
| Staging | $25 | $30 | $20 | $5 | $10 | **$90** |
| Production | $60 | $50 | $25 | $10 | $20 | **$165** |
| **Total** | | | | | | **$315/month** |

**Additional Costs:**
- Domain: ~$12/year
- SSL: Free (AWS Certificate Manager)
- Monitoring: ~$10/month
- Backups: ~$5/month
- **Grand Total**: ~$330/month

**Cost Optimization:**
- Use Savings Plans for 20-40% savings
- Reserved Instances for RDS (up to 60% savings)
- Auto-scaling to match demand
- Delete unused resources weekly

---

## 🔒 Security Checklist

### Before Going Live

- [ ] **Access Control**
  - [ ] MFA enabled on AWS root account
  - [ ] IAM users have minimal permissions
  - [ ] No hardcoded credentials in code
  - [ ] All secrets in AWS Secrets Manager

- [ ] **Network Security**
  - [ ] Security groups configured (least privilege)
  - [ ] VPC configured with private subnets
  - [ ] ALB has HTTPS listener only
  - [ ] RDS not publicly accessible

- [ ] **Application Security**
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] SQL injection protection
  - [ ] XSS protection headers
  - [ ] CORS configured properly

- [ ] **Data Security**
  - [ ] Passwords hashed (bcrypt)
  - [ ] Sensitive data encrypted at rest
  - [ ] TLS 1.2+ for data in transit
  - [ ] Regular security audits scheduled

- [ ] **Monitoring**
  - [ ] CloudWatch alarms configured
  - [ ] Log aggregation working
  - [ ] Error tracking (Sentry/Rollbar)
  - [ ] Uptime monitoring (UptimeRobot)

---

## 🔍 Troubleshooting

### Deployment Failed on Production
```bash
# Check GitHub Actions logs
# Visit: https://github.com/your-org/cropwise/actions

# Check ECS task logs
aws logs tail /ecs/cropwise-prod-backend --follow --region ap-south-1

# Check task status
aws ecs describe-tasks \
  --cluster cropwise-prod-cluster \
  --tasks $(aws ecs list-tasks --cluster cropwise-prod-cluster --query 'taskArns[0]' --output text) \
  --region ap-south-1
```

### High CPU Usage
```bash
# Check current CPU usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=cropwise-prod-backend \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Scale up temporarily
aws ecs update-service \
  --cluster cropwise-prod-cluster \
  --service cropwise-prod-backend \
  --desired-count 4
```

### Database Connection Issues
```bash
# Check database status
aws rds describe-db-instances \
  --db-instance-identifier cropwise-prod-db \
  --query 'DBInstances[0].DBInstanceStatus'

# Check connections
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=cropwise-prod-db \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

---

## 📝 Phase Checklist

Final verification before launch:

### Staging Environment
- [ ] Accessible via staging URL
- [ ] All features work correctly
- [ ] QA team tested thoroughly
- [ ] Performance acceptable
- [ ] No console errors

### Production Environment
- [ ] Accessible via production URL (or custom domain)
- [ ] HTTPS working correctly
- [ ] Database migrations successful
- [ ] All integrations working (Google OAuth, Twilio, etc.)
- [ ] Can create account and login
- [ ] All core features functional
- [ ] Performance acceptable under load

### Monitoring & Security
- [ ] CloudWatch alarms firing correctly
- [ ] Logs visible in CloudWatch
- [ ] AWS WAF protecting application
- [ ] Backups running automatically
- [ ] Cost alerts configured
- [ ] Security checklist completed
- [ ] Team trained on incident response

---

## 🎉 Congratulations!

You've completed the full setup! Your CropWise platform is now:
- ✅ Running in production
- ✅ Fully monitored
- ✅ Secured and protected
- ✅ Backed up automatically
- ✅ Ready for real users!

---

## 🎯 What's Next?

### Immediate Next Steps
1. **Add Users**: Invite your team and first customers
2. **Monitor**: Watch dashboards for first few days
3. **Document**: Add any custom configurations to team wiki
4. **Train**: Ensure team knows how to use the platform

### Ongoing Maintenance
- Review AWS costs weekly
- Check CloudWatch alarms daily
- Update dependencies monthly
- Review security quarterly
- Conduct backup tests quarterly

### Feature Development
- Follow Git workflow for new features
- Test on development first
- Deploy to staging for QA
- Deploy to production after approval

---

## 📚 Related Documentation

- [Admin Guide](../operations/ADMIN_GUIDE.md) - Day-to-day operations
- [Troubleshooting](../deployment/TROUBLESHOOTING.md) - Common issues
- [Security Guide](../operations/SECURITY_GUIDE.md) - Security best practices
- [Release Process](../deployment/RELEASE_PROCESS.md) - How to release updates

---

## 🆘 Need Help?

### Support Channels
- 📧 Email: support@cropwise.io
- 📱 Phone: +91-9354484998
- 💬 Community Forum: community.cropwise.io
- 🐛 GitHub Issues: github.com/yellowflowersorganics-star/cropwise/issues

### Emergency Contacts
- 🚨 Production Down: +91-9354484998
- 🔒 Security Issue: security@cropwise.io
- 💰 Billing Issue: billing@cropwise.io

---

**Last Updated**: November 16, 2025  
**Phase Duration**: ~2-3 hours  
**Difficulty**: ⭐⭐⭐⭐ Expert  
**Prerequisites**: Phase 1, 2, & 3 completed

**🎊 Welcome to production! Happy farming! 🌱**

