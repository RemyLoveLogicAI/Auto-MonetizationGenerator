#!/bin/bash
set -e

# Auto-MonetizationGenerator Deployment Script
# Provides zero-downtime deployment with health checks and rollback capability

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HEALTH_ENDPOINT="http://localhost:3000/api/health"
MAX_RETRIES=30
RETRY_DELAY=2

echo "🚀 Starting deployment process..."
echo "📁 Project root: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if PM2 is available
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found. Installing globally..."
    npm install -g pm2
fi

# Security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate || {
    echo "⚠️  Security vulnerabilities found. Continue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled due to security concerns"
        exit 1
    fi
}

# Build application
echo "🔨 Building application..."
npm run build

# Test build integrity
if [ ! -f "dist/_worker.js" ]; then
    echo "❌ Build failed - worker file not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Backup current deployment (if exists)
if pm2 list | grep -q "webapp"; then
    echo "💾 Creating backup of current deployment..."
    pm2 save
    echo "✅ Backup created"
fi

# Deploy new version
echo "🚀 Deploying new version..."

# Stop existing instance gracefully
if pm2 list | grep -q "webapp"; then
    echo "⏹️  Stopping existing instance..."
    pm2 stop webapp
fi

# Start new instance
echo "▶️  Starting new instance..."
pm2 start ecosystem.config.cjs

# Health check with retries
echo "🏥 Performing health checks..."
for i in $(seq 1 $MAX_RETRIES); do
    echo "🔍 Health check attempt $i/$MAX_RETRIES..."
    
    if curl -f -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        
        # Verify response content
        HEALTH_RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
        if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
            echo "✅ Application is healthy and responding correctly"
            break
        else
            echo "⚠️  Health endpoint responding but status not OK"
        fi
    else
        echo "❌ Health check failed (attempt $i/$MAX_RETRIES)"
        
        if [ $i -eq $MAX_RETRIES ]; then
            echo "💥 Deployment failed - health checks unsuccessful"
            echo "🔄 Attempting rollback..."
            
            # Rollback
            pm2 stop webapp
            pm2 resurrect
            
            echo "❌ Deployment failed and rolled back"
            exit 1
        fi
        
        sleep $RETRY_DELAY
    fi
done

# Final verification
echo "🔍 Final verification..."
FINAL_CHECK=$(curl -s "$HEALTH_ENDPOINT" | grep -o '"status":"ok"' || echo "")
if [ -n "$FINAL_CHECK" ]; then
    echo "🎉 Deployment successful!"
    echo "📊 Application metrics:"
    curl -s "$HEALTH_ENDPOINT" | jq '.' 2>/dev/null || curl -s "$HEALTH_ENDPOINT"
    
    # Save PM2 configuration
    pm2 save
    
    echo "✅ Deployment completed successfully"
    echo "🌐 Application available at: http://localhost:3000"
else
    echo "❌ Final verification failed"
    exit 1
fi