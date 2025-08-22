#!/usr/bin/env node

/**
 * Enhanced Environment Setup with Smart Storage
 * Auto-configure environment dengan Cloudflare R2 dan Google Drive
 */

const fs = require('fs');
const path = require('path');
const EnvironmentDetector = require('./env-detector');

async function setupEnhancedEnvironment() {
  console.log('🚀 Enhanced Environment Setup with Smart Storage');
  console.log('🎯 Auto-detecting environment and configuring storage...');
  console.log('');

  const detector = new EnvironmentDetector();
  const detectedEnv = detector.detectEnvironment();
  
  console.log(`📍 Detected environment: ${detectedEnv.toUpperCase()}`);
  
  const config = detector.getEnvironmentConfig(detectedEnv);

  // Display environment info
  detector.displayEnvironmentInfo(detectedEnv);

  // Display storage configuration
  displayStorageInfo(detectedEnv, config);

  // Backup existing .env.local if exists
  await backupExistingEnv();

  // Generate enhanced .env.local
  await generateEnhancedEnvFile(detectedEnv, config);

  // Validate configuration
  await validateEnhancedConfiguration(detectedEnv, config);

  // Test storage connections
  await testStorageConnections(config);

  // Get package manager specific commands
  const packageManager = detector.detectPackageManager();
  const commands = detector.getPackageManagerCommands(packageManager);

  // Add Socket.IO configuration
  await addSocketIOConfig();

  console.log('\n✅ Enhanced environment setup complete!');
  console.log(`🚀 Ready for: ${commands.dev} (${detectedEnv})`);
  console.log(`📱 Access at: ${config.NEXT_PUBLIC_APP_URL}`);
  console.log('💾 Storage tiers configured and ready');
  console.log(`📦 Using ${packageManager} as package manager`);
}

function displayStorageInfo(envName, config) {
  console.log('\n💾 STORAGE CONFIGURATION:');
  console.log('='.repeat(40));
  console.log(`🥇 Primary: ${config.SMART_STORAGE_PRIMARY}`);
  console.log(`🥈 Secondary: ${config.SMART_STORAGE_SECONDARY}`);
  console.log(`🥉 Tertiary: ${config.SMART_STORAGE_TERTIARY}`);
  console.log(`📊 Compression: ${config.SMART_STORAGE_COMPRESSION_QUALITY}%`);
  console.log('='.repeat(40));
}

async function backupExistingEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), `.env.local.backup.enhanced-${timestamp}`);
    
    fs.copyFileSync(envPath, backupPath);
    console.log(`💾 Backed up existing .env.local to: ${path.basename(backupPath)}`);
  }
}

async function generateEnhancedEnvFile(envName, config) {
  console.log('📝 Generating enhanced .env.local...');

  const envContent = `# Enhanced Auto-generated ${envName.toUpperCase()} Environment
# Generated at: ${new Date().toISOString()}
# Target: ${config.description}
# Storage: Cloudflare R2 + Google Drive + Local Backup

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

# Environment Specific Settings
${envName === 'development' ? `PORT=3000
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_ENV_INFO=true` : ''}${envName === 'production' ? `NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_STANDALONE=true
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_ENV_INFO=false` : ''}${envName === 'staging' ? `NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_STANDALONE=true
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_ENV_INFO=true` : ''}

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
# DSLR SYSTEM INTEGRATION
# ===================================
DSLR_WATCH_FOLDER=C:/DCIM/100NIKON
DSLR_UPLOADER_NAME=Official Photographer
DSLR_ALBUM_NAME=Official
DSLR_AUTO_UPLOAD=true
DSLR_NOTIFICATION_ENABLED=true
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Generated enhanced .env.local');
}

async function validateEnhancedConfiguration(envName, config) {
  console.log('🔍 Validating enhanced configuration...');

  const checks = [
    {
      name: 'Environment',
      test: config.NEXT_PUBLIC_ENV_MODE === envName,
      value: config.NEXT_PUBLIC_ENV_MODE
    },
    {
      name: 'App URL',
      test: config.NEXT_PUBLIC_APP_URL.includes('http'),
      value: config.NEXT_PUBLIC_APP_URL
    },
    {
      name: 'Supabase',
      test: config.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co'),
      value: 'Connected'
    },
    {
      name: 'Cloudflare R2',
      test: config.CLOUDFLARE_R2_ACCOUNT_ID && config.CLOUDFLARE_R2_BUCKET_NAME,
      value: config.CLOUDFLARE_R2_BUCKET_NAME
    },
    {
      name: 'Google Drive',
      test: config.GOOGLE_DRIVE_CLIENT_ID && config.GOOGLE_DRIVE_CLIENT_SECRET,
      value: 'Configured'
    },
    {
      name: 'Smart Storage',
      test: config.SMART_STORAGE_ENABLED === 'true',
      value: `${config.SMART_STORAGE_PRIMARY} → ${config.SMART_STORAGE_SECONDARY} → ${config.SMART_STORAGE_TERTIARY}`
    }
  ];

  checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`   ${status} ${check.name}: ${check.value}`);
  });

  const allPassed = checks.every(check => check.test);
  
  if (allPassed) {
    console.log('✅ All enhanced configuration checks passed');
  } else {
    console.log('⚠️ Some configuration checks failed');
  }
}

async function testStorageConnections(config) {
  console.log('🔌 Testing storage connections...');

  // Test local storage
  try {
    const localPath = config.LOCAL_BACKUP_PATH;
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }
    console.log('   ✅ Local Storage: Ready');
  } catch (error) {
    console.log('   ❌ Local Storage: Failed');
  }

  // Test Cloudflare R2 (basic validation)
  if (config.CLOUDFLARE_R2_ACCOUNT_ID && config.CLOUDFLARE_R2_ACCESS_KEY_ID) {
    console.log('   ✅ Cloudflare R2: Configured');
  } else {
    console.log('   ❌ Cloudflare R2: Missing credentials');
  }

  // Test Google Drive (basic validation)
  if (config.GOOGLE_DRIVE_CLIENT_ID && config.GOOGLE_DRIVE_CLIENT_SECRET) {
    console.log('   ✅ Google Drive: Configured');
  } else {
    console.log('   ❌ Google Drive: Missing credentials');
  }
}

// Run enhanced setup
async function addSocketIOConfig() {
  console.log('🔌 Adding Socket.IO configuration...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Check if Socket.IO config already exists
    if (!content.includes('SOCKET.IO EXTERNAL INTEGRATION')) {
      const socketIOConfig = `

# ===================================
# SOCKET.IO EXTERNAL INTEGRATION
# ===================================
NEXT_PUBLIC_USE_SOCKETIO=true
NEXT_PUBLIC_SOCKETIO_URL=https://wbs.zeabur.app

# Real-time Features
ENABLE_WEBSOCKET=true
ENABLE_REAL_TIME_UPDATES=true
ENABLE_SOCKETIO_ROOMS=true
`;
      
      content += socketIOConfig;
      fs.writeFileSync(envPath, content);
      console.log('✅ Socket.IO configuration added');
    } else {
      console.log('✅ Socket.IO configuration already exists');
    }
  }
}

setupEnhancedEnvironment().catch(error => {
  console.error('❌ Enhanced setup failed:', error);
  process.exit(1);
});