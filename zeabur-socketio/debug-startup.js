/**
 * Debug Startup Script
 * Comprehensive debugging untuk troubleshoot Zeabur deployment issues
 */

console.log('🔍 Debug Startup Script - HafiPortrait Socket.IO');
console.log('================================================');
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Working Directory: ${process.cwd()}`);
console.log(`Process ID: ${process.pid}`);

// Environment Variables Debug
console.log('\n🌍 Environment Variables:');
console.log('=========================');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`PORT: ${process.env.PORT || 'NOT SET'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
console.log(`FRONTEND_URL_SECONDARY: ${process.env.FRONTEND_URL_SECONDARY || 'NOT SET'}`);

// Database Environment (if set)
console.log('\n🗄️ Database Environment:');
console.log('========================');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET'}`);

// File System Check
console.log('\n📁 File System Check:');
console.log('=====================');
const fs = require('fs');
const requiredFiles = [
  'package.json',
  'server.js',
  'ecosystem.config.js',
  'ecosystem.simple.js',
  '.env.example'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
  
  if (exists && file === 'package.json') {
    try {
      const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      console.log(`   - Name: ${pkg.name}`);
      console.log(`   - Version: ${pkg.version}`);
      console.log(`   - Start Script: ${pkg.scripts?.start || 'NOT SET'}`);
      console.log(`   - PM2 Dependency: ${pkg.dependencies?.pm2 ? 'YES' : 'NO'}`);
    } catch (error) {
      console.log(`   - Error reading package.json: ${error.message}`);
    }
  }
});

// Network Configuration
console.log('\n🌐 Network Configuration:');
console.log('=========================');
const os = require('os');
const networkInterfaces = os.networkInterfaces();
Object.keys(networkInterfaces).forEach(interfaceName => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach(interface => {
    if (interface.family === 'IPv4' && !interface.internal) {
      console.log(`${interfaceName}: ${interface.address}`);
    }
  });
});

// Memory Information
console.log('\n💾 Memory Information:');
console.log('=====================');
const memUsage = process.memoryUsage();
console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
console.log(`External: ${Math.round(memUsage.external / 1024 / 1024)} MB`);

// Dependencies Check
console.log('\n📦 Dependencies Check:');
console.log('=====================');
const dependencies = [
  'socket.io',
  'express',
  'cors',
  'jsonwebtoken',
  'pm2'
];

dependencies.forEach(dep => {
  try {
    const version = require(`${dep}/package.json`).version;
    console.log(`✅ ${dep}: v${version}`);
  } catch (error) {
    console.log(`❌ ${dep}: NOT INSTALLED`);
  }
});

// Port Availability Check
console.log('\n🔌 Port Availability Check:');
console.log('===========================');
const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port is in use
    });
  });
}

async function checkPorts() {
  const ports = [8080, 3000, 3001];
  
  for (const port of ports) {
    const available = await checkPort(port);
    console.log(`Port ${port}: ${available ? 'AVAILABLE' : 'IN USE'}`);
  }
}

// DNS Resolution Check
console.log('\n🌐 DNS Resolution Check:');
console.log('=======================');
const dns = require('dns');

const domains = [
  'wbs.zeabur.app',
  'hafiportrait.photography',
  'hafiportrait.vercel.app'
];

domains.forEach(domain => {
  dns.lookup(domain, (err, address) => {
    if (err) {
      console.log(`❌ ${domain}: DNS FAILED (${err.code})`);
    } else {
      console.log(`✅ ${domain}: ${address}`);
    }
  });
});

// Startup Configuration Summary
console.log('\n📋 Startup Configuration Summary:');
console.log('=================================');

const config = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasFrontendUrl: !!process.env.FRONTEND_URL,
  productionReady: process.env.NODE_ENV === 'production' && 
                   process.env.JWT_SECRET && 
                   process.env.FRONTEND_URL
};

console.log(`Environment: ${config.environment}`);
console.log(`Port: ${config.port}`);
console.log(`JWT Secret: ${config.hasJwtSecret ? 'CONFIGURED' : 'MISSING'}`);
console.log(`Frontend URL: ${config.hasFrontendUrl ? 'CONFIGURED' : 'MISSING'}`);
console.log(`Production Ready: ${config.productionReady ? 'YES' : 'NO'}`);

// Recommendations
console.log('\n💡 Recommendations:');
console.log('==================');

if (!config.productionReady) {
  console.log('⚠️ Not production ready. Required environment variables:');
  if (config.environment !== 'production') {
    console.log('   - Set NODE_ENV=production');
  }
  if (!config.hasJwtSecret) {
    console.log('   - Set JWT_SECRET=your-secret-key');
  }
  if (!config.hasFrontendUrl) {
    console.log('   - Set FRONTEND_URL=https://hafiportrait.photography');
  }
} else {
  console.log('✅ Configuration looks good for production!');
}

// Run port check
checkPorts().then(() => {
  console.log('\n🚀 Debug startup completed');
  console.log('==========================');
  
  // Exit if this is just a debug run
  if (process.argv.includes('--debug-only')) {
    console.log('Debug-only mode, exiting...');
    process.exit(0);
  }
  
  // Otherwise, start the actual server
  console.log('Starting Socket.IO server...');
  require('./server.js');
}).catch(error => {
  console.error('❌ Debug startup failed:', error);
  process.exit(1);
});