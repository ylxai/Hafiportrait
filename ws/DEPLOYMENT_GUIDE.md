# 🚀 HafiPortrait WebSocket Service - Deployment Guide

## 📋 **Quick Start (Recommended)**

### **1. Download ke VPS**
```bash
# Option 1: Download zip dari GitHub
wget https://github.com/your-repo/archive/main.zip
unzip main.zip
cd your-repo-main/ws

# Option 2: Clone repository
git clone https://github.com/your-repo.git
cd your-repo/ws

# Option 3: Manual copy
# Copy semua file di folder ws/ ke VPS Anda
```

### **2. Auto Deployment**
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

**Script akan otomatis:**
- ✅ Install Docker & Docker Compose
- ✅ Setup firewall (ports 3001, 3002)
- ✅ Build dan start service
- ✅ Test koneksi
- ✅ Show service info

---

## 🔧 **Manual Setup**

### **Prerequisites**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
```

### **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Edit configuration (optional)
nano .env
```

### **Firewall Configuration**
```bash
# Ubuntu/Debian
sudo ufw allow 3001/tcp
sudo ufw allow 3002/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --reload
```

### **Start Service**
```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f websocket
```

### **Test Connection**
```bash
# Test WebSocket
node test-connection.js

# Check health
curl http://localhost:3002/health

# Check stats
curl http://localhost:3002/stats
```

---

## 🌐 **Domain Setup (Optional)**

### **1. DNS Configuration**
```
# Add A record
ws.hafiportrait.photography → YOUR_VPS_IP
```

### **2. Nginx Reverse Proxy**
```bash
# Install Nginx
sudo apt install nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/websocket
sudo ln -s /etc/nginx/sites-available/websocket /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### **3. SSL Certificate**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d ws.hafiportrait.photography

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **Monitoring & Management**

### **Service Management**
```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f websocket

# Restart service
docker-compose restart websocket

# Stop service
docker-compose down

# Update service
git pull
docker-compose up -d --build
```

### **Health Monitoring**
```bash
# Health check
curl http://localhost:3002/health

# Detailed stats
curl http://localhost:3002/stats | jq

# Test WebSocket
node test-connection.js
```

### **Log Management**
```bash
# View container logs
docker-compose logs websocket --tail 100

# View application logs
tail -f logs/websocket.log

# Clear old logs
docker system prune -f
```

---

## 🔗 **Vercel Integration**

### **Environment Variables**
Set di Vercel Dashboard:

```bash
# Production WebSocket URL
NEXT_PUBLIC_WS_URL=ws://YOUR_VPS_IP:3001/ws

# Atau dengan domain:
NEXT_PUBLIC_WS_URL=ws://ws.hafiportrait.photography:3001/ws

# Dengan SSL:
NEXT_PUBLIC_WS_URL=wss://ws.hafiportrait.photography:3001/ws
```

### **Client Code Update**
```javascript
// Di aplikasi Vercel, WebSocket client akan otomatis connect ke:
const wsClient = new WebSocketClient(process.env.NEXT_PUBLIC_WS_URL);
```

---

## 🛠 **Troubleshooting**

### **Common Issues**

#### **1. Connection Refused**
```bash
# Check if service is running
docker-compose ps

# Check logs
docker-compose logs websocket

# Check firewall
sudo ufw status
```

#### **2. Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tulpn | grep 3001

# Kill process if needed
sudo kill -9 PID
```

#### **3. Docker Permission Denied**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
```

#### **4. WebSocket Connection Failed**
```bash
# Test from server
node test-connection.js

# Test from external
telnet YOUR_VPS_IP 3001

# Check nginx logs (if using proxy)
sudo tail -f /var/log/nginx/error.log
```

### **Performance Tuning**

#### **For High Traffic**
```yaml
# docker-compose.yml
services:
  websocket:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    environment:
      - MAX_CONNECTIONS=5000
      - HEARTBEAT_INTERVAL=60000
```

#### **System Limits**
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Increase connection limits
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📈 **Scaling**

### **Multiple Instances**
```yaml
# docker-compose.yml
services:
  websocket:
    scale: 3
    ports:
      - "3001-3003:3001"
```

### **Load Balancer**
```nginx
# nginx.conf
upstream websocket_backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location /ws {
        proxy_pass http://websocket_backend;
        # ... other settings
    }
}
```

---

## 🔒 **Security**

### **Basic Security**
```bash
# Update system regularly
sudo apt update && sudo apt upgrade

# Configure fail2ban
sudo apt install fail2ban

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### **WebSocket Security**
```javascript
// server.js - Add origin validation
const allowedOrigins = [
  'https://hafiportrait.photography',
  'https://www.hafiportrait.photography'
];

// Validate origin in connection handler
```

---

## 📞 **Support**

Jika mengalami masalah:

1. **Check logs**: `docker-compose logs websocket`
2. **Test connection**: `node test-connection.js`
3. **Check health**: `curl http://localhost:3002/health`
4. **Restart service**: `docker-compose restart websocket`

**Service URLs:**
- WebSocket: `ws://YOUR_VPS_IP:3001/ws`
- Health Check: `http://YOUR_VPS_IP:3002/health`
- Stats: `http://YOUR_VPS_IP:3002/stats`