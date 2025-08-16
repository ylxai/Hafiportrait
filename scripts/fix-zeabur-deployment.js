/**
 * Fix Zeabur Deployment Issues
 * Troubleshooting dan auto-fix untuk common deployment problems
 */

const fs = require('fs');
const readline = require('readline');

class ZeaburDeploymentFixer {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.issues = [];
    this.fixes = [];
  }

  async run() {
    console.log('🔧 Zeabur Deployment Fixer');
    console.log('==========================\n');
    
    try {
      await this.diagnoseIssues();
      await this.showDiagnosis();
      await this.applyFixes();
      
      console.log('\n✅ Deployment fix completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Push changes to GitHub');
      console.log('2. Redeploy on Zeabur');
      console.log('3. Check logs for improvements');
      
    } catch (error) {
      console.error('❌ Fix failed:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async diagnoseIssues() {
    console.log('🔍 Diagnosing deployment issues...\n');
    
    // Check 1: Zeabur folder structure
    await this.checkZeaburFolder();
    
    // Check 2: Package.json configuration
    await this.checkPackageJson();
    
    // Check 3: Environment configuration
    await this.checkEnvironmentConfig();
    
    // Check 4: PM2 configuration
    await this.checkPM2Config();
    
    // Check 5: Server configuration
    await this.checkServerConfig();
    
    // Check 6: Port configuration
    await this.checkPortConfig();
  }

  async checkZeaburFolder() {
    console.log('📁 Checking Zeabur folder structure...');
    
    const requiredFiles = [
      'zeabur-socketio/package.json',
      'zeabur-socketio/server.js',
      'zeabur-socketio/ecosystem.config.js',
      'zeabur-socketio/.env.example'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        this.issues.push({
          type: 'missing-file',
          severity: 'high',
          message: `Missing required file: ${file}`,
          fix: () => this.createMissingFile(file)
        });
      } else {
        console.log(`✅ ${file} exists`);
      }
    }
  }

  async checkPackageJson() {
    console.log('\\n📦 Checking package.json configuration...');
    
    const packagePath = 'zeabur-socketio/package.json';
    if (!fs.existsSync(packagePath)) return;
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check start script
    if (!packageJson.scripts?.start?.includes('pm2-runtime')) {
      this.issues.push({
        type: 'incorrect-start-script',
        severity: 'high',
        message: 'Start script should use pm2-runtime for Zeabur',
        fix: () => this.fixStartScript()
      });
    } else {
      console.log('✅ Start script uses PM2');
    }
    
    // Check PM2 dependency
    if (!packageJson.dependencies?.pm2) {
      this.issues.push({
        type: 'missing-pm2',
        severity: 'medium',
        message: 'PM2 dependency missing',
        fix: () => this.addPM2Dependency()
      });
    } else {
      console.log('✅ PM2 dependency present');
    }
    
    // Check Zeabur configuration
    if (!packageJson.zeabur) {
      this.issues.push({
        type: 'missing-zeabur-config',
        severity: 'low',
        message: 'Zeabur-specific configuration missing',
        fix: () => this.addZeaburConfig()
      });
    } else {
      console.log('✅ Zeabur configuration present');
    }
  }

  async checkEnvironmentConfig() {
    console.log('\\n🌍 Checking environment configuration...');
    
    const serverPath = 'zeabur-socketio/server.js';
    if (!fs.existsSync(serverPath)) return;
    
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check port configuration
    if (!serverContent.includes('process.env.PORT || 8080')) {
      this.issues.push({
        type: 'incorrect-port',
        severity: 'high',
        message: 'Server should use port 8080 for Zeabur',
        fix: () => this.fixPortConfig()
      });
    } else {
      console.log('✅ Port configuration correct (8080)');
    }
    
    // Check production URL
    if (!serverContent.includes('wbs.zeabur.app')) {
      this.issues.push({
        type: 'incorrect-domain',
        severity: 'medium',
        message: 'Production URL should use wbs.zeabur.app',
        fix: () => this.fixDomainConfig()
      });
    } else {
      console.log('✅ Domain configuration correct (wbs.zeabur.app)');
    }
  }

  async checkPM2Config() {
    console.log('\\n⚙️ Checking PM2 configuration...');
    
    const ecosystemPath = 'zeabur-socketio/ecosystem.config.js';
    if (!fs.existsSync(ecosystemPath)) {
      this.issues.push({
        type: 'missing-ecosystem',
        severity: 'high',
        message: 'PM2 ecosystem.config.js missing',
        fix: () => this.createEcosystemConfig()
      });
      return;
    }
    
    const ecosystemContent = fs.readFileSync(ecosystemPath, 'utf8');
    
    // Check port configuration
    if (!ecosystemContent.includes('PORT: 8080')) {
      this.issues.push({
        type: 'ecosystem-port',
        severity: 'medium',
        message: 'PM2 ecosystem should use port 8080',
        fix: () => this.fixEcosystemPort()
      });
    } else {
      console.log('✅ PM2 ecosystem port configuration correct');
    }
  }

  async checkServerConfig() {
    console.log('\\n🖥️ Checking server configuration...');
    
    const serverPath = 'zeabur-socketio/server.js';
    if (!fs.existsSync(serverPath)) return;
    
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check CORS configuration
    if (!serverContent.includes('https://hafiportrait.photography')) {
      this.issues.push({
        type: 'cors-config',
        severity: 'medium',
        message: 'CORS should include production domain',
        fix: () => this.fixCORSConfig()
      });
    } else {
      console.log('✅ CORS configuration includes production domain');
    }
    
    // Check graceful shutdown
    if (!serverContent.includes('SIGTERM') || !serverContent.includes('SIGINT')) {
      this.issues.push({
        type: 'graceful-shutdown',
        severity: 'low',
        message: 'Graceful shutdown handlers missing',
        fix: () => this.addGracefulShutdown()
      });
    } else {
      console.log('✅ Graceful shutdown handlers present');
    }
  }

  async checkPortConfig() {
    console.log('\\n🔌 Checking port configuration consistency...');
    
    const files = [
      'zeabur-socketio/server.js',
      'zeabur-socketio/.env.example',
      'zeabur-socketio/ecosystem.config.js',
      'zeabur-socketio/zeabur.json'
    ];
    
    let portInconsistencies = 0;
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('3001') && !content.includes('8080')) {
          portInconsistencies++;
          console.log(`⚠️ ${file} still uses port 3001`);
        }
      }
    }
    
    if (portInconsistencies > 0) {
      this.issues.push({
        type: 'port-inconsistency',
        severity: 'high',
        message: `${portInconsistencies} files still use port 3001 instead of 8080`,
        fix: () => this.fixAllPorts()
      });
    } else {
      console.log('✅ All files use port 8080 consistently');
    }
  }

  async showDiagnosis() {
    console.log('\\n📊 Diagnosis Results:');
    console.log('=====================');
    
    if (this.issues.length === 0) {
      console.log('🎉 No issues found! Deployment configuration looks good.');
      return;
    }
    
    const highIssues = this.issues.filter(i => i.severity === 'high');
    const mediumIssues = this.issues.filter(i => i.severity === 'medium');
    const lowIssues = this.issues.filter(i => i.severity === 'low');
    
    if (highIssues.length > 0) {
      console.log('\\n🚨 High Priority Issues:');
      highIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.message}`);
      });
    }
    
    if (mediumIssues.length > 0) {
      console.log('\\n⚠️ Medium Priority Issues:');
      mediumIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.message}`);
      });
    }
    
    if (lowIssues.length > 0) {
      console.log('\\n💡 Low Priority Issues:');
      lowIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.message}`);
      });
    }
    
    console.log(`\\n📈 Total issues found: ${this.issues.length}`);
  }

  async applyFixes() {
    if (this.issues.length === 0) return;
    
    const shouldFix = await this.question('\\nApply automatic fixes? (y/n) [y]: ');
    if (shouldFix.toLowerCase() === 'n') {
      console.log('Skipping automatic fixes.');
      return;
    }
    
    console.log('\\n🔧 Applying fixes...');
    
    for (const issue of this.issues) {
      try {
        console.log(`Fixing: ${issue.message}`);
        await issue.fix();
        this.fixes.push(issue.message);
        console.log('✅ Fixed');
      } catch (error) {
        console.log(`❌ Failed to fix: ${error.message}`);
      }
    }
    
    console.log(`\\n✅ Applied ${this.fixes.length} fixes`);
  }

  // Fix methods
  async fixStartScript() {
    const packagePath = 'zeabur-socketio/package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.scripts.start = 'pm2-runtime start ecosystem.config.js';
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async addPM2Dependency() {
    const packagePath = 'zeabur-socketio/package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.dependencies.pm2 = '^5.3.0';
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async addZeaburConfig() {
    const packagePath = 'zeabur-socketio/package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.zeabur = {
      port: 8080,
      healthCheck: {
        path: '/health',
        port: 8080
      }
    };
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async fixPortConfig() {
    const serverPath = 'zeabur-socketio/server.js';
    let content = fs.readFileSync(serverPath, 'utf8');
    content = content.replace(/process\.env\.PORT \|\| 3001/g, 'process.env.PORT || 8080');
    fs.writeFileSync(serverPath, content);
  }

  async fixDomainConfig() {
    const serverPath = 'zeabur-socketio/server.js';
    let content = fs.readFileSync(serverPath, 'utf8');
    content = content.replace(/socket-server\.zeabur\.app/g, 'wbs.zeabur.app');
    fs.writeFileSync(serverPath, content);
  }

  async fixAllPorts() {
    const files = [
      'zeabur-socketio/server.js',
      'zeabur-socketio/.env.example',
      'zeabur-socketio/ecosystem.config.js',
      'zeabur-socketio/zeabur.json',
      'zeabur-socketio/test-connection.js',
      'zeabur-socketio/health-check.js',
      'zeabur-socketio/client-example.html'
    ];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/3001/g, '8080');
        fs.writeFileSync(file, content);
      }
    }
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run fixer
const fixer = new ZeaburDeploymentFixer();
fixer.run();