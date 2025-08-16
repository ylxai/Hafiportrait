#!/usr/bin/env node

/**
 * Environment Status Checker
 * Display current environment configuration
 */

const fs = require('fs');
const path = require('path');
const EnvironmentDetector = require('./env-detector');

function displayCurrentEnvironment() {
  console.log('📊 ENVIRONMENT STATUS CHECK');
  console.log('='.repeat(50));

  const detector = new EnvironmentDetector();
  
  // Auto-detect current environment
  const detectedEnv = detector.detectEnvironment();
  console.log(`🔍 Auto-detected environment: ${detectedEnv.toUpperCase()}`);

  // Check existing .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('\n📄 Current .env.local configuration:');
    console.log('-'.repeat(30));
    
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    const importantVars = [
      'NODE_ENV',
      'NEXT_PUBLIC_ENV_MODE', 
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_DEBUG_MODE'
    ];
    
    importantVars.forEach(varName => {
      const line = lines.find(l => l.startsWith(`${varName}=`));
      if (line) {
        const value = line.split('=')[1];
        console.log(`   ${varName}: ${value}`);
      } else {
        console.log(`   ${varName}: ❌ NOT SET`);
      }
    });
    
    // Check file timestamp
    const stats = fs.statSync(envPath);
    console.log(`\n📅 Last modified: ${stats.mtime.toLocaleString()}`);
    
  } else {
    console.log('\n❌ No .env.local file found');
    console.log('💡 Run one of these commands to setup:');
    console.log('   npm run env:dev     # Development (VPS CloudRun)');
    console.log('   npm run env:prod    # Production (Vercel)');
    console.log('   npm run env:staging # Staging (Vercel Preview)');
  }

  // Display available environments
  console.log('\n🌐 Available environments:');
  console.log('-'.repeat(30));
  
  Object.entries(detector.environments).forEach(([name, config]) => {
    const current = detectedEnv === name ? '👈 CURRENT' : '';
    console.log(`   ${name.toUpperCase()}: ${config.NEXT_PUBLIC_APP_URL} ${current}`);
    console.log(`      ${config.description}`);
  });

  // Quick commands
  console.log('\n⚡ Quick commands:');
  console.log('-'.repeat(20));
  console.log('   npm run env:dev     # Switch to development');
  console.log('   npm run env:prod    # Switch to production');
  console.log('   npm run env:staging # Switch to staging');
  console.log('   npm run dev         # Start development server');
  console.log('   npm run build       # Build for production');

  // Environment recommendations
  console.log('\n💡 Recommendations:');
  console.log('-'.repeat(20));
  
  if (detectedEnv === 'development') {
    console.log('   ✅ Perfect for local development & testing');
    console.log('   🎯 Use VPS CloudRun for testing features');
    console.log('   🚀 Run: npm run dev');
  } else if (detectedEnv === 'production') {
    console.log('   ✅ Ready for Vercel production deployment');
    console.log('   🌐 Will deploy to: hafiportrait.photography');
    console.log('   🚀 Run: npm run build');
  } else if (detectedEnv === 'staging') {
    console.log('   ✅ Ready for Vercel preview deployment');
    console.log('   🔄 Good for testing before production');
    console.log('   🚀 Run: npm run build:staging');
  }
}

// Run status check
displayCurrentEnvironment();