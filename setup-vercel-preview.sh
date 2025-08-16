#!/bin/bash

# HafiPortrait Admin Dashboard - Vercel Preview Environment Setup
# This script helps set up environment variables specifically for Vercel preview deployments

echo "🚀 Setting up Vercel Preview Environment Variables for HafiPortrait Admin Dashboard"
echo "=================================================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ You are not logged in to Vercel. Please login first:"
    echo "   vercel login"
    exit 1
fi

echo "✅ Vercel CLI is ready"

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local value=$2
    local environment=$3
    
    echo "Setting $var_name for $environment environment..."
    echo "$value" | vercel env add $var_name $environment
    
    if [ $? -eq 0 ]; then
        echo "✅ $var_name set successfully for $environment"
    else
        echo "❌ Failed to set $var_name for $environment"
    fi
}

echo ""
echo "🔧 Setting up environment variables for Vercel preview..."

# App Configuration - Preview Environment
echo ""
echo "📱 App Configuration (Preview)"
add_env_var "NEXT_PUBLIC_APP_URL" "https://hafiportrait.photography" "preview"
add_env_var "NEXT_PUBLIC_API_BASE_URL" "https://hafiportrait.photography" "preview"
add_env_var "NODE_ENV" "production" "preview"

# CORS Configuration - Preview Environment
echo ""
echo "🌐 CORS Configuration (Preview)"
add_env_var "ALLOWED_ORIGINS" "https://hafiportrait.photography,https://www.hafiportrait.photography,https://hafiportrait.vercel.app,https://*.vercel.app" "preview"

# App Configuration - Production Environment
echo ""
echo "📱 App Configuration (Production)"
add_env_var "NEXT_PUBLIC_APP_URL" "https://hafiportrait.photography" "production"
add_env_var "NEXT_PUBLIC_API_BASE_URL" "https://hafiportrait.photography" "production"
add_env_var "NODE_ENV" "production" "production"

# CORS Configuration - Production Environment
echo ""
echo "🌐 CORS Configuration (Production)"
add_env_var "ALLOWED_ORIGINS" "https://hafiportrait.photography,https://www.hafiportrait.photography,https://hafiportrait.vercel.app" "production"

# Development Environment (if needed)
echo ""
echo "🔧 Development Environment (Optional)"
read -p "Do you want to set up development environment variables? (y/n): " setup_dev

if [ "$setup_dev" = "y" ] || [ "$setup_dev" = "Y" ]; then
    add_env_var "NEXT_PUBLIC_APP_URL" "http://localhost:3000" "development"
    add_env_var "NEXT_PUBLIC_API_BASE_URL" "http://localhost:3000" "development"
    add_env_var "NODE_ENV" "development" "development"
    add_env_var "ALLOWED_ORIGINS" "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000" "development"
fi

echo ""
echo "🎉 Environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy your application: vercel --prod"
echo "2. Create a preview deployment: vercel"
echo "3. Test the login functionality on both production and preview"
echo "4. Check CORS headers in browser developer tools"
echo "5. Use the test page: /admin/test-login"
echo ""
echo "🔍 To verify environment variables:"
echo "   vercel env ls"
echo ""
echo "🌐 Preview URL will be something like:"
echo "   https://your-project-git-branch-username.vercel.app"
echo ""
echo "🔧 To test different environments:"
echo "   - Production: https://hafiportrait.photography/admin/login"
echo "   - Preview: https://your-preview-url.vercel.app/admin/login"
echo "   - Test: https://your-preview-url.vercel.app/admin/test-login"
echo ""
echo "📚 For more information:"
echo "   https://vercel.com/docs/concepts/projects/environment-variables"