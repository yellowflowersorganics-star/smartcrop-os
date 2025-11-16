# 🏗️ AWS Infrastructure Setup Guide

Complete step-by-step guide to set up AWS infrastructure for CropWise across all environments.

---

## 📋 Overview

You'll create separate AWS resources for **Development**, **Staging**, and **Production** environments:

```
┌──────────────────────────────────────────────────────────────────┐
│                   AWS Infrastructure Per Environment              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. ECR (Docker Registry) - 1 repository with environment tags   │
│     └─ Store backend Docker images (dev, stage, prod tags)      │
│                                                                   │
│  2. ECS Clusters - 3 clusters (dev, stage, prod)                │
│     └─ Run backend containers in isolation                       │
│                                                                   │
│  3. Application Load Balancers - 3 ALBs (dev, stage, prod)      │
│     └─ Route traffic to backend services                         │
│                                                                   │
│  4. S3 Buckets - 3 buckets (dev, stage, prod)                   │
│     └─ Host frontend static files                                │
│                                                                   │
│  5. CloudFront - 3 distributions (dev, stage, prod)              │
│     └─ Deliver frontend globally with CDN                        │
│                                                                   │
│  6. RDS PostgreSQL - 3 databases ✅ (Already done!)              │
│     └─ Separate databases per environment                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### **Environment Summary**

| Environment | Purpose | Cost/Month | Uptime SLA |
|-------------|---------|------------|------------|
| **Development** | Testing & development | ~$50 | No SLA (can stop anytime) |
| **Staging** | Pre-production testing | ~$80 | 95% (business hours) |
| **Production** | Live application | ~$150-200 | 99.9% (24/7) |

**Total Estimated Cost**: ~$280-330/month for all 3 environments  
**Estimated Setup Time**: 2-3 hours for all environments

---

## 🚀 STEP 1: Create ECR Repository

**What it is**: Docker registry to store your backend images

**Strategy**: Use **ONE repository** with **environment-specific tags** (dev, stage, prod)

### **1.1 Go to ECR Console**
👉 https://console.aws.amazon.com/ecr/repositories

### **1.2 Create Repository**

1. Click **"Create repository"**
2. Configure:
   - **Visibility**: Private
   - **Repository name**: `cropwise-backend`
   - **Tag immutability**: Disabled (allows tag updates)
   - **Scan on push**: Enabled (automatic security scanning)
   - **Encryption**: AES-256 (default)
3. Click **"Create repository"**

### **1.3 Note the Repository URI**

You'll see something like:
```
123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend
```

**Save this!** You'll use it with different tags:
```
# Development
123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend:dev

# Staging
123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend:stage

# Production (versioned)
123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend:v1.0.0
123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend:prod (latest)
```

### **1.4 Set Up Lifecycle Policy (Optional but Recommended)**

Keep your ECR storage costs low by auto-deleting old images:

1. Select your repository: `cropwise-backend`
2. Click **Lifecycle Policy** → **Create rule**
3. Add rules:

**Rule 1: Keep last 10 dev images**
```json
{
  "rulePriority": 1,
  "description": "Keep last 10 dev images",
  "selection": {
    "tagStatus": "tagged",
    "tagPrefixList": ["dev"],
    "countType": "imageCountMoreThan",
    "countNumber": 10
  },
  "action": {
    "type": "expire"
  }
}
```

**Rule 2: Keep last 10 stage images**
```json
{
  "rulePriority": 2,
  "description": "Keep last 10 stage images",
  "selection": {
    "tagStatus": "tagged",
    "tagPrefixList": ["stage"],
    "countType": "imageCountMoreThan",
    "countNumber": 10
  },
  "action": {
    "type": "expire"
  }
}
```

**Rule 3: Keep all production images (v*)**
- Don't expire production images - keep for rollback

4. Click **Save**

---

## 🐳 STEP 2: Create ECS Clusters

**What it is**: Container orchestration service to run your backend

**Strategy**: Create **3 separate clusters** for complete environment isolation

### **2.1 Go to ECS Console**
👉 https://console.aws.amazon.com/ecs/home#/clusters

---

### **2.2 Create Development Cluster**

1. Click **"Create cluster"**
2. Configure:
   - **Cluster name**: `cropwise-dev-cluster`
   - **Infrastructure**: AWS Fargate (serverless, no EC2 to manage)
   - **Monitoring**: ⭕ Disable Container Insights (save cost for dev)
   - **Tags**: 
     - Key: `Environment`, Value: `development`
     - Key: `Project`, Value: `cropwise`
3. Click **"Create"**

**Wait**: 30 seconds for cluster to be created

---

### **2.3 Create Staging Cluster**

1. Click **"Create cluster"** again
2. Configure:
   - **Cluster name**: `cropwise-stage-cluster`
   - **Infrastructure**: AWS Fargate
   - **Monitoring**: ✅ Enable Container Insights (useful for debugging)
   - **Tags**: 
     - Key: `Environment`, Value: `staging`
     - Key: `Project`, Value: `cropwise`
3. Click **"Create"**

---

### **2.4 Create Production Cluster**

1. Click **"Create cluster"** again
2. Configure:
   - **Cluster name**: `cropwise-prod-cluster`
   - **Infrastructure**: AWS Fargate
   - **Monitoring**: ✅ Enable Container Insights (essential for production)
   - **Tags**: 
     - Key: `Environment`, Value: `production`
     - Key: `Project`, Value: `cropwise`
     - Key: `CostCenter`, Value: `cropwise-prod`
3. Click **"Create"**

---

### **2.5 Verify All Clusters**

You should now see 3 clusters:
```
✅ cropwise-dev-cluster    (Active)
✅ cropwise-stage-cluster  (Active)
✅ cropwise-prod-cluster   (Active)
```

**Cluster Isolation Benefits:**
- Complete separation between environments
- Different IAM permissions per cluster
- Independent scaling and monitoring
- No accidental deployments to wrong environment

---

## ⚖️ STEP 3: Create Application Load Balancers

**What it is**: Distributes traffic to your backend containers

**Strategy**: Create **3 separate ALBs** for each environment

### **3.1 Go to EC2 Console - Load Balancers**
👉 https://console.aws.amazon.com/ec2/home#LoadBalancers

---

### **3.2 Create Development Load Balancer**

#### **Step 1: Create Target Group First**

1. Go to: https://console.aws.amazon.com/ec2/home#TargetGroups
2. Click **"Create target group"**
3. Configure:
   - **Target type**: IP addresses (for AWS Fargate)
   - **Target group name**: `cropwise-dev-backend-tg`
   - **Protocol**: HTTP
   - **Port**: 3000 (your backend port)
   - **VPC**: Default VPC (or your custom VPC)
   - **Protocol version**: HTTP1
   
4. **Health check settings**:
   - **Health check protocol**: HTTP
   - **Health check path**: `/health` (or `/api/health`)
   - **Healthy threshold**: 2
   - **Unhealthy threshold**: 2
   - **Timeout**: 5 seconds
   - **Interval**: 30 seconds
   
5. **Tags**:
   - Key: `Environment`, Value: `development`
   - Key: `Project`, Value: `cropwise`

6. Click **"Next"** → **"Create target group"** (don't register targets yet)

#### **Step 2: Create Load Balancer**

1. Go back to: https://console.aws.amazon.com/ec2/home#LoadBalancers
2. Click **"Create load balancer"**
3. Select **"Application Load Balancer"** → **"Create"**

4. **Basic Configuration:**
   - **Name**: `cropwise-dev-alb`
   - **Scheme**: Internet-facing
   - **IP address type**: IPv4

5. **Network Mapping:**
   - **VPC**: Default VPC (same as target group)
   - **Mappings**: Select **at least 2 availability zones**
     - ✅ us-east-1a
     - ✅ us-east-1b
     - ⭕ us-east-1c (optional)

6. **Security Groups:**
   - Click **"Create new security group"**
   - **Security group name**: `cropwise-dev-alb-sg`
   - **Description**: CropWise Development ALB
   - **Inbound rules**:
     ```
     Type: HTTP
     Protocol: TCP
     Port: 80
     Source: 0.0.0.0/0 (Anywhere)
     Description: Allow HTTP from internet
     ```
   - Click **"Create security group"**
   - Go back to ALB creation and select the new security group

7. **Listeners and routing:**
   - **Protocol**: HTTP
   - **Port**: 80
   - **Default action**: Forward to `cropwise-dev-backend-tg`

8. **Tags**:
   - Key: `Environment`, Value: `development`
   - Key: `Project`, Value: `cropwise`

9. Click **"Create load balancer"**

#### **Step 3: Wait and Get DNS Name**

- Wait 2-5 minutes for status to become **Active**
- Note the DNS name:
  ```
  cropwise-dev-alb-1234567890.us-east-1.elb.amazonaws.com
  ```
- **This is your development backend API URL!**

---

### **3.3 Create Staging Load Balancer**

Repeat the process for staging:

#### **Target Group:**
- Name: `cropwise-stage-backend-tg`
- Port: 3000
- Health check path: `/health`
- Tags: `Environment=staging`

#### **Load Balancer:**
- Name: `cropwise-stage-alb`
- Scheme: Internet-facing
- Security group: Create `cropwise-stage-alb-sg` (same inbound rules)
- Listener: HTTP:80 → `cropwise-stage-backend-tg`
- Tags: `Environment=staging`

#### **DNS Name:**
```
cropwise-stage-alb-9876543210.us-east-1.elb.amazonaws.com
```

---

### **3.4 Create Production Load Balancer**

#### **Target Group:**
- Name: `cropwise-prod-backend-tg`
- Port: 3000
- Health check path: `/health`
- **Health check settings** (stricter for production):
  - Healthy threshold: 3
  - Unhealthy threshold: 2
  - Timeout: 5 seconds
  - Interval: 30 seconds
- Tags: `Environment=production`

#### **Load Balancer:**
- Name: `cropwise-prod-alb`
- Scheme: Internet-facing
- **Network mapping**: All 3 availability zones (for high availability)
  - ✅ us-east-1a
  - ✅ us-east-1b
  - ✅ us-east-1c
- Security group: Create `cropwise-prod-alb-sg`
  - **Inbound rules**:
    ```
    HTTP (80) from 0.0.0.0/0
    HTTPS (443) from 0.0.0.0/0 (for production SSL)
    ```
- **Enable access logs** (production best practice):
  - Create S3 bucket: `cropwise-prod-alb-logs`
  - Enable access logs to this bucket
- **Enable deletion protection** (prevent accidental deletion)
- Listener: HTTP:80 → `cropwise-prod-backend-tg`
- Tags: `Environment=production`, `CostCenter=cropwise-prod`

#### **DNS Name:**
```
cropwise-prod-alb-5555555555.us-east-1.elb.amazonaws.com
```

---

### **3.5 Verify All Load Balancers**

You should now have 3 ALBs:
```
✅ cropwise-dev-alb    (Active) → Dev backend
✅ cropwise-stage-alb  (Active) → Stage backend
✅ cropwise-prod-alb   (Active) → Prod backend
```

### **3.6 Save All DNS Names**

Add these to your GitHub Secrets or `.env`:
```bash
# Development
BACKEND_URL_DEV=http://cropwise-dev-alb-XXX.us-east-1.elb.amazonaws.com

# Staging
BACKEND_URL_STAGE=http://cropwise-stage-alb-XXX.us-east-1.elb.amazonaws.com

# Production
BACKEND_URL_PROD=http://cropwise-prod-alb-XXX.us-east-1.elb.amazonaws.com
```

**Note**: For production, you'll want to add a custom domain and SSL (covered in a separate guide)

---

## 🚀 STEP 4: Create ECS Task Definition

**What it is**: Blueprint for running your backend container

### **4.1 Go to ECS Console - Task Definitions**
👉 https://console.aws.amazon.com/ecs/home#/taskDefinitions

### **4.2 Create Task Definition**

1. Click **"Create new task definition"**
2. **Task definition family**: `cropwise-backend-dev`
3. **Launch type**: AWS Fargate

**Infrastructure (Development):**
- **Operating system**: Linux/X86_64
- **CPU**: 0.25 vCPU (256) - Smaller for dev
- **Memory**: 512 MB - Smaller for dev

**Container Configuration:**
- **Container name**: `cropwise-backend-dev`
- **Image URI**: Your ECR URI from Step 1.4
  ```
  123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend:dev
  ```
- **Port mappings**: 3000 (TCP)

**Environment Variables:**
Click "Add" for each:
```
NODE_ENV = development
DATABASE_URL = (Use DEV database value from GitHub Secret)
JWT_SECRET = (Use DEV value from GitHub Secret)
SESSION_SECRET = (Use DEV value from GitHub Secret)
GOOGLE_CLIENT_ID = (Use value from GitHub Secret)
GOOGLE_CLIENT_SECRET = (Use value from GitHub Secret)
REDIS_URL = redis://cropwise-dev-redis:6379
MQTT_BROKER_URL = mqtt://cropwise-dev-mqtt:1883
```

**Logging:**
- Enable CloudWatch Logs
- Log group: `/ecs/cropwise-backend-dev`

4. Click **"Create"**

### **4.3 Create Staging Task Definition**

Repeat the process with staging-specific values:

1. Go to: https://console.aws.amazon.com/ecs/home#/taskDefinitions
2. Click **"Create new task definition"**
3. Family name: `cropwise-backend-stage`

**Infrastructure (Staging):**
- **Operating system**: Linux/X86_64
- **CPU**: 0.5 vCPU (512) - Medium for staging
- **Memory**: 1 GB - Medium for staging

**Container Configuration:**
- **Container name**: `cropwise-backend-stage`
- **Image URI**: 
  ```
  123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend:stage
  ```
- **Port mappings**: 3000 (TCP)

**Environment Variables:**
```
NODE_ENV = staging
DATABASE_URL = (Use STAGING database value from GitHub Secret)
JWT_SECRET = (Use STAGING value from GitHub Secret)
SESSION_SECRET = (Use STAGING value from GitHub Secret)
GOOGLE_CLIENT_ID = (Use value from GitHub Secret)
GOOGLE_CLIENT_SECRET = (Use value from GitHub Secret)
REDIS_URL = redis://cropwise-stage-redis:6379
MQTT_BROKER_URL = mqtt://cropwise-stage-mqtt:1883
```

**Logging:**
- Log group: `/ecs/cropwise-backend-stage`

### **4.4 Create Production Task Definition**

Repeat the process with production-specific values:

1. Go to: https://console.aws.amazon.com/ecs/home#/taskDefinitions
2. Click **"Create new task definition"**
3. Family name: `cropwise-backend-prod`

**Infrastructure (Production):**
- **Operating system**: Linux/X86_64
- **CPU**: 1 vCPU (1024) - Larger for production
- **Memory**: 2 GB - Larger for production

**Container Configuration:**
- **Container name**: `cropwise-backend-prod`
- **Image URI**: Use version tags for production
  ```
  123456789012.dkr.ecr.us-east-1.amazonaws.com/cropwise-backend:v1.0.0
  # Or use 'prod' tag for latest production build
  ```
- **Port mappings**: 3000 (TCP)

**Environment Variables:**
```
NODE_ENV = production
DATABASE_URL = (Use PRODUCTION database value from GitHub Secret)
JWT_SECRET = (Use PRODUCTION value from GitHub Secret)
SESSION_SECRET = (Use PRODUCTION value from GitHub Secret)
GOOGLE_CLIENT_ID = (Use value from GitHub Secret)
GOOGLE_CLIENT_SECRET = (Use value from GitHub Secret)
REDIS_URL = redis://cropwise-prod-redis:6379
MQTT_BROKER_URL = mqtt://cropwise-prod-mqtt:1883
```

**Logging:**
- Log group: `/ecs/cropwise-backend-prod`

**Important Notes:**
- Each environment has its own task definition family
- Use environment-specific container names to avoid conflicts
- Use different image tags (dev/stage/prod or version numbers)
- Each environment has separate environment variables and secrets
- Production uses more resources (CPU/Memory) than dev/staging

---

## 🎯 STEP 5: Create ECS Services

**What it is**: Runs and maintains your containers in each cluster

**Strategy**: Create **3 separate services** in their respective clusters

---

### **5.1 Create Development Service**

1. Go to: https://console.aws.amazon.com/ecs/home#/clusters
2. Click: **`cropwise-dev-cluster`**
3. Click **"Create service"**

#### **Configure Development Service:**

**Environment:**
- **Compute options**: Launch type
- **Launch type**: Fargate

**Deployment Configuration:**
- **Application type**: Service
- **Task definition**: 
  - **Family**: `cropwise-backend-dev`
  - **Revision**: Latest
- **Service name**: `cropwise-backend-dev-service`
- **Desired tasks**: **1** (one container for dev)

**Networking:**
- **VPC**: Default VPC (same as ALB)
- **Subnets**: Select all available subnets
- **Security group**: 
  - Create new: `cropwise-dev-ecs-sg`
  - **Inbound rules**:
    ```
    Type: Custom TCP
    Protocol: TCP
    Port: 3000
    Source: [cropwise-dev-alb-sg security group ID]
    Description: Allow traffic from dev ALB
    ```
  - **Outbound rules**: All traffic (for database, internet access)

**Load Balancing:**
- **Load balancer type**: Application Load Balancer
- **Container to load balance**: `cropwise-backend-dev:3000`
- **Use an existing load balancer**: `cropwise-dev-alb`
- **Target group**: Use existing → `cropwise-dev-backend-tg`
- **Health check grace period**: 60 seconds

**Auto Scaling:**
- ⭕ **Disable** for development (not needed)

**Tags:**
- Key: `Environment`, Value: `development`
- Key: `Project`, Value: `cropwise`

4. Click **"Create"**

#### **Wait and Verify**

- Wait 3-5 minutes for service to start
- Status should show: **1/1 tasks running**
- Check **Tasks** tab → Click task → **Logs** tab for startup messages

#### **Test Development Backend**

```powershell
# Test health endpoint
curl http://cropwise-dev-alb-XXXXXXXXXX.us-east-1.elb.amazonaws.com/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "development",
  "database": "connected"
}
```

---

### **5.2 Create Staging Service**

1. Go to: https://console.aws.amazon.com/ecs/home#/clusters
2. Click: **`cropwise-stage-cluster`**
3. Click **"Create service"**

#### **Configure Staging Service:**

**Environment:**
- **Launch type**: Fargate

**Deployment Configuration:**
- **Task definition**: `cropwise-backend-stage` (Latest)
- **Service name**: `cropwise-backend-stage-service`
- **Desired tasks**: **1** (can increase for load testing)

**Networking:**
- **VPC**: Default VPC
- **Subnets**: Select all
- **Security group**: Create `cropwise-stage-ecs-sg`
  - Inbound: Port 3000 from `cropwise-stage-alb-sg`

**Load Balancing:**
- **Load balancer**: `cropwise-stage-alb`
- **Target group**: `cropwise-stage-backend-tg`
- **Health check grace period**: 60 seconds

**Auto Scaling:**
- ⭕ **Optional** for staging
- If enabled:
  - Min: 1, Max: 2
  - Target CPU: 70%

**Tags:**
- Key: `Environment`, Value: `staging`

4. Click **"Create"**

---

### **5.3 Create Production Service**

1. Go to: https://console.aws.amazon.com/ecs/home#/clusters
2. Click: **`cropwise-prod-cluster`**
3. Click **"Create service"**

#### **Configure Production Service:**

**Environment:**
- **Launch type**: Fargate

**Deployment Configuration:**
- **Task definition**: `cropwise-backend-prod` (Latest or specific version)
- **Service name**: `cropwise-backend-prod-service`
- **Desired tasks**: **2** (minimum for high availability)

**Deployment options:**
- **Deployment type**: Rolling update
- **Minimum healthy percent**: 100
- **Maximum percent**: 200
- **Deployment circuit breaker**: ✅ Enable (with rollback)

**Networking:**
- **VPC**: Default VPC
- **Subnets**: Select all (for high availability across AZs)
- **Security group**: Create `cropwise-prod-ecs-sg`
  - **Inbound rules**:
    ```
    Type: Custom TCP
    Port: 3000
    Source: [cropwise-prod-alb-sg]
    Description: Allow traffic from prod ALB only
    ```

**Load Balancing:**
- **Load balancer**: `cropwise-prod-alb`
- **Target group**: `cropwise-prod-backend-tg`
- **Health check grace period**: 90 seconds (more time for prod startup)

**Auto Scaling** (Recommended for Production):**
- ✅ **Enable**
- **Minimum tasks**: 2
- **Maximum tasks**: 10
- **Scaling policy**:
  - **Target tracking**: ECS service average CPU utilization
  - **Target value**: 70%
  - **Scale-in cooldown**: 300 seconds
  - **Scale-out cooldown**: 60 seconds

**Service Discovery (Optional):**
- Enable if using service mesh or microservices

**Tags:**
- Key: `Environment`, Value: `production`
- Key: `CostCenter`, Value: `cropwise-prod`

4. Click **"Create"**

---

### **5.4 Verify All Services**

You should now have 3 services running:

```
✅ cropwise-dev-cluster
   └─ cropwise-backend-dev-service (1/1 tasks running)

✅ cropwise-stage-cluster
   └─ cropwise-backend-stage-service (1/1 tasks running)

✅ cropwise-prod-cluster
   └─ cropwise-backend-prod-service (2/2 tasks running)
```

---

### **5.5 Test All Backends**

```powershell
# Test Development
curl http://cropwise-dev-alb-XXX.us-east-1.elb.amazonaws.com/health

# Test Staging
curl http://cropwise-stage-alb-XXX.us-east-1.elb.amazonaws.com/health

# Test Production
curl http://cropwise-prod-alb-XXX.us-east-1.elb.amazonaws.com/health
```

Expected responses should show correct environment:
```json
{
  "status": "ok",
  "environment": "development|staging|production",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 📦 STEP 6: Create S3 Buckets for Frontend

**What it is**: Storage for your frontend static files (React, Vue, Angular, etc.)

**Strategy**: Create **3 separate S3 buckets** for complete isolation

### **6.1 Go to S3 Console**
👉 https://s3.console.aws.amazon.com/s3/buckets

---

### **6.2 Create Development Bucket**

1. Click **"Create bucket"**
2. Configure:
   - **Bucket name**: `cropwise-dev-frontend` (must be globally unique)
     - If taken, try: `cropwise-dev-frontend-2025` or `cropwise-dev-YOUR_COMPANY`
   - **AWS Region**: us-east-1 (same as other resources)
   - **Object Ownership**: ACLs disabled (recommended)
   - **Block Public Access settings**: 
     - ⚠️ **UNCHECK** "Block all public access" (CloudFront needs access)
     - Acknowledge the warning
   - **Bucket Versioning**: ⭕ Disable (not critical for dev)
   - **Default encryption**: ✅ Enable (SSE-S3)
   - **Tags**:
     - Key: `Environment`, Value: `development`
     - Key: `Project`, Value: `cropwise`
3. Click **"Create bucket"**

#### **Enable Static Website Hosting:**

1. Click your bucket: `cropwise-dev-frontend`
2. Go to **Properties** tab
3. Scroll to **Static website hosting** → Click **"Edit"**
4. Configure:
   - ✅ **Enable**
   - **Hosting type**: Host a static website
   - **Index document**: `index.html`
   - **Error document**: `index.html` (for SPA routing - React/Vue/Angular)
5. Click **"Save changes"**
6. Note the **Bucket website endpoint**: 
   ```
   http://cropwise-dev-frontend.s3-website-us-east-1.amazonaws.com
   ```

#### **Configure Bucket Policy:**

1. Go to **Permissions** tab
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
      "Resource": "arn:aws:s3:::cropwise-dev-frontend/*"
    }
  ]
}
```

4. **Important**: Replace `cropwise-dev-frontend` with YOUR actual bucket name
5. Click **"Save changes"**

---

### **6.3 Create Staging Bucket**

Repeat for staging:

1. Click **"Create bucket"**
2. Configure:
   - **Bucket name**: `cropwise-stage-frontend`
   - **Region**: us-east-1
   - **Block Public Access**: UNCHECK all
   - **Bucket Versioning**: ⭕ Disable
   - **Encryption**: ✅ Enable (SSE-S3)
   - **Tags**: `Environment=staging`
3. **Enable Static Website Hosting**:
   - Index: `index.html`
   - Error: `index.html`
4. **Bucket Policy**: Same as above, replace bucket name with `cropwise-stage-frontend`

---

### **6.4 Create Production Bucket**

Production bucket with best practices:

1. Click **"Create bucket"**
2. Configure:
   - **Bucket name**: `cropwise-prod-frontend`
   - **Region**: us-east-1
   - **Block Public Access**: UNCHECK all
   - **Bucket Versioning**: ✅ **Enable** (important for rollback)
   - **Default encryption**: ✅ Enable (SSE-S3 or SSE-KMS for extra security)
   - **Object Lock**: ⭕ Disable (unless required for compliance)
   - **Tags**: `Environment=production`, `CostCenter=cropwise-prod`
3. **Enable Static Website Hosting**:
   - Index: `index.html`
   - Error: `index.html`
4. **Bucket Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cropwise-prod-frontend/*"
    }
  ]
}
```

---

### **6.5 Verify All Buckets**

You should now have 3 S3 buckets:

```
✅ cropwise-dev-frontend   (Static website hosting enabled)
✅ cropwise-stage-frontend (Static website hosting enabled)
✅ cropwise-prod-frontend  (Static website hosting enabled, versioning enabled)
```

### **6.6 Test Direct S3 Access** (Optional)

Upload a test `index.html` to verify:

```powershell
# Create test file
echo "<h1>CropWise Dev Frontend</h1>" > index.html

# Upload to dev bucket
aws s3 cp index.html s3://cropwise-dev-frontend/

# Test in browser:
# http://cropwise-dev-frontend.s3-website-us-east-1.amazonaws.com
```

---

## 🌐 STEP 7: Create CloudFront Distribution

**What it is**: CDN for fast global delivery of your frontend

### **7.1 Go to CloudFront Console**
👉 https://console.aws.amazon.com/cloudfront/home

### **7.2 Create Distribution**

1. Click **"Create distribution"**

**Origin Settings:**
- **Origin domain**: Select your S3 bucket from dropdown
  - `cropwise-dev-frontend.s3.us-east-1.amazonaws.com`
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

👉 https://github.com/yellowflowersorganics-star/cropwise/settings/secrets/actions/new

### **7.7 Repeat for Production**

Create production distribution for `cropwise-prod-frontend` bucket

---

## ✅ STEP 8: Update GitHub Secrets

Add these new secrets based on the resources you created:

### **Frontend URLs**

```
Name: VITE_API_URL
Value: http://cropwise-dev-alb-123456789.us-east-1.elb.amazonaws.com
```

### **CloudFront Distribution IDs**

```
Name: CLOUDFRONT_DEV_DISTRIBUTION_ID
Value: E1234ABCDEFGH (from Step 7.6)

Name: CLOUDFRONT_PROD_DISTRIBUTION_ID  
Value: E5678IJKLMNOP (production distribution)
```

👉 Update at: https://github.com/yellowflowersorganics-star/cropwise/settings/secrets/actions

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
   http://cropwise-dev-alb-123456789.us-east-1.elb.amazonaws.com/api/auth/google/callback
   https://d111111abcdef8.cloudfront.net/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```
5. Click **"Save"**

---

## 🚀 STEP 10: Deploy!

Now you're ready to deploy:

```powershell
cd C:\Users\praghav\cropwise

# Deploy to development
git checkout develop
git push origin develop

# Watch deployment
start https://github.com/yellowflowersorganics-star/cropwise/actions
```

---

## 📋 Infrastructure Checklist

Before deploying, verify you've created:

### **Development Environment**
- [x] ECR Repository: `cropwise-backend-dev`
- [x] ECS Cluster: `cropwise-dev-cluster`
- [x] ECS Task Definition: `cropwise-backend-dev`
- [x] ECS Service: `cropwise-backend-dev`
- [x] Application Load Balancer: `cropwise-dev-alb`
- [x] Target Group: `cropwise-dev-backend-tg`
- [x] S3 Bucket: `cropwise-dev-frontend`
- [x] CloudFront Distribution
- [x] RDS PostgreSQL: `cropwise-production-db`

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
- Backend: `http://cropwise-dev-alb-123456789.us-east-1.elb.amazonaws.com`
- Database: `cropwise-production-db.xxx.us-east-1.rds.amazonaws.com`

**Production:**
- Frontend: `https://d222222abcdef9.cloudfront.net`
- Backend: `http://cropwise-prod-alb-987654321.us-east-1.elb.amazonaws.com`
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

