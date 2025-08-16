# HafiPortrait Photography - Quick Start Guide

**For New Sessions & Context Reconstruction**

---

## 🚀 SYSTEM OVERVIEW

**HafiPortrait Photography** is a complete event photography management system with:
- Smart multi-tier storage (Cloudflare R2, Google Drive, Local)
- Enhanced admin dashboard with event management
- Mobile-optimized responsive design
- Automated photo backup and archival system
- Real-time event status management

**Current Status:** ✅ Fully functional but needs performance optimization

---

## 🔥 IMMEDIATE PRIORITIES

### 🚨 CRITICAL (Do First)
1. **CPU Usage 100%** - Server performance severely impacted
2. **Build Size 868MB** - Needs immediate code splitting
3. **Dependency Cleanup** - 1.1GB node_modules needs pruning

### ⚡ QUICK WINS (Easy Fixes)
1. Enable production mode: `NODE_ENV=production`
2. Restart services: `pm2 restart all`
3. Dependency audit: `npm audit --fix`
4. Remove unused packages: `npm prune`

---

## 📁 KEY DIRECTORIES

```
src/
├── app/admin/page.tsx          # Enhanced admin dashboard
├── components/admin/           # Admin components (EventList, etc.)
├── lib/
│   ├── smart-storage-manager.js    # Multi-tier storage
│   ├── event-storage-manager.js    # Event backup system
│   ├── database-with-smart-storage.ts # Enhanced DB
│   └── fallback-compression.js     # Image optimization
└── api/                        # All API routes (13 fixed)

scripts/
├── check-server-resources.js   # Resource monitoring
└── optimize-server-performance.js # Performance optimizer
```

---

## 🎯 COMMON SESSION STARTERS

### Performance Optimization
- "Continue server optimization for HafiPortrait"
- "Fix the CPU 100% usage issue"
- "Optimize the 868MB build size"

### Feature Development  
- "Enhance the admin dashboard functionality"
- "Improve the event backup system"
- "Add new storage optimization features"

### Bug Fixes
- "Fix API route issues"
- "Resolve image compression problems"
- "Debug mobile responsiveness"

---

## 🔧 EMERGENCY PROCEDURES

### If System is Down
```bash
# 1. Check resources
node scripts/check-server-resources.js

# 2. Restart services
pm2 restart all

# 3. Check logs
pm2 logs

# 4. Fallback to basic mode
NODE_ENV=production npm start
```

### If Build Fails
```bash
# 1. Clean build
rm -rf .next
npm run build

# 2. Check dependencies
npm audit --fix
npm prune

# 3. Rebuild
npm run build
```

---

## 📊 CURRENT METRICS

```
✅ Working: Smart Storage, Admin Dashboard, Event Management
🔴 Critical: CPU 100%, Build 868MB, Dependencies 1.1GB
🟡 Monitor: Memory 16.66%, Disk 9%
```

---

## 💡 CONTEXT CLUES FOR AI

When starting new sessions, mention:
- **"HafiPortrait Photography system"** - I'll know it's the event photography platform
- **"Continue from server optimization"** - I'll focus on performance issues
- **"Check the system status file"** - I'll read HAFIPORTRAIT_SYSTEM_STATUS.md
- **"Critical CPU and build size issues"** - I'll prioritize these problems

---

**🎯 Remember:** Always check `HAFIPORTRAIT_SYSTEM_STATUS.md` for complete context and current priorities.