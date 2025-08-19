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
- [ ] **2.1** Build Docker images
  ```bash
  pnpm run docker:build
  ```
- [ ] **2.2** Test development environment
  ```bash
  pnpm run docker:dev
  # Test: http://147.251.255.227:4000
  ```
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

### **Potential Issues**
1. **Port conflicts** → Use `pnpm run docker:stop` first
2. **Permission issues** → Check file ownership
3. **Environment variables** → Verify .env files
4. **Memory limits** → Monitor with `docker stats`

### **Quick Fixes**
```bash
# Clean everything and restart
pnpm run docker:clean
pnpm run docker:build
pnpm run docker:prod

# Check logs for errors
pnpm run docker:logs

# Restart specific service
docker restart hafiportrait-prod
```

## 📝 **Migration Notes**

### **Completed Steps**
- [x] **Production stopped** - PM2 processes halted
- [x] **Ports available** - 3000/3001 ready for Docker
- [x] **Docker files created** - Multi-stage setup ready
- [x] **Scripts prepared** - Management commands ready

### **Next Actions**
1. Build Docker images
2. Test development environment
3. Test production environment
4. Deploy to production
5. Verify domain access

---

**Migration started on:** `date +"%Y-%m-%d %H:%M:%S"`
**Estimated completion:** 30-60 minutes
**Risk level:** Low (easy rollback available)

**Ready to proceed with Docker migration!** 🚀