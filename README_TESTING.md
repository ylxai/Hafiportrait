# 🧪 HafiPortrait Monitoring System - Testing Guide

**Panduan lengkap untuk testing sistem monitoring HafiPortrait dengan berbagai opsi testing**

---

## 🚀 **QUICK START - PILIH METODE TESTING**

### **🎯 Option 1: One-Command Test (RECOMMENDED)**
```bash
# Test semua komponen dengan satu perintah
chmod +x scripts/test-all.sh
./scripts/test-all.sh
```

### **⚡ Option 2: Automated Full Test**
```bash
# Test otomatis lengkap dengan setup
chmod +x scripts/start-monitoring-test.sh
./scripts/start-monitoring-test.sh
```

### **🎮 Option 3: Interactive Step-by-Step**
```bash
# Test interaktif dengan panduan
chmod +x scripts/run-monitoring-tests.sh
./scripts/run-monitoring-tests.sh interactive
```

### **🔍 Option 4: Individual Component Test**
```bash
# Test hanya komponen tertentu
node scripts/test-monitoring-system.js
```

---

## 📊 **TESTING SCRIPTS OVERVIEW**

| Script | Fungsi | Mode | Durasi | Recommended For |
|--------|--------|------|--------|-----------------|
| `test-all.sh` | **All-in-one testing** | Auto | ~5 min | **Production readiness** |
| `start-monitoring-test.sh` | Full system test + manual | Auto + Manual | ~10 min | **Development** |
| `run-monitoring-tests.sh` | Interactive testing | Interactive/Auto | ~15 min | **Learning/Debugging** |
| `test-monitoring-system.js` | Component testing | Individual | ~2 min | **CI/CD** |

---

## 🎯 **RECOMMENDED TESTING WORKFLOW**

### **For First Time Setup:**
```bash
# 1. Setup sistem (jika belum)
./scripts/setup-monitoring.sh

# 2. Test lengkap
./scripts/test-all.sh

# 3. Manual verification di browser
# http://localhost:3000/admin
```

### **For Development:**
```bash
# 1. Quick test setelah changes
node scripts/test-monitoring-system.js

# 2. Full test jika major changes
./scripts/test-all.sh
```

### **For Production Deployment:**
```bash
# 1. Comprehensive test
./scripts/test-all.sh

# 2. Manual testing
# 3. Performance verification
# 4. Deploy jika success rate ≥ 80%
```

---

## 📋 **WHAT GETS TESTED**

### **🔧 Infrastructure Tests**
- ✅ Node.js version compatibility (≥18)
- ✅ Package manager availability (pnpm/npm)
- ✅ Required dependencies installation
- ✅ File structure validation
- ✅ TypeScript compilation
- ✅ Environment configuration

### **🌐 API Endpoint Tests**
- ✅ Health check (`/api/health`)
- ✅ Monitoring overview (`/api/admin/monitoring?type=overview`)
- ✅ System metrics (`/api/admin/monitoring?type=metrics`)
- ✅ Health status (`/api/admin/monitoring?type=health`)
- ✅ Alerts data (`/api/admin/monitoring?type=alerts`)
- ✅ Alert creation (POST)
- ✅ Health check trigger (POST)

### **🚨 Alert Manager Tests**
- ✅ Alert creation functionality
- ✅ Alert retrieval and filtering
- ✅ Alert resolution process
- ✅ Metrics calculation
- ✅ Cooldown mechanism
- ✅ Multi-channel notifications

### **🏥 Health Monitor Tests**
- ✅ System metrics collection (CPU, Memory, Storage)
- ✅ Database health checks
- ✅ Storage service health checks
- ✅ API endpoints health checks
- ✅ External services health checks
- ✅ Overall status calculation

### **📱 Component Tests**
- ✅ Real-time Monitor component rendering
- ✅ Alert Dashboard component rendering
- ✅ Advanced Monitoring component rendering
- ✅ Admin dashboard integration
- ✅ Navigation functionality
- ✅ Responsive design

### **⚡ Performance Tests**
- ✅ API response times (target: <1000ms excellent, <3000ms acceptable)
- ✅ Memory usage monitoring
- ✅ Component rendering speed
- ✅ Auto-refresh performance impact
- ✅ Real-time updates efficiency

### **🔗 Integration Tests**
- ✅ Admin dashboard accessibility
- ✅ Monitoring API integration
- ✅ Real-time data flow
- ✅ Alert notification flow
- ✅ Cross-component communication

---

## 📈 **SUCCESS CRITERIA**

### **✅ Passing Criteria**
```
📊 Test Results:
   Total Test Categories: 7
   ✅ Passed: 6-7
   ❌ Failed: 0-1
   Success Rate: ≥ 80%
   
🎉 Overall Result: PASSED
System is ready for production!
```

### **📊 Performance Benchmarks**
- **API Response Time**: < 1000ms (excellent), < 3000ms (acceptable)
- **Memory Usage**: < 100MB (efficient), < 200MB (acceptable)
- **Component Render**: < 500ms
- **Overall Success Rate**: ≥ 80%

### **🔍 Expected Output Example**
```bash
🧪 HafiPortrait Monitoring System Test Suite
╔══════════════════════════════════════════════════════════════╗
║    Comprehensive testing for all monitoring components      ║
╚══════════════════════════════════════════════════════════════╝

🧪 System Requirements Check
==================================================
✅ Node.js v18.17.0 ✓
✅ pnpm found ✓
✅ curl found ✓

🧪 API Endpoints Test
==================================================
✅ Health Check ✓
✅ Monitoring Overview ✓
✅ System Metrics ✓
✅ Alert Creation ✓

🧪 Performance Test
==================================================
✅ Response 1: 245ms (excellent) ✓
✅ Response 2: 189ms (excellent) ✓
✅ Average response time: 217ms
✅ Performance test passed (excellent) ✓

📊 Final Test Results:
   Total Test Categories: 7
   ✅ Passed: 7
   ❌ Failed: 0
   Success Rate: 100%

🎉 OVERALL RESULT: PASSED
System is ready for production deployment!
```

---

## 🔍 **TROUBLESHOOTING COMMON ISSUES**

### **❌ Node.js Version Issues**
```bash
# Check current version
node --version

# Install Node.js 18+ if needed
# Using nvm:
nvm install 18
nvm use 18

# Using package manager:
# macOS: brew install node@18
# Ubuntu: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

### **❌ Port Already in Use**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)

# Or use different port
PORT=3001 pnpm dev
```

### **❌ Dependencies Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install

# Or use npm
npm install
```

### **❌ Permission Issues**
```bash
# Fix script permissions
chmod +x scripts/*.sh
chmod +x scripts/*.js

# Fix log directory
mkdir -p logs/monitoring
chmod 755 logs/monitoring
```

### **❌ API Endpoints Failing**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check environment variables
cat .env | grep -E "(DATABASE_URL|JWT_SECRET)"

# Check logs
tail -f logs/monitoring/monitoring.log
```

### **❌ Components Not Rendering**
```bash
# Check TypeScript errors
npx tsc --noEmit --skipLibCheck

# Clear Next.js cache
rm -rf .next

# Check build
pnpm build
```

---

## 📱 **MANUAL TESTING CHECKLIST**

### **After Automated Tests Pass:**

#### **1. Admin Dashboard Access**
- [ ] Open `http://localhost:3000/admin`
- [ ] Login dengan credentials admin
- [ ] Navigate ke "System & Monitoring"

#### **2. Real-time Monitor Testing**
- [ ] Klik "Real-time Monitor" di sidebar
- [ ] Verify metrics update setiap 5 detik
- [ ] Test auto-refresh toggle (Play/Pause)
- [ ] Test manual refresh button
- [ ] Check health checks status
- [ ] Verify responsive design di mobile

#### **3. Alert Dashboard Testing**
- [ ] Klik "Alert Dashboard" di sidebar
- [ ] Verify alert list displays
- [ ] Test filter buttons (All/Critical/Unresolved)
- [ ] Create test alert via API
- [ ] Test alert resolution
- [ ] Check metrics overview cards

#### **4. Advanced Monitoring Testing**
- [ ] Klik "Advanced Monitoring" di sidebar
- [ ] Test tab switching (Real-time/Alerts)
- [ ] Verify combined interface works
- [ ] Check data consistency antar tabs
- [ ] Test all controls

#### **5. Performance Testing**
- [ ] Monitor CPU usage saat auto-refresh
- [ ] Check memory usage di browser dev tools
- [ ] Test dengan multiple tabs open
- [ ] Verify no memory leaks
- [ ] Check network requests frequency

---

## 📊 **LOG FILES & REPORTS**

### **Generated Files:**
```
logs/monitoring/
├── final-test-report.txt       # Summary hasil test
├── comprehensive-test.log      # Detailed test results
├── dev-server.log             # Development server logs
├── monitoring-service.log     # Monitoring service logs
├── setup.log                  # Setup process logs
└── test-report.json          # JSON format results
```

### **Report Structure:**
```
HafiPortrait Monitoring System - Final Test Report
==================================================
Date: 2024-01-15 10:30:00
Test Categories: 7
Passed: 7
Failed: 0
Success Rate: 100%

Test Results:
- System Requirements: PASSED
- Dependencies: PASSED
- File Structure: PASSED
- Services: PASSED
- API Endpoints: PASSED
- Admin Dashboard: PASSED
- Performance: PASSED

Overall Status: READY FOR PRODUCTION
```

---

## 🚀 **PRODUCTION DEPLOYMENT CHECKLIST**

### **Before Production:**
- [ ] All automated tests pass (≥ 80% success rate)
- [ ] Manual testing completed successfully
- [ ] Performance benchmarks met
- [ ] No critical errors in logs
- [ ] Environment variables configured for production
- [ ] Notification channels tested (Slack/Email/WhatsApp)
- [ ] Backup procedures verified
- [ ] Security scan completed
- [ ] Documentation updated

### **Production Setup Commands:**
```bash
# 1. Setup monitoring on production server
./scripts/setup-monitoring.sh

# 2. Configure production environment
cp .env.example .env.production
# Edit .env.production with production values

# 3. Start monitoring service with PM2
pm2 start ecosystem.monitoring.config.js

# 4. Verify production monitoring
curl https://your-domain.com/api/admin/monitoring?type=overview

# 5. Setup log rotation
sudo logrotate -f /etc/logrotate.conf
```

---

## 🎯 **NEXT STEPS AFTER TESTING**

### **If All Tests Pass (≥80%)** ✅
1. **Deploy to staging** environment
2. **Configure production monitoring** dengan PM2/systemd
3. **Setup notification channels** (Slack, Email, WhatsApp)
4. **Train admin users** untuk menggunakan monitoring dashboard
5. **Monitor system performance** di production
6. **Schedule regular health checks**

### **If Tests Fail (<80%)** ❌
1. **Review failed test details** di log files
2. **Fix identified issues** satu per satu
3. **Re-run specific tests** untuk verify fixes
4. **Repeat testing** sampai success rate ≥ 80%
5. **Document any known issues** untuk future reference

---

## 🎉 **KESIMPULAN**

**Sistem testing monitoring HafiPortrait telah LENGKAP dengan:**

✅ **4 Testing Scripts** - One-command, Automated, Interactive, Individual
✅ **7 Test Categories** - Infrastructure sampai Integration
✅ **Comprehensive Coverage** - 25+ individual tests
✅ **Detailed Reporting** - JSON dan text reports
✅ **Troubleshooting Guide** - Solutions untuk common issues
✅ **Production Readiness** - Complete deployment checklist

**Untuk memulai testing, jalankan:**
```bash
./scripts/test-all.sh
```

**Sistem monitoring HafiPortrait siap untuk production deployment!** 🚀

---

## 📞 **SUPPORT & DOCUMENTATION**

- **Main Documentation**: `MONITORING_SYSTEM_COMPLETE.md`
- **Admin Integration**: `ADMIN_DASHBOARD_INTEGRATION_COMPLETE.md`
- **Test Checklist**: `MONITORING_TEST_CHECKLIST.md`
- **Complete Test Guide**: `TEST_MONITORING_COMPLETE.md`

**Happy Testing!** 🧪✨