#!/bin/bash
# CropWise - AWS Infrastructure Setup
# This script creates all required AWS resources

set -e

echo "🌱 CropWise - AWS Infrastructure Setup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
APP_NAME="cropwise"
DB_USERNAME="cropwise_admin"
DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)}

echo -e "${BLUE}Region: $AWS_REGION${NC}"
echo -e "${YELLOW}⚠️  Save this password: $DB_PASSWORD${NC}"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq not installed (required for JSON parsing)${NC}"
    echo "Install: sudo apt-get install jq  # or  brew install jq"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $ACCOUNT_ID"
echo ""

# Step 1: Create VPC
echo "📡 Step 1: Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$APP_NAME-vpc}]" \
    --region $AWS_REGION \
    --query 'Vpc.VpcId' \
    --output text)
echo -e "${GREEN}✅ VPC created: $VPC_ID${NC}"

# Enable DNS
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support

# Step 2: Create Internet Gateway
echo ""
echo "🌐 Step 2: Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$APP_NAME-igw}]" \
    --region $AWS_REGION \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)

aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID --region $AWS_REGION
echo -e "${GREEN}✅ Internet Gateway created: $IGW_ID${NC}"

# Step 3: Create Subnets (2 public, 2 private)
echo ""
echo "🏗️  Step 3: Creating Subnets..."

# Public Subnets
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-public-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-public-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# Private Subnets
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.10.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-private-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.11.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-private-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)

echo -e "${GREEN}✅ Subnets created${NC}"

# Step 4: Create and configure Route Tables
echo ""
echo "🛣️  Step 4: Configuring Route Tables..."

ROUTE_TABLE_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$APP_NAME-public-rt}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_1 --route-table-id $ROUTE_TABLE_ID
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_2 --route-table-id $ROUTE_TABLE_ID

echo -e "${GREEN}✅ Route tables configured${NC}"

# Step 5: Create Security Groups
echo ""
echo "🔒 Step 5: Creating Security Groups..."

# ALB Security Group
ALB_SG=$(aws ec2 create-security-group \
    --group-name "$APP_NAME-alb-sg" \
    --description "Security group for ALB" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0

# ECS Security Group
ECS_SG=$(aws ec2 create-security-group \
    --group-name "$APP_NAME-ecs-sg" \
    --description "Security group for ECS tasks" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 3000 --source-group $ALB_SG
aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 8080 --source-group $ALB_SG

# RDS Security Group
RDS_SG=$(aws ec2 create-security-group \
    --group-name "$APP_NAME-rds-sg" \
    --description "Security group for RDS" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 5432 --source-group $ECS_SG

# Redis Security Group
REDIS_SG=$(aws ec2 create-security-group \
    --group-name "$APP_NAME-redis-sg" \
    --description "Security group for Redis" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress --group-id $REDIS_SG --protocol tcp --port 6379 --source-group $ECS_SG

echo -e "${GREEN}✅ Security groups created${NC}"

# Step 6: Create RDS Subnet Group
echo ""
echo "💾 Step 6: Creating RDS Subnet Group..."

aws rds create-db-subnet-group \
    --db-subnet-group-name "$APP_NAME-db-subnet-group" \
    --db-subnet-group-description "Subnet group for CropWise database" \
    --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2

echo -e "${GREEN}✅ RDS subnet group created${NC}"

# Step 7: Create RDS Instance
echo ""
echo "💾 Step 7: Creating RDS PostgreSQL instance (this takes ~10 minutes)..."

aws rds create-db-instance \
    --db-instance-identifier "$APP_NAME-db" \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username $DB_USERNAME \
    --master-user-password $DB_PASSWORD \
    --allocated-storage 20 \
    --db-subnet-group-name "$APP_NAME-db-subnet-group" \
    --vpc-security-group-ids $RDS_SG \
    --backup-retention-period 7 \
    --publicly-accessible false \
    --storage-encrypted \
    --db-name cropwise_db

echo -e "${GREEN}✅ RDS instance creation started${NC}"

# Step 8: Create ElastiCache Subnet Group
echo ""
echo "⚡ Step 8: Creating ElastiCache Subnet Group..."

aws elasticache create-cache-subnet-group \
    --cache-subnet-group-name "$APP_NAME-redis-subnet-group" \
    --cache-subnet-group-description "Subnet group for CropWise Redis" \
    --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2

echo -e "${GREEN}✅ ElastiCache subnet group created${NC}"

# Step 9: Create ElastiCache Redis
echo ""
echo "⚡ Step 9: Creating ElastiCache Redis cluster..."

aws elasticache create-cache-cluster \
    --cache-cluster-id "$APP_NAME-redis" \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --cache-subnet-group-name "$APP_NAME-redis-subnet-group" \
    --security-group-ids $REDIS_SG

echo -e "${GREEN}✅ Redis cluster creation started${NC}"

# Step 10: Create ECS Cluster
echo ""
echo "🐳 Step 10: Creating ECS Cluster..."

aws ecs create-cluster \
    --cluster-name "$APP_NAME-cluster" \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1

echo -e "${GREEN}✅ ECS cluster created${NC}"

# Step 11: Create Application Load Balancer
echo ""
echo "⚖️  Step 11: Creating Application Load Balancer..."

ALB_ARN=$(aws elbv2 create-load-balancer \
    --name "$APP_NAME-alb" \
    --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
    --security-groups $ALB_SG \
    --scheme internet-facing \
    --type application \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)

ALB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --query 'LoadBalancers[0].DNSName' \
    --output text)

echo -e "${GREEN}✅ ALB created: $ALB_DNS${NC}"

# Save configuration
echo ""
echo "💾 Saving configuration..."

cat > aws-config.json <<EOF
{
  "accountId": "$ACCOUNT_ID",
  "region": "$AWS_REGION",
  "vpcId": "$VPC_ID",
  "publicSubnets": ["$PUBLIC_SUBNET_1", "$PUBLIC_SUBNET_2"],
  "privateSubnets": ["$PRIVATE_SUBNET_1", "$PRIVATE_SUBNET_2"],
  "securityGroups": {
    "alb": "$ALB_SG",
    "ecs": "$ECS_SG",
    "rds": "$RDS_SG",
    "redis": "$REDIS_SG"
  },
  "albArn": "$ALB_ARN",
  "albDns": "$ALB_DNS",
  "dbUsername": "$DB_USERNAME",
  "dbPassword": "$DB_PASSWORD"
}
EOF

echo -e "${GREEN}✅ Configuration saved to aws-config.json${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ AWS Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Summary:"
echo "  VPC:                $VPC_ID"
echo "  Public Subnets:     $PUBLIC_SUBNET_1, $PUBLIC_SUBNET_2"
echo "  Private Subnets:    $PRIVATE_SUBNET_1, $PRIVATE_SUBNET_2"
echo "  Load Balancer:      $ALB_DNS"
echo "  ECS Cluster:        $APP_NAME-cluster"
echo "  Database:           $APP_NAME-db (creating...)"
echo "  Redis:              $APP_NAME-redis (creating...)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Save these credentials!${NC}"
echo "  DB Username: $DB_USERNAME"
echo "  DB Password: $DB_PASSWORD"
echo ""
echo "⏳ RDS and Redis are still creating (5-10 minutes)"
echo "   Check status: aws rds describe-db-instances --db-instance-identifier $APP_NAME-db"
echo ""
echo "🚀 Next Steps:"
echo "  1. Wait for RDS and Redis to finish creating"
echo "  2. Run: ./scripts/aws-deploy.sh to deploy application"
echo ""

