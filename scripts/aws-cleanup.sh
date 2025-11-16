#!/bin/bash
# CropWise - AWS Cleanup Script
# WARNING: This will delete all AWS resources!

set -e

echo "🗑️  CropWise - AWS Cleanup"
echo "==============================="
echo ""
echo "⚠️  WARNING: This will DELETE all CropWise resources from AWS!"
echo "⚠️  This action CANNOT be undone!"
echo ""
read -p "Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

AWS_REGION=${AWS_REGION:-ap-south-1}
APP_NAME="cropwise"

echo ""
echo "Starting cleanup..."

# Delete ECS Services and Cluster
echo "🐳 Deleting ECS resources..."
aws ecs delete-cluster --cluster "$APP_NAME-cluster" --region $AWS_REGION 2>/dev/null || true

# Delete Load Balancer
echo "⚖️  Deleting Load Balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names "$APP_NAME-alb" --region $AWS_REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null) || true
if [ "$ALB_ARN" != "None" ] && [ -n "$ALB_ARN" ]; then
    aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $AWS_REGION
    echo "Waiting for ALB to delete..."
    sleep 30
fi

# Delete Target Groups
echo "🎯 Deleting Target Groups..."
for TG in $(aws elbv2 describe-target-groups --region $AWS_REGION --query "TargetGroups[?contains(TargetGroupName, '$APP_NAME')].TargetGroupArn" --output text); do
    aws elbv2 delete-target-group --target-group-arn $TG --region $AWS_REGION 2>/dev/null || true
done

# Delete RDS
echo "💾 Deleting RDS instance..."
aws rds delete-db-instance \
    --db-instance-identifier "$APP_NAME-db" \
    --skip-final-snapshot \
    --region $AWS_REGION 2>/dev/null || true

# Delete RDS Subnet Group
aws rds delete-db-subnet-group \
    --db-subnet-group-name "$APP_NAME-db-subnet-group" \
    --region $AWS_REGION 2>/dev/null || true

# Delete ElastiCache
echo "⚡ Deleting Redis cluster..."
aws elasticache delete-cache-cluster \
    --cache-cluster-id "$APP_NAME-redis" \
    --region $AWS_REGION 2>/dev/null || true

# Delete ElastiCache Subnet Group
aws elasticache delete-cache-subnet-group \
    --cache-subnet-group-name "$APP_NAME-redis-subnet-group" \
    --region $AWS_REGION 2>/dev/null || true

# Delete ECR Repositories
echo "📦 Deleting ECR repositories..."
aws ecr delete-repository --repository-name "$APP_NAME-backend" --force --region $AWS_REGION 2>/dev/null || true
aws ecr delete-repository --repository-name "$APP_NAME-frontend" --force --region $AWS_REGION 2>/dev/null || true

# Wait for resources to delete
echo "⏳ Waiting for resources to delete (this may take a few minutes)..."
sleep 60

# Get VPC ID
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$APP_NAME-vpc" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION 2>/dev/null)

if [ "$VPC_ID" != "None" ] && [ -n "$VPC_ID" ]; then
    echo "🌐 Deleting VPC resources..."
    
    # Delete Security Groups
    for SG in $(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text --region $AWS_REGION); do
        aws ec2 delete-security-group --group-id $SG --region $AWS_REGION 2>/dev/null || true
    done
    
    # Detach and delete Internet Gateway
    IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query 'InternetGateways[0].InternetGatewayId' --output text --region $AWS_REGION)
    if [ "$IGW_ID" != "None" ] && [ -n "$IGW_ID" ]; then
        aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID --region $AWS_REGION
        aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID --region $AWS_REGION
    fi
    
    # Delete Subnets
    for SUBNET in $(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[].SubnetId' --output text --region $AWS_REGION); do
        aws ec2 delete-subnet --subnet-id $SUBNET --region $AWS_REGION 2>/dev/null || true
    done
    
    # Delete Route Tables
    for RT in $(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text --region $AWS_REGION); do
        aws ec2 delete-route-table --route-table-id $RT --region $AWS_REGION 2>/dev/null || true
    done
    
    # Delete VPC
    aws ec2 delete-vpc --vpc-id $VPC_ID --region $AWS_REGION
fi

# Delete configuration file
rm -f aws-config.json

echo ""
echo "✅ Cleanup complete!"
echo "All CropWise resources have been deleted from AWS."
echo ""

