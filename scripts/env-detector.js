/**
 * Environment Detection Utility
 * Auto-detect environment berdasarkan context
 */

const fs = require('fs');
const path = require('path');

class EnvironmentDetector {
  constructor() {
    this.environments = {
      development: {
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: 'http://0.0.0.0:3000',
        NEXT_PUBLIC_ENV_MODE: 'development',
        description: 'Development server (accessible from all interfaces)'
      },
      production: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'https://hafiportrait.photography',
        NEXT_PUBLIC_ENV_MODE: 'production',
        description: 'Vercel production dengan domain custom'
      },
      staging: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APP_URL: 'https://hafiportrait-staging.vercel.app',
        NEXT_PUBLIC_ENV_MODE: 'staging',
        description: 'Vercel staging environment'
      }
    };
  }

  /**
   * Auto-detect environment berdasarkan berbagai faktor
   */
  detectEnvironment() {
    console.log('🔍 Auto-detecting environment...');

    // 1. Check dari npm script context
    const npmScript = this.detectFromNpmScript();
    if (npmScript) {
      console.log(`📝 Detected from npm script: ${npmScript}`);
      return npmScript;
    }

    // 2. Check dari environment variables
    const envVar = this.detectFromEnvVars();
    if (envVar) {
      console.log(`🌐 Detected from environment variables: ${envVar}`);
      return envVar;
    }

    // 3. Check dari git branch
    const gitBranch = this.detectFromGitBranch();
    if (gitBranch) {
      console.log(`🌿 Detected from git branch: ${gitBranch}`);
      return gitBranch;
    }

    // 4. Check dari CI/CD context
    const cicd = this.detectFromCICD();
    if (cicd) {
      console.log(`🚀 Detected from CI/CD: ${cicd}`);
      return cicd;
    }

    // 5. Fallback ke development
    console.log('⚠️ Could not auto-detect, defaulting to development');
    return 'development';
  }

  /**
   * Detect package manager yang digunakan
   */
  detectPackageManager() {
    // Check for pnpm-specific environment variables
    if (process.env.PNPM_SCRIPT_SRC_DIR || process.env.PNPM_HOME) {
      return 'pnpm';
    }

    // Check for yarn-specific environment variables
    if (process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('yarn')) {
      return 'yarn';
    }

    // Get the correct working directory (scripts are run from root, not scripts folder)
    const rootDir = path.resolve(__dirname, '..');
    
    // Check for lock files in order of preference
    if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }

    if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) {
      return 'yarn';
    }

    if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
      return 'npm';
    }

    // Also check current working directory as fallback
    if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }

    if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
      return 'yarn';
    }

    if (fs.existsSync(path.join(process.cwd(), 'package-lock.json'))) {
      return 'npm';
    }

    // Default fallback
    return 'npm';
  }

  /**
   * Detect dari npm/pnpm script yang sedang berjalan
   */
  detectFromNpmScript() {
    // Detect package manager first
    const packageManager = this.detectPackageManager();
    
    // Get lifecycle event from npm or pnpm
    const npmLifecycleEvent = process.env.npm_lifecycle_event;
    const pnpmLifecycleEvent = process.env.PNPM_SCRIPT_SRC_DIR ? process.env.npm_lifecycle_event : null;
    const lifecycleEvent = pnpmLifecycleEvent || npmLifecycleEvent;
    
    // Get command from npm or pnpm
    const npmCommand = process.env.npm_command;
    const pnpmCommand = process.env.PNPM_SCRIPT_SRC_DIR ? 'pnpm' : null;
    const command = pnpmCommand || npmCommand;

    console.log(`📦 Package Manager: ${packageManager}`);
    if (lifecycleEvent) {
      console.log(`🔄 Lifecycle Event: ${lifecycleEvent}`);
    }

    if (lifecycleEvent === 'dev') {
      return 'development';
    }

    if (lifecycleEvent === 'build') {
      // Check jika ada flag khusus
      const args = process.argv.slice(2);
      if (args.includes('--staging')) {
        return 'staging';
      }
      return 'production';
    }

    if (lifecycleEvent === 'build:staging') {
      return 'staging';
    }

    if (lifecycleEvent === 'start') {
      // Start biasanya production, tapi check existing config
      return this.detectFromExistingConfig() || 'production';
    }

    // Check for pnpm-specific environment variables
    if (process.env.PNPM_SCRIPT_SRC_DIR) {
      // Running under pnpm, check script name from argv
      const scriptName = process.argv[2];
      if (scriptName === 'dev') {
        return 'development';
      }
      if (scriptName === 'build:staging') {
        return 'staging';
      }
      if (scriptName === 'build') {
        return 'production';
      }
    }

    return null;
  }

  /**
   * Detect dari environment variables
   */
  detectFromEnvVars() {
    // Check NODE_ENV
    if (process.env.NODE_ENV === 'development') {
      return 'development';
    }

    // Check Vercel environment
    if (process.env.VERCEL_ENV === 'production') {
      return 'production';
    }

    if (process.env.VERCEL_ENV === 'preview') {
      return 'staging';
    }

    // Check custom environment variable
    if (process.env.APP_ENV) {
      return process.env.APP_ENV;
    }

    return null;
  }

  /**
   * Detect dari git branch
   */
  detectFromGitBranch() {
    try {
      const { execSync } = require('child_process');
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
        encoding: 'utf8' 
      }).trim();

      if (branch === 'main' || branch === 'master') {
        return 'production';
      }

      if (branch === 'staging' || branch === 'develop') {
        return 'staging';
      }

      if (branch.startsWith('feature/') || branch.startsWith('dev/')) {
        return 'development';
      }

      return null;
    } catch (error) {
      console.warn('Could not detect git branch:', error.message);
      return null;
    }
  }

  /**
   * Detect dari CI/CD environment
   */
  detectFromCICD() {
    // Vercel
    if (process.env.VERCEL) {
      if (process.env.VERCEL_ENV === 'production') {
        return 'production';
      }
      return 'staging';
    }

    // GitHub Actions
    if (process.env.GITHUB_ACTIONS) {
      const ref = process.env.GITHUB_REF;
      if (ref === 'refs/heads/main' || ref === 'refs/heads/master') {
        return 'production';
      }
      return 'staging';
    }

    // Netlify
    if (process.env.NETLIFY) {
      return process.env.CONTEXT === 'production' ? 'production' : 'staging';
    }

    return null;
  }

  /**
   * Detect dari existing config file
   */
  detectFromExistingConfig() {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        if (content.includes('NEXT_PUBLIC_ENV_MODE=development')) {
          return 'development';
        }
        
        if (content.includes('NEXT_PUBLIC_ENV_MODE=production')) {
          return 'production';
        }
        
        if (content.includes('NEXT_PUBLIC_ENV_MODE=staging')) {
          return 'staging';
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return null;
  }

  /**
   * Get environment configuration
   */
  getEnvironmentConfig(envName) {
    const config = this.environments[envName];
    if (!config) {
      throw new Error(`Unknown environment: ${envName}`);
    }

    return {
      ...config,
      // Add common variables
      NEXT_PUBLIC_SUPABASE_URL: 'https://azspktldiblhrwebzmwq.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDQwNDQsImV4cCI6MjA2OTUyMDA0NH0.uKHB4K9hxUDTc0ZkwidCJv_Ev-oa99AflFvrFt_8MG8',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk0NDA0NCwiZXhwIjoyMDY5NTIwMDQ0fQ.hk8vOgFoW3PJZxhw40sHiNyvNxbD4_c4x6fqBynvlmE',
      JWT_SECRET: `hafiportrait-${envName}-secret-key-2025`,
      // Add storage configurations
      ...this.getStorageConfig(envName)
    };
  }

  /**
   * Get storage configuration based on environment
   */
  getStorageConfig(envName) {
    const baseStorageConfig = {
      // Cloudflare R2 Configuration
      CLOUDFLARE_R2_ACCOUNT_ID: 'b14090010faed475102a62eca152b67f',
      CLOUDFLARE_R2_ACCESS_KEY_ID: '51c66dbac26827b84132186428eb3492',
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: '65fe1143600bd9ef97a5c76b4ae924259779e0d0815ce44f09a1844df37fe3f1',
      CLOUDFLARE_R2_BUCKET_NAME: 'hafiportrait-photos',
      CLOUDFLARE_R2_CUSTOM_DOMAIN: 'photos.hafiportrait.photography',
      CLOUDFLARE_R2_PUBLIC_URL: 'https://photos.hafiportrait.photography',
      CLOUDFLARE_R2_REGION: 'auto',
      CLOUDFLARE_R2_ENDPOINT: 'https://b14090010faed475102a62eca152b67f.r2.cloudflarestorage.com',

      // Google Drive Configuration
      GOOGLE_DRIVE_CLIENT_ID: '1098208255243-i92ah6oithsvfhvq4fq62tfr8armjh1a.apps.googleusercontent.com',
      GOOGLE_DRIVE_CLIENT_SECRET: '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',
      GOOGLE_DRIVE_REFRESH_TOKEN: '1//0erDLcuFyYiK3CgYIARAAGA4SNwF-L9Ir3z2Ib2mbiPwCs-c3K_JeLfkZT0Zwxs-AMCJqyLsWs6nM8gk6Y4KLvrofLQHF9Qwcifg',
      GOOGLE_DRIVE_FOLDER_ID: 'root',
      GOOGLE_DRIVE_FOLDER_NAME: 'HafiPortrait-Photos',
      GOOGLE_DRIVE_SHARED_FOLDER: 'false',

      // Local Storage Configuration
      LOCAL_BACKUP_PATH: './DSLR-System/Backup/dslr-backup',

      // Smart Storage Settings
      SMART_STORAGE_ENABLED: 'true',
      SMART_STORAGE_COMPRESSION_QUALITY: '85',

      // Socket.IO Local Server Integration
      NEXT_PUBLIC_USE_SOCKETIO: 'true',
      NEXT_PUBLIC_SOCKETIO_URL: 'http://147.251.255.227:3001',
      SOCKETIO_PORT: '3001',
      ENABLE_WEBSOCKET: 'true',
      ENABLE_REAL_TIME_UPDATES: 'true',
      ENABLE_SOCKETIO_ROOMS: 'true'
    };

    // Environment-specific storage preferences
    const envStorageConfig = {
      development: {
        SMART_STORAGE_DEFAULT_TIER: 'cloudflareR2',
        SMART_STORAGE_PRIMARY: 'cloudflareR2',
        SMART_STORAGE_SECONDARY: 'local',
        SMART_STORAGE_TERTIARY: 'googleDrive',
        SMART_STORAGE_COMPRESSION_QUALITY: '75' // Lower quality for dev
      },
      staging: {
        SMART_STORAGE_DEFAULT_TIER: 'cloudflareR2',
        SMART_STORAGE_PRIMARY: 'cloudflareR2',
        SMART_STORAGE_SECONDARY: 'googleDrive',
        SMART_STORAGE_TERTIARY: 'local',
        SMART_STORAGE_COMPRESSION_QUALITY: '85' // Standard quality
      },
      production: {
        SMART_STORAGE_DEFAULT_TIER: 'cloudflareR2',
        SMART_STORAGE_PRIMARY: 'cloudflareR2',
        SMART_STORAGE_SECONDARY: 'googleDrive',
        SMART_STORAGE_TERTIARY: 'supabase',
        SMART_STORAGE_COMPRESSION_QUALITY: '90' // High quality for production
      }
    };

    return {
      ...baseStorageConfig,
      ...envStorageConfig[envName]
    };
  }

  /**
   * Display environment info
   */
  displayEnvironmentInfo(envName) {
    const config = this.environments[envName];
    const packageManager = this.detectPackageManager();
    
    console.log('\n🎯 ENVIRONMENT CONFIGURATION:');
    console.log('='.repeat(40));
    console.log(`📍 Environment: ${envName.toUpperCase()}`);
    console.log(`📝 Description: ${config.description}`);
    console.log(`🌐 URL: ${config.NEXT_PUBLIC_APP_URL}`);
    console.log(`⚙️ NODE_ENV: ${config.NODE_ENV}`);
    console.log(`📦 Package Manager: ${packageManager}`);
    console.log('='.repeat(40));
  }

  /**
   * Get package manager specific commands
   */
  getPackageManagerCommands(packageManager = null) {
    const pm = packageManager || this.detectPackageManager();
    
    const commands = {
      npm: {
        install: 'npm install',
        dev: 'npm run dev',
        build: 'npm run build',
        start: 'npm start'
      },
      yarn: {
        install: 'yarn install',
        dev: 'yarn dev',
        build: 'yarn build',
        start: 'yarn start'
      },
      pnpm: {
        install: 'pnpm install',
        dev: 'pnpm dev',
        build: 'pnpm build',
        start: 'pnpm start'
      }
    };

    return commands[pm] || commands.npm;
  }
}

module.exports = EnvironmentDetector;
