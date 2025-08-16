#!/bin/bash

# HafiPortrait CloudRun Deployment Script

echo "🚀 Deploying HafiPortrait to CloudRun..."
echo "🎯 Target: http://bwpwwtphgute.ap-southeast-1.clawcloudrun.com"

# Build the application
echo "📦 Building application..."
npm run build

# Test locally first (optional)
echo "🧪 Testing locally..."
npm start &
SERVER_PID=$!
sleep 10

# Test if server is running
if curl -f http://localhost:8080/api/test/db > /dev/null 2>&1; then
    echo "✅ Local test passed"
    kill $SERVER_PID
else
    echo "❌ Local test failed"
    kill $SERVER_PID
    exit 1
fi

echo "🎯 Ready for CloudRun deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Build Docker image: docker build -t hafiportrait ."
echo "2. Tag for registry: docker tag hafiportrait gcr.io/PROJECT_ID/hafiportrait"
echo "3. Push to registry: docker push gcr.io/PROJECT_ID/hafiportrait"
echo "4. Deploy to CloudRun: gcloud run deploy hafiportrait --image gcr.io/PROJECT_ID/hafiportrait --platform managed --region asia-southeast1 --allow-unauthenticated"
echo ""
echo "🌐 Access URL: http://bwpwwtphgute.ap-southeast-1.clawcloudrun.com/admin/login"
echo "👤 Username: hafi"
echo "🔑 Password: Hantu@112233"