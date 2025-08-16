/**
 * Standalone Socket.IO Server for Production Deployment
 * Enhanced real-time server dengan auto-fallback, room management, dan mobile optimization
 */

const { Server } = require('socket.io');
const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

class ProductionSocketIOServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.io = null;
    this.clients = new Map();
    this.roomSubscriptions = new Map();
    this.rateLimiter = new Map();
    this.heartbeatInterval = null;
    this.dslrStatusWatcher = null;
    this.backupStatusWatcher = null;
    this.statsInterval = null;
    
    // File paths
    this.DSLR_STATUS_FILE = path.join(process.cwd(), 'dslr-status.json');
    this.BACKUP_STATUS_FILE = path.join(process.cwd(), 'backup-status.json');
    
    // Cache
    this.lastDslrStatus = null;
    this.lastBackupStatus = null;
    
    // Rate limiting
    this.RATE_LIMIT = 100; // messages per minute
    
    this.setupServer();
  }

  setupServer() {
    // Create HTTP server
    this.server = createServer();
    
    // Create Socket.IO server
    this.io = new Server(this.server, {
      path: '/socket.io/',
      cors: {
        origin: process.env.CORS_ORIGIN ? 
          process.env.CORS_ORIGIN.split(',') : 
          ["https://hafiportrait.photography", "https://www.hafiportrait.photography"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      compression: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6,
      upgradeTimeout: 10000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupHealthCheck();

    console.log(`🚀 Production Socket.IO server configured on port ${this.port}`);
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
          socket.data.userId = decoded.userId;
          socket.data.isAdmin = decoded.isAdmin || false;
        } catch (error) {
          console.warn('⚠️ Invalid token provided:', error.message);
        }
      }
      
      next();
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      const clientId = socket.id;
      const currentCount = this.rateLimiter.get(clientId) || 0;
      
      if (currentCount > this.RATE_LIMIT) {
        console.warn(`⚠️ Rate limit exceeded for client: ${clientId}`);
        return next(new Error('Rate limit exceeded'));
      }
      
      next();
    });

    // Logging middleware
    this.io.use((socket, next) => {
      const userAgent = socket.handshake.headers['user-agent'];
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent || '');
      const clientIP = socket.handshake.address;
      
      socket.data.userAgent = userAgent;
      socket.data.isMobile = isMobile;
      socket.data.clientIP = clientIP;
      
      console.log(`🔌 Connection attempt: ${socket.id} (${isMobile ? 'Mobile' : 'Desktop'}) from ${clientIP}`);
      next();
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  setupHealthCheck() {
    // Simple health check endpoint
    this.server.on('request', (req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        const stats = this.getStats();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          stats: stats
        }));
      }
    });
  }

  handleConnection(socket) {
    const clientId = socket.id;
    const client = {
      id: clientId,
      userId: socket.data.userId,
      rooms: new Set(),
      lastPing: Date.now(),
      transport: socket.conn.transport.name,
      userAgent: socket.data.userAgent,
      isMobile: socket.data.isMobile,
      clientIP: socket.data.clientIP
    };

    this.clients.set(clientId, client);
    console.log(`✅ Client connected: ${clientId} via ${client.transport} (Total: ${this.clients.size})`);

    // Send welcome message
    socket.emit('connected', {
      clientId,
      transport: client.transport,
      timestamp: new Date().toISOString(),
      serverVersion: '2.0.0-socketio-production',
      features: ['rooms', 'compression', 'auto-fallback', 'mobile-optimized', 'rate-limited']
    });

    // Handle room subscriptions
    socket.on('join-room', (roomName) => {
      this.handleRoomJoin(socket, roomName);
    });

    socket.on('leave-room', (roomName) => {
      this.handleRoomLeave(socket, roomName);
    });

    // Handle client messages
    socket.on('message', (data) => {
      this.handleClientMessage(socket, data);
    });

    // Handle heartbeat
    socket.on('heartbeat', (data) => {
      this.handleHeartbeat(socket, data);
    });

    // Handle transport upgrade
    socket.conn.on('upgrade', () => {
      const newTransport = socket.conn.transport.name;
      console.log(`🔄 Client ${clientId} upgraded to ${newTransport}`);
      
      if (this.clients.has(clientId)) {
        this.clients.get(clientId).transport = newTransport;
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${clientId}:`, error);
    });
  }

  handleRoomJoin(socket, roomName) {
    const clientId = socket.id;
    const client = this.clients.get(clientId);
    
    if (!client) return;

    // Validate room name
    const allowedRooms = ['dslr-monitoring', 'backup-status', 'admin-notifications', 'upload-progress'];
    if (!allowedRooms.includes(roomName)) {
      socket.emit('error', { message: `Invalid room: ${roomName}` });
      return;
    }

    // Check admin permissions
    if (roomName.includes('admin') && !socket.data.isAdmin) {
      socket.emit('error', { message: 'Admin access required' });
      return;
    }

    // Join room
    socket.join(roomName);
    client.rooms.add(roomName);

    // Track room subscriptions
    if (!this.roomSubscriptions.has(roomName)) {
      this.roomSubscriptions.set(roomName, new Set());
    }
    this.roomSubscriptions.get(roomName).add(clientId);

    console.log(`📍 Client ${clientId} joined room: ${roomName}`);
    
    // Send current status
    this.sendCurrentStatusToClient(socket, roomName);
    
    socket.emit('room-joined', { 
      room: roomName, 
      timestamp: new Date().toISOString(),
      clientsInRoom: this.roomSubscriptions.get(roomName)?.size || 0
    });
  }

  handleRoomLeave(socket, roomName) {
    const clientId = socket.id;
    const client = this.clients.get(clientId);
    
    if (!client) return;

    socket.leave(roomName);
    client.rooms.delete(roomName);

    if (this.roomSubscriptions.has(roomName)) {
      this.roomSubscriptions.get(roomName).delete(clientId);
    }

    console.log(`📍 Client ${clientId} left room: ${roomName}`);
    socket.emit('room-left', { room: roomName, timestamp: new Date().toISOString() });
  }

  sendCurrentStatusToClient(socket, roomName) {
    switch (roomName) {
      case 'dslr-monitoring':
        if (this.lastDslrStatus) {
          socket.emit('dslr_status', this.lastDslrStatus);
        }
        break;
      
      case 'backup-status':
        if (this.lastBackupStatus) {
          socket.emit('backup_status', this.lastBackupStatus);
        }
        break;
    }
  }

  handleClientMessage(socket, data) {
    const clientId = socket.id;
    
    // Update rate limiter
    const currentCount = this.rateLimiter.get(clientId) || 0;
    this.rateLimiter.set(clientId, currentCount + 1);
    
    console.log(`📨 Message from ${clientId}:`, data);
    
    // Handle specific message types
    if (data.type === 'request-dslr-status') {
      this.sendCurrentStatusToClient(socket, 'dslr-monitoring');
    } else if (data.type === 'request-backup-status') {
      this.sendCurrentStatusToClient(socket, 'backup-status');
    }
    
    socket.emit('message-received', {
      originalMessage: data,
      timestamp: new Date().toISOString()
    });
  }

  handleHeartbeat(socket, data) {
    const clientId = socket.id;
    const client = this.clients.get(clientId);
    
    if (client) {
      client.lastPing = Date.now();
    }
    
    socket.emit('heartbeat-response', {
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    });
  }

  handleDisconnection(socket, reason) {
    const clientId = socket.id;
    const client = this.clients.get(clientId);
    
    if (client) {
      // Remove from all rooms
      client.rooms.forEach(roomName => {
        if (this.roomSubscriptions.has(roomName)) {
          this.roomSubscriptions.get(roomName).delete(clientId);
        }
      });
      
      this.clients.delete(clientId);
      this.rateLimiter.delete(clientId);
    }
    
    console.log(`🔌 Client disconnected: ${clientId} (${reason}) (Remaining: ${this.clients.size})`);
  }

  start() {
    this.server.listen(this.port, '0.0.0.0', () => {
      console.log(`✅ Production Socket.IO server running on port ${this.port}`);
      console.log(`📡 WebSocket endpoint: ws://0.0.0.0:${this.port}/socket.io/`);
      console.log(`🏥 Health check: http://0.0.0.0:${this.port}/health`);
      
      // Start monitoring services
      this.startHeartbeat();
      this.startDslrMonitoring();
      this.startBackupMonitoring();
      this.startStatsLogging();
      this.startRateLimiterCleanup();
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const staleClients = [];
      
      this.clients.forEach((client, clientId) => {
        if (now - client.lastPing > 90000) { // 90 seconds timeout
          staleClients.push(clientId);
        }
      });
      
      // Remove stale clients
      staleClients.forEach(clientId => {
        console.log(`🧹 Removing stale client: ${clientId}`);
        this.clients.delete(clientId);
        this.rateLimiter.delete(clientId);
      });
      
    }, 30000);
  }

  startDslrMonitoring() {
    this.dslrStatusWatcher = setInterval(() => {
      this.checkDslrStatus();
    }, 2000);
  }

  checkDslrStatus() {
    try {
      if (fs.existsSync(this.DSLR_STATUS_FILE)) {
        const statusData = fs.readFileSync(this.DSLR_STATUS_FILE, 'utf8');
        const currentStatus = JSON.parse(statusData);
        
        if (JSON.stringify(currentStatus) !== JSON.stringify(this.lastDslrStatus)) {
          this.lastDslrStatus = currentStatus;
          
          this.broadcastToRoom('dslr-monitoring', 'dslr_status', {
            ...currentStatus,
            timestamp: new Date().toISOString(),
            source: 'file-watcher'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error reading DSLR status:', error);
    }
  }

  startBackupMonitoring() {
    this.backupStatusWatcher = setInterval(() => {
      this.checkBackupStatus();
    }, 5000);
  }

  checkBackupStatus() {
    try {
      if (fs.existsSync(this.BACKUP_STATUS_FILE)) {
        const statusData = fs.readFileSync(this.BACKUP_STATUS_FILE, 'utf8');
        const currentStatus = JSON.parse(statusData);
        
        if (JSON.stringify(currentStatus) !== JSON.stringify(this.lastBackupStatus)) {
          this.lastBackupStatus = currentStatus;
          
          this.broadcastToRoom('backup-status', 'backup_status', {
            ...currentStatus,
            timestamp: new Date().toISOString(),
            source: 'file-watcher'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error reading backup status:', error);
    }
  }

  broadcastToRoom(roomName, eventName, data) {
    const subscriberCount = this.roomSubscriptions.get(roomName)?.size || 0;
    if (subscriberCount > 0) {
      this.io.to(roomName).emit(eventName, data);
      console.log(`📡 Broadcasted ${eventName} to room ${roomName} (${subscriberCount} clients)`);
    }
  }

  broadcast(eventName, data) {
    this.io.emit(eventName, data);
    console.log(`📡 Broadcasted ${eventName} to all clients (${this.clients.size} clients)`);
  }

  startStatsLogging() {
    this.statsInterval = setInterval(() => {
      const stats = this.getStats();
      console.log('📊 Socket.IO Server Stats:', {
        connectedClients: stats.connectedClients,
        roomSubscriptions: stats.roomSubscriptions,
        transports: stats.transports,
        uptime: `${Math.floor(stats.uptime / 60)}m ${Math.floor(stats.uptime % 60)}s`
      });
    }, 60000);
  }

  startRateLimiterCleanup() {
    setInterval(() => {
      this.rateLimiter.clear();
    }, 60000);
  }

  stop() {
    console.log('🛑 Stopping Socket.IO server...');
    
    // Clear intervals
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.dslrStatusWatcher) clearInterval(this.dslrStatusWatcher);
    if (this.backupStatusWatcher) clearInterval(this.backupStatusWatcher);
    if (this.statsInterval) clearInterval(this.statsInterval);
    
    // Disconnect all clients
    if (this.io) {
      this.io.disconnectSockets(true);
    }
    
    // Clear data structures
    this.clients.clear();
    this.roomSubscriptions.clear();
    this.rateLimiter.clear();
    
    // Close server
    if (this.io) {
      this.io.close();
    }
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ Socket.IO server stopped');
  }

  getStats() {
    const transports = new Map();
    this.clients.forEach(client => {
      const transport = client.transport;
      transports.set(transport, (transports.get(transport) || 0) + 1);
    });

    return {
      connectedClients: this.clients.size,
      roomSubscriptions: Object.fromEntries(
        Array.from(this.roomSubscriptions.entries()).map(([room, clients]) => [room, clients.size])
      ),
      transports: Object.fromEntries(transports),
      uptime: process.uptime(),
      lastDslrUpdate: this.lastDslrStatus?.lastHeartbeat,
      lastBackupUpdate: Array.isArray(this.lastBackupStatus) ? this.lastBackupStatus.length : 0,
      rateLimit: {
        activeClients: this.rateLimiter.size,
        limit: this.RATE_LIMIT
      }
    };
  }
}

// Start server
const port = parseInt(process.env.PORT || process.env.SOCKETIO_PORT || process.env.WS_PORT || '3001');
const server = new ProductionSocketIOServer(port);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.stop();
  process.exit(0);
});

// Start server
server.start();

module.exports = { ProductionSocketIOServer };