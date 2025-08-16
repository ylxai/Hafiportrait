# HafiPortrait Socket.IO Server - Zeabur Deployment

Socket.IO server yang dioptimalkan untuk deployment di Zeabur.com dengan fitur real-time notifications untuk aplikasi HafiPortrait Photography.

## 🚀 Quick Deploy ke Zeabur

### 1. Push ke GitHub
```bash
# Clone atau copy folder ini ke repository GitHub baru
git init
git add .
git commit -m "Initial Socket.IO server for Zeabur"
git branch -M main
git remote add origin https://github.com/username/hafiportrait-socketio.git
git push -u origin main
```

### 2. Deploy di Zeabur
1. Login ke [Zeabur.com](https://zeabur.com)
2. Klik "New Project"
3. Connect GitHub repository
4. Pilih repository yang baru dibuat
5. Zeabur akan auto-detect Node.js dan deploy

### 3. Environment Variables di Zeabur
Set environment variables berikut di Zeabur dashboard:

```
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.com
```

## 📡 Fitur Socket.IO Server

### Real-time Events
- ✅ **Photo Upload Notifications** - Notifikasi real-time saat foto baru diupload
- ✅ **Message Notifications** - Notifikasi pesan baru di guestbook
- ✅ **Event Status Updates** - Update status event (active/completed/archived)
- ✅ **Admin Notifications** - Notifikasi khusus untuk admin
- ✅ **User Join/Leave** - Tracking user yang join/leave event

### API Endpoints
- `GET /health` - Health check untuk monitoring
- `GET /status` - Status server dan statistik koneksi
- `GET /api/stats` - Statistik detail koneksi dan rooms
- `POST /api/notify` - Send notification via HTTP API

### Authentication
- JWT token support untuk authenticated users
- Guest access untuk public events
- Admin role detection dan special permissions

## 🔧 Testing

### Local Testing
```bash
# Install dependencies
npm install

# Development mode (without PM2)
npm run dev

# Production mode with PM2
npm start

# Alternative: Start without PM2
npm run start:node

# Test connection
npm test

# Health check
npm run health

# PM2 Management
npm run pm2:logs      # View logs
npm run pm2:monit     # Monitor processes
npm run pm2:restart   # Restart all processes
npm run pm2:stop      # Stop all processes
```

### Production Testing
```bash
# Test deployed server
node test-connection.js https://your-zeabur-domain.com
```

## 🌐 Integration dengan Frontend

### Client Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('https://your-zeabur-domain.com', {
  auth: {
    token: 'your-jwt-token' // Optional
  }
});

// Join event room
socket.emit('join-event', 'event-123');

// Listen for new photos
socket.on('new-photo', (photoData) => {
  console.log('New photo uploaded:', photoData);
});

// Listen for messages
socket.on('new-message', (messageData) => {
  console.log('New message:', messageData);
});
```

### Send Notifications via API
```javascript
// Send notification to specific event
fetch('https://your-zeabur-domain.com/api/notify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: 'event-123',
    type: 'new-photo',
    data: {
      photoId: 'photo-456',
      photoUrl: 'https://...',
      uploadedBy: 'user-789'
    }
  })
});

// Send admin notification
fetch('https://your-zeabur-domain.com/api/notify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'admin-alert',
    adminOnly: true,
    data: {
      message: 'New event created',
      eventId: 'event-123'
    }
  })
});
```

## 📊 Monitoring

### Health Check
```bash
curl https://your-zeabur-domain.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "connections": 25,
  "uptime": 3600
}
```

### Connection Stats
```bash
curl https://your-zeabur-domain.com/api/stats
```

Response:
```json
{
  "totalConnections": 25,
  "eventRooms": [
    {
      "eventId": "event-123",
      "connections": 15
    }
  ],
  "adminConnections": 2,
  "uptime": 3600
}
```

## 🔒 Security Features

- CORS protection dengan whitelist domains
- JWT authentication support
- Rate limiting (dapat ditambahkan)
- Input validation
- Graceful shutdown handling

## 🚀 Performance

- Optimized untuk Zeabur deployment
- Support WebSocket dan Polling fallback
- Efficient room management
- Memory-efficient client tracking
- Heartbeat monitoring

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | JWT secret key | Required |
| `FRONTEND_URL` | Frontend domain for CORS | Required |

## 🔄 Update Frontend Config

Setelah deploy, update konfigurasi di frontend Anda:

```javascript
// src/lib/socketio-client.ts atau config file
const SOCKET_SERVER_URL = 'https://your-zeabur-domain.com';
```

## 📞 Support

Jika ada masalah dengan deployment atau konfigurasi, check:

1. Zeabur logs untuk error messages
2. Health check endpoint: `/health`
3. Status endpoint: `/status`
4. Test connection dengan: `npm test`

---

**Ready untuk production!** 🎉

Server ini sudah dioptimalkan untuk:
- ✅ Zeabur deployment
- ✅ Real-time notifications
- ✅ Scalable architecture
- ✅ Production monitoring
- ✅ Security best practices