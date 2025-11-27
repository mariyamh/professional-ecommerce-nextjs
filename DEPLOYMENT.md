# íº€ Deployment Guide - E-Commerce NestJS API

Complete guide for deploying your e-commerce API to production.

## í³‹ Table of Contents

1. [AWS (Recommended)](#aws-deployment)
2. [Heroku](#heroku-deployment)
3. [DigitalOcean](#digitalocean-deployment)
4. [Docker + AWS ECS](#docker--aws-ecs)
5. [Vercel (Not Recommended)](#vercel)

---

## í¾¯ AWS Deployment (Recommended)

### Why AWS?
- âœ… Most scalable option
- âœ… Native S3 integration (for images)
- âœ… RDS for PostgreSQL
- âœ… ElastiCache for Redis
- âœ… Full control
- âš ï¸ More complex setup

### Architecture
```
Client â†’ Load Balancer (ALB) â†’ EC2/ECS â†’ RDS PostgreSQL
                                  â†“
                              S3 Bucket (Images)
```

### Step-by-Step AWS Deployment

#### 1. **Create S3 Bucket**
```bash
# Install AWS CLI
brew install awscli  # Mac
# or
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS
aws configure
# AWS Access Key ID: your-key
# AWS Secret Access Key: your-secret
# Default region: us-east-1
# Default output format: json

# Create S3 bucket
aws s3api create-bucket \
  --bucket ecommerce-products-YOUR_NAME \
  --region us-east-1

# Enable public access for product images
aws s3api put-bucket-policy \
  --bucket ecommerce-products-YOUR_NAME \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ecommerce-products-YOUR_NAME/*"
    }]
  }'

# Enable CORS
aws s3api put-bucket-cors \
  --bucket ecommerce-products-YOUR_NAME \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }]
  }'
```

#### 2. **Create RDS PostgreSQL Database**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier ecommerce-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --publicly-accessible

# Wait for creation (takes 5-10 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier ecommerce-db

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier ecommerce-db \
  --query 'DBInstances[0].Endpoint.Address'
```

#### 3. **Deploy to EC2**
```bash
# Create EC2 instance (Ubuntu)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-groups ecommerce-sg

# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# On EC2: Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repo
git clone your-repo-url
cd ecommerce-nestjs-api

# Install dependencies
npm install

# Create .env
nano .env
# Add all production environment variables

# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name ecommerce-api
pm2 startup
pm2 save
```

#### 4. **Environment Variables on EC2**
```env
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_rds_password
DB_DATABASE=ecommerce_db

JWT_SECRET=your-production-jwt-secret
JWT_EXPIRATION=7d

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=ecommerce-products-YOUR_NAME

STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_live_your_webhook
```

#### 5. **Setup Load Balancer (ALB)**
```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name ecommerce-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Create Target Group
aws elbv2 create-target-group \
  --name ecommerce-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx

# Register EC2 instance
aws elbv2 register-targets \
  --target-group-arn arn:xxx \
  --targets Id=i-xxx
```

### Cost Estimate (AWS)
- EC2 t2.micro: ~$8/month
- RDS t3.micro: ~$15/month
- S3: ~$0.023/GB + requests
- ALB: ~$16/month
- **Total: ~$40-50/month**

---

## í¿£ Heroku Deployment (Easiest)

### Why Heroku?
- âœ… Easiest deployment
- âœ… Free tier available
- âœ… PostgreSQL included
- âš ï¸ No native S3 (need external)
- âš ï¸ Sleeps on free tier

### Step-by-Step
```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # Mac
# or
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create ecommerce-api-YOUR_NAME

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set AWS_ACCESS_KEY_ID=your-key
heroku config:set AWS_SECRET_ACCESS_KEY=your-secret
heroku config:set AWS_S3_BUCKET_NAME=your-bucket
heroku config:set AWS_REGION=us-east-1
heroku config:set STRIPE_SECRET_KEY=your-stripe-key

# Deploy
git push heroku master

# Open app
heroku open

# View logs
heroku logs --tail
```

### Procfile
```bash
cat > Procfile << 'EOF'
web: npm run start:prod
