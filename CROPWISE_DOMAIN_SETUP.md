# 🌾 CropWise.io Domain Setup Guide

Complete guide for setting up your cropwise.io domain with AWS, SSL, and CloudFront.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Registered `cropwise.io` domain (Namecheap, Google Domains, etc.)
- ✅ Access to your domain registrar's DNS settings
- ✅ AWS account with deployed application
- ✅ GitHub account with repository access

---

## 🎯 Architecture Overview

### **Current Setup (Without Domain):**
```
Frontend: http://cropwise-dev-frontend.s3-website.ap-south-1.amazonaws.com
Backend:  http://65.0.87.98:3000
```

### **Target Setup (With Domain):**
```
Frontend:     https://cropwise.io  or  https://www.cropwise.io
Backend API:  https://api.cropwise.io
Admin Panel:  https://admin.cropwise.io (optional)
Docs:         https://docs.cropwise.io (optional)
```

---

## 🚀 Step-by-Step Setup

## Part 1: SSL Certificate (AWS Certificate Manager)

### **1.1 Request SSL Certificate**

👉 https://console.aws.amazon.com/acm/home?region=ap-south-1

**Important:** CloudFront requires certificates in `ap-south-1` region!

1. Click **"Request certificate"**
2. Select **"Request a public certificate"**
3. Click **"Next"**

**Add domain names:**
```
cropwise.io
*.cropwise.io
```

4. Select validation method: **DNS validation** (recommended)
5. Click **"Request"**

### **1.2 Validate Domain Ownership**

1. After requesting, click on the certificate
2. You'll see CNAME records that need to be added to DNS
3. For each domain, note:
   - **CNAME Name:** `_abc123def.cropwise.io`
   - **CNAME Value:** `_xyz789.acm-validations.aws.`

4. Add these CNAME records to your domain registrar (see Part 2)
5. Wait 5-30 minutes for validation to complete
6. Certificate status will change to **"Issued"** ✅

---

## Part 2: DNS Configuration

### **Option A: Using Namecheap**

1. Go to: https://ap.www.namecheap.com/domains/list/
2. Click **"Manage"** next to cropwise.io
3. Go to **"Advanced DNS"** tab

**Add these records:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME Record | _abc123def | _xyz789.acm-validations.aws. | Automatic |
| CNAME Record | www | dxxxxx.cloudfront.net | Automatic |
| CNAME Record | api | cropwise-dev-alb-xxxxx.ap-south-1.elb.amazonaws.com | Automatic |
| A Record | @ | (CloudFront IP via Alias) | Automatic |

### **Option B: Using Route 53 (Recommended for AWS)**

1. Create hosted zone: https://console.aws.amazon.com/route53/v2/hostedzones
2. Click **"Create hosted zone"**
3. Domain name: `cropwise.io`
4. Type: **Public hosted zone**
5. Click **"Create"**

**Update nameservers at your registrar:**
- Copy the 4 NS records from Route 53
- Update nameservers at your domain registrar

**Benefits:**
- ✅ Better integration with AWS services
- ✅ Automatic alias records for CloudFront/ALB
- ✅ Health checks and failover
- ✅ Faster propagation

---

## Part 3: CloudFront Distribution (Frontend)

### **3.1 Create CloudFront Distribution**

👉 https://console.aws.amazon.com/cloudfront/v3/home

1. Click **"Create distribution"**

**Origin settings:**
```
Origin domain: cropwise-dev-frontend.s3-website.ap-south-1.amazonaws.com
Origin path: (leave empty)
Name: S3-cropwise-frontend
Protocol: HTTP only (S3 website endpoints don't support HTTPS)
```

**Default cache behavior:**
```
Viewer protocol policy: Redirect HTTP to HTTPS
Allowed HTTP methods: GET, HEAD
Cache policy: CachingOptimized
```

**Settings:**
```
Alternate domain names (CNAMEs):
  - cropwise.io
  - www.cropwise.io

Custom SSL certificate: Select your certificate from ACM
Default root object: index.html
```

**Error pages (Important for React Router):**

Add custom error response:
```
HTTP error code: 403
Customize error response: Yes
Response page path: /index.html
HTTP response code: 200
```

Add another:
```
HTTP error code: 404
Customize error response: Yes
Response page path: /index.html
HTTP response code: 200
```

2. Click **"Create distribution"**
3. Wait 10-15 minutes for deployment
4. Note your **Distribution domain name:** `dxxxxx.cloudfront.net`

### **3.2 Update DNS**

Add CNAME record pointing to CloudFront:
```
www.cropwise.io  →  dxxxxx.cloudfront.net
```

If using Route 53, create an A record with Alias:
```
cropwise.io  →  Alias to CloudFront distribution
```

---

## Part 4: Application Load Balancer (Backend API)

### **4.1 Create Application Load Balancer**

👉 https://console.aws.amazon.com/ec2/v2/home?region=ap-south-1#LoadBalancers:

1. Click **"Create Load Balancer"**
2. Select **"Application Load Balancer"**
3. Name: `cropwise-api-alb`
4. Scheme: **Internet-facing**
5. IP address type: **IPv4**

**Network mapping:**
- VPC: Default VPC
- Availability Zones: Select at least 2 AZs

**Security groups:**
- Create new security group: `cropwise-alb-sg`
- Allow: HTTP (80), HTTPS (443) from 0.0.0.0/0

**Listeners:**
```
HTTP:80  → Forward to: cropwise-api-tg
HTTPS:443 → Forward to: cropwise-api-tg
```

For HTTPS listener:
- Security policy: ELBSecurityPolicy-2016-08
- Certificate: Select your cropwise.io certificate

6. Click **"Create load balancer"**

### **4.2 Create Target Group**

👉 https://console.aws.amazon.com/ec2/v2/home?region=ap-south-1#TargetGroups:

1. Click **"Create target group"**
2. Target type: **IP addresses**
3. Name: `cropwise-api-tg`
4. Protocol: **HTTP**
5. Port: **3000**
6. VPC: Default VPC
7. Health check path: `/api/health`
8. Click **"Next"**
9. Register your ECS task IPs (or let ECS auto-register)
10. Click **"Create"**

### **4.3 Update ECS Service**

👉 https://console.aws.amazon.com/ecs/home?region=ap-south-1#/clusters/cropwise-dev-cluster/services/cropwise-backend-dev

1. Click **"Update service"**
2. Expand **"Load balancing"**
3. Load balancer type: **Application Load Balancer**
4. Select your ALB: `cropwise-api-alb`
5. Target group: `cropwise-api-tg`
6. Click **"Update"**

### **4.4 Update DNS for API**

Add CNAME record:
```
api.cropwise.io  →  cropwise-api-alb-xxxxx.ap-south-1.elb.amazonaws.com
```

---

## Part 5: Update Application Configuration

### **5.1 Update GitHub Secrets**

👉 https://github.com/yellowflowersorganics-star/cropwise/settings/secrets/actions

Update these secrets:

```
VITE_API_URL=https://api.cropwise.io
```

### **5.2 Update ECS Environment Variables**

👉 https://console.aws.amazon.com/ecs/home?region=ap-south-1#/taskDefinitions/cropwise-backend-dev

1. Create new task definition revision
2. Update environment variables:

```
FRONTEND_URL=https://cropwise.io
CORS_ORIGIN=https://cropwise.io,https://www.cropwise.io
```

3. Update the service to use new revision

### **5.3 Update Google OAuth**

👉 https://console.cloud.google.com/apis/credentials

Update authorized redirect URIs:
```
https://api.cropwise.io/auth/google/callback
https://cropwise.io/auth/callback
```

Update authorized JavaScript origins:
```
https://cropwise.io
https://www.cropwise.io
```

---

## Part 6: Deploy Changes

### **6.1 Trigger Deployment**

Push to GitHub to trigger CI/CD:

```bash
git add .
git commit -m "chore: Update branding to CropWise and configure domain"
git push origin develop
```

### **6.2 Wait for Deployment**

Monitor: https://github.com/yellowflowersorganics-star/cropwise/actions

After deployment completes, invalidate CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id EXXXXXX \
  --paths "/*"
```

---

## ✅ Verification Checklist

### **Frontend:**
- [ ] https://cropwise.io loads without SSL warnings
- [ ] https://www.cropwise.io redirects to cropwise.io (or vice versa)
- [ ] All pages load correctly
- [ ] React Router works (refresh on any page)

### **Backend API:**
- [ ] https://api.cropwise.io/api returns API info
- [ ] https://api.cropwise.io/api/health returns 200 or 401
- [ ] CORS allows requests from cropwise.io

### **SSL:**
- [ ] Certificate is valid and trusted
- [ ] No mixed content warnings
- [ ] HTTPS redirects work

### **Authentication:**
- [ ] Google OAuth login works
- [ ] Redirects return to correct domain

---

## 🔧 Troubleshooting

### **Issue: DNS not resolving**
```bash
# Check DNS propagation
nslookup cropwise.io
dig cropwise.io

# Check nameservers
dig cropwise.io NS
```
**Solution:** Wait up to 48 hours for DNS propagation

### **Issue: SSL Certificate not working**
- Ensure certificate is in `ap-south-1` region for CloudFront
- Check that DNS validation is complete
- Verify CNAME records are correct

### **Issue: CloudFront shows "NoSuchBucket"**
- Origin domain must be S3 **website endpoint**, not S3 bucket URL
- Correct: `bucket-name.s3-website.region.amazonaws.com`
- Wrong: `bucket-name.s3.region.amazonaws.com`

### **Issue: React Router shows 404 on refresh**
- Add CloudFront custom error responses (see Part 3.1)
- Ensure default root object is set to `index.html`

### **Issue: API CORS errors**
- Update `CORS_ORIGIN` environment variable in ECS task definition
- Restart ECS service after updating

---

## 📊 Cost Estimate

### **Monthly AWS Costs (Development):**
```
CloudFront:        $1-5   (based on traffic)
Certificate (ACM): $0     (free!)
Route 53:          $0.50  (hosted zone) + $0.40 per million queries
ALB:               $16    (hourly rate) + $0.008 per LCU-hour
ECS Fargate:       $30-50 (running tasks)
RDS:               $15-30 (db.t3.micro)
S3:                $1-2   (storage + requests)

Total:             ~$65-105/month
```

### **Domain Registration:**
```
cropwise.io:       $10-20/year
```

---

## 🚀 Optional Enhancements

### **1. Add Subdomain for Admin Panel**
```
admin.cropwise.io → Separate CloudFront distribution
```

### **2. Set up Monitoring**
```
CloudWatch Alarms for:
- ALB 5XX errors
- ECS CPU/Memory usage
- CloudFront error rate
```

### **3. Set up Email**
```
AWS SES or Gmail:
- noreply@cropwise.io
- support@cropwise.io
```

### **4. Add Status Page**
```
status.cropwise.io → AWS Amplify or static S3 site
```

---

## 📞 Support

If you encounter issues:
1. Check AWS CloudWatch logs
2. Verify DNS with `dig` or `nslookup`
3. Test SSL with https://www.ssllabs.com/ssltest/
4. Check CORS with browser dev tools

---

## 🎉 Congratulations!

Once complete, your application will be live at:
- **Frontend:** https://cropwise.io
- **API:** https://api.cropwise.io
- **Docs:** Your API documentation

**Enjoy your new domain!** 🌾✨

