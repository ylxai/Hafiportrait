# 🚀 Production to Docker Migration Checklist

## ✅ **Pre-Migration Status**

### **Current Production Status (STOPPED)**
- [x] **PM2 hafiportrait-app** - STOPPED ✋
- [x] **PM2 hafiportrait-socketio** - STOPPED ✋
- [x] **PM2 pm2-logrotate** - RUNNING (Keep running)
- [x] **Port 3000** - Available for Docker
- [x] **Port 3001** - Available for Docker

### **Domain & Infrastructure (UNCHANGED)**
- [x] **Domain**: hafiportrait.photography ✅
- [x] **Cloudflare**: Active ✅
- [x] **Nginx**: Configured (pointing to port 3000/3001) ✅
- [x] **SSL**: Cloudflare certificates ✅

## 🐳 **Docker Migration Steps**

### **Phase 1: Preparation**
- [ ] **1.1** Verify Docker installed
- [ ] **1.2** Verify docker-compose installed
- [ ] **1.3** Check environment files exist
  - [ ] `.env.production` ✅
  - [ ] `.env.dev.public` ✅
- [ ] **1.4** Verify port availability
  - [ ] Port 3000 (Production Next.js)
  - [ ] Port 3001 (Production Socket.IO)
  - [ ] Port 4000 (Development Next.js)
  - [ ] Port 4001 (Development Socket.IO)

### **Phase 2: Docker Build & Test**
- [x] **2.1** Build Docker images ✅ COMPLETED
  ```bash
  pnpm run docker:build
  ```
- [❌] **2.2** Test development environment ❌ FAILED
  ```bash
  pnpm run docker:dev
  # Test: http://147.251.255.227:3002 (Updated port)
  ```
  **CRITICAL ISSUES:**
  - Docker Compose HTTP timeouts (60s limit exceeded)
  - Container creation failures 
  - Resource/network constraints
  - Command parsing still problematic despite fixes
  
- [ ] **2.3** Test production environment
  ```bash
  pnpm run docker:prod
  # Test: http://147.251.255.227:3000
  ```
- [ ] **2.4** Verify both can run simultaneously
  ```bash
  pnpm run docker:both
  ```

### **Phase 3: Production Deployment**
- [ ] **3.1** Stop any remaining processes
  ```bash
  pm2 stop all
  pkill -f "next"
  pkill -f "socketio"
  ```
- [ ] **3.2** Start Docker production
  ```bash
  pnpm run docker:prod
  ```
- [ ] **3.3** Verify services running
  ```bash
  pnpm run docker:status
  ```
- [ ] **3.4** Test local access
  - [ ] http://localhost:3000 ✅
  - [ ] http://localhost:3001/health ✅
  - [ ] http://147.251.255.227:3000 ✅
  - [ ] http://147.251.255.227:3001/health ✅

### **Phase 4: Domain Verification**
- [ ] **4.1** Test domain access
  - [ ] https://hafiportrait.photography ✅
  - [ ] https://hafiportrait.photography/admin ✅
  - [ ] https://hafiportrait.photography/api/health ✅
- [ ] **4.2** Test Socket.IO connection
  - [ ] WebSocket connection ✅
  - [ ] Real-time features ✅
- [ ] **4.3** Test all major features
  - [ ] Homepage gallery ✅
  - [ ] Photo strip ✅
  - [ ] Admin panel ✅
  - [ ] Event management ✅
  - [ ] Photo upload ✅

### **Phase 5: Monitoring & Optimization**
- [ ] **5.1** Monitor container health
  ```bash
  pnpm run docker:logs
  ```
- [ ] **5.2** Check resource usage
  ```bash
  docker stats
  ```
- [ ] **5.3** Verify auto-restart
  ```bash
  docker restart hafiportrait-prod
  ```
- [ ] **5.4** Test crash recovery
- [ ] **5.5** Monitor for 24 hours

## 🔧 **Rollback Plan (If Needed)**

### **Emergency Rollback**
```bash
# 1. Stop Docker containers
pnpm run docker:stop

# 2. Start old PM2 processes
pm2 start ecosystem.config.js

# 3. Verify services
pm2 list
curl http://localhost:3000
```

### **Rollback Checklist**
- [ ] **R.1** Stop Docker containers
- [ ] **R.2** Start PM2 processes
- [ ] **R.3** Verify domain access
- [ ] **R.4** Check all features working
- [ ] **R.5** Monitor for stability

## 📊 **Performance Comparison**

### **Before (PM2)**
- Memory usage: ~160MB total
- Startup time: ~30 seconds
- Build time: Manual (2-3 minutes)

### **After (Docker)**
- Memory usage: ___ MB (to be measured)
- Startup time: ___ seconds (to be measured)
- Build time: Automatic in container

## 🎯 **Success Criteria**

### **Must Have**
- [x] **Domain accessible** via https://hafiportrait.photography
- [ ] **All features working** (gallery, admin, upload)
- [ ] **Socket.IO functioning** (real-time features)
- [ ] **Performance acceptable** (similar to PM2)
- [ ] **Auto-restart working** (container resilience)

### **Nice to Have**
- [ ] **Development environment** working on port 4000
- [ ] **Hot reload** functioning for development
- [ ] **Container monitoring** setup
- [ ] **Log aggregation** working

## 🚨 **Known Issues & Solutions**

### **Current Issues (Phase 2)**
1. **Docker Permission Denied** ⚠️ CRITICAL
   - Error: `permission denied while trying to connect to the Docker daemon socket`
   - Solution: `sudo usermod -aG docker $USER && newgrp docker`
   
2. **Port Configuration Conflicts** ✅ FIXED
   - Issue: Multiple files had hardcoded 4000/4001 ports
   - Fixed: Updated to 3002/3003 for development
   - Files updated: package.json, docker-compose.yml, socketio-server.js, Dockerfile.multi-stage
   
3. **Command Parsing Issues** ✅ FIXED
   - Issue: `/app/-H` directory error from command parsing
   - Fixed: Created dedicated `dev:docker` script in package.json
   - Updated docker-compose.yml to use proper JSON array format

### **Next Steps (Priority Order)**

#### **IMMEDIATE (Choose One):**

**Option A: Manual Container Bypass** (RECOMMENDED)
```bash
# Bypass docker-compose, run container manually
sudo docker run -d --name hafiportrait-dev-manual \
  -p 3002:3002 \
  --env-file .env.dev.public \
  -v $(pwd):/app \
  stable_hafiportrait-dev:latest \
  sh -c "cd /app && pnpm run dev:docker"
```

**Option B: Rollback to PM2** (SAFE FALLBACK)
```bash
# Resume production with proven PM2 setup
sudo pm2 start ecosystem.config.js
# Docker migration dapat dilanjutkan nanti
```

**Option C: Simplify Docker Setup** (LONG TERM)
```bash
# Focus production Docker first, skip development
sudo docker-compose up -d hafiportrait-prod socketio-prod
```

#### **AFTER IMMEDIATE FIX:**
1. **Verify chosen approach works**
2. **Test domain access** (https://hafiportrait.photography)
3. **Monitor stability** for 24 hours
4. **Plan Docker optimization** (if continuing Docker path)

### **Quick Fixes**
```bash
# Fix permissions (try first)
sudo usermod -aG docker $USER
newgrp docker

# Alternative: Use sudo (temporary)
sudo docker restart hafiportrait-dev
sudo docker logs hafiportrait-dev

# Clean everything if needed
sudo docker system prune -f
pnpm run docker:build
```

## 📝 **Migration Notes**

### **Completed Steps**
- [x] **Production stopped** - PM2 processes halted ✅
- [x] **Ports available** - 3000/3001 ready for Docker ✅
- [x] **Docker files created** - Multi-stage setup ready ✅
- [x] **Scripts prepared** - Management commands ready ✅
- [x] **Images built** - Docker build successful ✅
- [x] **Port conflicts resolved** - Updated all config files ✅

### **Failed Steps**
- [❌] **Container deployment** - Docker Compose timeouts
- [❌] **Development testing** - Container creation failed
- [❌] **Production migration** - Blocked by container issues

### **Current Situation**
- **Time invested:** 1+ hours troubleshooting
- **Success rate:** 0% (no working containers)
- **Production status:** DOWN (PM2 stopped)
- **Risk level:** HIGH (production offline)

### **Immediate Actions Required**
1. **Choose recovery strategy** (Manual container / PM2 rollback / Simplified Docker)
2. **Restore production service** ASAP
3. **Verify domain accessibility**
4. **Plan Docker optimization** (if continuing)

---

**Migration started:** 2+ hours ago  
**Current status:** BLOCKED - Need immediate decision  
**Risk level:** HIGH (production down)  
**Recommendation:** Choose Option A or B immediately** 🚨