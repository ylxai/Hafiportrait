#!/usr/bin/env node

/**
 * Auto Environment Switcher
 * Intelligent environment switching berdasarkan context
 */

const EnvironmentDetector = require('./env-detector');
const { execSync } = require('child_process');

async function autoSwitchEnvironment() {
  console.log('🤖 Auto Environment Switcher');
  console.log('🔍 Analyzing current context...');
  console.log('');

  const detector = new EnvironmentDetector();
  const detectedEnv = detector.detectEnvironment();
  
  console.log(`📍 Detected environment: ${detectedEnv.toUpperCase()}`);
  
  // Get current environment from .env.local
  const currentEnv = detector.detectFromExistingConfig();
  
  if (currentEnv === detectedEnv) {
    console.log(`✅ Environment already configured for ${detectedEnv}`);
    detector.displayEnvironmentInfo(detectedEnv);
    return;
  }

  console.log(`🔄 Switching from ${currentEnv || 'unknown'} to ${detectedEnv}...`);
  
  // Switch to detected environment
  try {
    let setupScript;
    switch (detectedEnv) {
      case 'development':
        setupScript = 'scripts/setup-dev-env.js';
        break;
      case 'production':
        setupScript = 'scripts/setup-prod-env.js';
        break;
      case 'staging':
        setupScript = 'scripts/setup-staging-env.js';
        break;
      default:
        throw new Error(`Unknown environment: ${detectedEnv}`);
    }

    execSync(`node ${setupScript}`, { stdio: 'inherit' });
    
    console.log('\n🎉 Environment switch completed!');
    
  } catch (error) {
    console.error('❌ Environment switch failed:', error.message);
    process.exit(1);
  }
}

// Run auto switcher
autoSwitchEnvironment();