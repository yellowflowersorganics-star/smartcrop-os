#!/bin/bash

###############################################################################
# CropWise - AWS Infrastructure Setup
# Sets up RDS, ElastiCache, Security Groups, etc.
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CropWise - Infrastructure Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

AWS_REGION=${AWS_REGION:-ap-south-1}
DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -base64 16)}
REDIS_PORT=6379
DB_PORT=5432

echo -e "${YELLOW}Configuration:${NC}"
echo -e "Region: ${AWS_REGION}"
echo -e "Database Password: ${DB_PASSWORD} (save this!)\n"

# Create VPC
create_vpc() {
    echo -e "${YELLOW}Creating VPC...${NC}"
    
    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block 10.0.0.0/16 \
        --region ${AWS_REGION} \
        --query 'Vpc.VpcId' \
        --output text)
    
    aws ec2 create-tags \
        --resources ${VPC_ID} \
        --tags Key=Name,Value=cropwise-vpc \
        --region ${AWS_REGION}
    
    echo -e "${GREEN}✓ VPC created: ${VPC_ID}${NC}"
    
    # Enable DNS
    aws ec2 modify-vpc-attribute \
        --vpc-id ${VPC_ID} \
        --enable-dns-hostnames \
        --region ${AWS_REGION}
    
    aws ec2 modify-vpc-attribute \
        --vpc-id ${VPC_ID} \
        --enable-dns-support \
        --region ${AWS_REGION}
}

# Create Subnets
create_subnets() {
    echo -e "${YELLOW}Creating subnets...${NC}"
    
    # Public Subnet 1
    SUBNET_PUBLIC_1=$(aws ec2 create-subnet \
        --vpc-id ${VPC_ID} \
        --cidr-block 10.0.1.0/24 \
        --availability-zone ${AWS_REGION}a \
        --region ${AWS_REGION} \
        --query 'Subnet.SubnetId' \
        --output text)
    
    aws ec2 create-tags \
        --resources ${SUBNET_PUBLIC_1} \
        --tags Key=Name,Value=cropwise-public-1 \
        --region ${AWS_REGION}
    
    # Public Subnet 2
    SUBNET_PUBLIC_2=$(aws ec2 create-subnet \
        --vpc-id ${VPC_ID} \
        --cidr-block 10.0.2.0/24 \
        --availability-zone ${AWS_REGION}b \
        --region ${AWS_REGION} \
        --query 'Subnet.SubnetId' \
        --output text)
    
    aws ec2 create-tags \
        --resources ${SUBNET_PUBLIC_2} \
        --tags Key=Name,Value=cropwise-public-2 \
        --region ${AWS_REGION}
    
    # Private Subnet 1
    SUBNET_PRIVATE_1=$(aws ec2 create-subnet \
        --vpc-id ${VPC_ID} \
        --cidr-block 10.0.3.0/24 \
        --availability-zone ${AWS_REGION}a \
        --region ${AWS_REGION} \
        --query 'Subnet.SubnetId' \
        --output text)
    
    aws ec2 create-tags \
        --resources ${SUBNET_PRIVATE_1} \
        --tags Key=Name,Value=cropwise-private-1 \
        --region ${AWS_REGION}
    
    # Private Subnet 2
    SUBNET_PRIVATE_2=$(aws ec2 create-subnet \
        --vpc-id ${VPC_ID} \
        --cidr-block 10.0.4.0/24 \
        --availability-zone ${AWS_REGION}b \
        --region ${AWS_REGION} \
        --query 'Subnet.SubnetId' \
        --output text)
    
    aws ec2 create-tags \
        --resources ${SUBNET_PRIVATE_2} \
        --tags Key=Name,Value=cropwise-private-2 \
        --region ${AWS_REGION}
    
    echo -e "${GREEN}✓ Subnets created${NC}"
}

# Create Internet Gateway
create_internet_gateway() {
    echo -e "${YELLOW}Creating Internet Gateway...${NC}"
    
    IGW_ID=$(aws ec2 create-internet-gateway \
        --region ${AWS_REGION} \
        --query 'InternetGateway.InternetGatewayId' \
        --output text)
    
    aws ec2 attach-internet-gateway \
        --vpc-id ${VPC_ID} \
        --internet-gateway-id ${IGW_ID} \
        --region ${AWS_REGION}
    
    aws ec2 create-tags \
        --resources ${IGW_ID} \
        --tags Key=Name,Value=cropwise-igw \
        --region ${AWS_REGION}
    
    echo -e "${GREEN}✓ Internet Gateway created: ${IGW_ID}${NC}"
}

# Create Security Groups
create_security_groups() {
    echo -e "${YELLOW}Creating security groups...${NC}"
    
    # Application Security Group
    APP_SG=$(aws ec2 create-security-group \
        --group-name cropwise-app-sg \
        --description "CropWise Application Security Group" \
        --vpc-id ${VPC_ID} \
        --region ${AWS_REGION} \
        --query 'GroupId' \
        --output text)
    
    # Allow HTTP/HTTPS
    aws ec2 authorize-security-group-ingress \
        --group-id ${APP_SG} \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region ${AWS_REGION}
    
    aws ec2 authorize-security-group-ingress \
        --group-id ${APP_SG} \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --region ${AWS_REGION}
    
    aws ec2 authorize-security-group-ingress \
        --group-id ${APP_SG} \
        --protocol tcp \
        --port 3000 \
        --cidr 0.0.0.0/0 \
        --region ${AWS_REGION}
    
    # Database Security Group
    DB_SG=$(aws ec2 create-security-group \
        --group-name cropwise-db-sg \
        --description "CropWise Database Security Group" \
        --vpc-id ${VPC_ID} \
        --region ${AWS_REGION} \
        --query 'GroupId' \
        --output text)
    
    # Allow PostgreSQL from app
    aws ec2 authorize-security-group-ingress \
        --group-id ${DB_SG} \
        --protocol tcp \
        --port 5432 \
        --source-group ${APP_SG} \
        --region ${AWS_REGION}
    
    # Redis Security Group
    REDIS_SG=$(aws ec2 create-security-group \
        --group-name cropwise-redis-sg \
        --description "CropWise Redis Security Group" \
        --vpc-id ${VPC_ID} \
        --region ${AWS_REGION} \
        --query 'GroupId' \
        --output text)
    
    # Allow Redis from app
    aws ec2 authorize-security-group-ingress \
        --group-id ${REDIS_SG} \
        --protocol tcp \
        --port 6379 \
        --source-group ${APP_SG} \
        --region ${AWS_REGION}
    
    echo -e "${GREEN}✓ Security groups created${NC}"
}

# Create RDS PostgreSQL
create_rds() {
    echo -e "${YELLOW}Creating RDS PostgreSQL instance...${NC}"
    echo -e "${YELLOW}This may take 10-15 minutes...${NC}"
    
    # Create DB subnet group
    aws rds create-db-subnet-group \
        --db-subnet-group-name cropwise-db-subnet \
        --db-subnet-group-description "CropWise DB Subnet Group" \
        --subnet-ids ${SUBNET_PRIVATE_1} ${SUBNET_PRIVATE_2} \
        --region ${AWS_REGION}
    
    # Create RDS instance
    aws rds create-db-instance \
        --db-instance-identifier cropwise-db \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 15.4 \
        --master-username cropwise_admin \
        --master-user-password ${DB_PASSWORD} \
        --allocated-storage 20 \
        --db-subnet-group-name cropwise-db-subnet \
        --vpc-security-group-ids ${DB_SG} \
        --backup-retention-period 7 \
        --no-publicly-accessible \
        --region ${AWS_REGION}
    
    echo -e "${GREEN}✓ RDS instance creation initiated${NC}"
    echo -e "${YELLOW}Run 'aws rds describe-db-instances' to check status${NC}"
}

# Create ElastiCache Redis
create_redis() {
    echo -e "${YELLOW}Creating ElastiCache Redis cluster...${NC}"
    
    # Create cache subnet group
    aws elasticache create-cache-subnet-group \
        --cache-subnet-group-name cropwise-redis-subnet \
        --cache-subnet-group-description "CropWise Redis Subnet Group" \
        --subnet-ids ${SUBNET_PRIVATE_1} ${SUBNET_PRIVATE_2} \
        --region ${AWS_REGION}
    
    # Create Redis cluster
    aws elasticache create-cache-cluster \
        --cache-cluster-id cropwise-redis \
        --cache-node-type cache.t3.micro \
        --engine redis \
        --num-cache-nodes 1 \
        --cache-subnet-group-name cropwise-redis-subnet \
        --security-group-ids ${REDIS_SG} \
        --region ${AWS_REGION}
    
    echo -e "${GREEN}✓ Redis cluster creation initiated${NC}"
}

# Save configuration
save_config() {
    echo -e "${YELLOW}Saving configuration...${NC}"
    
    cat > ../config/infrastructure.json << EOF
{
  "region": "${AWS_REGION}",
  "vpcId": "${VPC_ID}",
  "subnets": {
    "public1": "${SUBNET_PUBLIC_1}",
    "public2": "${SUBNET_PUBLIC_2}",
    "private1": "${SUBNET_PRIVATE_1}",
    "private2": "${SUBNET_PRIVATE_2}"
  },
  "securityGroups": {
    "app": "${APP_SG}",
    "database": "${DB_SG}",
    "redis": "${REDIS_SG}"
  },
  "database": {
    "password": "${DB_PASSWORD}",
    "username": "cropwise_admin"
  }
}
EOF
    
    echo -e "${GREEN}✓ Configuration saved to aws/config/infrastructure.json${NC}"
}

# Main
main() {
    create_vpc
    create_subnets
    create_internet_gateway
    create_security_groups
    create_rds
    create_redis
    save_config
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  Infrastructure Setup Complete! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo -e "${BLUE}Configuration saved to: aws/config/infrastructure.json${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Save your database password: ${DB_PASSWORD}${NC}\n"
    
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. Wait for RDS and Redis to finish provisioning (10-15 minutes)"
    echo -e "2. Run: ${YELLOW}./get-endpoints.sh${NC} to get connection strings"
    echo -e "3. Configure Elastic Beanstalk with: ${YELLOW}./setup-elasticbeanstalk.sh${NC}\n"
}

main

