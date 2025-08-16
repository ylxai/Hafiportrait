#!/usr/bin/env node

/**
 * Koyeb Deployment Setup Script
 * Automated setup untuk deploy WebSocket server ke Koyeb
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result;
  } catch (error) {
    if (!options.silent) {
      log(`❌ Error executing: ${command}`, 'red');
      log(error.message, 'red');
    }
    throw error;
  }
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'blue');

  // Check if ws directory exists
  if (!fs.existsSync('ws')) {
    log('❌ WebSocket directory (ws/) not found!', 'red');
    log('Please run this script from the project root directory.', 'yellow');
    process.exit(1);
  }

  // Check required files
  const requiredFiles = [
    'ws/package.json',
    'ws/server.js',
    'ws/Dockerfile',
    'ws/health-check.js'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log(`❌ Required file missing: ${file}`, 'red');
      process.exit(1);
    }
  }

  log('✅ All required files found', 'green');

  // Check if Koyeb CLI is installed
  try {
    execCommand('koyeb --version', { silent: true });
    log('✅ Koyeb CLI is installed', 'green');
  } catch (error) {
    log('⚠️  Koyeb CLI not found. Installing...', 'yellow');
    try {
      execCommand('curl -fsSL https://cli.koyeb.com/install.sh | sh');
      log('✅ Koyeb CLI installed successfully', 'green');
    } catch (installError) {
      log('❌ Failed to install Koyeb CLI', 'red');
      log('Please install manually: https://www.koyeb.com/docs/cli/installation', 'yellow');
      process.exit(1);
    }
  }

  // Check Git repository
  try {
    const gitRemote = execCommand('git remote get-url origin', { silent: true }).trim();
    log(`✅ Git repository: ${gitRemote}`, 'green');
    return gitRemote;
  } catch (error) {
    log('❌ Git repository not found or not configured', 'red');
    log('Please ensure you are in a Git repository with remote origin set.', 'yellow');
    process.exit(1);
  }
}

async function setupKoyebAuth() {
  log('\n🔐 Setting up Koyeb authentication...', 'blue');

  try {
    // Check if already logged in
    execCommand('koyeb auth current-user', { silent: true });
    log('✅ Already logged in to Koyeb', 'green');
    return true;
  } catch (error) {
    log('⚠️  Not logged in to Koyeb', 'yellow');
    
    const authMethod = await askQuestion('Choose auth method (1: Browser login, 2: API token): ');
    
    if (authMethod === '1') {
      log('Opening browser for authentication...', 'cyan');
      execCommand('koyeb auth login');
    } else if (authMethod === '2') {
      const token = await askQuestion('Enter your Koyeb API token: ');
      execCommand(`koyeb auth login --token ${token}`);
    } else {
      log('❌ Invalid choice', 'red');
      process.exit(1);
    }
    
    log('✅ Successfully authenticated with Koyeb', 'green');
    return true;
  }
}

async function getDeploymentConfig() {
  log('\n⚙️  Configuring deployment...', 'blue');

  const config = {};

  // App name
  config.appName = await askQuestion('Enter app name (default: hafiportrait-websocket): ') || 'hafiportrait-websocket';

  // Region
  log('\nAvailable regions:', 'cyan');
  log('1. fra (Frankfurt, Europe)', 'cyan');
  log('2. was (Washington, US East)', 'cyan');
  log('3. sin (Singapore, Asia)', 'cyan');
  
  const regionChoice = await askQuestion('Choose region (1-3, default: 1): ') || '1';
  const regions = { '1': 'fra', '2': 'was', '3': 'sin' };
  config.region = regions[regionChoice] || 'fra';

  // Instance type
  log('\nAvailable instance types:', 'cyan');
  log('1. nano (512MB RAM, 0.1 vCPU) - ~$23/month', 'cyan');
  log('2. small (1GB RAM, 0.25 vCPU) - ~$46/month', 'cyan');
  
  const instanceChoice = await askQuestion('Choose instance type (1-2, default: 1): ') || '1';
  const instances = { '1': 'nano', '2': 'small' };
  config.instanceType = instances[instanceChoice] || 'nano';

  // Environment
  const envChoice = await askQuestion('Environment (1: Production, 2: Staging, default: 1): ') || '1';
  config.environment = envChoice === '2' ? 'staging' : 'production';

  return config;
}

async function createKoyebApp(config, gitRemote) {
  log('\n🚀 Creating Koyeb application...', 'blue');

  const { appName, region, instanceType, environment } = config;

  // Prepare environment variables
  const envVars = [
    `NODE_ENV=${environment}`,
    'WS_PORT=3001',
    'HEALTH_PORT=3002',
    'HOST=0.0.0.0',
    'MAX_CONNECTIONS=1000',
    'HEARTBEAT_INTERVAL=30000',
    'PING_TIMEOUT=120000',
    'ENABLE_STATS_LOGGING=true',
    'STATS_INTERVAL=30000',
    'CORS_ORIGIN=*',
    'LOG_LEVEL=info'
  ];

  const envFlags = envVars.map(env => `--env ${env}`).join(' ');

  // Create deployment command
  const deployCommand = `koyeb app create ${appName} \\
    --git ${gitRemote} \\
    --git-branch main \\
    --git-build-command "cd ws && npm install" \\
    --git-run-command "cd ws && npm start" \\
    --ports 3001:http \\
    --ports 3002:http \\
    ${envFlags} \\
    --regions ${region} \\
    --instance-type ${instanceType} \\
    --min-scale 1 \\
    --max-scale 3`;

  try {
    log('Executing deployment command...', 'cyan');
    execCommand(deployCommand);
    log('✅ Koyeb application created successfully!', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to create Koyeb application', 'red');
    
    // Check if app already exists
    try {
      execCommand(`koyeb app get ${appName}`, { silent: true });
      log(`⚠️  App '${appName}' already exists`, 'yellow');
      
      const updateChoice = await askQuestion('Update existing app? (y/N): ');
      if (updateChoice.toLowerCase() === 'y') {
        log('Updating existing application...', 'cyan');
        execCommand(`koyeb app redeploy ${appName}`);
        log('✅ Application updated successfully!', 'green');
        return true;
      }
    } catch (getError) {
      // App doesn't exist, original error is valid
    }
    
    throw error;
  }
}

async function waitForDeployment(appName) {
  log('\n⏳ Waiting for deployment to complete...', 'blue');

  const maxAttempts = 30; // 5 minutes
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const status = execCommand(`koyeb app get ${appName} --output json`, { silent: true });
      const appData = JSON.parse(status);
      
      if (appData.status === 'healthy') {
        log('✅ Deployment completed successfully!', 'green');
        return appData;
      } else if (appData.status === 'error') {
        log('❌ Deployment failed', 'red');
        log('Check logs with: koyeb app logs ' + appName, 'yellow');
        return null;
      }
      
      log(`⏳ Status: ${appData.status} (${attempts + 1}/${maxAttempts})`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
    } catch (error) {
      log('⚠️  Error checking deployment status', 'yellow');
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  log('⚠️  Deployment timeout. Check status manually with: koyeb app get ' + appName, 'yellow');
  return null;
}

async function testDeployment(appData) {
  if (!appData || !appData.domains || appData.domains.length === 0) {
    log('⚠️  No domain found for testing', 'yellow');
    return false;
  }

  const domain = appData.domains[0];
  const wsUrl = `wss://${domain}/ws`;
  const healthUrl = `https://${domain}/health`;

  log('\n🧪 Testing deployment...', 'blue');

  // Test health endpoint
  try {
    log('Testing health endpoint...', 'cyan');
    const healthResponse = execCommand(`curl -s ${healthUrl}`, { silent: true });
    const healthData = JSON.parse(healthResponse);
    
    if (healthData.status === 'healthy') {
      log('✅ Health check passed', 'green');
    } else {
      log('⚠️  Health check returned non-healthy status', 'yellow');
    }
  } catch (error) {
    log('❌ Health check failed', 'red');
    return false;
  }

  // Test WebSocket connection
  try {
    log('Testing WebSocket connection...', 'cyan');
    
    // Create temporary test script
    const testScript = `
const WebSocket = require('ws');
const ws = new WebSocket('${wsUrl}');
let connected = false;

ws.on('open', () => {
  connected = true;
  console.log('✅ WebSocket connection successful');
  ws.close();
  process.exit(0);
});

ws.on('error', (error) => {
  console.log('❌ WebSocket connection failed:', error.message);
  process.exit(1);
});

setTimeout(() => {
  if (!connected) {
    console.log('❌ WebSocket connection timeout');
    process.exit(1);
  }
}, 10000);
`;

    fs.writeFileSync('/tmp/test-websocket.js', testScript);
    execCommand('cd ws && node /tmp/test-websocket.js');
    fs.unlinkSync('/tmp/test-websocket.js');
    
    log('✅ WebSocket test passed', 'green');
  } catch (error) {
    log('❌ WebSocket test failed', 'red');
    return false;
  }

  return true;
}

async function generateVercelConfig(appData) {
  if (!appData || !appData.domains || appData.domains.length === 0) {
    log('⚠️  No domain found for Vercel configuration', 'yellow');
    return;
  }

  const domain = appData.domains[0];
  const wsUrl = `wss://${domain}/ws`;

  log('\n📝 Generating Vercel configuration...', 'blue');

  const vercelEnv = `
# Add this to your Vercel environment variables:
# Dashboard: https://vercel.com/dashboard

NEXT_PUBLIC_WS_URL=${wsUrl}
`;

  const vercelConfigPath = 'vercel-websocket-config.txt';
  fs.writeFileSync(vercelConfigPath, vercelEnv);

  log(`✅ Vercel configuration saved to: ${vercelConfigPath}`, 'green');
  log('\n📋 Next steps for Vercel:', 'cyan');
  log('1. Go to https://vercel.com/dashboard', 'cyan');
  log('2. Select your project', 'cyan');
  log('3. Go to Settings → Environment Variables', 'cyan');
  log(`4. Add: NEXT_PUBLIC_WS_URL = ${wsUrl}`, 'cyan');
  log('5. Redeploy your application', 'cyan');

  return wsUrl;
}

async function showSummary(config, appData, wsUrl) {
  log('\n🎉 Deployment Summary', 'green');
  log('='.repeat(50), 'green');
  
  if (appData && appData.domains && appData.domains.length > 0) {
    const domain = appData.domains[0];
    
    log(`📱 App Name: ${config.appName}`, 'cyan');
    log(`🌍 Region: ${config.region}`, 'cyan');
    log(`💻 Instance: ${config.instanceType}`, 'cyan');
    log(`🔗 Domain: ${domain}`, 'cyan');
    log(`🌐 WebSocket URL: wss://${domain}/ws`, 'cyan');
    log(`❤️  Health Check: https://${domain}/health`, 'cyan');
    log(`📊 Stats: https://${domain}/stats`, 'cyan');
  }

  log('\n🔧 Management Commands:', 'yellow');
  log(`koyeb app get ${config.appName}`, 'cyan');
  log(`koyeb app logs ${config.appName}`, 'cyan');
  log(`koyeb app redeploy ${config.appName}`, 'cyan');
  log(`koyeb app delete ${config.appName}`, 'cyan');

  log('\n📝 Files Created:', 'yellow');
  log('- vercel-websocket-config.txt (Vercel environment variables)', 'cyan');
  log('- koyeb.yml (Koyeb configuration)', 'cyan');

  log('\n✅ Deployment completed successfully!', 'green');
  log('Your WebSocket server is now live and ready for real-time notifications.', 'green');
}

async function main() {
  try {
    log('🚀 Koyeb WebSocket Deployment Setup', 'bright');
    log('=' .repeat(50), 'bright');

    // Check prerequisites
    const gitRemote = await checkPrerequisites();

    // Setup authentication
    await setupKoyebAuth();

    // Get deployment configuration
    const config = await getDeploymentConfig();

    // Create Koyeb application
    await createKoyebApp(config, gitRemote);

    // Wait for deployment
    const appData = await waitForDeployment(config.appName);

    if (appData) {
      // Test deployment
      const testPassed = await testDeployment(appData);

      if (testPassed) {
        // Generate Vercel configuration
        const wsUrl = await generateVercelConfig(appData);

        // Show summary
        await showSummary(config, appData, wsUrl);
      } else {
        log('⚠️  Deployment completed but tests failed', 'yellow');
        log('Check logs with: koyeb app logs ' + config.appName, 'yellow');
      }
    } else {
      log('❌ Deployment failed or timed out', 'red');
      log('Check status with: koyeb app get ' + config.appName, 'yellow');
    }

  } catch (error) {
    log('\n❌ Setup failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { main };