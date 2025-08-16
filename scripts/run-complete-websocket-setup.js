#!/usr/bin/env node

/**
 * Complete WebSocket Setup Runner
 * Runs all WebSocket integration scripts in sequence
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Complete WebSocket Setup Runner');
console.log('==================================\n');

const scripts = [
  {
    name: 'External WebSocket Integration',
    script: 'integrate-external-websocket.js',
    description: 'Creates integration hooks and production config'
  },
  {
    name: 'External WebSocket Setup',
    script: 'setup-external-websocket.js', 
    description: 'Configures environment and creates test components'
  },
  {
    name: 'Connection Test',
    script: 'test-external-websocket.js',
    description: 'Tests connection to your VPS WebSocket server'
  }
];

async function runScript(scriptInfo) {
  const { name, script, description } = scriptInfo;
  
  console.log(`\n📋 Running: ${name}`);
  console.log(`📝 Description: ${description}`);
  console.log(`🔧 Script: ${script}\n`);
  
  try {
    const scriptPath = path.join(__dirname, script);
    execSync(`node ${scriptPath}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log(`\n✅ ${name} completed successfully!`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${name} failed:`, error.message);
    return false;
  }
}

async function runCompleteSetup() {
  console.log('🎯 Starting complete WebSocket setup...\n');
  
  let successCount = 0;
  
  for (const script of scripts) {
    const success = await runScript(script);
    if (success) {
      successCount++;
    } else {
      console.log('\n⚠️ Setup encountered an error. Continuing with remaining scripts...');
    }
    
    // Add separator between scripts
    console.log('\n' + '='.repeat(60));
  }
  
  // Final summary
  console.log('\n🎉 Complete WebSocket Setup Summary');
  console.log('===================================');
  console.log(`✅ Completed: ${successCount}/${scripts.length} scripts`);
  
  if (successCount === scripts.length) {
    console.log('\n🚀 All setup scripts completed successfully!');
    console.log('\n📝 Your system is now configured with:');
    console.log('   ✅ External WebSocket integration');
    console.log('   ✅ Enhanced polling fallback');
    console.log('   ✅ Production-ready configuration');
    console.log('   ✅ Connection testing tools');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Review generated files and configurations');
    console.log('   2. Set Vercel environment variables');
    console.log('   3. Test locally with: npm run dev');
    console.log('   4. Deploy to production: vercel --prod');
    
    console.log('\n📊 Expected benefits:');
    console.log('   🚀 Real-time updates with WebSocket');
    console.log('   ⚡ 3-10x faster fallback polling');
    console.log('   📱 Mobile-optimized performance');
    console.log('   🔋 Battery efficient operation');
    
  } else {
    console.log('\n⚠️ Some scripts failed. Please check the errors above.');
    console.log('   You can run individual scripts manually if needed.');
  }
  
  console.log('\n🔗 WebSocket Server: https://xcyrexmwrwjq.ap-southeast-1.clawcloudrun.com');
  console.log('🏥 Health Check: https://xcyrexmwrwjq.ap-southeast-1.clawcloudrun.com/health');
}

// Run complete setup
if (require.main === module) {
  runCompleteSetup().catch(console.error);
}

module.exports = { runCompleteSetup };