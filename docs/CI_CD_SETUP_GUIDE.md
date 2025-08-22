# 🚀 CI/CD Pipeline Setup Guide - HafiPortrait

**Complete CI/CD Implementation Guide with Free Platforms**

---

## 🆓 **FREE CI/CD PLATFORMS COMPARISON**

### **1. 🔵 Atlassian Bitbucket Pipelines** ⭐ **RECOMMENDED**
- **Free Tier**: 50 build minutes/month
- **Features**: Docker support, parallel steps, deployments
- **Integration**: Perfect with Atlassian ecosystem
- **Pros**: Easy setup, good documentation, Atlassian integration
- **Best For**: Small to medium projects, Atlassian users

### **2. 🟢 GitHub Actions**
- **Free Tier**: 2,000 minutes/month (public), 500 minutes/month (private)
- **Features**: Matrix builds, marketplace actions, secrets management
- **Pros**: Huge ecosystem, excellent documentation, great for open source
- **Best For**: GitHub-hosted projects, open source

### **3. 🟠 GitLab CI/CD**
- **Free Tier**: 400 minutes/month
- **Features**: Built-in registry, review apps, auto DevOps
- **Pros**: Complete DevOps platform, integrated container registry
- **Best For**: Full DevOps workflow, self-hosted options

### **4. 🔴 CircleCI**
- **Free Tier**: 6,000 build minutes/month
- **Features**: Docker layer caching, SSH debugging, parallelism
- **Pros**: Fast builds, excellent caching, generous free tier
- **Best For**: Docker-heavy workflows, performance-critical builds

---

## 📊 **PLATFORM SELECTION MATRIX**

| Feature | Bitbucket | GitHub | GitLab | CircleCI |
|---------|-----------|--------|--------|----------|
| **Free Minutes** | 50/month | 2000/500 | 400/month | 6000/month |
| **Parallel Jobs** | ✅ | ✅ | ✅ | ✅ |
| **Docker Support** | ✅ | ✅ | ✅ | ✅ |
| **Caching** | ✅ | ✅ | ✅ | ✅ Advanced |
| **Secrets Management** | ✅ | ✅ | ✅ | ✅ |
| **Deployment Environments** | ✅ | ✅ | ✅ | ✅ |
| **Atlassian Integration** | ✅ Excellent | ❌ | ❌ | ❌ |
| **Marketplace/Extensions** | ✅ | ✅ Huge | ✅ | ✅ |

---

## 🔵 **BITBUCKET PIPELINES SETUP** (Recommended for Atlassian Users)

### **📁 Repository Structure**
```
hafiportrait/
├── bitbucket-pipelines.yml     # Main pipeline config ✅
├── .github/workflows/ci-cd.yml # GitHub Actions alternative ✅
├── .gitlab-ci.yml              # GitLab CI alternative ✅
├── .env.example               # Environment template
├── package.json              # Dependencies
├── Dockerfile               # Production container
├── docker-compose.yml       # Local development
└── scripts/
    ├── deploy.sh            # Deployment script ✅
    ├── health-check.sh     # Health verification ✅
    └── test.sh             # Testing script
```

### **⚙️ Setup Steps for Bitbucket Pipelines**

#### **1. Enable Pipelines**
```bash
# In your Bitbucket repository:
# 1. Go to Repository Settings
# 2. Click "Pipelines" in the left sidebar
# 3. Click "Enable Pipelines"
# 4. Commit bitbucket-pipelines.yml to your repo
```

#### **2. Configure Repository Variables**
```bash
# In Bitbucket Repository Settings > Pipelines > Repository variables:
DATABASE_URL=your_production_database_url
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
VERCEL_TOKEN=your_vercel_token (if using Vercel)
SLACK_WEBHOOK=your_slack_webhook_url (optional)
```

#### **3. Configure Deployments**
```bash
# In Bitbucket Repository Settings > Pipelines > Deployments:
# Add environments: staging, production
# Configure environment-specific variables
```

---

## 🟢 **GITHUB ACTIONS SETUP**

### **⚙️ Setup Steps**

#### **1. Repository Secrets**
```bash
# In GitHub Repository Settings > Secrets and variables > Actions:
# Add these secrets:
DATABASE_URL=your_production_database_url
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
PRODUCTION_URL=https://your-domain.com
SLACK_WEBHOOK=your_slack_webhook_url
```

#### **2. Environment Protection**
```bash
# In GitHub Repository Settings > Environments:
# Create environments: staging, production
# Add protection rules for production (require reviews)
```

---

## 🟠 **GITLAB CI/CD SETUP**

### **⚙️ Setup Steps**

#### **1. CI/CD Variables**
```bash
# In GitLab Project Settings > CI/CD > Variables:
DATABASE_URL=your_production_database_url
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
STAGING_URL=https://staging.your-domain.com
PRODUCTION_URL=https://your-domain.com
```

#### **2. GitLab Runner (if self-hosted)**
```bash
# Install GitLab Runner
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt-get install gitlab-runner

# Register runner
sudo gitlab-runner register
```

---

## 🚀 **DEPLOYMENT PLATFORMS INTEGRATION**

### **1. 🔷 Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login and link project
vercel login
vercel link

# Get project details
vercel env ls
```

**Vercel Environment Variables:**
```bash
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### **2. 🚂 Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### **3. 🎨 Render**
```bash
# Render deploys automatically from Git
# Configure in Render dashboard:
# - Connect GitHub/GitLab repository
# - Set build command: pnpm run build
# - Set start command: pnpm start
```

### **4. 🌊 Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify init
netlify deploy --prod
```

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **📋 Required Environment Variables**

#### **Production Environment:**
```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret-key

# Storage Configuration
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=your_r2_endpoint

# Google Drive Backup
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token

# Socket.IO
SOCKETIO_PORT=4001
NEXT_PUBLIC_SOCKET_URL=https://your-socket-domain.com

# Security
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

#### **Staging Environment:**
```bash
# Same as production but with staging URLs
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
DATABASE_URL=postgresql://user:pass@staging-host:5432/staging_db
# ... other variables with staging values
```

---

## 🧪 **TESTING INTEGRATION**

### **📝 Test Scripts (package.json)**
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:load": "node scripts/load-testing-suite.js",
    "test:coverage": "jest --coverage",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### **🔧 Jest Configuration (jest.config.js)**
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/src/**/*.test.{js,ts}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

---

## 📊 **MONITORING & ALERTING**

### **🚨 Slack Integration**
```javascript
// scripts/notify-slack.js
const webhook = process.env.SLACK_WEBHOOK;
const payload = {
  text: `🚀 HafiPortrait deployed to ${process.env.ENVIRONMENT}`,
  channel: '#deployments',
  username: 'Deploy Bot'
};

fetch(webhook, {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

### **📧 Email Notifications**
```bash
# Using SendGrid or similar service
SENDGRID_API_KEY=your_sendgrid_key
NOTIFICATION_EMAIL=admin@your-domain.com
```

---

## 🔄 **ROLLBACK PROCEDURES**

### **🔙 Automatic Rollback**
```bash
# In deploy.sh
rollback() {
  echo "🔄 Rolling back to previous version..."
  
  # Git-based rollback
  git checkout HEAD~1
  
  # Vercel rollback
  vercel rollback --token=$VERCEL_TOKEN
  
  # Database rollback (if needed)
  # npm run db:rollback
  
  echo "✅ Rollback completed"
}
```

### **🚨 Emergency Procedures**
```bash
# Emergency rollback script
#!/bin/bash
# scripts/emergency-rollback.sh

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Rolling back to last known good state..."

# Stop current deployment
vercel rollback --token=$VERCEL_TOKEN

# Notify team
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-type: application/json' \
  --data '{"text":"🚨 Emergency rollback initiated for HafiPortrait"}'

echo "✅ Emergency rollback completed"
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **🗄️ Caching Strategy**
```yaml
# In CI/CD pipelines
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .pnpm-store/
    - .next/cache/
    - ~/.cache/
```

### **⚡ Build Optimization**
```bash
# Parallel builds
npm run build:parallel

# Incremental builds
NEXT_BUILD_CACHE=true npm run build

# Bundle analysis
npm run analyze
```

---

## 🛡️ **SECURITY BEST PRACTICES**

### **🔐 Secrets Management**
```bash
# Never commit secrets to repository
# Use platform-specific secret management:

# Bitbucket: Repository Variables (secured)
# GitHub: Repository Secrets
# GitLab: CI/CD Variables (protected)
# CircleCI: Environment Variables
```

### **🔒 Security Scanning**
```bash
# Add to CI pipeline
npm audit --audit-level moderate
snyk test  # If using Snyk
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **✅ Pre-Deployment**
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup procedures verified

### **✅ Deployment**
- [ ] CI/CD pipeline configured
- [ ] Staging deployment successful
- [ ] Health checks passing
- [ ] Performance tests completed
- [ ] Production deployment approved

### **✅ Post-Deployment**
- [ ] Health monitoring active
- [ ] Performance metrics normal
- [ ] Error tracking configured
- [ ] Team notifications sent
- [ ] Documentation updated

---

## 🎯 **RECOMMENDED SETUP FOR HAFIPORTRAIT**

### **🏆 Best Choice: GitHub Actions + Vercel**
**Why?**
- ✅ Generous free tier (2000 minutes)
- ✅ Excellent ecosystem and documentation
- ✅ Perfect Vercel integration
- ✅ Great for Next.js projects
- ✅ Easy secrets management

### **🥈 Alternative: Bitbucket Pipelines + Railway**
**Why?**
- ✅ Great for Atlassian users
- ✅ Simple configuration
- ✅ Good Railway integration
- ⚠️ Limited free minutes (50/month)

### **🥉 Budget Option: GitLab CI + Render**
**Why?**
- ✅ Complete DevOps platform
- ✅ Good free tier features
- ✅ Self-hosted options
- ✅ Integrated container registry

---

## 🚀 **QUICK START COMMANDS**

### **Setup GitHub Actions:**
```bash
# 1. Copy .github/workflows/ci-cd.yml to your repo
# 2. Configure repository secrets
# 3. Push to main branch
git add .github/workflows/ci-cd.yml
git commit -m "Add GitHub Actions CI/CD pipeline"
git push origin main
```

### **Setup Bitbucket Pipelines:**
```bash
# 1. Copy bitbucket-pipelines.yml to your repo
# 2. Enable pipelines in Bitbucket
# 3. Configure repository variables
git add bitbucket-pipelines.yml
git commit -m "Add Bitbucket Pipelines CI/CD"
git push origin main
```

### **Setup GitLab CI:**
```bash
# 1. Copy .gitlab-ci.yml to your repo
# 2. Configure CI/CD variables
# 3. Push to main branch
git add .gitlab-ci.yml
git commit -m "Add GitLab CI/CD pipeline"
git push origin main
```

---

**🎉 Your CI/CD pipeline is now ready for HafiPortrait production deployment!**
