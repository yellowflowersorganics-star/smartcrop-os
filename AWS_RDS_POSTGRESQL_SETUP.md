# 🗄️ AWS RDS PostgreSQL Setup Guide

Complete step-by-step guide to set up PostgreSQL on AWS RDS for CropWise.

---

## 📋 Table of Contents

1. [Quick Setup (15 minutes)](#quick-setup)
2. [Detailed Setup Steps](#detailed-setup-steps)
3. [Getting Your DATABASE_URL](#getting-your-database_url)
4. [Testing the Connection](#testing-the-connection)
5. [Security Best Practices](#security-best-practices)
6. [Pricing Estimates](#pricing-estimates)

---

## 🚀 Quick Setup

### What You'll Create:
- **PostgreSQL 15** database on AWS RDS
- **Free tier eligible** (if available) or ~$15-30/month
- **Automatic backups** enabled
- **Multi-AZ** for production (optional, +100% cost)

### What You'll Get:
```
DATABASE_URL=postgresql://cropwise_admin:YourSecurePassword123!@cropwise-db.abc123xyz.us-east-1.rds.amazonaws.com:5432/cropwise_production
```

---

## 📝 Detailed Setup Steps

### **Step 1: Log in to AWS Console**

1. Go to: https://console.aws.amazon.com
2. Sign in with your AWS account
3. **Select your region** (top-right corner)
   - Recommended: **us-east-1** (N. Virginia) - Lowest cost, most services
   - Use the same region as your `AWS_REGION` secret

---

### **Step 2: Navigate to RDS**

1. In the AWS Console search bar, type: **RDS**
2. Click **RDS** (Relational Database Service)
3. Click **Create database** button (orange button)

---

### **Step 3: Choose Database Configuration**

#### **Database Creation Method:**
- ✅ Select: **Standard create** (gives you more control)

#### **Engine Options:**
- ✅ **Engine type**: PostgreSQL
- ✅ **Version**: PostgreSQL 15.x (latest stable)

#### **Templates:**
Choose based on your needs:

**For Development/Testing:**
- ✅ **Free tier** (if available in your account)
  - db.t3.micro (1 vCPU, 1 GB RAM)
  - 20 GB storage
  - Single-AZ
  - Perfect for testing

**For Production:**
- ✅ **Production** template
  - Enables Multi-AZ (high availability)
  - Automatic backups
  - Enhanced monitoring

**For Small Production (Budget-Friendly):**
- ✅ **Dev/Test** template, but manually configure:
  - Single-AZ (save 50% cost)
  - Enable backups
  - Good starting point, scale later

---

### **Step 4: Settings**

#### **DB Instance Identifier:**
```
cropwise-production-db
```
(This is just a name for AWS, not used in connection string)

#### **Credentials Settings:**

**Master Username:**
```
cropwise_admin
```

**Master Password:**
```
Generate a secure password (or use this format):
CropWise2025!Production@DB
```

**IMPORTANT**: 
- ✅ Save this password in your password manager (1Password, LastPass, etc.)
- ❌ Don't use simple passwords like "password123"
- You'll need this for the DATABASE_URL

---

### **Step 5: Instance Configuration**

#### **DB Instance Class:**

**For Development:**
```
db.t3.micro
- 1 vCPU, 1 GB RAM
- Free tier eligible (750 hours/month)
- ~$0/month (free tier) or ~$15/month
```

**For Production (Small):**
```
db.t3.small
- 2 vCPU, 2 GB RAM
- ~$30/month
- Good for 100-1000 users
```

**For Production (Medium):**
```
db.t3.medium
- 2 vCPU, 4 GB RAM
- ~$60/month
- Good for 1000-10000 users
```

#### **Storage:**

**Storage Type:**
- ✅ **General Purpose SSD (gp3)** - Best performance/cost ratio

**Allocated Storage:**
- Development: **20 GB** (minimum)
- Production: **100 GB** (recommended starting point)

**Storage Autoscaling:**
- ✅ **Enable** storage autoscaling
- Maximum storage threshold: **1000 GB**
- Will grow automatically as you need more space

---

### **Step 6: Connectivity**

#### **Compute Resource:**
- ⭕ **Don't connect to an EC2 compute resource** (select "Don't connect")
- We'll configure VPC manually

#### **Network Type:**
- ✅ **IPv4**

#### **Virtual Private Cloud (VPC):**
- Select: **Default VPC** (if this is your first time)
- Or select your custom VPC if you have one

#### **DB Subnet Group:**
- Select: **default** (AWS will create public/private subnets)

#### **Public Access:**

**For Development:**
- ✅ **Yes** - Easier to connect from your local machine
- ⚠️ **Note**: Still secured by security group

**For Production:**
- ⭕ **No** - More secure (only accessible from VPC)
- Your EC2/ECS instances will connect internally
- Use bastion host or VPN for direct access

**Recommendation**: Start with **Yes** for easier setup, change to **No** later

#### **VPC Security Group:**
- ✅ **Create new**
- Name: `cropwise-db-sg`

#### **Availability Zone:**
- ⭕ **No preference** (let AWS choose)

#### **Database Port:**
- Keep default: **5432**

---

### **Step 7: Database Authentication**

- ✅ **Password authentication** (default)
- ⭕ Skip IAM database authentication (for now)

---

### **Step 8: Monitoring**

#### **Enhanced Monitoring:**
- ✅ **Enable** (recommended for production)
- Granularity: **60 seconds** (default)

#### **Performance Insights:**
- ✅ **Enable** Performance Insights
- Retention: **7 days** (free tier)

---

### **Step 9: Additional Configuration**

Click **"Additional configuration"** to expand:

#### **Database Options:**

**Initial Database Name:**
```
cropwise_production
```
⚠️ **IMPORTANT**: This creates the initial database. If you leave this blank, no database is created!

#### **DB Parameter Group:**
- Keep default: `default.postgres15`

#### **Option Group:**
- Keep default: `default:postgres-15`

#### **Backup:**

**Automated Backups:**
- ✅ **Enable** automated backups
- Backup retention: **7 days** (minimum)
- Backup window: **Choose a time with low traffic** (e.g., 3:00 AM your timezone)

**Copy Tags to Snapshots:**
- ✅ Enable

#### **Encryption:**
- ✅ **Enable encryption** (recommended)
- Use default AWS KMS key

#### **Log Exports:**
Select logs to send to CloudWatch:
- ✅ PostgreSQL log
- ⭕ Upgrade log (optional)

#### **Maintenance:**

**Auto Minor Version Upgrade:**
- ✅ **Enable** (automatic security patches)

**Maintenance Window:**
- ⭕ **No preference** (or choose a low-traffic time)

#### **Deletion Protection:**
- ✅ **Enable** deletion protection (for production)
- ⭕ Disable for dev/test (easier to delete)

---

### **Step 10: Review and Create**

1. Review all settings
2. **Estimated monthly cost** will be shown at the bottom
3. Click **"Create database"** (orange button)

**Wait Time**: 
- ⏱️ Database creation takes **5-10 minutes**
- Status will show "Creating..." → "Available"

---

## 🔗 Getting Your DATABASE_URL

### **Step 1: Wait for Database to be Available**

1. Go to: https://console.aws.amazon.com/rds/home
2. Click **Databases** in left sidebar
3. Wait until Status shows: **Available** ✅

### **Step 2: Get the Endpoint**

1. Click on your database name: `cropwise-production-db`
2. In the **Connectivity & security** tab, find:
   ```
   Endpoint: cropwise-production-db.c9abc123xyz.us-east-1.rds.amazonaws.com
   Port: 5432
   ```
3. **Copy the Endpoint** (this is your database hostname)

### **Step 3: Construct DATABASE_URL**

Format:
```
postgresql://[username]:[password]@[endpoint]:[port]/[database_name]
```

Example with your values:
```
postgresql://cropwise_admin:CropWise2025!Production@DB@cropwise-production-db.c9abc123xyz.us-east-1.rds.amazonaws.com:5432/cropwise_production
```

**Your actual DATABASE_URL:**
```
postgresql://cropwise_admin:YOUR_PASSWORD_HERE@YOUR_ENDPOINT_HERE:5432/cropwise_production
```

Replace:
- `YOUR_PASSWORD_HERE` → The master password you created in Step 4
- `YOUR_ENDPOINT_HERE` → The endpoint from Step 2

### **Step 4: Add to GitHub Secrets**

1. Go to: https://github.com/yellowflowersorganics-star/cropwise/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `DATABASE_URL`
4. Value: Your complete DATABASE_URL from above
5. Click **"Add secret"**

---

## 🔒 Security Configuration

### **Step 1: Configure Security Group**

Your database needs to allow connections:

1. In RDS Console, click your database
2. Under **Connectivity & security**, click the **VPC security group** link
3. Click **Edit inbound rules**
4. Add rules:

#### **For Development (Public Access):**
```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: Your IP address (e.g., 123.45.67.89/32)
Description: My local machine
```

To find your IP: https://whatismyipaddress.com

#### **For Production (Private Access):**
```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: Security group of your ECS/EC2 instances
Description: CropWise backend services
```

⚠️ **Never use 0.0.0.0/0** (allows anyone to connect)

---

## 🧪 Testing the Connection

### **Option 1: Using psql (Command Line)**

```powershell
# Install PostgreSQL client (if not installed)
# Download from: https://www.postgresql.org/download/windows/

# Connect to database
psql "postgresql://cropwise_admin:YOUR_PASSWORD@YOUR_ENDPOINT:5432/cropwise_production"

# Should see:
# cropwise_production=>
```

### **Option 2: Using pgAdmin (GUI)**

1. Download pgAdmin: https://www.pgadmin.org/download/
2. Install and open pgAdmin
3. Right-click **Servers** → **Register** → **Server**
4. **General** tab:
   - Name: `CropWise Production`
5. **Connection** tab:
   - Host: `YOUR_ENDPOINT` (from RDS)
   - Port: `5432`
   - Database: `cropwise_production`
   - Username: `cropwise_admin`
   - Password: `YOUR_PASSWORD`
6. Click **Save**

### **Option 3: Using Node.js (Test Script)**

Create a test file:

```javascript
// test-db-connection.js
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://cropwise_admin:YOUR_PASSWORD@YOUR_ENDPOINT:5432/cropwise_production';

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for RDS
  }
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('📅 Server time:', result.rows[0].now);
    
    const versionResult = await client.query('SELECT version()');
    console.log('🗄️  PostgreSQL version:', versionResult.rows[0].version);
    
    await client.end();
    console.log('✅ Test completed successfully!');
  } catch (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
}

testConnection();
```

Run:
```powershell
cd C:\Users\praghav\cropwise
node test-db-connection.js
```

---

## 💰 Pricing Estimates

### **Free Tier (First 12 Months)**
If your AWS account is less than 12 months old:
```
Instance: db.t3.micro (750 hours/month) → $0
Storage: 20 GB General Purpose SSD → $0
Backups: 20 GB → $0
Total: FREE for 750 hours/month
```

### **Development/Testing**
```
Instance: db.t3.micro (1 GB RAM)
Storage: 20 GB SSD
Backups: 20 GB
Monthly Cost: ~$15-20/month
```

### **Small Production**
```
Instance: db.t3.small (2 GB RAM)
Storage: 100 GB SSD
Backups: 100 GB
Single-AZ (no Multi-AZ)
Monthly Cost: ~$40-50/month
```

### **Production with High Availability**
```
Instance: db.t3.small (2 GB RAM)
Storage: 100 GB SSD
Backups: 100 GB
Multi-AZ: Enabled (2x instance cost)
Monthly Cost: ~$80-100/month
```

### **Cost Optimization Tips:**
1. **Start small** - Use db.t3.micro or db.t3.small
2. **Single-AZ first** - Add Multi-AZ later when needed
3. **Enable storage autoscaling** - Only pay for what you use
4. **Set up billing alerts** - Get notified at $25, $50, $100
5. **Use Reserved Instances** - Save 30-60% if you commit to 1-3 years

---

## 🎯 Database Initialization

After creating the database, you'll need to run migrations:

### **Using Prisma (if using Prisma ORM)**
```powershell
cd C:\Users\praghav\cropwise\backend
npm install
npx prisma migrate deploy
```

### **Using TypeORM**
```powershell
cd C:\Users\praghav\cropwise\backend
npm run migration:run
```

### **Using SQL Scripts**
```powershell
psql "postgresql://cropwise_admin:PASSWORD@ENDPOINT:5432/cropwise_production" < schema.sql
```

---

## 📊 Monitoring Your Database

### **CloudWatch Metrics (Automatic)**
Go to: https://console.aws.amazon.com/cloudwatch/

**Key Metrics to Watch:**
- **CPUUtilization** - Should stay below 80%
- **FreeableMemory** - Monitor for memory issues
- **DatabaseConnections** - Track connection usage
- **ReadLatency / WriteLatency** - Performance monitoring
- **FreeStorageSpace** - Prevent running out of space

### **Performance Insights**
1. Go to RDS Console
2. Click your database
3. Click **Performance Insights** tab
4. View real-time queries and performance

### **Set Up CloudWatch Alarms**
```
Alarm: High CPU Usage
Threshold: CPUUtilization > 80% for 5 minutes
Action: Send SNS notification to your email
```

---

## 🔄 Backup and Recovery

### **Automatic Backups**
- **Enabled by default** (7-35 days retention)
- **Point-in-time recovery** available
- **Zero downtime** backup process

### **Manual Snapshots**
1. Go to RDS Console
2. Select your database
3. **Actions** → **Take snapshot**
4. Name: `cropwise-prod-manual-backup-2025-11-14`
5. **Manual snapshots never expire** until you delete them

### **Restore from Backup**
1. Go to **Snapshots** in RDS Console
2. Select snapshot
3. **Actions** → **Restore snapshot**
4. Creates a **new database instance**
5. Update DATABASE_URL to point to restored instance

---

## 🚨 Common Issues and Solutions

### **Issue 1: Can't connect to database**

**Solution:**
1. Check security group allows your IP
2. Verify Public Access is enabled (for external connections)
3. Check VPC and subnet configuration
4. Verify username/password are correct
5. Ensure you're using the correct endpoint

### **Issue 2: "too many connections" error**

**Solution:**
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Max connections for db.t3.micro: ~87
-- Max connections for db.t3.small: ~158

-- Configure connection pooling in your app:
// backend/config/database.js
pool: {
  min: 2,
  max: 10  // Don't exceed instance limit
}
```

### **Issue 3: Slow queries**

**Solution:**
1. Enable Performance Insights
2. Check for missing indexes
3. Analyze slow query logs in CloudWatch
4. Consider upgrading instance size

### **Issue 4: Running out of storage**

**Solution:**
- Storage autoscaling should handle this
- If disabled, manually increase storage:
  1. Select database → **Modify**
  2. Increase **Allocated storage**
  3. Apply immediately or during maintenance window

---

## ✅ Post-Setup Checklist

After creating your database:

- [ ] Database status is "Available"
- [ ] Successfully connected using psql or pgAdmin
- [ ] Added DATABASE_URL to GitHub Secrets
- [ ] Security group configured correctly
- [ ] Backups enabled (7+ days retention)
- [ ] CloudWatch alarms set up
- [ ] Billing alert configured
- [ ] Tested connection from your application
- [ ] Ran database migrations
- [ ] Documented credentials in password manager

---

## 📚 Additional Resources

- **AWS RDS Documentation**: https://docs.aws.amazon.com/rds/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **RDS PostgreSQL Best Practices**: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html
- **Cost Calculator**: https://calculator.aws/#/

---

## 🎯 Quick Reference - DATABASE_URL Format

```bash
# Format
postgresql://[username]:[password]@[endpoint]:[port]/[database_name]

# Example
postgresql://cropwise_admin:SecurePass123!@cropwise-db.abc123.us-east-1.rds.amazonaws.com:5432/cropwise_production

# URL-encode special characters in password:
# @ → %40
# ! → %21
# # → %23
# $ → %24
# % → %25

# Example with encoded password (if password is: Pass@123!)
postgresql://cropwise_admin:Pass%40123%21@cropwise-db.abc123.us-east-1.rds.amazonaws.com:5432/cropwise_production
```

---

**Created**: November 14, 2025  
**Last Updated**: November 14, 2025  
**For**: CropWise Production Environment

