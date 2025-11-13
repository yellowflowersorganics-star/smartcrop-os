#!/bin/bash
# SmartCrop OS - AWS Deployment Script
# This script automates deployment to AWS

set -e  # Exit on error

echo "🌱 SmartCrop OS - AWS Deployment"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
APP_NAME="smartcrop-os"
ENVIRONMENT=${ENVIRONMENT:-production}

echo -e "${BLUE}Region: $AWS_REGION${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# Check if logged in
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not logged in to AWS${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ Logged in to AWS Account: $ACCOUNT_ID${NC}"

# Step 1: Build Docker images
echo ""
echo "📦 Step 1: Building Docker images..."
docker-compose build

# Step 2: Create ECR repositories
echo ""
echo "📦 Step 2: Creating ECR repositories..."

create_ecr_repo() {
    REPO_NAME=$1
    if aws ecr describe-repositories --repository-names $REPO_NAME --region $AWS_REGION &> /dev/null; then
        echo "Repository $REPO_NAME already exists"
    else
        aws ecr create-repository \
            --repository-name $REPO_NAME \
            --region $AWS_REGION \
            --image-scanning-configuration scanOnPush=true
        echo -e "${GREEN}✅ Created repository: $REPO_NAME${NC}"
    fi
}

create_ecr_repo "$APP_NAME-backend"
create_ecr_repo "$APP_NAME-frontend"

# Step 3: Login to ECR
echo ""
echo "🔐 Step 3: Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 4: Tag and push images
echo ""
echo "🚀 Step 4: Pushing images to ECR..."

ECR_BACKEND="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME-backend:latest"
ECR_FRONTEND="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME-frontend:latest"

docker tag smartcrop-backend:latest $ECR_BACKEND
docker tag smartcrop-frontend:latest $ECR_FRONTEND

docker push $ECR_BACKEND
docker push $ECR_FRONTEND

echo -e "${GREEN}✅ Images pushed successfully${NC}"

# Step 5: Update ECS task definitions
echo ""
echo "📝 Step 5: Updating ECS task definitions..."
echo "Image URIs:"
echo "  Backend:  $ECR_BACKEND"
echo "  Frontend: $ECR_FRONTEND"

# Step 6: Deploy to ECS
echo ""
echo "🚀 Step 6: Deploying to ECS..."
echo "Run: aws ecs update-service --cluster smartcrop-cluster --service smartcrop-backend --force-new-deployment"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update ECS services to use new images"
echo "2. Check CloudWatch logs for any errors"
echo "3. Verify application health at your domain"
echo ""

