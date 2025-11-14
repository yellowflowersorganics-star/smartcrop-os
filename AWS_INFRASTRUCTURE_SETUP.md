# 🏗️ AWS Infrastructure Setup Guide (No Domain Required)

Complete guide to set up AWS infrastructure for SmartCrop deployment.

---

## 📋 Overview

You'll create these AWS resources to run your application:

```
┌─────────────────────────────────────────┐
│          AWS Infrastructure             │
├─────────────────────────────────────────┤
│                                         │
│  1. ECR (Docker Registry)              │
│     └─ Store backend Docker images     │
│                                         │
│  2. ECS Cluster (Container Service)    │
│     └─ Run backend containers          │
│                                         │
│  3. Application Load Balancer          │
│     └─ Route traffic to backend        │
│                                         │
│  4. S3 Bucket (Frontend Storage)       │
│     └─ Host frontend static files      │
│                                         │
│  5. CloudFront (CDN)                   │
│     └─ Deliver frontend globally       │
│                                         │
│  6. RDS PostgreSQL ✅ (Already done!)  │
│     └─ Your database                   │
│                                         │
└─────────────────────────────────────────┘
```

**Estimated Setup Time**: 30-45 minutes  
**Estimated Monthly Cost**: $50-100

---

## 🚀 STEP 1: Create ECR Repository

**What it is**: Docker registry to store your backend images

### **1.1 Go to ECR Console**
👉 https://console.aws.amazon.com/ecr/repositories

### **1.2 Create Repository**

1. Click **"Create repository"**
2. **Visibility**: Private
3. **Repository name**: `smartcrop-backend-dev`
4. **Tag immutability**: Disabled
5. **Scan on push**: Enabled (security)
6. Click **"Create repository"**

### **1.3 Repeat for Production**

Create another repository:
- Name: `smartcrop-backend-prod`
- Same settings

### **1.4 Note the Repository URIs**

You'll see something like:
```
123456789012.dkr.ecr.us-east-1.amazonaws.com/smartcrop-backend-dev
123456789012.dkr.ecr.us-east-1.amazonaws.com/smartcrop-backend-prod
```

Save these for later!

---

## 🐳 STEP 2: Create ECS Cluster

**What it is**: Container orchestration service to run your backend

### **2.1 Go to ECS Console**
👉 https://console.aws.amazon.com/ecs/home#/clusters

### **2.2 Create Cluster**

1. Click **"Create cluster"**
2. **Cluster name**: `smartcrop-dev-cluster`
3. **Infrastructure**: AWS Fargate (serverless)
4. **Monitoring**: Enable Container Insights (optional, costs extra)
5. Click **"Create"**

### **2.3 Repeat for Production**

Create another cluster:
- Name: `smartcrop-prod-cluster`

---

## ⚖️ STEP 3: Create Application Load Balancer

**What it is**: Distributes traffic to your backend containers

### **3.1 Go to EC2 Console - Load Balancers**
👉 https://console.aws.amazon.com/ec2/home#LoadBalancers

### **3.2 Create Load Balancer**

1. Click **"Create load balancer"**
2. Select **"Application Load Balancer"**
3. Click **"Create"**

### **3.3 Configure Load Balancer**

**Basic Configuration:**
- **Name**: `smartcrop-dev-alb`
- **Scheme**: Internet-facing
- **IP address type**: IPv4

**Network Mapping:**
- **VPC**: Default VPC (or your VPC)
- **Mappings**: Select all availability zones (at least 2)

**Security Groups:**
- Create new security group or use default
- **Inbound rules**: 
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0 (if using SSL)

**Listeners:**
- **Protocol**: HTTP
- **Port**: 80
- **Default action**: Create target group (next step)

### **3.4 Create Target Group**

1. Click **"Create target group"**
2. **Target type**: IP addresses (for Fargate)
3. **Target group name**: `smartcrop-dev-backend-tg`
4. **Protocol**: HTTP
5. **Port**: 3000 (your backend port)
6. **VPC**: Same as ALB
7. **Health check path**: `/health` or `/api/health`
8. Click **"Create"**

### **3.5 Finish Load Balancer Creation**

1. Select the target group you just created
2. Click **"Create load balancer"**
3. Wait 2-5 minutes for it to become "Active"

### **3.6 Get Your Backend URL**

After creation, you'll see:
```
DNS name: smartcrop-dev-alb-123456789.us-east-1.elb.amazonaws.com
```

**This is your backend API URL!** Save it!

### **3.7 Repeat for Production**

Create another ALB:
- Name: `smartcrop-prod-alb`
- Target group: `smartcrop-prod-backend-tg`

---

## 🚀 STEP 4: Create ECS Task Definition

**What it is**: Blueprint for running your backend container

### **4.1 Go to ECS Console - Task Definitions**
👉 https://console.aws.amazon.com/ecs/home#/taskDefinitions

### **4.2 Create Task Definition**

1. Click **"Create new task definition"**
2. **Task definition family**: `smartcrop-backend-dev`
3. **Launch type**: AWS Fargate

**Infrastructure:**
- **Operating system**: Linux/X86_64
- **CPU**: 0.5 vCPU (512)
- **Memory**: 1 GB

**Container Configuration:**
- **Container name**: `smartcrop-backend`
- **Image URI**: Your ECR URI from Step 1.4
  ```
  123456789012.dkr.ecr.us-east-1.amazonaws.com/smartcrop-backend-dev:latest
  ```
- **Port mappings**: 3000 (TCP)

**Environment Variables:**
Click "Add" for each:
```
NODE_ENV = production
DATABASE_URL = (Use value from GitHub Secret)
JWT_SECRET = (Use value from GitHub Secret)
SESSION_SECRET = (Use value from GitHub Secret)
GOOGLE_CLIENT_ID = (Use value from GitHub Secret)
GOOGLE_CLIENT_SECRET = (Use value from GitHub Secret)
```

**Logging:**
- Enable CloudWatch Logs
- Log group: `/ecs/smartcrop-backend-dev`

4. Click **"Create"**

### **4.3 Repeat for Production**

Create another task definition:
- Family: `smartcrop-backend-prod`
- Use production ECR image
- Same configuration

---

## 🎯 STEP 5: Create ECS Service

**What it is**: Runs and maintains your containers

### **5.1 Go to Your ECS Cluster**

1. Open: https://console.aws.amazon.com/ecs/home#/clusters
2. Click: `smartcrop-dev-cluster`
3. Click **"Create service"**

### **5.2 Configure Service**

**Environment:**
- **Compute options**: Launch type
- **Launch type**: Fargate

**Deployment Configuration:**
- **Application type**: Service
- **Family**: `smartcrop-backend-dev`
- **Service name**: `smartcrop-backend-dev`
- **Desired tasks**: 1 (start small)

**Networking:**
- **VPC**: Default VPC
- **Subnets**: Select all
- **Security group**: 
  - Create new or use existing
  - Allow inbound on port 3000 from ALB security group

**Load Balancing:**
- **Load balancer type**: Application Load Balancer
- **Load balancer**: `smartcrop-dev-alb`
- **Target group**: `smartcrop-dev-backend-tg`
- **Health check grace period**: 60 seconds

**Auto Scaling (Optional):**
- Enable for production
- Min: 1, Max: 4
- Target CPU: 70%

3. Click **"Create"**

Wait 3-5 minutes for service to start.

### **5.3 Verify Service is Running**

1. Go to your service
2. **Tasks** tab should show 1 running task
3. Click the task ID
4. Check **Logs** tab for startup messages

### **5.4 Test Backend**

```powershell
# Test health endpoint
curl http://smartcrop-dev-alb-123456789.us-east-1.elb.amazonaws.com/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### **5.5 Repeat for Production**

Create production service in `smartcrop-prod-cluster`

---

## 📦 STEP 6: Create S3 Bucket for Frontend

**What it is**: Storage for your frontend static files

### **6.1 Go to S3 Console**
👉 https://s3.console.aws.amazon.com/s3/buckets

### **6.2 Create Bucket**

1. Click **"Create bucket"**
2. **Bucket name**: `smartcrop-dev-frontend` (must be globally unique)
   - If taken, try: `smartcrop-dev-frontend-YOUR_COMPANY`
3. **Region**: us-east-1 (same as other resources)
4. **Block Public Access**: UNCHECK all (we'll use CloudFront)
5. **Bucket Versioning**: Enable (optional)
6. Click **"Create bucket"**

### **6.3 Enable Static Website Hosting**

1. Click your bucket
2. **Properties** tab
3. Scroll to **Static website hosting**
4. Click **"Edit"**
5. **Enable** static website hosting
6. **Index document**: `index.html`
7. **Error document**: `index.html` (for SPA routing)
8. Click **"Save changes"**

### **6.4 Configure Bucket Policy**

1. **Permissions** tab
2. **Bucket policy** → Click **"Edit"**
3. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::smartcrop-dev-frontend/*"
    }
  ]
}
```

4. Replace `smartcrop-dev-frontend` with your bucket name
5. Click **"Save changes"**

### **6.5 Repeat for Production**

Create another bucket:
- Name: `smartcrop-prod-frontend`

---

## 🌐 STEP 7: Create CloudFront Distribution

**What it is**: CDN for fast global delivery of your frontend

### **7.1 Go to CloudFront Console**
👉 https://console.aws.amazon.com/cloudfront/home

### **7.2 Create Distribution**

1. Click **"Create distribution"**

**Origin Settings:**
- **Origin domain**: Select your S3 bucket from dropdown
  - `smartcrop-dev-frontend.s3.us-east-1.amazonaws.com`
- **Origin path**: Leave empty
- **Origin access**: Public (or Origin Access Control for more security)

**Default Cache Behavior:**
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD, OPTIONS
- **Cache policy**: CachingOptimized
- **Origin request policy**: CORS-S3Origin (if using CORS)

**Settings:**
- **Price class**: Use all edge locations (or choose cheaper option)
- **Alternate domain name (CNAME)**: Leave empty (no custom domain yet)
- **Custom SSL certificate**: Default CloudFront Certificate
- **Default root object**: `index.html`

2. Click **"Create distribution"**

### **7.3 Wait for Deployment**

- Status will show "Deploying" for 5-15 minutes
- When complete, status changes to "Enabled"

### **7.4 Get Your Frontend URL**

You'll see:
```
Distribution domain name: d111111abcdef8.cloudfront.net
```

**This is your frontend URL!** Save it!

Example:
```
https://d111111abcdef8.cloudfront.net
```

### **7.5 Add Error Pages (Important for SPAs)**

1. Click your distribution
2. **Error pages** tab
3. Click **"Create custom error response"**
4. Configure:
   - **HTTP error code**: 403
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200
5. Click **"Create"**
6. Repeat for error code 404

This ensures your SPA routing works correctly.

### **7.6 Copy Distribution ID**

You'll see something like: `E1234ABCDEFGH`

**Add this to GitHub Secrets:**
```
Name: CLOUDFRONT_DEV_DISTRIBUTION_ID
Value: E1234ABCDEFGH
```

👉 https://github.com/yellowflowersorganics-star/smartcrop-os/settings/secrets/actions/new

### **7.7 Repeat for Production**

Create production distribution for `smartcrop-prod-frontend` bucket

---

## ✅ STEP 8: Update GitHub Secrets

Add these new secrets based on the resources you created:

### **Frontend URLs**

```
Name: VITE_API_URL
Value: http://smartcrop-dev-alb-123456789.us-east-1.elb.amazonaws.com
```

### **CloudFront Distribution IDs**

```
Name: CLOUDFRONT_DEV_DISTRIBUTION_ID
Value: E1234ABCDEFGH (from Step 7.6)

Name: CLOUDFRONT_PROD_DISTRIBUTION_ID  
Value: E5678IJKLMNOP (production distribution)
```

👉 Update at: https://github.com/yellowflowersorganics-star/smartcrop-os/settings/secrets/actions

---

## 🔐 STEP 9: Update Google OAuth

Add your actual AWS URLs to Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. **Add Authorized JavaScript Origins:**
   ```
   https://d111111abcdef8.cloudfront.net
   http://localhost:8080
   ```
4. **Add Authorized Redirect URIs:**
   ```
   http://smartcrop-dev-alb-123456789.us-east-1.elb.amazonaws.com/api/auth/google/callback
   https://d111111abcdef8.cloudfront.net/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```
5. Click **"Save"**

---

## 🚀 STEP 10: Deploy!

Now you're ready to deploy:

```powershell
cd C:\Users\praghav\smartcrop-os

# Deploy to development
git checkout develop
git push origin develop

# Watch deployment
start https://github.com/yellowflowersorganics-star/smartcrop-os/actions
```

---

## 📋 Infrastructure Checklist

Before deploying, verify you've created:

### **Development Environment**
- [x] ECR Repository: `smartcrop-backend-dev`
- [x] ECS Cluster: `smartcrop-dev-cluster`
- [x] ECS Task Definition: `smartcrop-backend-dev`
- [x] ECS Service: `smartcrop-backend-dev`
- [x] Application Load Balancer: `smartcrop-dev-alb`
- [x] Target Group: `smartcrop-dev-backend-tg`
- [x] S3 Bucket: `smartcrop-dev-frontend`
- [x] CloudFront Distribution
- [x] RDS PostgreSQL: `smartcrop-production-db`

### **Production Environment**
- [ ] Same resources with `-prod` suffix

### **GitHub Secrets Updated**
- [ ] `VITE_API_URL` (ALB URL)
- [ ] `CLOUDFRONT_DEV_DISTRIBUTION_ID`
- [ ] `CLOUDFRONT_PROD_DISTRIBUTION_ID`

### **Google OAuth Updated**
- [ ] Added CloudFront URL to authorized origins
- [ ] Added ALB URL to redirect URIs

---

## 💰 Cost Estimate

With all infrastructure:

```
ECS Fargate (1 task, 0.5 vCPU, 1GB RAM): ~$15/month
Application Load Balancer: ~$18/month
RDS db.t3.micro: ~$15/month
S3 Storage (first 50GB free): ~$1/month
CloudFront (first 1TB free): ~$0-5/month
Data Transfer: ~$5-10/month

Total: ~$55-70/month (development)
Total: ~$110-140/month (dev + production)
```

---

## 🎯 Your Final URLs

After setup, you'll have:

**Development:**
- Frontend: `https://d111111abcdef8.cloudfront.net`
- Backend: `http://smartcrop-dev-alb-123456789.us-east-1.elb.amazonaws.com`
- Database: `smartcrop-production-db.xxx.us-east-1.rds.amazonaws.com`

**Production:**
- Frontend: `https://d222222abcdef9.cloudfront.net`
- Backend: `http://smartcrop-prod-alb-987654321.us-east-1.elb.amazonaws.com`
- Database: Same RDS instance (or create separate for prod)

---

## 🔄 Adding Custom Domain Later

When you buy a domain:

1. **Register domain** (Route 53, Namecheap, etc.)
2. **Request SSL certificate** in ACM (AWS Certificate Manager)
3. **Add CNAME to CloudFront** distribution
4. **Create Route 53 records** pointing to CloudFront
5. **Update Google OAuth** with new domain
6. **Update VITE_API_URL** secret

---

**Created**: November 14, 2025  
**Status**: Ready for Infrastructure Setup

