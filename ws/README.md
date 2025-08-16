# 🚀 HafiPortrait WebSocket Service

WebSocket service terpisah untuk real-time notifications yang bisa di-deploy dengan Docker di VPS manapun.

## 📋 **Quick Setup**

### **1. Download & Extract**
```bash
# Download folder ws ini ke VPS Anda
# Atau clone repository dan ambil folder ws/
```

### **2. Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Edit sesuai kebutuhan
nano .env
```

### **3. Docker Deployment**
```bash
# Build dan start service
docker-compose up -d

# Check logs
docker-compose logs -f websocket

# Check status
docker-compose ps
```

### **4. Verifikasi**
```bash
# Test WebSocket connection
node test-connection.js

# Check health endpoint
curl http://localhost:3001/health
```

## 🔧 **Port Configuration**

### **Ports yang Digunakan:**
- **3001**: WebSocket server (ws://your-server:3001/ws)
- **3002**: Health check HTTP endpoint (http://your-server:3002/health)

### **Firewall Setup:**
```bash
# Ubuntu/Debian
sudo ufw allow 3001
sudo ufw allow 3002

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --reload
```

## 🌐 **Vercel Integration**

Update environment variables di Vercel Dashboard:
```bash
NEXT_PUBLIC_WS_URL=ws://YOUR_VPS_IP:3001/ws
# atau dengan domain:
NEXT_PUBLIC_WS_URL=ws://ws.hafiportrait.photography:3001/ws
```

## 📊 **Monitoring**

```bash
# View logs
docker-compose logs -f websocket

# Monitor resources
docker stats

# Restart service
docker-compose restart websocket
```

## 🔄 **Updates**

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```