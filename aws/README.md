# AWS Deployment Configurations

This directory contains all AWS deployment configurations for SmartCrop OS.

## Files Overview

### CloudFormation
- **`cloudformation-template.yaml`** - Complete infrastructure as code
  - Creates VPC, subnets, security groups
  - Sets up RDS PostgreSQL and ElastiCache Redis
  - Configures ECS cluster and ALB
  - Manages secrets in Secrets Manager

### ECS Task Definitions
- **`ecs-backend-task.json`** - Backend container configuration
  - Node.js backend running on port 3000
  - Health checks and logging configured
  - Environment variables from Secrets Manager

- **`ecs-frontend-task.json`** - Frontend container configuration
  - React app served with Nginx
  - Optimized for production

### IAM Roles
- **`iam-roles.json`** - Required IAM roles and policies
  - ECS Task Execution Role
  - ECS Task Role with required permissions

## Quick Deploy

### Option 1: CloudFormation (Recommended)
```bash
./scripts/cloudformation-deploy.sh
```

### Option 2: Manual ECS
```bash
# 1. Create infrastructure
./scripts/aws-setup.sh

# 2. Deploy containers
./scripts/aws-deploy.sh
```

## Customization

### Update Task Definitions
```bash
# Edit task files
vi aws/ecs-backend-task.json

# Register new version
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-backend-task.json

# Update service
aws ecs update-service \
  --cluster smartcrop-cluster \
  --service smartcrop-backend \
  --task-definition smartcrop-backend:NEW_REVISION
```

### Modify CloudFormation Stack
```bash
# Update template
vi aws/cloudformation-template.yaml

# Update stack
aws cloudformation update-stack \
  --stack-name smartcrop-os-production \
  --template-body file://aws/cloudformation-template.yaml \
  --capabilities CAPABILITY_IAM
```

## Architecture

```
┌─────────────────────────────────────┐
│  Application Load Balancer (ALB)   │
└─────────────────┬───────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼────┐      ┌────▼────┐
    │ Backend │      │ Backend │
    │  (ECS)  │      │  (ECS)  │
    └────┬────┘      └────┬────┘
         │                │
         └────────┬───────┘
                  │
         ┌────────▼────────┐
         │     Redis       │
         │ (ElastiCache)   │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │   PostgreSQL    │
         │     (RDS)       │
         └─────────────────┘
```

## Cost Optimization

1. **Free Tier** (First 12 months)
   - Use t3.micro instances
   - db.t3.micro for RDS
   - cache.t3.micro for Redis

2. **Reserved Instances** (After free tier)
   - 1-year term: 30-40% savings
   - 3-year term: 50-60% savings

3. **Auto Scaling**
   - Configure in CloudFormation template
   - Scale based on CPU/memory usage

## Security

- All secrets stored in AWS Secrets Manager
- Private subnets for database and cache
- Security groups restrict traffic between services
- VPC isolates your infrastructure
- SSL/TLS encryption in transit
- Encryption at rest for RDS and ElastiCache

## Monitoring

View logs:
```bash
# Backend logs
aws logs tail /ecs/smartcrop-backend --follow

# Frontend logs
aws logs tail /ecs/smartcrop-frontend --follow
```

View metrics in CloudWatch Console:
- CPU utilization
- Memory usage
- Request count
- Error rate
- Database connections

## Cleanup

**⚠️ WARNING: This deletes all AWS resources!**

```bash
./scripts/aws-cleanup.sh
```

## Support

- [Full Deployment Guide](../docs/AWS_DEPLOYMENT_GUIDE.md)
- [Quick Start Guide](../docs/AWS_QUICK_START.md)
- GitHub Issues: https://github.com/your-repo/issues

