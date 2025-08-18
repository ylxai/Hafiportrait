# 🎯 HafiPortrait Production Monitoring System

**Status**: ✅ PRODUCTION READY  
**Version**: 1.0.0  
**Last Updated**: January 17, 2025

## 📋 Overview

Sistem monitoring production otomatis untuk HafiPortrait Photography yang memantau:
- ✅ **Production API Health** - Status endpoint dan database
- ✅ **Real-time Performance** - Photo sync dan WebSocket monitoring  
- ✅ **Backup System** - Google Drive backup operations
- ✅ **Centralized Dashboard** - Unified monitoring interface

---

## 🚀 Quick Start

### 1. Setup Monitoring System
```bash
# Make setup script executable
chmod +x scripts/setup-monitoring.sh

# Run automated setup
./scripts/setup-monitoring.sh
```

### 2. Start Monitoring
```bash
# Option 1: Direct start
./start-monitoring.sh

# Option 2: Using master script
node scripts/start-production-monitoring.js start

# Option 3: Using PM2
pm2 start ecosystem.monitoring.config.js
```

### 3. Check Status
```bash
# Quick status check
./check-monitoring.sh

# Detailed dashboard report
node scripts/monitoring-dashboard.js report
```

---

## 📊 Monitoring Components

### 🔧 **Production Monitor** (`production-monitoring.js`)
**Purpose**: Core API health and database monitoring

**Metrics Tracked**:
- API response times (target: <5s)
- Error rates (target: <5%)
- Database connectivity
- Event API functionality
- Backup system status

**Alerts**:
- High error rate (>5%)
- Slow response times (>5s)
- Database connection failures

### ⚡ **Real-time Performance Monitor** (`realtime-performance-monitor.js`)
**Purpose**: Photo sync and WebSocket performance

**Metrics Tracked**:
- Photo sync times (target: 1-2s)
- WebSocket connection stability
- Real-time update performance
- Backup operation timing

**Alerts**:
- Slow photo sync (>5s)
- WebSocket disconnections
- Backup timeouts (>5min)

### 💾 **Backup System Monitor** (`backup-system-monitor.js`)
**Purpose**: Google Drive backup operations

**Metrics Tracked**:
- Backup success rates (target: >95%)
- Storage usage monitoring
- Active backup operations
- Backup completion times

**Alerts**:
- Backup failures
- Storage quota warnings
- Long-running backups

### 📈 **Monitoring Dashboard** (`monitoring-dashboard.js`)
**Purpose**: Centralized monitoring interface

**Features**:
- Overall system health scoring
- Aggregated alerts from all systems
- Performance trend analysis
- Automated report generation

---

## 🎛️ Management Commands

### Start/Stop Operations
```bash
# Start all monitoring
node scripts/start-production-monitoring.js start

# Check current status
node scripts/start-production-monitoring.js status

# Stop all monitoring
node scripts/start-production-monitoring.js stop

# Restart all monitoring
node scripts/start-production-monitoring.js restart

# View recent logs
node scripts/start-production-monitoring.js logs
```

### Individual Component Testing
```bash
# Test production API monitoring
node scripts/production-monitoring.js test

# Test real-time performance
node scripts/realtime-performance-monitor.js test

# Test backup system
node scripts/backup-system-monitor.js check

# Generate dashboard report
node scripts/monitoring-dashboard.js report
```

---

## 📁 File Structure

```
scripts/
├── production-monitoring.js          # Core API health monitoring
├── realtime-performance-monitor.js   # Real-time performance tracking
├── backup-system-monitor.js          # Backup system monitoring
├── monitoring-dashboard.js           # Centralized dashboard
├── start-production-monitoring.js    # Master control script
└── setup-monitoring.sh              # Automated setup script

logs/
├── production-monitor.log            # Production API logs
├── realtime-performance.log          # Performance monitoring logs
├── backup-system.log                 # Backup operation logs
├── monitoring-dashboard.log          # Dashboard logs
└── dashboard-report.json            # Latest dashboard report

Helper Scripts:
├── start-monitoring.sh               # Quick start script
├── check-monitoring.sh              # Status check script
└── stop-monitoring.sh               # Quick stop script
```

---

## ⚙️ Configuration

### Environment Variables

**Required**:
```bash
NEXT_PUBLIC_APP_URL=https://your-app.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**Optional**:
```bash
NEXT_PUBLIC_WS_URL=wss://your-websocket.com
TEST_EVENT_ID=event-id-for-testing
MONITORING_PORT=3002
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

### Monitoring Intervals
- **Production Health**: 30 seconds
- **Real-time Performance**: Continuous WebSocket + 2min API tests
- **Backup System**: 1 minute
- **Dashboard Updates**: 30 seconds
- **Report Generation**: 5 minutes

### Alert Thresholds
```javascript
{
  responseTime: 5000,        // 5 seconds
  errorRate: 0.05,          // 5%
  photoSyncTime: 5000,      // 5 seconds
  backupTimeout: 300000,    // 5 minutes
  backupSuccessRate: 0.95   // 95%
}
```

---

## 📊 Dashboard Reports

### Health Status Levels
- 🟢 **Excellent** (90-100%): All systems optimal
- 🟡 **Good** (80-89%): Minor issues, system stable
- 🟠 **Fair** (70-79%): Some performance degradation
- 🔴 **Poor** (50-69%): Significant issues detected
- 💀 **Critical** (<50%): System requires immediate attention

### Sample Dashboard Output
```
🎯 HAFIPORTRAIT PRODUCTION MONITORING DASHBOARD
============================================================
📊 Overall Health: 🟢 EXCELLENT
⏱️  System Uptime: 24.5 hours
🚨 Total Alerts: 0 (0 critical/high)
🕐 Last Update: 2025-01-17T10:30:00.000Z

📈 QUICK METRICS:
   Production API: ✅ Error Rate: 0.0%, Avg Response: 1250ms
   Real-time Sync: ✅ Photo Sync: EXCELLENT, WebSocket: connected
   Backup System:  ✅ Success Rate: 100.0%, Active: 0
```

---

## 🚨 Alert Management

### Alert Types and Responses

**🔴 Critical Alerts**:
- Database connection failure → Check Supabase status
- WebSocket completely down → Restart WebSocket server
- Backup system failure → Check Google Drive API

**🟡 Medium Alerts**:
- High response times → Check server resources
- Backup taking too long → Monitor Google Drive quota
- WebSocket reconnections → Check network stability

**🟢 Low Alerts**:
- Minor performance degradation → Monitor trends
- Storage usage warnings → Plan cleanup

### Automated Responses
- **Auto-restart** failed monitoring processes
- **Log rotation** to prevent disk space issues
- **Graceful shutdown** on system signals
- **PID file management** for process tracking

---

## 🔧 Troubleshooting

### Common Issues

**1. Monitoring Won't Start**
```bash
# Check Node.js version (requires 16+)
node --version

# Check dependencies
npm install

# Check environment variables
node scripts/start-production-monitoring.js status
```

**2. High Error Rates**
```bash
# Check application logs
tail -f logs/production-monitor.log

# Test API endpoints manually
curl $NEXT_PUBLIC_APP_URL/api/health
```

**3. WebSocket Issues**
```bash
# Check WebSocket URL
echo $NEXT_PUBLIC_WS_URL

# Test WebSocket connection
node scripts/realtime-performance-monitor.js test
```

**4. Backup Monitoring Fails**
```bash
# Test Google Drive connection
node scripts/backup-system-monitor.js check

# Check Google Drive API credentials
```

### Log Analysis
```bash
# View all recent logs
node scripts/start-production-monitoring.js logs

# Monitor specific component
tail -f logs/realtime-performance.log

# Search for errors
grep -i error logs/*.log
```

---

## 🔄 Deployment Options

### 1. Manual Process Management
```bash
# Start monitoring
./start-monitoring.sh

# Run in background
nohup ./start-monitoring.sh > monitoring.out 2>&1 &
```

### 2. PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ecosystem.monitoring.config.js

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

### 3. Systemd Service (Linux)
```bash
# Setup requires root access
sudo ./scripts/setup-monitoring.sh

# Enable auto-start
sudo systemctl enable hafiportrait-monitoring

# Start service
sudo systemctl start hafiportrait-monitoring

# Check status
sudo systemctl status hafiportrait-monitoring
```

---

## 📈 Performance Targets

### Production Metrics
- ✅ **API Response Time**: <2s average, <5s maximum
- ✅ **Error Rate**: <1% normal, <5% acceptable
- ✅ **Uptime**: >99.5%
- ✅ **Photo Sync**: 1-2s real-time updates

### Backup Metrics
- ✅ **Success Rate**: >95%
- ✅ **Completion Time**: <5 minutes for normal events
- ✅ **Storage Efficiency**: Optimized folder structure
- ✅ **Recovery Time**: <1 hour for full restore

### Real-time Metrics
- ✅ **WebSocket Uptime**: >99%
- ✅ **Photo Sync Latency**: <2s
- ✅ **Cross-tab Sync**: Instant via broadcast
- ✅ **Mobile Performance**: Optimized for all devices

---

## 🛡️ Security Considerations

### Access Control
- Monitoring logs contain no sensitive data
- API keys stored in environment variables only
- Process isolation for each monitoring component
- Secure log file permissions

### Data Privacy
- No photo content logged, only metadata
- User data anonymized in logs
- Backup URLs logged but not content
- GDPR compliant logging practices

---

## 📞 Support & Maintenance

### Regular Maintenance
- **Daily**: Check dashboard health status
- **Weekly**: Review alert trends and performance
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize monitoring thresholds

### Emergency Procedures
1. **System Down**: Check master process and restart if needed
2. **High Alerts**: Investigate root cause using detailed logs
3. **Performance Issues**: Scale monitoring intervals if needed
4. **Storage Issues**: Implement log cleanup procedures

### Contact Information
- **System Admin**: Check logs and restart services
- **Developer Support**: Review code and update thresholds
- **Infrastructure**: Monitor server resources and scaling

---

**🎉 Production Monitoring System Ready!**

The HafiPortrait monitoring system provides comprehensive coverage of all critical components with automated alerting and detailed reporting. The system is designed for 24/7 operation with minimal maintenance requirements.

For questions or issues, check the troubleshooting section or review the detailed logs in the `logs/` directory.