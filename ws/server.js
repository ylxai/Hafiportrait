/**
 * HafiPortrait WebSocket Service
 * Standalone WebSocket server untuk real-time notifications
 */

const { WebSocketServer, WebSocket } = require('ws');
const { createServer } = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  wsPort: parseInt(process.env.WS_PORT) || 3001,
  healthPort: parseInt(process.env.HEALTH_PORT) || 3002,
  host: process.env.HOST || '0.0.0.0',
  maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000,
  heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL) || 30000,
  pingTimeout: parseInt(process.env.PING_TIMEOUT) || 120000,
  enableStatsLogging: process.env.ENABLE_STATS_LOGGING === 'true',
  statsInterval: parseInt(process.env.STATS_INTERVAL) || 30000,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// File paths
const STATUS_DIR = path.join(__dirname, 'status');
const LOGS_DIR = path.join(__dirname, 'logs');
const DSLR_STATUS_FILE = path.join(STATUS_DIR, 'dslr-status.json');
const BACKUP_STATUS_FILE = path.join(STATUS_DIR, 'backup-status.json');

// Ensure directories exist
[STATUS_DIR, LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize status files if they don't exist
if (!fs.existsSync(DSLR_STATUS_FILE)) {
  fs.writeFileSync(DSLR_STATUS_FILE, JSON.stringify({
    status: 'disconnected',
    lastHeartbeat: null,
    cameraModel: null,
    batteryLevel: null,
    storageRemaining: null
  }, null, 2));
}

if (!fs.existsSync(BACKUP_STATUS_FILE)) {
  fs.writeFileSync(BACKUP_STATUS_FILE, JSON.stringify([], null, 2));
}

class HafiPortraitWebSocketServer {
  constructor() {
    this.clients = new Map();
    this.wss = null;
    this.httpServer = null;
    this.healthServer = null;
    this.intervals = new Map();
    this.stats = {
      startTime: Date.now(),
      totalConnections: 0,
      currentConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      lastDslrUpdate: null,
      lastBackupUpdate: null
    };
    
    // Cache untuk status files
    this.lastDslrStatus = null;
    this.lastBackupStatus = null;
    
    this.setupServers();
  }

  /**
   * Setup WebSocket dan Health Check servers
   */
  setupServers() {
    // HTTP server untuk WebSocket
    this.httpServer = createServer();
    
    // WebSocket server
    this.wss = new WebSocketServer({
      server: this.httpServer,
      path: '/ws',
      maxPayload: 16 * 1024, // 16KB max payload
      perMessageDeflate: {
        zlibDeflateOptions: {
          level: 3,
          chunkSize: 1024,
        },
        threshold: 1024,
        concurrencyLimit: 10,
        clientMaxWindowBits: 13,
        serverMaxWindowBits: 13,
        serverMaxNoContextTakeover: false,
        clientMaxNoContextTakeover: false,
      }
    });

    // Health check server
    this.healthServer = createServer((req, res) => {
      if (req.url === '/health') {
        const healthData = {
          status: 'healthy',
          uptime: Math.floor((Date.now() - this.stats.startTime) / 1000),
          connections: this.stats.currentConnections,
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthData, null, 2));
      } else if (req.url === '/stats') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.getDetailedStats(), null, 2));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.setupWebSocketHandlers();
    this.log('info', '🚀 WebSocket server configured');
  }

  /**
   * Setup WebSocket event handlers
   */
  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, request) => {
      // Check connection limit
      if (this.clients.size >= config.maxConnections) {
        this.log('warn', `🚫 Connection limit reached (${config.maxConnections})`);
        ws.close(1013, 'Server overloaded');
        return;
      }

      this.handleNewConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      this.log('error', '❌ WebSocket server error:', error);
    });
  }

  /**
   * Handle new WebSocket connection
   */
  handleNewConnection(ws, request) {
    const clientId = this.generateClientId();
    const clientInfo = {
      id: clientId,
      ws: ws,
      subscriptions: new Set(),
      lastPing: Date.now(),
      connectedAt: Date.now(),
      ip: request.socket.remoteAddress,
      userAgent: request.headers['user-agent']
    };

    this.clients.set(clientId, clientInfo);
    this.stats.totalConnections++;
    this.stats.currentConnections++;

    this.log('info', `🔌 Client connected: ${clientId} (Total: ${this.clients.size})`);

    // Send welcome message
    this.sendToClient(clientId, 'connected', {
      clientId: clientId,
      serverTime: new Date().toISOString(),
      availableChannels: ['dslr_status', 'backup_progress', 'upload_events', 'system_notifications']
    });

    // Setup client event handlers
    ws.on('message', (data) => {
      this.handleClientMessage(clientId, data);
    });

    ws.on('close', (code, reason) => {
      this.handleClientDisconnect(clientId, code, reason);
    });

    ws.on('error', (error) => {
      this.log('error', `❌ Client ${clientId} error:`, error);
      this.clients.delete(clientId);
      this.stats.currentConnections--;
    });

    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.lastPing = Date.now();
      }
    });
  }

  /**
   * Handle client messages
   */
  handleClientMessage(clientId, data) {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);
      
      if (!client) return;

      this.stats.messagesReceived++;

      switch (message.type) {
        case 'subscribe':
          const channel = message.payload?.channel;
          if (channel) {
            client.subscriptions.add(channel);
            this.sendToClient(clientId, 'subscribed', { channel });
            this.log('debug', `📺 Client ${clientId} subscribed to ${channel}`);
          }
          break;

        case 'unsubscribe':
          const unsubChannel = message.payload?.channel;
          if (unsubChannel) {
            client.subscriptions.delete(unsubChannel);
            this.sendToClient(clientId, 'unsubscribed', { channel: unsubChannel });
            this.log('debug', `📺 Client ${clientId} unsubscribed from ${unsubChannel}`);
          }
          break;

        case 'heartbeat':
          client.lastPing = Date.now();
          this.sendToClient(clientId, 'heartbeat_response', { 
            timestamp: new Date().toISOString() 
          });
          break;

        case 'get_status':
          // Send current status to client
          this.sendCurrentStatus(clientId);
          break;

        default:
          this.log('debug', `🤷 Unknown message type from ${clientId}: ${message.type}`);
      }
    } catch (error) {
      this.log('error', `❌ Error parsing message from ${clientId}:`, error);
    }
  }

  /**
   * Handle client disconnect
   */
  handleClientDisconnect(clientId, code, reason) {
    this.clients.delete(clientId);
    this.stats.currentConnections--;
    this.log('info', `🔌 Client disconnected: ${clientId} (Code: ${code}, Total: ${this.clients.size})`);
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId, type, payload) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return false;

    const message = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    try {
      client.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
      return true;
    } catch (error) {
      this.log('error', `❌ Error sending message to ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast message to subscribed clients
   */
  broadcast(channel, type, payload) {
    const message = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
          sentCount++;
          this.stats.messagesSent++;
        } catch (error) {
          this.log('error', `❌ Error broadcasting to ${client.id}:`, error);
        }
      }
    });

    this.log('debug', `📡 Broadcasted ${type} to ${sentCount} clients on channel ${channel}`);
    return sentCount;
  }

  /**
   * Send current status to client
   */
  sendCurrentStatus(clientId) {
    const status = {
      dslr: this.lastDslrStatus,
      backup: this.lastBackupStatus,
      server: {
        uptime: Math.floor((Date.now() - this.stats.startTime) / 1000),
        connections: this.stats.currentConnections
      }
    };
    
    this.sendToClient(clientId, 'current_status', status);
  }

  /**
   * Start monitoring services
   */
  startMonitoring() {
    // Heartbeat untuk cleanup stale connections
    this.intervals.set('heartbeat', setInterval(() => {
      this.cleanupStaleConnections();
    }, config.heartbeatInterval));

    // DSLR status monitoring
    this.intervals.set('dslr', setInterval(() => {
      this.checkDslrStatus();
    }, 5000));

    // Backup status monitoring
    this.intervals.set('backup', setInterval(() => {
      this.checkBackupStatus();
    }, 3000));

    // Stats logging
    if (config.enableStatsLogging) {
      this.intervals.set('stats', setInterval(() => {
        this.logStats();
      }, config.statsInterval));
    }

    this.log('info', '📊 Monitoring services started');
  }

  /**
   * Cleanup stale connections
   */
  cleanupStaleConnections() {
    const now = Date.now();
    const staleClients = [];

    this.clients.forEach((client, clientId) => {
      if (now - client.lastPing > config.pingTimeout) {
        staleClients.push(clientId);
      } else if (client.ws.readyState === WebSocket.OPEN) {
        // Send ping
        try {
          client.ws.ping();
        } catch (error) {
          staleClients.push(clientId);
        }
      }
    });

    // Remove stale clients
    staleClients.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client) {
        this.log('debug', `🧹 Removing stale client: ${clientId}`);
        client.ws.terminate();
        this.clients.delete(clientId);
        this.stats.currentConnections--;
      }
    });
  }

  /**
   * Check DSLR status file
   */
  checkDslrStatus() {
    try {
      if (fs.existsSync(DSLR_STATUS_FILE)) {
        const statusData = fs.readFileSync(DSLR_STATUS_FILE, 'utf8');
        const currentStatus = JSON.parse(statusData);
        
        if (JSON.stringify(currentStatus) !== JSON.stringify(this.lastDslrStatus)) {
          this.lastDslrStatus = currentStatus;
          this.stats.lastDslrUpdate = Date.now();
          
          const sentCount = this.broadcast('dslr_status', 'dslr_update', currentStatus);
          this.log('debug', `📸 DSLR status updated, sent to ${sentCount} clients`);
        }
      }
    } catch (error) {
      this.log('error', '❌ Error reading DSLR status:', error);
    }
  }

  /**
   * Check backup status file
   */
  checkBackupStatus() {
    try {
      if (fs.existsSync(BACKUP_STATUS_FILE)) {
        const statusData = fs.readFileSync(BACKUP_STATUS_FILE, 'utf8');
        const currentStatus = JSON.parse(statusData);
        
        if (JSON.stringify(currentStatus) !== JSON.stringify(this.lastBackupStatus)) {
          this.lastBackupStatus = currentStatus;
          this.stats.lastBackupUpdate = Date.now();
          
          const sentCount = this.broadcast('backup_progress', 'backup_update', currentStatus);
          this.log('debug', `💾 Backup status updated, sent to ${sentCount} clients`);
        }
      }
    } catch (error) {
      this.log('error', '❌ Error reading backup status:', error);
    }
  }

  /**
   * Log server statistics
   */
  logStats() {
    const stats = this.getDetailedStats();
    this.log('info', '📊 Server Stats:', {
      connections: stats.currentConnections,
      uptime: `${Math.floor(stats.uptime / 60)}m ${Math.floor(stats.uptime % 60)}s`,
      memory: `${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB`,
      messages: `${stats.messagesReceived}↓ ${stats.messagesSent}↑`
    });
  }

  /**
   * Get detailed server statistics
   */
  getDetailedStats() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const subscriptions = {};
    
    this.clients.forEach(client => {
      client.subscriptions.forEach(sub => {
        subscriptions[sub] = (subscriptions[sub] || 0) + 1;
      });
    });

    return {
      ...this.stats,
      uptime,
      subscriptions,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Logging function
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = data ? `${message} ${JSON.stringify(data)}` : message;
    
    if (level === 'error' || level === 'warn' || level === 'info' || config.logLevel === 'debug') {
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${logMessage}`);
    }
  }

  /**
   * Start the server
   */
  start() {
    // Start WebSocket server
    this.httpServer.listen(config.wsPort, config.host, () => {
      this.log('info', `✅ WebSocket server running on ws://${config.host}:${config.wsPort}/ws`);
    });

    // Start health check server
    this.healthServer.listen(config.healthPort, config.host, () => {
      this.log('info', `✅ Health check server running on http://${config.host}:${config.healthPort}/health`);
    });

    // Start monitoring
    this.startMonitoring();

    // Graceful shutdown handlers
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
  }

  /**
   * Graceful shutdown
   */
  shutdown(signal) {
    this.log('info', `🛑 Received ${signal}, shutting down gracefully...`);
    
    // Clear all intervals
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      this.log('debug', `🧹 Cleared ${name} interval`);
    });
    
    // Close all client connections
    this.clients.forEach((client, clientId) => {
      client.ws.close(1000, 'Server shutting down');
    });
    this.clients.clear();
    
    // Close servers
    if (this.wss) {
      this.wss.close(() => {
        this.log('info', '✅ WebSocket server closed');
      });
    }
    
    if (this.httpServer) {
      this.httpServer.close(() => {
        this.log('info', '✅ HTTP server closed');
      });
    }
    
    if (this.healthServer) {
      this.healthServer.close(() => {
        this.log('info', '✅ Health server closed');
        process.exit(0);
      });
    }
  }
}

// Start server
const server = new HafiPortraitWebSocketServer();
server.start();