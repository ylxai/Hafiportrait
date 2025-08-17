# 🚀 HafiPortrait Port Allocation

## 📊 Production Ports (PM2)
- **4000**: Next.js Web Application (PM2 Production)
- **4001**: Socket.IO Server (PM2 Production)
- **4002**: Next.js Production Manual Test

## 💻 Development Ports (Manual)
- **3000**: Next.js Development (`pnpm dev`)
- **3001**: Socket.IO Development (`pnpm run socketio:dev`)
- **3002**: Next.js Development Manual Test

## 🌐 OpenStack Security Groups
Configure these ports in OpenStack dashboard:

### Inbound Rules Required:
```bash
# Production Ports
Port 4000 - TCP - 0.0.0.0/0 (Next.js Production)
Port 4001 - TCP - 0.0.0.0/0 (Socket.IO Production)
Port 4002 - TCP - 0.0.0.0/0 (Production Test)

# Development Ports  
Port 3000 - TCP - 0.0.0.0/0 (Next.js Development)
Port 3001 - TCP - 0.0.0.0/0 (Socket.IO Development)
Port 3002 - TCP - 0.0.0.0/0 (Development Test)
```

### UFW Commands:
```bash
sudo ufw allow 3000/tcp comment "Next.js Development"
sudo ufw allow 3001/tcp comment "Socket.IO Development"
sudo ufw allow 3002/tcp comment "Development Test"
sudo ufw allow 4000/tcp comment "Next.js Production"
sudo ufw allow 4001/tcp comment "Socket.IO Production"
sudo ufw allow 4002/tcp comment "Production Test"
```

## 🚀 Quick Commands:

### Production (PM2):
```bash
pm2 start ecosystem.config.js --env production
# Access: http://your-ip:4000
```

### Development:
```bash
pnpm dev
# Access: http://localhost:3000
```

### Manual Production Test:
```bash
PORT=3002 NODE_ENV=production pnpm start
# Access: http://localhost:3002
```