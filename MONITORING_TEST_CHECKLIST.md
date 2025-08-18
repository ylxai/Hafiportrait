# 🧪 Monitoring System Test Checklist

**Panduan lengkap untuk testing sistem monitoring HafiPortrait**

---

## 🚀 **QUICK START TESTING**

### **1. Automated Testing**
```bash
# Jalankan test otomatis lengkap
chmod +x scripts/start-monitoring-test.sh
./scripts/start-monitoring-test.sh

# Atau test individual
chmod +x scripts/test-monitoring-system.js
node scripts/test-monitoring-system.js
```

### **2. Manual Testing**
```bash
# Start development server
pnpm dev

# Start monitoring (di terminal terpisah)
node scripts/automated-monitoring.js

# Akses admin dashboard
http://localhost:3000/admin
```

---

## ✅ **TEST CHECKLIST**

### **📁 1. File Structure Test**
- [ ] `src/lib/alert-manager.ts` exists
- [ ] `src/lib/health-monitor.ts` exists  
- [ ] `src/components/admin/alert-dashboard.tsx` exists
- [ ] `src/components/admin/real-time-monitor.tsx` exists
- [ ] `src/app/api/admin/monitoring/route.ts` exists
- [ ] `scripts/automated-monitoring.js` exists
- [ ] `scripts/setup-monitoring.sh` exists

### **🔧 2. Dependencies Test**
- [ ] Node.js version 18+ installed
- [ ] `@tanstack/react-query` installed
- [ ] `lucide-react` installed
- [ ] `next` installed
- [ ] All TypeScript types resolved

### **⚙️ 3. Configuration Test**
- [ ] `.env` file configured
- [ ] `DATABASE_URL` set
- [ ] `JWT_SECRET` set
- [ ] `SESSION_SECRET` set
- [ ] `monitoring/config/monitoring.json` exists (after setup)

### **🌐 4. API Endpoints Test**
- [ ] `GET /api/health` returns 200
- [ ] `GET /api/admin/monitoring?type=overview` returns data
- [ ] `GET /api/admin/monitoring?type=metrics` returns metrics
- [ ] `GET /api/admin/monitoring?type=health` returns health status
- [ ] `GET /api/admin/monitoring?type=alerts` returns alerts
- [ ] `POST /api/admin/monitoring` (test-alert) works
- [ ] `POST /api/admin/monitoring` (health-check) works

### **🚨 5. Alert Manager Test**
- [ ] Alert creation works
- [ ] Alert retrieval works
- [ ] Alert resolution works
- [ ] Alert metrics calculation works
- [ ] Multiple severity levels work
- [ ] Cooldown mechanism works

### **🏥 6. Health Monitor Test**
- [ ] System metrics collection works
- [ ] Health checks execute
- [ ] Database check works
- [ ] Storage check works
- [ ] API endpoints check works
- [ ] External services check works
- [ ] Overall status calculation works

### **📊 7. Real-time Monitor Component**
- [ ] Component renders without errors
- [ ] Live metrics display updates
- [ ] Health checks status shows
- [ ] Performance graphs work
- [ ] Auto-refresh toggle works
- [ ] Manual refresh works
- [ ] Responsive design works

### **🎛️ 8. Alert Dashboard Component**
- [ ] Component renders without errors
- [ ] Alert list displays
- [ ] Alert filtering works (all/critical/unresolved)
- [ ] Alert resolution interface works
- [ ] Metrics overview cards show
- [ ] Analytics tabs work
- [ ] Auto-refresh works

### **📈 9. Advanced Monitoring Component**
- [ ] Component renders without errors
- [ ] Tab switching works (Real-time/Alerts)
- [ ] Real-time tab shows monitoring
- [ ] Alerts tab shows alert dashboard
- [ ] Card layout responsive
- [ ] Controls work properly

### **🎯 10. Admin Dashboard Integration**
- [ ] Admin dashboard accessible at `/admin`
- [ ] System & Monitoring menu visible
- [ ] Real-time Monitor menu item works
- [ ] Alert Dashboard menu item works
- [ ] Advanced Monitoring menu item works
- [ ] Navigation between sections works
- [ ] Mobile responsive design works

### **⚡ 11. Performance Test**
- [ ] API response time < 1000ms (excellent)
- [ ] API response time < 3000ms (acceptable)
- [ ] Memory usage reasonable
- [ ] No memory leaks detected
- [ ] Component rendering fast
- [ ] Auto-refresh doesn't cause lag

### **🔗 12. Integration Test**
- [ ] Admin dashboard loads
- [ ] Monitoring API integration works
- [ ] Real-time updates work
- [ ] Alert notifications work
- [ ] Health checks trigger properly
- [ ] Data persistence works

---

## 🧪 **MANUAL TESTING STEPS**

### **Step 1: Setup & Start**
```bash
# 1. Run setup
./scripts/setup-monitoring.sh

# 2. Start development server
pnpm dev

# 3. Start monitoring (new terminal)
node scripts/automated-monitoring.js
```

### **Step 2: Test API Endpoints**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test monitoring overview
curl http://localhost:3000/api/admin/monitoring?type=overview

# Test alert creation
curl -X POST http://localhost:3000/api/admin/monitoring \
  -H "Content-Type: application/json" \
  -d '{"action":"test-alert"}'

# Test health check trigger
curl -X POST http://localhost:3000/api/admin/monitoring \
  -H "Content-Type: application/json" \
  -d '{"action":"health-check"}'
```

### **Step 3: Test Admin Dashboard**
1. **Buka browser**: `http://localhost:3000/admin`
2. **Login** dengan credentials admin
3. **Navigate** ke "System & Monitoring"
4. **Test setiap menu**:
   - Real-time Monitor
   - Alert Dashboard
   - Advanced Monitoring

### **Step 4: Test Real-time Monitor**
1. **Buka**: Real-time Monitor
2. **Verify**: Live metrics update
3. **Test**: Auto-refresh toggle
4. **Test**: Manual refresh button
5. **Check**: Health checks status
6. **Verify**: Responsive design

### **Step 5: Test Alert Dashboard**
1. **Buka**: Alert Dashboard
2. **Create**: Test alert via API
3. **Verify**: Alert appears in dashboard
4. **Test**: Alert filtering
5. **Test**: Alert resolution
6. **Check**: Metrics cards

### **Step 6: Test Advanced Monitoring**
1. **Buka**: Advanced Monitoring
2. **Test**: Tab switching
3. **Verify**: Real-time tab works
4. **Verify**: Alerts tab works
5. **Check**: Combined interface

---

## 🔍 **DEBUGGING GUIDE**

### **Common Issues & Solutions**

#### **🚫 API Endpoints Not Working**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check logs
tail -f logs/monitoring/monitoring.log

# Restart server
pnpm dev
```

#### **🚫 Components Not Rendering**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check build
pnpm build

# Check browser console for errors
```

#### **🚫 Monitoring Not Starting**
```bash
# Check Node.js version
node --version  # Should be 18+

# Check script permissions
chmod +x scripts/automated-monitoring.js

# Check logs
cat logs/monitoring/service-error.log
```

#### **🚫 Admin Dashboard Not Accessible**
```bash
# Check if authenticated
# Clear browser cache
# Check network tab in browser dev tools
```

### **Log Files to Check**
- `logs/monitoring/monitoring.log` - Main monitoring log
- `logs/monitoring/service.log` - Service output
- `logs/monitoring/service-error.log` - Service errors
- `logs/monitoring/test-report.json` - Test results

---

## 📊 **EXPECTED TEST RESULTS**

### **✅ Success Criteria**
- **File Structure**: All files exist
- **Dependencies**: All installed and compatible
- **API Endpoints**: All return 200 status
- **Components**: Render without errors
- **Integration**: Admin dashboard accessible
- **Performance**: Response time < 3000ms
- **Overall Success Rate**: ≥ 80%

### **📈 Performance Benchmarks**
- **API Response Time**: < 1000ms (excellent), < 3000ms (acceptable)
- **Memory Usage**: < 100MB (efficient), < 200MB (acceptable)
- **Component Render**: < 500ms
- **Auto-refresh Impact**: Minimal CPU usage

---

## 🎯 **PRODUCTION READINESS CHECKLIST**

### **Before Production Deployment**
- [ ] All tests pass (≥ 80% success rate)
- [ ] No critical errors in logs
- [ ] Performance benchmarks met
- [ ] Environment variables configured
- [ ] Notification channels tested
- [ ] Backup procedures verified
- [ ] Security scan completed
- [ ] Documentation updated

### **Production Monitoring Setup**
- [ ] Setup script executed on production server
- [ ] PM2 or systemd service configured
- [ ] Log rotation configured
- [ ] Monitoring alerts configured
- [ ] Health checks scheduled
- [ ] Performance monitoring active

---

## 🚀 **NEXT STEPS AFTER TESTING**

### **If All Tests Pass** ✅
1. **Deploy to staging** environment
2. **Configure notification channels** (Slack, Email)
3. **Setup production monitoring**
4. **Train admin users**
5. **Monitor system performance**

### **If Tests Fail** ❌
1. **Review failed test details**
2. **Check error logs**
3. **Fix identified issues**
4. **Re-run tests**
5. **Repeat until all pass**

---

**🎉 Sistem monitoring HafiPortrait siap untuk testing lengkap!**

**Jalankan**: `./scripts/start-monitoring-test.sh` untuk memulai testing otomatis.