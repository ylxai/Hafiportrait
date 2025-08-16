# 🎯 DSLR SYSTEM PRODUCTION CHECKLIST

## ✅ Pre-Event Setup (5 minutes)
- [ ] Connect DSLR camera to computer
- [ ] Verify camera folder: C:/DCIM/100NIKON (or auto-detect)
- [ ] Create event: `node dslr-hybrid-cli.js quick "Wedding Name" 2025-01-15`
- [ ] Test storage: `node storage-optimization-cli.js test`
- [ ] Start system: `./start-system.sh`

## 📸 During Event
- [ ] Monitor uploads in real-time
- [ ] Switch albums as needed: `node dslr-hybrid-cli.js update <event-id> album "Tamu"`
- [ ] Check storage status: `./check-storage.sh`

## 🔧 System Status
- Storage: 2.1TB+ total capacity (Cloudflare R2 + Google Drive + Local)
- Auto-upload: Real-time with watermark
- Backup: Local + cloud redundancy
- Notifications: Real-time push notifications

## 🚀 Quick Commands
```bash
# Event management
cd DSLR-System/Core
node dslr-hybrid-cli.js list
node dslr-hybrid-cli.js current
node dslr-hybrid-cli.js status

# Storage management  
cd ../Storage
node storage-optimization-cli.js status
node storage-optimization-cli.js test

# System testing
cd ../Testing
node test-cloudflare-r2-connection.js
```

## 📊 Performance Metrics
- Upload speed: 2-3 seconds per photo
- Storage efficiency: 60-80% compression
- Reliability: 99%+ uptime
- Capacity: 300-500 photos per event
