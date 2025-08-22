# 🧠 Session Memory - PM2 Production Issues

**Session Date**: August 22, 2025  
**Duration**: ~15 iterations  
**Status**: Development Working, Production Broken  

## 🎯 Session Summary

### What User Wanted
- Switch from Docker to PM2 for better control
- Isolated development and production environments
- Apply code changes without affecting production

### What We Achieved ✅
- Successfully migrated from Docker to PM2
- Created isolated environments:
  - **Production**: `/home/ubuntu/stable/` (port 3000/3001)
  - **Development**: `/home/ubuntu/dev-workspace/` (port 3002/3003)
- Development environment fully functional with hot reload
- Socket.IO production service working normally

### What's Broken ❌
- Production Next.js app (port 3000) - 500 Internal Server Error
- PM2 production app in continuous restart loop (96+ restarts)
- Build issues with missing vendor chunks

## 🔧 Current Working Setup

```bash
# Working Services
pm2 list
# ✅ hafiportrait-dev (port 3002) - ONLINE
# ✅ hafiportrait-socketio-dev (port 3003) - ONLINE  
# ✅ hafiportrait-socketio (port 3001) - ONLINE
# ❌ hafiportrait-app (port 3000) - RESTART LOOP

# Access URLs
http://147.251.255.227:3002  # Development (WORKING)
http://147.251.255.227:3003  # Dev Socket.IO (WORKING)
http://147.251.255.227:3001  # Prod Socket.IO (WORKING)
http://147.251.255.227:3000  # Production (BROKEN - 500 Error)
```

## 📋 Next Session Action Items

### Priority 1: Immediate Fix
1. **Use development as production temporarily**
   - Point users to port 3002
   - Development is stable and fully functional

### Priority 2: Production Investigation
1. **Fresh production setup**
   ```bash
   mkdir /home/ubuntu/stable-fresh
   cp -r /home/ubuntu/dev-workspace/* /home/ubuntu/stable-fresh/
   # Setup clean production environment
   ```

2. **Build investigation**
   ```bash
   cd /home/ubuntu/stable
   rm -rf .next node_modules
   pnpm install
   pnpm build --verbose
   # Check for specific build errors
   ```

### Priority 3: Long-term Solutions
1. **Implement sync script** (dev → prod deployment)
2. **Production optimization**
3. **Monitoring and alerts**

## 🔍 Key Files Modified

```bash
# PM2 Configurations
ecosystem.config.js                    # Production PM2 config
ecosystem.development.config.js        # Development PM2 config

# Documentation Created
docs/PM2_PRODUCTION_ISSUE_SESSION.md   # Full session documentation
docs/QUICK_RESUME_GUIDE.md            # Quick resume commands

# Package.json Scripts Added
"docs:session": "cat docs/PM2_PRODUCTION_ISSUE_SESSION.md"
"docs:resume": "cat docs/QUICK_RESUME_GUIDE.md"
```

## 🚨 Critical Issues to Address

1. **Production Build Failure**
   - Missing vendor chunks error
   - Module not found errors
   - Continuous PM2 restart loop

2. **Environment Configuration**
   - Production using development configs as workaround
   - Environment variable conflicts

3. **Deployment Strategy**
   - Need automated dev → prod sync
   - Zero-downtime deployment process

## 📞 Quick Resume Commands

```bash
# Check status
pm2 status
pnpm run docs:resume

# Access working services
curl http://147.251.255.227:3002  # Development
curl http://147.251.255.227:3000  # Production (will fail)

# Check production logs
pm2 logs hafiportrait-app --lines 10
```

## 🎯 User's Original Goal Status

- ✅ **Docker → PM2 migration**: Completed
- ✅ **Environment isolation**: Completed  
- ✅ **Development workflow**: Working perfectly
- ❌ **Production stability**: Needs fixing
- ⏳ **Code deployment process**: Partially implemented

## 💡 Recommended Next Session Approach

1. **Start with**: `pnpm run docs:resume`
2. **Quick fix**: Use development as production temporarily
3. **Focus on**: Fresh production setup or deep build investigation
4. **Goal**: Get production port 3000 working properly

---

**Memory Key**: Development environment is fully functional and isolated. Production has build/runtime issues but can be temporarily replaced by development environment. Focus next session on production fixes.