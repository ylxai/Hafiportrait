#!/usr/bin/env node

/**
 * Setup Development Environment
 * Auto-configure untuk VPS CloudRun development
 */

const fs = require('fs');
const path = require('path');
const EnvironmentDetector = require('./env-detector');

async function setupDevelopmentEnvironment() {
  console.log('🔧 Setting up Development Environment...');
  console.log('🎯 Target: Development Server (0.0.0.0:3000 - All Interfaces)');
  console.log('');

  const detector = new EnvironmentDetector();
  const config = detector.getEnvironmentConfig('development');

  // Display environment info
  detector.displayEnvironmentInfo('development');

  // Backup existing .env.local if exists
  await backupExistingEnv();

  // Generate .env.local for development
  await generateEnvFile(config);

  // Validate configuration
  await validateConfiguration(config);

  console.log('\n✅ Development environment setup complete!');
  console.log('🚀 Ready to run: npm run dev');
  console.log(`📱 Access at: ${config.NEXT_PUBLIC_APP_URL}`);
}

async function backupExistingEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), `.env.local.backup.${timestamp}`);
    
    fs.copyFileSync(envPath, backupPath);
    console.log(`💾 Backed up existing .env.local to: ${path.basename(backupPath)}`);
  }
}

async function generateEnvFile(config) {
  console.log('📝 Generating .env.local for development...');

  const envContent = `# Auto-generated Development Environment
# Generated at: ${new Date().toISOString()}
# Target: Development Server (0.0.0.0:3000 - All Interfaces)

# Environment Configuration
NODE_ENV=${config.NODE_ENV}
NEXT_PUBLIC_ENV_MODE=${config.NEXT_PUBLIC_ENV_MODE}
NEXT_PUBLIC_APP_URL=${config.NEXT_PUBLIC_APP_URL}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}

# Authentication
JWT_SECRET=${config.JWT_SECRET}

# Development Specific
PORT=3000
HOST=0.0.0.0
NEXT_TELEMETRY_DISABLED=1

# Development Tools
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_ENV_INFO=true

# Development CORS & Security (Allow All Origins)
CORS_ORIGIN=*
ALLOWED_ORIGINS=*
NEXT_PUBLIC_ALLOW_ALL_ORIGINS=true

# Public IP Access (Development)
NEXT_PUBLIC_DEV_IP=147.251.255.227
NEXT_PUBLIC_DEV_URL_IP=http://147.251.255.227:3000
NEXT_PUBLIC_DEV_URL_LOCAL=http://localhost:3000

# ===================================
# CLOUDFLARE R2 STORAGE (10GB FREE)
# ===================================
CLOUDFLARE_R2_ACCOUNT_ID=${config.CLOUDFLARE_R2_ACCOUNT_ID}
CLOUDFLARE_R2_ACCESS_KEY_ID=${config.CLOUDFLARE_R2_ACCESS_KEY_ID}
CLOUDFLARE_R2_SECRET_ACCESS_KEY=${config.CLOUDFLARE_R2_SECRET_ACCESS_KEY}
CLOUDFLARE_R2_BUCKET_NAME=${config.CLOUDFLARE_R2_BUCKET_NAME}
CLOUDFLARE_R2_CUSTOM_DOMAIN=${config.CLOUDFLARE_R2_CUSTOM_DOMAIN}
CLOUDFLARE_R2_PUBLIC_URL=${config.CLOUDFLARE_R2_PUBLIC_URL}
CLOUDFLARE_R2_REGION=${config.CLOUDFLARE_R2_REGION}
CLOUDFLARE_R2_ENDPOINT=${config.CLOUDFLARE_R2_ENDPOINT}

# ===================================
# GOOGLE DRIVE STORAGE (2TB+)
# ===================================
GOOGLE_DRIVE_CLIENT_ID=${config.GOOGLE_DRIVE_CLIENT_ID}
GOOGLE_DRIVE_CLIENT_SECRET=${config.GOOGLE_DRIVE_CLIENT_SECRET}
GOOGLE_DRIVE_REFRESH_TOKEN=${config.GOOGLE_DRIVE_REFRESH_TOKEN}
GOOGLE_DRIVE_FOLDER_ID=${config.GOOGLE_DRIVE_FOLDER_ID}
GOOGLE_DRIVE_FOLDER_NAME=${config.GOOGLE_DRIVE_FOLDER_NAME}
GOOGLE_DRIVE_SHARED_FOLDER=${config.GOOGLE_DRIVE_SHARED_FOLDER}

# ===================================
# SMART STORAGE CONFIGURATION
# ===================================
LOCAL_BACKUP_PATH=${config.LOCAL_BACKUP_PATH}
SMART_STORAGE_ENABLED=${config.SMART_STORAGE_ENABLED}
SMART_STORAGE_DEFAULT_TIER=${config.SMART_STORAGE_DEFAULT_TIER}
SMART_STORAGE_PRIMARY=${config.SMART_STORAGE_PRIMARY}
SMART_STORAGE_SECONDARY=${config.SMART_STORAGE_SECONDARY}
SMART_STORAGE_TERTIARY=${config.SMART_STORAGE_TERTIARY}
SMART_STORAGE_COMPRESSION_QUALITY=${config.SMART_STORAGE_COMPRESSION_QUALITY}

# ===================================
# SOCKET.IO LOCAL SERVER
# ===================================
NEXT_PUBLIC_USE_SOCKETIO=true
NEXT_PUBLIC_SOCKETIO_URL=http://147.251.255.227:3001
SOCKETIO_PORT=3001

# Real-time Features
ENABLE_WEBSOCKET=true
ENABLE_REAL_TIME_UPDATES=true
ENABLE_SOCKETIO_ROOMS=true
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Generated .env.local');
}

async function validateConfiguration(config) {
  console.log('🔍 Validating configuration...');

  const checks = [
    {
      name: 'NODE_ENV',
      test: config.NODE_ENV === 'development',
      value: config.NODE_ENV
    },
    {
      name: 'APP_URL',
      test: config.NEXT_PUBLIC_APP_URL.includes('0.0.0.0') || config.NEXT_PUBLIC_APP_URL.includes('localhost'),
      value: config.NEXT_PUBLIC_APP_URL
    },
    {
      name: 'Supabase URL',
      test: config.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co'),
      value: config.NEXT_PUBLIC_SUPABASE_URL
    },
    {
      name: 'JWT Secret',
      test: config.JWT_SECRET.includes('development'),
      value: config.JWT_SECRET.substring(0, 20) + '...'
    }
  ];

  checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`   ${status} ${check.name}: ${check.value}`);
  });

  const allPassed = checks.every(check => check.test);
  
  if (allPassed) {
    console.log('✅ All configuration checks passed');
  } else {
    console.log('⚠️ Some configuration checks failed');
    process.exit(1);
  }
}

// Run setup
setupDevelopmentEnvironment().catch(error => {
  console.error('❌ Development setup failed:', error);
  process.exit(1);
});