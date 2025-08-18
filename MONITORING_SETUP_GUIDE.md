# 📊 Monitoring & Alerting Setup Guide - HafiPortrait

**Panduan Lengkap Implementasi Monitoring dan Alerting System**

---

## 🎯 **OVERVIEW**

Sistem monitoring HafiPortrait terdiri dari:
- **Health Monitoring**: Pemantauan kesehatan sistem real-time
- **Alert Management**: Sistem notifikasi otomatis
- **Performance Tracking**: Monitoring performa aplikasi
- **CI/CD Integration**: Integrasi dengan pipeline deployment

---

## 🚀 **QUICK START**

### **1. Setup Environment Variables**
```bash
# Monitoring Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-socket-domain.com

# Alert Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
NOTIFICATION_EMAIL=admin@your-domain.com

# Optional: WhatsApp Integration
WHATSAPP_API_URL=https://your-whatsapp-api.com
WHATSAPP_PHONE_NUMBER=+1234567890

# Logging Level
LOG_LEVEL=info
```

### **2. Start Monitoring System**
```bash
# Make script executable
chmod +x scripts/start-monitoring.sh

# Start monitoring
./scripts/start-monitoring.sh start

# Check status
./scripts/start-monitoring.sh status
```

### **3. Access Monitoring Dashboard**
- Buka admin panel: `https://your-domain.com/admin`
- Navigate ke tab "Monitoring"
- Dashboard akan menampilkan real-time health status

---

## 📋 **KOMPONEN SISTEM**

### **1. Enhanced Health Monitor**
**File**: `scripts/enhanced-health-monitor.js`

**Fitur**:
- ✅ Real-time health checking
- ✅ Multi-service monitoring (API, Database, Storage, WebSocket)
- ✅ System resource monitoring
- ✅ Automatic alerting
- ✅ Performance metrics

**Usage**:
```bash
# Start monitoring daemon
node scripts/enhanced-health-monitor.js start

# Run single health check
node scripts/enhanced-health-monitor.js check

# Get current status
node scripts/enhanced-health-monitor.js status
```

### **2. Alert Manager**
**File**: `scripts/alert-manager.js`

**Fitur**:
- ✅ Multi-channel notifications (Slack, Discord, Email, WhatsApp)
- ✅ Alert cooldown management
- ✅ Priority-based alerting
- ✅ Alert history tracking

**Usage**:
```bash
# Send test alert
node scripts/alert-manager.js send "test" "Test alert message" "info"

# View alert history
node scripts/alert-manager.js history 20

# Get alert statistics
node scripts/alert-manager.js stats
```

### **3. Monitoring Dashboard**
**File**: `src/components/admin/monitoring-dashboard.tsx`

**Fitur**:
- ✅ Real-time system status
- ✅ Service health overview
- ✅ System resource usage
- ✅ Alert history
- ✅ Auto-refresh capability

### **4. CI/CD Integration**
**File**: `scripts/ci-monitoring-integration.js`

**Fitur**:
- ✅ Post-deployment health verification
- ✅ Smoke testing
- ✅ Deployment notifications
- ✅ Rollback triggers

---

## ⚙️ **KONFIGURASI DETAIL**

### **Health Check Endpoints**
```javascript
// Endpoint yang dimonitor
const endpoints = {
  api: '/api/health',              // Core API health
  database: '/api/test/db',        // Database connectivity
  storage: '/api/admin/storage/status', // Storage health
  monitoring: '/api/monitoring/health'   // Enhanced monitoring
};
```

### **Alert Thresholds**
```javascript
const thresholds = {
  responseTime: 3000,    // 3 detik
  errorRate: 0.1,        // 10%
  diskUsage: 85,         // 85%
  memoryUsage: 90,       // 90%
  cpuUsage: 80          // 80%
};
```

### **Alert Levels**
- **INFO**: Informational messages
- **WARNING**: Non-critical issues
- **ERROR**: Service degradation
- **CRITICAL**: System failure

---

## 🔔 **SETUP NOTIFIKASI**

### **1. Slack Integration**
```bash
# 1. Create Slack App di https://api.slack.com/apps
# 2. Enable Incoming Webhooks
# 3. Create webhook untuk channel #alerts
# 4. Set environment variable
export SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
```

### **2. Discord Integration**
```bash
# 1. Buat Discord webhook di server settings
# 2. Copy webhook URL
# 3. Set environment variable
export DISCORD_WEBHOOK="https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
```

### **3. Email Integration**
```bash
# Setup email notifications (implementasi custom)
export NOTIFICATION_EMAIL="admin@your-domain.com"
export SMTP_HOST="smtp.your-provider.com"
export SMTP_PORT="587"
export SMTP_USER="your-smtp-user"
export SMTP_PASS="your-smtp-password"
```

---

## 🚀 **CI/CD INTEGRATION**

### **1. GitHub Actions**
Tambahkan ke `.github/workflows/ci-cd.yml`:

```yaml
- name: Post-Deployment Monitoring
  run: |
    node scripts/ci-monitoring-integration.js
  env:
    NEXT_PUBLIC_APP_URL: ${{ secrets.PRODUCTION_URL }}
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
```

### **2. Bitbucket Pipelines**
Tambahkan ke `bitbucket-pipelines.yml`:

```yaml
- step:
    name: Post-Deployment Health Check
    script:
      - node scripts/ci-monitoring-integration.js
```

### **3. GitLab CI**
Tambahkan ke `.gitlab-ci.yml`:

```yaml
monitoring:
  stage: verify
  script:
    - node scripts/ci-monitoring-integration.js
  only:
    - main
    - staging
```

---

## 📊 **MONITORING DASHBOARD**

### **Akses Dashboard**
1. Login ke admin panel: `/admin/login`
2. Navigate ke tab "Monitoring"
3. Dashboard menampilkan:
   - System status overview
   - Service health checks
   - System resource usage
   - Recent alerts
   - Performance metrics

### **Dashboard Features**
- **Auto-refresh**: Update otomatis setiap 30 detik
- **Real-time status**: Status kesehatan sistem real-time
- **Historical data**: Riwayat performa dan alerts
- **Interactive charts**: Grafik performa interaktif

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Health Check Gagal**
```bash
# Check service status
./scripts/start-monitoring.sh status

# View logs
./scripts/start-monitoring.sh logs health-monitor

# Restart monitoring
./scripts/start-monitoring.sh restart
```

#### **2. Alerts Tidak Terkirim**
```bash
# Test alert system
node scripts/alert-manager.js send "test" "Test message" "info"

# Check alert configuration
node scripts/alert-manager.js stats

# Verify webhook URLs
curl -X POST $SLACK_WEBHOOK -d '{"text":"Test message"}'
```

#### **3. Dashboard Tidak Load**
```bash
# Check API endpoint
curl https://your-domain.com/api/monitoring/health

# Check browser console untuk errors
# Verify authentication dan permissions
```

### **Log Locations**
```bash
logs/
├── health-monitor.log      # Health monitoring logs
├── alerts.log             # Alert system logs
├── system-monitor.log      # System resource logs
└── errors.log             # Error logs
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **1. Monitoring Overhead**
- Health checks: ~50ms per check
- Alert processing: ~100ms per alert
- Dashboard updates: ~200ms per refresh

### **2. Resource Usage**
- Memory: ~50MB untuk monitoring daemon
- CPU: <1% average usage
- Network: ~1KB per health check

### **3. Scaling Considerations**
- Increase check intervals untuk high-traffic
- Use external monitoring service untuk enterprise
- Implement metric aggregation untuk historical data

---

## 🛡️ **SECURITY CONSIDERATIONS**

### **1. Webhook Security**
- Gunakan HTTPS untuk semua webhooks
- Rotate webhook URLs secara berkala
- Implement webhook signature verification

### **2. Monitoring Data**
- Jangan log sensitive information
- Encrypt monitoring data at rest
- Implement access controls untuk dashboard

### **3. Alert Content**
- Sanitize alert messages
- Avoid exposing internal system details
- Use generic error messages untuk public alerts

---

## 📋 **MAINTENANCE CHECKLIST**

### **Daily**
- [ ] Check monitoring dashboard
- [ ] Review alert history
- [ ] Verify all services healthy

### **Weekly**
- [ ] Review monitoring logs
- [ ] Check alert statistics
- [ ] Update monitoring thresholds if needed

### **Monthly**
- [ ] Rotate webhook URLs
- [ ] Clean up old logs
- [ ] Review monitoring performance
- [ ] Update monitoring documentation

---

## 🎯 **BEST PRACTICES**

### **1. Alert Management**
- Set appropriate cooldown periods
- Use different alert levels correctly
- Group related alerts
- Implement escalation procedures

### **2. Health Checks**
- Keep checks lightweight
- Set realistic thresholds
- Monitor critical paths only
- Implement graceful degradation

### **3. Dashboard Usage**
- Use auto-refresh wisely
- Focus on actionable metrics
- Implement role-based access
- Keep dashboard responsive

---

## 🚀 **NEXT STEPS**

1. **Setup Basic Monitoring**: Ikuti Quick Start guide
2. **Configure Alerts**: Setup Slack/Discord notifications
3. **Integrate CI/CD**: Tambahkan monitoring ke pipeline
4. **Customize Dashboard**: Sesuaikan dashboard dengan kebutuhan
5. **Monitor & Optimize**: Review dan optimize monitoring setup

---

**🎉 Sistem monitoring HafiPortrait siap digunakan untuk production deployment!**