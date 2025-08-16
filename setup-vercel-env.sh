#!/bin/bash

# HafiPortrait Admin Dashboard - Vercel Environment Setup
# This script helps set up environment variables for Vercel deployment

echo "🚀 Setting up Vercel Environment Variables for HafiPortrait Admin Dashboard"
echo "=================================================================="

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

# Function to prompt for environment variable
prompt_env_var() {
    local var_name=$1
    local description=$2
    local default_value=$3
    local is_secret=$4
    
    echo ""
    echo "📝 $description"
    if [ "$is_secret" = "true" ]; then
        read -s -p "Enter $var_name (hidden): " value
        echo ""
    else
        read -p "Enter $var_name [$default_value]: " value
    fi
    
    if [ -z "$value" ]; then
        value=$default_value
    fi
    
    echo "Setting $var_name..."
    vercel env add $var_name production <<< "$value"
    
    if [ $? -eq 0 ]; then
        echo "✅ $var_name set successfully"
    else
        echo "❌ Failed to set $var_name"
    fi
}

echo ""
echo "🔧 Setting up environment variables..."
echo "Note: You can skip any variable by pressing Enter (will use default values)"

# App Configuration
prompt_env_var "NEXT_PUBLIC_APP_URL" "Main application URL" "https://hafiportrait.photography" false
prompt_env_var "NODE_ENV" "Node environment" "production" false

# Database Configuration (if using database)
echo ""
echo "🗄️  Database Configuration (skip if not using database)"
prompt_env_var "DATABASE_URL" "Database connection URL" "" false
prompt_env_var "DATABASE_HOST" "Database host" "" false
prompt_env_var "DATABASE_PORT" "Database port" "5432" false
prompt_env_var "DATABASE_NAME" "Database name" "" false
prompt_env_var "DATABASE_USER" "Database user" "" false
prompt_env_var "DATABASE_PASSWORD" "Database password" "" true

# Authentication
echo ""
echo "🔐 Authentication Configuration"
prompt_env_var "JWT_SECRET" "JWT secret key (generate a strong random string)" "" true
prompt_env_var "SESSION_SECRET" "Session secret key (generate a strong random string)" "" true

# CORS Configuration
echo ""
echo "🌐 CORS Configuration"
prompt_env_var "ALLOWED_ORIGINS" "Comma-separated list of allowed origins" "https://hafiportrait.photography,https://www.hafiportrait.photography,https://hafiportrait.vercel.app" false

# API Configuration
echo ""
echo "🔌 API Configuration"
prompt_env_var "DSLR_API_BASE_URL" "DSLR API base URL" "https://hafiportrait.photography" false
prompt_env_var "NEXT_PUBLIC_API_BASE_URL" "Public API base URL" "https://hafiportrait.photography" false

# Storage Configuration (optional)
echo ""
echo "📁 Storage Configuration (skip if not using cloud storage)"
prompt_env_var "R2_ACCOUNT_ID" "Cloudflare R2 account ID" "" false
prompt_env_var "R2_ACCESS_KEY_ID" "Cloudflare R2 access key ID" "" false
prompt_env_var "R2_SECRET_ACCESS_KEY" "Cloudflare R2 secret access key" "" true
prompt_env_var "R2_BUCKET_NAME" "Cloudflare R2 bucket name" "" false
prompt_env_var "R2_ENDPOINT" "Cloudflare R2 endpoint" "" false

# Email Configuration (optional)
echo ""
echo "📧 Email Configuration (skip if not using email services)"
prompt_env_var "SMTP_HOST" "SMTP host" "" false
prompt_env_var "SMTP_PORT" "SMTP port" "587" false
prompt_env_var "SMTP_USER" "SMTP username" "" false
prompt_env_var "SMTP_PASS" "SMTP password" "" true

# Monitoring and Analytics (optional)
echo ""
echo "📊 Monitoring and Analytics (skip if not using)"
prompt_env_var "NEXT_PUBLIC_GA_ID" "Google Analytics ID" "" false
prompt_env_var "SENTRY_DSN" "Sentry DSN" "" false

# Feature Flags
echo ""
echo "🚩 Feature Flags"
prompt_env_var "ENABLE_WEBSOCKET" "Enable WebSocket functionality" "true" false
prompt_env_var "ENABLE_REAL_TIME_UPDATES" "Enable real-time updates" "true" false
prompt_env_var "ENABLE_FILE_UPLOAD" "Enable file upload functionality" "true" false

echo ""
echo "🎉 Environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy your application: vercel --prod"
echo "2. Test the login functionality"
echo "3. Check CORS headers in browser developer tools"
echo "4. Monitor logs in Vercel dashboard"
echo ""
echo "🔍 To verify environment variables:"
echo "   vercel env ls"
echo ""
echo "🔄 To update a variable:"
echo "   vercel env rm VARIABLE_NAME"
echo "   vercel env add VARIABLE_NAME production"
echo ""
echo "📚 For more information, check the documentation:"
echo "   https://vercel.com/docs/concepts/projects/environment-variables"