#!/bin/bash

# HafiPortrait Production Environment Setup
# Script untuk setup environment variables yang aman untuk production

echo "🔒 Setting up Production Environment Variables for HafiPortrait"
echo "=============================================================="

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

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to prompt for environment variable
prompt_env_var() {
    local var_name=$1
    local description=$2
    local default_value=$3
    local is_secret=$4
    local is_required=$5
    
    echo ""
    echo "📝 $description"
    if [ "$is_required" = "true" ]; then
        echo "   ⚠️  This is REQUIRED for production"
    fi
    
    if [ "$is_secret" = "true" ]; then
        read -s -p "Enter $var_name (hidden): " value
        echo ""
    else
        read -p "Enter $var_name [$default_value]: " value
    fi
    
    if [ -z "$value" ]; then
        if [ "$is_required" = "true" ]; then
            echo "❌ $var_name is required for production"
            return 1
        fi
        value=$default_value
    fi
    
    echo "Setting $var_name for production..."
    echo "$value" | vercel env add $var_name production
    
    if [ $? -eq 0 ]; then
        echo "✅ $var_name set successfully"
    else
        echo "❌ Failed to set $var_name"
        return 1
    fi
}

echo ""
echo "🔧 Setting up production environment variables..."
echo "Note: Some variables are REQUIRED for production security"

# Database Configuration (REQUIRED)
echo ""
echo "🗄️  Database Configuration (REQUIRED)"
if ! prompt_env_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL" "" false true; then
    exit 1
fi

if ! prompt_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key" "" true true; then
    exit 1
fi

# Authentication (REQUIRED)
echo ""
echo "🔐 Authentication Configuration (REQUIRED)"
echo "Generating secure JWT secret..."
jwt_secret=$(generate_secret)
echo "Generated JWT secret: $jwt_secret"

echo "Setting JWT_SECRET..."
echo "$jwt_secret" | vercel env add JWT_SECRET production
if [ $? -eq 0 ]; then
    echo "✅ JWT_SECRET set successfully"
else
    echo "❌ Failed to set JWT_SECRET"
    exit 1
fi

# Session Secret
echo "Generating secure session secret..."
session_secret=$(generate_secret)
echo "Generated session secret: $session_secret"

echo "Setting SESSION_SECRET..."
echo "$session_secret" | vercel env add SESSION_SECRET production
if [ $? -eq 0 ]; then
    echo "✅ SESSION_SECRET set successfully"
else
    echo "❌ Failed to set SESSION_SECRET"
    exit 1
fi

# App Configuration
echo ""
echo "📱 App Configuration"
prompt_env_var "NEXT_PUBLIC_APP_URL" "Main application URL" "https://hafiportrait.photography" false false
prompt_env_var "NEXT_PUBLIC_API_BASE_URL" "API base URL" "https://hafiportrait.photography" false false

# CORS Configuration
echo ""
echo "🌐 CORS Configuration"
prompt_env_var "ALLOWED_ORIGINS" "Comma-separated list of allowed origins" "https://hafiportrait.photography,https://www.hafiportrait.photography" false false

# Environment
echo ""
echo "🔧 Environment Configuration"
echo "Setting NODE_ENV to production..."
echo "production" | vercel env add NODE_ENV production
if [ $? -eq 0 ]; then
    echo "✅ NODE_ENV set successfully"
else
    echo "❌ Failed to set NODE_ENV"
fi

# Security Configuration
echo ""
echo "🔒 Security Configuration"
echo "Setting security headers and configurations..."

# Disable Next.js telemetry
echo "1" | vercel env add NEXT_TELEMETRY_DISABLED production

# Set production mode
echo "production" | vercel env add NEXT_PUBLIC_ENV_MODE production

echo ""
echo "🎉 Production environment setup completed!"
echo ""
echo "📋 Security Checklist:"
echo "✅ JWT_SECRET generated and set"
echo "✅ SESSION_SECRET generated and set"
echo "✅ Database credentials configured"
echo "✅ CORS origins configured"
echo "✅ Environment set to production"
echo ""
echo "🚀 Next steps:"
echo "1. Deploy to production: vercel --prod"
echo "2. Test health check: https://hafiportrait.photography/api/health"
echo "3. Test login functionality"
echo "4. Monitor logs: vercel logs"
echo ""
echo "🔍 To verify environment variables:"
echo "   vercel env ls"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "- Keep your JWT_SECRET and SESSION_SECRET secure"
echo "- Never commit secrets to version control"
echo "- Regularly rotate your secrets"
echo "- Monitor your application logs for security issues"
echo ""
echo "📚 For more information:"
echo "   https://vercel.com/docs/concepts/projects/environment-variables"