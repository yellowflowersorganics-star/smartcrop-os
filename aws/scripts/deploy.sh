#!/bin/bash

###############################################################################
# CropWise - AWS Deployment Script
# This script automates the deployment process to AWS
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CropWise - AWS Deployment${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo -e "${YELLOW}Install from: https://aws.amazon.com/cli/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI found${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo -e "${YELLOW}Run: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials configured${NC}"

# Get AWS account info
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${BLUE}Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}\n"

# Function to create S3 bucket for deployment
create_s3_bucket() {
    BUCKET_NAME="cropwise-deployment-${AWS_ACCOUNT_ID}"
    
    echo -e "${YELLOW}Creating S3 bucket: ${BUCKET_NAME}${NC}"
    
    if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
        if [ "$AWS_REGION" = "us-east-1" ]; then
            aws s3 mb "s3://${BUCKET_NAME}"
        else
            aws s3 mb "s3://${BUCKET_NAME}" --region "${AWS_REGION}"
        fi
        echo -e "${GREEN}✓ S3 bucket created${NC}"
    else
        echo -e "${GREEN}✓ S3 bucket already exists${NC}"
    fi
}

# Function to build backend
build_backend() {
    echo -e "\n${YELLOW}Building backend...${NC}"
    cd ../backend
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    echo -e "${GREEN}✓ Backend built${NC}"
    cd ../aws/scripts
}

# Function to build frontend
build_frontend() {
    echo -e "\n${YELLOW}Building frontend...${NC}"
    cd ../frontend
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    npm run build
    echo -e "${GREEN}✓ Frontend built${NC}"
    cd ../aws/scripts
}

# Function to deploy frontend to S3
deploy_frontend() {
    echo -e "\n${YELLOW}Deploying frontend to S3...${NC}"
    
    FRONTEND_BUCKET="cropwise-frontend-${AWS_ACCOUNT_ID}"
    
    # Create bucket
    if aws s3 ls "s3://${FRONTEND_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
        if [ "$AWS_REGION" = "us-east-1" ]; then
            aws s3 mb "s3://${FRONTEND_BUCKET}"
        else
            aws s3 mb "s3://${FRONTEND_BUCKET}" --region "${AWS_REGION}"
        fi
    fi
    
    # Enable static website hosting
    aws s3 website "s3://${FRONTEND_BUCKET}" \
        --index-document index.html \
        --error-document index.html
    
    # Upload frontend build
    cd ../../frontend
    aws s3 sync dist/ "s3://${FRONTEND_BUCKET}/" --delete
    
    # Make bucket public
    aws s3api put-bucket-policy --bucket "${FRONTEND_BUCKET}" --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Sid\": \"PublicReadGetObject\",
                \"Effect\": \"Allow\",
                \"Principal\": \"*\",
                \"Action\": \"s3:GetObject\",
                \"Resource\": \"arn:aws:s3:::${FRONTEND_BUCKET}/*\"
            }
        ]
    }"
    
    echo -e "${GREEN}✓ Frontend deployed${NC}"
    echo -e "${BLUE}Frontend URL: http://${FRONTEND_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com${NC}"
    
    cd ../aws/scripts
}

# Main deployment
main() {
    echo -e "${YELLOW}Starting deployment...${NC}\n"
    
    create_s3_bucket
    build_backend
    build_frontend
    deploy_frontend
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. Configure RDS PostgreSQL database"
    echo -e "2. Configure ElastiCache Redis"
    echo -e "3. Deploy backend to Elastic Beanstalk"
    echo -e "4. Configure environment variables"
    echo -e "\nRun: ${YELLOW}./setup-infrastructure.sh${NC} to set up AWS infrastructure\n"
}

# Run main function
main

