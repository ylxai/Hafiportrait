# 📊 Session Monitoring System - Setup Guide

## 🎯 TRIGGER CONTEXT COMMAND:
```bash
"cek dan perbaiki session continuity dan monitoring system"
```

## 🚀 QUICK SETUP STEPS:

### 1. **Database Schema Setup**
```bash
# Execute session monitoring schema
psql -f scripts/create-session-monitoring-tables.sql

# Verify tables created
psql -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'session%';"
```

### 2. **Start Development Server**
```bash
# Start with IP access support
pnpm dev --port 3000 --hostname 0.0.0.0
```

### 3. **Test Session Monitoring**
```bash
# Test session health endpoint
curl -s http://147.251.255.227:3000/api/admin/session/health | jq .

# Test session events endpoint
curl -s http://147.251.255.227:3000/api/admin/session/events | jq .
```

### 4. **Access Monitoring Dashboard**
```bash
# Login to admin dashboard
http://147.251.255.227:3000/admin/login
# Credentials: hafi / Hantu@112233

# Navigate to Sessions tab for monitoring
http://147.251.255.227:3000/admin (Sessions tab)
```

## 📊 MONITORING FEATURES:

### **Real-time Health Status**
- ✅ System health indicator (healthy/warning/critical)
- ✅ Active sessions count
- ✅ Authentication success/failure rates
- ✅ Average session duration

### **Analytics Dashboard**
- ✅ Device type breakdown (Mobile/Desktop/Tablet)
- ✅ Login activity by hour
- ✅ IP address tracking
- ✅ Session events timeline

### **Automated Features**
- ✅ Auto event logging (login/logout/auth_check)
- ✅ Health alerts for critical issues
- ✅ Data cleanup (30+ days retention)
- ✅ Performance metrics tracking

## 🔧 API ENDPOINTS:

```bash
# Session Health Monitoring
GET /api/admin/session/health
Response: {
  "status": "healthy|warning|critical",
  "issues": ["array of issues"],
  "metrics": { ... }
}

# Session Events Logging
GET /api/admin/session/events?limit=50&type=login
POST /api/admin/session/events
Body: {
  "session_id": "string",
  "user_id": number,
  "event_type": "login|logout|auth_check|auth_failure|timeout",
  "metadata": {}
}
```

## 🎯 TROUBLESHOOTING:

### **If monitoring not working:**
1. Check database schema: `\dt session*`
2. Verify API endpoints: `curl /api/admin/session/health`
3. Check browser console for errors
4. Restart development server

### **If no data showing:**
1. Login/logout to generate events
2. Check session_events table: `SELECT * FROM session_events LIMIT 10;`
3. Verify auto-logging in use-auth.ts
4. Check network requests in browser dev tools

## 📋 NEXT DEVELOPMENT PRIORITIES:

1. **Production Deployment** - Deploy monitoring to live environment
2. **Alert System** - Email/SMS alerts for critical issues
3. **Performance Optimization** - Optimize monitoring queries
4. **Security Hardening** - Enhanced security measures
5. **Mobile Optimization** - Mobile-specific monitoring features

---

**📞 SUPPORT:** If monitoring system issues occur, check logs and restart with clean database schema.