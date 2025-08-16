/**
 * Deployment helper untuk Zeabur Socket.IO
 * Otomatis setup GitHub repo dan deployment guide
 */

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

class ZeaburDeploymentHelper {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.config = {
      githubRepo: '',
      zeaburUrl: '',
      jwtSecret: '',
      frontendUrl: ''
    };
  }

  async run() {
    console.log('🚀 Zeabur Socket.IO Deployment Helper');
    console.log('====================================\n');
    
    try {
      await this.checkPrerequisites();
      await this.collectDeploymentConfig();
      await this.prepareZeaburFolder();
      await this.setupGitRepository();
      await this.generateDeploymentInstructions();
      
      console.log('\n✅ Deployment preparation completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Push to GitHub: cd zeabur-socketio && git push');
      console.log('2. Deploy on Zeabur: https://zeabur.com');
      console.log('3. Set environment variables on Zeabur');
      console.log('4. Run migration: npm run migrate:zeabur');
      
    } catch (error) {
      console.error('❌ Deployment preparation failed:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');
    
    // Check if zeabur-socketio folder exists
    if (!fs.existsSync('zeabur-socketio')) {
      throw new Error('zeabur-socketio folder not found. Please create it first.');
    }
    
    // Check if git is installed
    try {
      execSync('git --version', { stdio: 'ignore' });
      console.log('✅ Git is installed');
    } catch (error) {
      throw new Error('Git is not installed. Please install Git first.');
    }
    
    // Check if zeabur-socketio has package.json
    if (!fs.existsSync('zeabur-socketio/package.json')) {
      throw new Error('zeabur-socketio/package.json not found.');
    }
    
    console.log('✅ All prerequisites met\n');
  }

  async collectDeploymentConfig() {
    console.log('📝 Deployment Configuration\n');
    
    this.config.githubRepo = await this.question(
      'GitHub repository URL (e.g., https://github.com/username/hafiportrait-socketio): '
    );
    
    this.config.frontendUrl = await this.question(
      'Frontend URL (e.g., https://hafiportrait.vercel.app): '
    );
    
    this.config.jwtSecret = await this.question(
      'JWT Secret (or press Enter to generate): '
    ) || this.generateJWTSecret();
    
    console.log('\n📋 Configuration Summary:');
    console.log(`GitHub Repo: ${this.config.githubRepo}`);
    console.log(`Frontend URL: ${this.config.frontendUrl}`);
    console.log(`JWT Secret: ${this.config.jwtSecret.substring(0, 10)}...`);
    
    const confirm = await this.question('\nProceed with deployment setup? (y/n) [y]: ');
    if (confirm.toLowerCase() === 'n') {
      throw new Error('Deployment setup cancelled by user');
    }
  }

  async prepareZeaburFolder() {
    console.log('\n🔧 Preparing Zeabur folder...');
    
    // Update .env.example with frontend URL
    const envExamplePath = 'zeabur-socketio/.env.example';
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    envContent = envContent.replace(
      'FRONTEND_URL=https://your-frontend-domain.com',
      `FRONTEND_URL=${this.config.frontendUrl}`
    );
    
    envContent = envContent.replace(
      'JWT_SECRET=your-jwt-secret-key-here',
      `JWT_SECRET=${this.config.jwtSecret}`
    );
    
    fs.writeFileSync(envExamplePath, envContent);
    console.log('✅ Updated .env.example');
    
    // Update server.js CORS origins
    const serverPath = 'zeabur-socketio/server.js';
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    const corsOrigins = [
      '"http://localhost:3000"',
      `"${this.config.frontendUrl}"`,
      '"https://*.vercel.app"',
      'process.env.FRONTEND_URL'
    ];
    
    serverContent = serverContent.replace(
      /origin: \[[\s\S]*?\]/,
      `origin: [\n          ${corsOrigins.join(',\n          ')}\n        ]`
    );
    
    fs.writeFileSync(serverPath, serverContent);
    console.log('✅ Updated CORS configuration');
    
    // Create production .env file
    const prodEnvPath = 'zeabur-socketio/.env.production';
    const prodEnvContent = `# Production Environment Variables for Zeabur
NODE_ENV=production
PORT=3001
JWT_SECRET=${this.config.jwtSecret}
FRONTEND_URL=${this.config.frontendUrl}
`;
    
    fs.writeFileSync(prodEnvPath, prodEnvContent);
    console.log('✅ Created .env.production');
  }

  async setupGitRepository() {
    console.log('\n📦 Setting up Git repository...');
    
    const zeaburDir = 'zeabur-socketio';
    
    try {
      // Initialize git if not already initialized
      if (!fs.existsSync(`${zeaburDir}/.git`)) {
        execSync('git init', { cwd: zeaburDir, stdio: 'ignore' });
        console.log('✅ Initialized Git repository');
      }
      
      // Add all files
      execSync('git add .', { cwd: zeaburDir, stdio: 'ignore' });
      console.log('✅ Added files to Git');
      
      // Create initial commit
      try {
        execSync('git commit -m "Initial Socket.IO server for Zeabur deployment"', { 
          cwd: zeaburDir, 
          stdio: 'ignore' 
        });
        console.log('✅ Created initial commit');
      } catch (error) {
        console.log('ℹ️ No changes to commit or already committed');
      }
      
      // Add remote origin
      if (this.config.githubRepo) {
        try {
          execSync(`git remote add origin ${this.config.githubRepo}`, { 
            cwd: zeaburDir, 
            stdio: 'ignore' 
          });
          console.log('✅ Added remote origin');
        } catch (error) {
          console.log('ℹ️ Remote origin already exists');
        }
        
        // Set main branch
        execSync('git branch -M main', { cwd: zeaburDir, stdio: 'ignore' });
        console.log('✅ Set main branch');
      }
      
    } catch (error) {
      console.error('⚠️ Git setup warning:', error.message);
    }
  }

  async generateDeploymentInstructions() {
    console.log('\n📋 Generating deployment instructions...');
    
    const instructionsPath = 'zeabur-socketio/DEPLOYMENT_INSTRUCTIONS.md';
    const instructions = `# 🚀 Zeabur Deployment Instructions

## Generated Configuration

- **GitHub Repository**: ${this.config.githubRepo}
- **Frontend URL**: ${this.config.frontendUrl}
- **JWT Secret**: ${this.config.jwtSecret.substring(0, 10)}...
- **Generated**: ${new Date().toISOString()}

## 1. Push to GitHub

\`\`\`bash
cd zeabur-socketio
git push -u origin main
\`\`\`

## 2. Deploy on Zeabur

1. Go to [Zeabur.com](https://zeabur.com)
2. Click "New Project"
3. Connect GitHub repository: \`${this.config.githubRepo}\`
4. Zeabur will auto-detect Node.js and deploy

## 3. Set Environment Variables on Zeabur

Add these environment variables in Zeabur dashboard:

\`\`\`
NODE_ENV=production
PORT=3001
JWT_SECRET=${this.config.jwtSecret}
FRONTEND_URL=${this.config.frontendUrl}
\`\`\`

## 4. Get Zeabur URL

After deployment, you'll get a URL like:
\`https://your-app-name.zeabur.app\`

## 5. Update Frontend Configuration

Run the migration script with your Zeabur URL:

\`\`\`bash
# In main project directory
npm run migrate:zeabur
# Enter your Zeabur URL when prompted
\`\`\`

## 6. Update Vercel Environment Variables

Add these to your Vercel project:

\`\`\`
NEXT_PUBLIC_SOCKETIO_URL=https://your-zeabur-url.zeabur.app
NEXT_PUBLIC_USE_SOCKETIO=true
JWT_SECRET=${this.config.jwtSecret}
\`\`\`

## 7. Test Integration

\`\`\`bash
# Test connection
npm run test:zeabur-integration

# Check health
npm run health:zeabur
\`\`\`

## 8. Monitor Deployment

- **Health Check**: \`https://your-zeabur-url.zeabur.app/health\`
- **Stats**: \`https://your-zeabur-url.zeabur.app/api/stats\`
- **Test Client**: Open \`client-example.html\` in browser

## Troubleshooting

### CORS Issues
If you get CORS errors, check that your frontend URL is correctly configured in the server.

### Connection Failed
1. Check Zeabur deployment logs
2. Verify environment variables
3. Test health endpoint

### Authentication Issues
Ensure JWT_SECRET is the same in both frontend and Zeabur server.

## Rollback Plan

If needed, rollback by updating Vercel environment:

\`\`\`
NEXT_PUBLIC_USE_SOCKETIO=false
\`\`\`

---

**Ready for production! 🎉**
`;
    
    fs.writeFileSync(instructionsPath, instructions);
    console.log('✅ Created DEPLOYMENT_INSTRUCTIONS.md');
    
    // Create deployment checklist
    const checklistPath = 'ZEABUR_DEPLOYMENT_CHECKLIST.md';
    const checklist = `# ✅ Zeabur Socket.IO Deployment Checklist

## Pre-deployment
- [ ] zeabur-socketio folder created and configured
- [ ] GitHub repository created: ${this.config.githubRepo}
- [ ] Environment variables configured
- [ ] CORS origins updated with frontend URL

## Deployment
- [ ] Code pushed to GitHub
- [ ] Zeabur project created and connected
- [ ] Environment variables set on Zeabur
- [ ] Deployment successful (check Zeabur dashboard)

## Integration
- [ ] Zeabur URL obtained
- [ ] Migration script executed: \`npm run migrate:zeabur\`
- [ ] Vercel environment variables updated
- [ ] Frontend redeployed

## Testing
- [ ] Health check working: \`npm run health:zeabur\`
- [ ] Integration test passed: \`npm run test:zeabur-integration\`
- [ ] Real-time notifications working
- [ ] Admin notifications working
- [ ] Mobile compatibility verified

## Monitoring
- [ ] Health endpoint accessible
- [ ] Stats endpoint working
- [ ] Connection monitoring setup
- [ ] Error logging configured

## Production Verification
- [ ] Photo upload notifications working
- [ ] Message notifications working
- [ ] Event backup notifications working
- [ ] Admin dashboard real-time updates
- [ ] Mobile browser compatibility

---

**Configuration Details:**
- Frontend URL: ${this.config.frontendUrl}
- GitHub Repo: ${this.config.githubRepo}
- Generated: ${new Date().toISOString()}
`;
    
    fs.writeFileSync(checklistPath, checklist);
    console.log('✅ Created ZEABUR_DEPLOYMENT_CHECKLIST.md');
  }

  generateJWTSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run deployment helper
const deployment = new ZeaburDeploymentHelper();
deployment.run();