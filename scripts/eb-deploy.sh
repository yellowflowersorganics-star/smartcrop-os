#!/bin/bash
# SmartCrop OS - Elastic Beanstalk Deployment Script

set -e

echo "🌱 SmartCrop OS - Elastic Beanstalk Deployment"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "❌ Elastic Beanstalk CLI not installed"
    echo ""
    echo "Install with:"
    echo "  pip install awsebcli --upgrade --user"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ EB CLI found${NC}"

# Navigate to backend
cd backend

# Check if EB is initialized
if [ ! -d ".elasticbeanstalk" ]; then
    echo -e "${YELLOW}⚠️  Elastic Beanstalk not initialized${NC}"
    echo "Initializing..."
    
    eb init smartcrop-os-backend \
        --platform "Node.js 18 running on 64bit Amazon Linux 2023" \
        --region us-east-1
    
    echo -e "${GREEN}✅ EB initialized${NC}"
fi

# Check current environment
echo ""
echo "📋 Current environment:"
eb status

# Deploy
echo ""
echo "🚀 Deploying to Elastic Beanstalk..."
eb deploy

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Check application status:"
echo "  eb status"
echo ""
echo "📝 View logs:"
echo "  eb logs"
echo ""
echo "🌐 Open application:"
echo "  eb open"
echo ""

