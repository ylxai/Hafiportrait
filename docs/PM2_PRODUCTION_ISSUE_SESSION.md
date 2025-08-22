# 🚨 PM2 Production Issue - Session Documentation

**Date**: August 22, 2025  
**Session**: Docker to PM2 Migration & Production Troubleshooting  
**Status**: Development Working, Production Issues  

## 📊 Current Status

### ✅ Working Services
- **Development**: `http://147.251.255.227:3002` - PM2 hafiportrait-dev (HEALTHY)
- **Development Socket.IO**: `http://147.251.255.227:3003` - PM2 hafiportrait-socketio-dev (HEALTHY)
- **Production Socket.IO**: `http://147.251.255.227:3001` - PM2 hafiportrait-socketio (HEALTHY)
- **Domain**: `https://hafiportrait.photography` - Cloudflare (ONLINE)

### ❌ Problematic Services
- **Production**: `http://147.251.255.227:3000` - PM2 hafiportrait-app (500 ERROR)

## 🔄 What Was Accomplished

### 1. Docker to PM2 Migration
- ✅ Successfully stopped Docker containers
- ✅ Created isolated development workspace: `/home/ubuntu/dev-workspace/`
- ✅ Setup PM2 configurations for both environments
- ✅ Development environment fully functional with file watching

### 2. Environment Isolation
- ✅ **Production**: `/home/ubuntu/stable/` (port 3000/3001)
- ✅ **Development**: `/home/ubuntu/dev-workspace/` (port 3002/3003)
- ✅ Separate PM2 ecosystem configs
- ✅ Independent dependency management

### 3. PM2 Configuration
```javascript
// Production: ecosystem.config.js
{
  name: 'hafiportrait-app',
  script: 'pnpm',
  args: 'dev', // Changed to dev as workaround
  env: { NODE_ENV: 'development', PORT: 3000 }
}

// Development: ecosystem.development.config.js  
{
  name: 'hafiportrait-dev',
  cwd: '../dev-workspace',
  env: { NODE_ENV: 'development', PORT: 3002 }
}
```

## 🚨 Production Issues Identified

### Primary Problem
- **500 Internal Server Error** on production port 3000
- **404 on /api/health** endpoint
- **PM2 continuous restart loop** (96+ restarts)

### Error Patterns
```bash
# Logs show continuous failures
ELIFECYCLE Command failed with exit code 1
> next start -p $PORT

# Build issues encountered
Cannot find module './vendor-chunks/@tanstack+query-core@4.40.0.js'
```

### Troubleshooting Attempts
1. ❌ Clean rebuild (`rm -rf .next node_modules && pnpm install && pnpm build`)
2. ❌ Environment variable fixes (`.env.production` vs `.env.local`)
3. ❌ Manual Next.js start
4. ❌ Copy from working development
5. ❌ Switch to development mode for production

## 📁 File Structure

```
/home/ubuntu/stable/           # Production directory
├── ecosystem.config.js        # Production PM2 config
├── .env.production           # Production environment
├── src/                      # Source code
├── .next/                    # Built files (problematic)
└── node_modules/             # Dependencies

/home/ubuntu/dev-workspace/    # Development directory  
├── ecosystem.development.config.js
├── .env.local               # Development environment
├── src/                     # Source code (working)
└── node_modules/            # Dependencies (working)
```

## 🎯 Next Steps Required

### Immediate Actions (Priority 1)
1. **Use Development as Production Temporarily**
   ```bash
   # Access website via development port
   http://147.251.255.227:3002
   ```

2. **Investigate Production Build Issues**
   - Check for corrupted build artifacts
   - Verify all dependencies are properly installed
   - Compare working dev vs broken prod environments

### Investigation Tasks (Priority 2)
1. **Deep Dive into Build Process**
   ```bash
   # Check build logs for specific errors
   pnpm build --verbose
   
   # Compare package.json between environments
   diff /home/ubuntu/stable/package.json /home/ubuntu/dev-workspace/package.json
   ```

2. **Environment Variable Analysis**
   ```bash
   # Verify production environment loading
   pm2 env hafiportrait-app
   
   # Test with different env files
   NODE_ENV=production pnpm start
   ```

3. **Fresh Production Setup**
   ```bash
   # Consider clean production setup
   mkdir /home/ubuntu/stable-fresh
   cd /home/ubuntu/stable-fresh
   # Copy from working development
   ```

### Long-term Solutions (Priority 3)
1. **Implement Sync Script** (was created but deleted)
   - Automated development to production deployment
   - Zero-downtime deployment strategy
   - Rollback capabilities

2. **Production Optimization**
   - Proper production build process
   - Environment-specific configurations
   - Health monitoring and alerts

## 🔧 Commands to Resume Session

### Check Current Status
```bash
pm2 status
curl -f http://localhost:3002/api/health  # Development
curl -f http://localhost:3000/api/health  # Production (will fail)
```

### Access Working Services
```bash
# Development (working)
http://147.251.255.227:3002

# Production Socket.IO (working)  
http://147.251.255.227:3001
```

### PM2 Management
```bash
# Restart production (will likely fail)
pm2 restart hafiportrait-app

# Check logs
pm2 logs hafiportrait-app --lines 20

# Stop problematic production
pm2 stop hafiportrait-app
```

## 📋 Session Context for Continuation

### User Request History
1. Started with Docker production running
2. Wanted to switch from Docker to PM2
3. Needed isolated development and production environments
4. Encountered production build/runtime issues
5. Successfully achieved development isolation
6. Production remains problematic

### Technical Context
- **Server**: Ubuntu VPS (147.251.255.227)
- **Node.js**: v22.18.0
- **Package Manager**: pnpm v10.14.0
- **Process Manager**: PM2 v6.0.8
- **Framework**: Next.js 14.2.15

### Environment Variables
- Production uses `.env.production`
- Development uses `.env.local`
- Both have Supabase, Cloudflare R2, Google Drive configs
- Socket.IO configurations differ by environment

## 🎯 Recommended Next Session Focus

1. **Fresh Production Setup** - Start clean production environment
2. **Build Process Investigation** - Deep dive into why production builds fail
3. **Sync Script Implementation** - Automated deployment from dev to prod
4. **Production Optimization** - Proper production configuration

## 📞 Quick Resume Commands

```bash
# Check what's running
pm2 status

# Access working development
curl http://147.251.255.227:3002

# Check production issue
pm2 logs hafiportrait-app --lines 10

# Start fresh investigation
cd /home/ubuntu/stable
ls -la .next/
```

---

**Note**: Development environment is fully functional and can serve as temporary production. Focus next session on resolving production build issues or implementing fresh production setup.