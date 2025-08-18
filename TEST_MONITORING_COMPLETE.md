# 🧪 Test Monitoring System - PANDUAN LENGKAP

**Panduan komprehensif untuk testing sistem monitoring HafiPortrait**

---

## 🚀 **QUICK START - JALANKAN TEST**

### **Option 1: Test Otomatis Lengkap** ⚡
```bash
# Jalankan semua test otomatis
chmod +x scripts/start-monitoring-test.sh
./scripts/start-monitoring-test.sh
```

### **Option 2: Test Interaktif Step-by-Step** 🎯
```bash
# Test dengan panduan step-by-step
chmod +x scripts/run-monitoring-tests.sh
./scripts/run-monitoring-tests.sh interactive
```

### **Option 3: Test Individual** 🔍
```bash
# Test hanya komponen tertentu
node scripts/test-monitoring-system.js
```

---

## 📋 **SCRIPT TESTING YANG TERSEDIA**

### **1. 🚀 start-monitoring-test.sh**
- **Fungsi**: Test otomatis lengkap dengan setup
- **Fitur**: 
  - Setup monitoring system
  - Start development server
  - Start automated monitoring
  - Test semua komponen
  - Performance testing
  - Keep services running untuk manual test

### **2. 🎯 run-monitoring-tests.sh**
- **Fungsi**: Test interaktif dengan progress tracking
- **Mode**: 
  - `interactive` - Step-by-step dengan user input
  - `auto` - Automated mode
- **Fitur**: Progress bar, colored output, detailed reporting

### **3. 🔍 test-monitoring-system.js**
- **Fungsi**: Comprehensive test suite
- **Fitur**: 
  - File structure test
  - Dependencies test
  - API endpoints test
  - Component rendering test
  - Performance test
  - Integration test

---

## 🧪 **TESTING WORKFLOW**

### **Workflow 1: First Time Setup & Test**
```bash
# 1. Setup sistem monitoring
./scripts/setup-monitoring.sh

# 2. Jalankan test lengkap
./scripts/start-monitoring-test.sh

# 3. Manual testing di browser
# http://localhost:3000/admin
```

### **Workflow 2: Development Testing**
```bash
# 1. Test interaktif untuk development
./scripts/run-monitoring-tests.sh interactive

# 2. Fix issues jika ada
# 3. Re-run specific tests
```

### **Workflow 3: CI/CD Testing**
```bash
# 1. Automated testing untuk CI/CD
./scripts/run-monitoring-tests.sh auto

# 2. Check exit code untuk pass/fail
echo $?  # 0 = success, 1 = failure
```

---

## 📊 **TEST CATEGORIES**

### **🔧 Infrastructure Tests**
- ✅ File structure validation
- ✅ Dependencies check
- ✅ Node.js version compatibility
- ✅ Environment configuration
- ✅ TypeScript compilation

### **🌐 API Tests**
- ✅ Health endpoint (`/api/health`)
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
- ✅ Escalation rules

### **🏥 Health Monitor Tests**
- ✅ System metrics collection
- ✅ Database health checks
- ✅ Storage health checks
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
- ✅ API response times (< 1000ms excellent, < 3000ms acceptable)
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

## 📈 **EXPECTED TEST RESULTS**

### **✅ Success Criteria**
```
📊 Test Summary:
   Total Tests: 12
   ✅ Passed: 10-12
   ❌ Failed: 0-2
   Success Rate: ≥ 80%
   
🎉 Overall Result: PASSED
System is ready for production!
```

### **📊 Performance Benchmarks**
- **API Response Time**: < 1000ms (excellent), < 3000ms (acceptable)
- **Memory Usage**: < 100MB (efficient), < 200MB (acceptable)
- **Component Render**: < 500ms
- **Success Rate**: ≥ 80%

### **🔍 Test Output Example**
```bash
🧪 Testing File Structure
==================================================
✅ File Structure: src/lib/alert-manager.ts exists (15234 bytes)
✅ File Structure: src/lib/health-monitor.ts exists (18456 bytes)
✅ File Structure: src/components/admin/alert-dashboard.tsx exists (12789 bytes)

🧪 Testing API Endpoints
==================================================
✅ API Endpoints: Health check - Status 200
✅ API Endpoints: Monitoring overview - Status 200
✅ API Endpoints: System metrics - Status 200

🧪 Testing Performance
==================================================
✅ Performance: API response time: 245ms (excellent)
✅ Performance: Memory usage: 67MB (efficient)
```

---

## 🔍 **TROUBLESHOOTING GUIDE**

### **❌ Common Issues & Solutions**

#### **1. Server Not Starting**
```bash
# Check port availability
lsof -i :3000

# Kill existing processes
pkill -f "next"

# Restart with different port
PORT=3001 pnpm dev
```

#### **2. API Endpoints Failing**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check logs
tail -f logs/monitoring/monitoring.log

# Verify environment variables
cat .env | grep -E "(DATABASE_URL|JWT_SECRET)"
```

#### **3. Components Not Rendering**
```bash
# Check TypeScript errors
npx tsc --noEmit --skipLibCheck

# Check build process
pnpm build

# Clear Next.js cache
rm -rf .next
```

#### **4. Monitoring Service Issues**
```bash
# Check if monitoring is running
ps aux | grep automated-monitoring

# Check monitoring logs
cat logs/monitoring/service-error.log

# Restart monitoring
pkill -f automated-monitoring
node scripts/automated-monitoring.js &
```

#### **5. Permission Issues**
```bash
# Fix script permissions
chmod +x scripts/*.sh
chmod +x scripts/*.js

# Fix log directory permissions
mkdir -p logs/monitoring
chmod 755 logs/monitoring
```

### **📋 Debug Checklist**
- [ ] Node.js version ≥ 18
- [ ] All dependencies installed (`pnpm install`)
- [ ] Environment variables set (`.env` file)
- [ ] No port conflicts (3000, 4001)
- [ ] Sufficient disk space for logs
- [ ] Network connectivity for external checks

---

## 📱 **MANUAL TESTING GUIDE**

### **After Automated Tests Pass**
1. **Open Admin Dashboard**: `http://localhost:3000/admin`
2. **Login** dengan credentials admin
3. **Navigate** ke "System & Monitoring"

### **Test Real-time Monitor**
- [ ] Metrics update setiap 5 detik
- [ ] Health checks menampilkan status
- [ ] Auto-refresh toggle berfungsi
- [ ] Manual refresh button bekerja
- [ ] Responsive di mobile

### **Test Alert Dashboard**
- [ ] Alert list menampilkan data
- [ ] Filter berfungsi (all/critical/unresolved)
- [ ] Alert resolution bekerja
- [ ] Metrics cards update
- [ ] Analytics tabs accessible

### **Test Advanced Monitoring**
- [ ] Tab switching (Real-time/Alerts) bekerja
- [ ] Combined interface responsive
- [ ] Data konsisten antar tabs
- [ ] Controls berfungsi semua

---

## 🚀 **PRODUCTION DEPLOYMENT CHECKLIST**

### **Before Production**
- [ ] All automated tests pass (≥ 80%)
- [ ] Manual testing completed
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Environment variables configured
- [ ] Notification channels tested
- [ ] Backup procedures verified
- [ ] Documentation updated

### **Production Setup**
```bash
# 1. Setup monitoring on production server
./scripts/setup-monitoring.sh

# 2. Configure environment variables
cp .env.example .env.production
# Edit .env.production with production values

# 3. Start monitoring service
pm2 start ecosystem.monitoring.config.js

# 4. Verify monitoring is working
curl https://your-domain.com/api/admin/monitoring?type=overview
```

---

## 📊 **TEST REPORTS & LOGS**

### **Generated Reports**
- `logs/monitoring/test-report.json` - Detailed test results
- `logs/monitoring/test-summary.txt` - Summary report
- `logs/monitoring/monitoring.log` - Runtime monitoring logs
- `logs/monitoring/service.log` - Service output logs

### **Report Structure**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalTests": 12,
    "passedTests": 11,
    "failedTests": 1,
    "successRate": 91.7
  },
  "results": [
    {
      "testName": "File Structure",
      "passed": true,
      "message": "All files exist",
      "timestamp": "2024-01-15T10:30:01.000Z"
    }
  ]
}
```

---

## 🎯 **NEXT STEPS AFTER TESTING**

### **If All Tests Pass** ✅
1. **Deploy to staging** environment
2. **Configure production monitoring**
3. **Setup notification channels**
4. **Train admin users**
5. **Monitor system performance**
6. **Schedule regular health checks**

### **If Tests Fail** ❌
1. **Review failed test details** in logs
2. **Fix identified issues**
3. **Re-run specific tests**
4. **Repeat until success rate ≥ 80%**
5. **Document any known issues**

---

## 🎉 **KESIMPULAN**

**Sistem testing monitoring HafiPortrait telah LENGKAP dengan:**

✅ **3 Script Testing** - Automated, Interactive, Individual
✅ **12 Test Categories** - Infrastructure, API, Components, Performance
✅ **Comprehensive Coverage** - File structure sampai integration
✅ **Detailed Reporting** - JSON reports dan summary
✅ **Troubleshooting Guide** - Solutions untuk common issues
✅ **Production Readiness** - Checklist untuk deployment

**Jalankan test dengan:**
```bash
./scripts/start-monitoring-test.sh
```

**Sistem monitoring HafiPortrait siap untuk production deployment!** 🚀