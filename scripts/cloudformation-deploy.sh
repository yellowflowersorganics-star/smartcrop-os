#!/bin/bash
# SmartCrop OS - CloudFormation Deployment

set -e

echo "🌱 SmartCrop OS - CloudFormation Deployment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
STACK_NAME="smartcrop-os-production"
TEMPLATE_FILE="aws/cloudformation-template.yaml"
AWS_REGION=${AWS_REGION:-us-east-1}

# Prompt for parameters
echo ""
echo "Enter deployment parameters:"
echo ""

read -sp "Database Password (min 8 chars): " DB_PASSWORD
echo ""
read -sp "JWT Secret (min 32 chars): " JWT_SECRET
echo ""
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -sp "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""
echo ""

# Validate stack template
echo "📝 Validating CloudFormation template..."
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $AWS_REGION

echo -e "${GREEN}✅ Template is valid${NC}"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION &> /dev/null; then
    echo ""
    echo -e "${YELLOW}⚠️  Stack $STACK_NAME already exists${NC}"
    read -p "Do you want to update it? (yes/no): " UPDATE_STACK
    
    if [ "$UPDATE_STACK" == "yes" ]; then
        echo "🔄 Updating stack..."
        aws cloudformation update-stack \
            --stack-name $STACK_NAME \
            --template-body file://$TEMPLATE_FILE \
            --parameters \
                ParameterKey=Environment,ParameterValue=production \
                ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD \
                ParameterKey=JWTSecret,ParameterValue=$JWT_SECRET \
                ParameterKey=GoogleClientId,ParameterValue=$GOOGLE_CLIENT_ID \
                ParameterKey=GoogleClientSecret,ParameterValue=$GOOGLE_CLIENT_SECRET \
            --capabilities CAPABILITY_IAM \
            --region $AWS_REGION
        
        echo "⏳ Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete \
            --stack-name $STACK_NAME \
            --region $AWS_REGION
    else
        echo "Deployment cancelled."
        exit 0
    fi
else
    echo "🚀 Creating new stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters \
            ParameterKey=Environment,ParameterValue=production \
            ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD \
            ParameterKey=JWTSecret,ParameterValue=$JWT_SECRET \
            ParameterKey=GoogleClientId,ParameterValue=$GOOGLE_CLIENT_ID \
            ParameterKey=GoogleClientSecret,ParameterValue=$GOOGLE_CLIENT_SECRET \
        --capabilities CAPABILITY_IAM \
        --region $AWS_REGION
    
    echo "⏳ Waiting for stack creation to complete (this will take 10-15 minutes)..."
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $AWS_REGION
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ CloudFormation Stack Deployed!${NC}"
echo -e "${GREEN}========================================${NC}"

# Get outputs
echo ""
echo "📋 Stack Outputs:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "🚀 Next Steps:"
echo "  1. Deploy Docker containers using: ./scripts/aws-deploy.sh"
echo "  2. Configure DNS for your domain"
echo "  3. Set up SSL certificate in ACM"
echo ""

