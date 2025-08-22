# 🐳 Docker Multi-Environment Setup

## 🎯 **Solusi untuk Problem "pnpm build"**

Dengan Docker multi-stage, Anda **TIDAK PERLU** `pnpm build` manual lagi!

### ❌ **Sebelum (Manual):**
```bash
# Setiap perubahan kode:
pnpm build  # ⏰ Tunggu 2-3 menit
pnpm start  # Baru bisa test
```

### ✅ **Sekarang (Docker):**
```bash
# Development: Hot reload otomatis
pnpm run docker:dev

# Production: Auto build di container
pnpm run docker:prod
```

## 🚀 **Quick Start**

### **Development Mode (Hot Reload)**
```bash
# Start development dengan hot reload
pnpm run docker:dev

# Access:
# 📱 Website: http://147.251.255.227:4000
# 🔌 Socket.IO: http://147.251.255.227:4001
```

### **Production Mode (Auto Build)**
```bash
# Start production (auto build inside container)
pnpm run docker:prod

# Access:
# 🌐 Website: http://147.251.255.227:3000
# 📡 Socket.IO: http://147.251.255.227:3001
```

### **Both Environments**
```bash
# Run development + production simultaneously
pnpm run docker:both

# Development: port 4000/4001
# Production: port 3000/3001
```

## 🎮 **Available Commands**

### **Basic Operations**
```bash
pnpm run docker:dev      # Start development
pnpm run docker:prod     # Start production  
pnpm run docker:both     # Start both
pnpm run docker:stop     # Stop all containers
pnpm run docker:status   # Show status
```

### **Management**
```bash
pnpm run docker:logs     # Show logs
pnpm run docker:build    # Rebuild images
pnpm run docker:clean    # Clean up everything
```

### **Direct Script**
```bash
./scripts/docker-manager.sh dev     # Same as pnpm run docker:dev
./scripts/docker-manager.sh prod    # Same as pnpm run docker:prod
./scripts/docker-manager.sh both    # Same as pnpm run docker:both
```

## 🏗️ **Architecture**

### **Multi-Stage Dockerfile**
```
┌─────────────────┐
│   Development   │ ← Hot reload, no build needed
│   Port 4000/4001│
└─────────────────┘

┌─────────────────┐
│     Builder     │ ← Auto build inside container
│   (Build Stage) │
└─────────────────┘

┌─────────────────┐
│   Production    │ ← Optimized, ready to serve
│   Port 3000/3001│
└─────────────────┘
```

### **Environment Isolation**
```
Development Container:
├── Hot reload ✅
├── Dev dependencies ✅  
├── Source code mounted ✅
└── No build required ✅

Production Container:
├── Optimized build ✅
├── Prod dependencies only ✅
├── Security hardened ✅
└── Auto build on start ✅
```

## 🛡️ **Benefits**

### **1. No Manual Build**
- ❌ **Before**: `pnpm build` setiap perubahan
- ✅ **Now**: Auto build di container

### **2. Environment Isolation**
- 🔒 **Development**: Isolated di container
- 🔒 **Production**: Isolated di container  
- 🔒 **No conflicts**: Bisa jalan bersamaan

### **3. Consistent Environment**
- 📦 **Same Node version** di semua environment
- 📦 **Same dependencies** guaranteed
- 📦 **Same configuration** across team

### **4. Easy Deployment**
- 🚀 **Development**: Instant hot reload
- 🚀 **Production**: Ready-to-deploy container
- 🚀 **Staging**: Same container, different config

## 🔄 **Workflow Examples**

### **Daily Development**
```bash
# Morning: Start development
pnpm run docker:dev

# Code changes → Auto reload ✅
# No build needed ✅
# Test immediately ✅

# Evening: Stop
pnpm run docker:stop
```

### **Production Testing**
```bash
# Test production build
pnpm run docker:prod

# Container builds automatically ✅
# Test production performance ✅
# No manual build steps ✅
```

### **Client Demo**
```bash
# Show both environments
pnpm run docker:both

# Development: Latest features (port 4000)
# Production: Stable version (port 3000)
```

## 📊 **Port Mapping**

| Environment | Next.js | Socket.IO | Status |
|-------------|---------|-----------|---------|
| Development | 4000 | 4001 | Hot reload |
| Production | 3000 | 3001 | Auto build |
| Host System | - | - | Unchanged |

## 🚨 **Important Notes**

1. **Host system unchanged** - Original setup tetap bisa dipakai
2. **No port conflicts** - Docker menggunakan port berbeda
3. **Volume mounting** - Development code changes langsung sync
4. **Auto restart** - Container restart otomatis jika crash

## 🎯 **Migration Path**

### **Current Workflow**
```bash
pnpm dev          # Development
pnpm build        # Manual build
pnpm start        # Production
```

### **New Docker Workflow**  
```bash
pnpm run docker:dev   # Development (hot reload)
pnpm run docker:prod  # Production (auto build)
```

**Both workflows bisa dipakai bersamaan!** 🚀

## 🔧 **Troubleshooting**

### **Container not starting?**
```bash
pnpm run docker:logs    # Check logs
pnpm run docker:status  # Check status
```

### **Port already in use?**
```bash
pnpm run docker:stop   # Stop all containers
pnpm run docker:clean  # Clean everything
```

### **Need fresh build?**
```bash
pnpm run docker:build  # Rebuild images
```

**Sekarang development jadi lebih smooth tanpa manual build!** 🎉