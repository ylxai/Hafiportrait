/**
 * HafiPortrait Socket.IO Server - Optimized for Zeabur Deployment
 * Real-time notifications and event updates
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class ZeaburSocketIOServer {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = process.env.PORT || 8080;
    this.jwtSecret = process.env.JWT_SECRET || 'hafiportrait-secret-key';
    
    // Initialize Socket.IO with CORS configuration
    this.io = new Server(this.server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "https://hafiportrait.vercel.app",
          "https://hafiportrait.photography",
          "https://*.vercel.app",
          "https://*.zeabur.app",
          process.env.FRONTEND_URL,
          process.env.FRONTEND_URL_SECONDARY
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.connectedClients = new Map();
    this.eventRooms = new Map();
    this.adminSockets = new Set();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  setupMiddleware() {
    this.app.use(express.json());
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connections: this.connectedClients.size,
        uptime: process.uptime()
      });
    });

    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        service: 'HafiPortrait Socket.IO',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        connections: this.connectedClients.size,
        eventRooms: this.eventRooms.size,
        adminConnections: this.adminSockets.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });
  }

  setupRoutes() {
    // API endpoint to send notifications
    this.app.post('/api/notify', (req, res) => {
      try {
        const { eventId, type, data, adminOnly = false } = req.body;
        
        if (adminOnly) {
          this.notifyAdmins(type, data);
        } else if (eventId) {
          this.notifyEvent(eventId, type, data);
        } else {
          this.notifyAll(type, data);
        }
        
        res.json({ success: true, message: 'Notification sent' });
      } catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
      }
    });

    // API endpoint to get connection stats
    this.app.get('/api/stats', (req, res) => {
      const stats = {
        totalConnections: this.connectedClients.size,
        eventRooms: Array.from(this.eventRooms.entries()).map(([eventId, clients]) => ({
          eventId,
          connections: clients.size
        })),
        adminConnections: this.adminSockets.size,
        uptime: process.uptime()
      };
      
      res.json(stats);
    });
  }

  setupSocketHandlers() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, this.jwtSecret);
          socket.userId = decoded.userId;
          socket.isAdmin = decoded.isAdmin || false;
        } catch (error) {
          console.log('Invalid token, continuing as guest:', error.message);
        }
      }
      
      next();
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id} (User: ${socket.userId || 'guest'})`);
      
      // Store client info
      this.connectedClients.set(socket.id, {
        userId: socket.userId,
        isAdmin: socket.isAdmin,
        connectedAt: new Date(),
        lastActivity: new Date()
      });

      // Add to admin sockets if admin
      if (socket.isAdmin) {
        this.adminSockets.add(socket.id);
        socket.join('admin-room');
        console.log(`Admin connected: ${socket.id}`);
      }

      // Join event room
      socket.on('join-event', (eventId) => {
        if (!eventId) return;
        
        socket.join(`event-${eventId}`);
        
        if (!this.eventRooms.has(eventId)) {
          this.eventRooms.set(eventId, new Set());
        }
        this.eventRooms.get(eventId).add(socket.id);
        
        console.log(`Client ${socket.id} joined event ${eventId}`);
        
        // Notify others in the event
        socket.to(`event-${eventId}`).emit('user-joined', {
          socketId: socket.id,
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      // Leave event room
      socket.on('leave-event', (eventId) => {
        if (!eventId) return;
        
        socket.leave(`event-${eventId}`);
        
        if (this.eventRooms.has(eventId)) {
          this.eventRooms.get(eventId).delete(socket.id);
          if (this.eventRooms.get(eventId).size === 0) {
            this.eventRooms.delete(eventId);
          }
        }
        
        console.log(`Client ${socket.id} left event ${eventId}`);
        
        // Notify others in the event
        socket.to(`event-${eventId}`).emit('user-left', {
          socketId: socket.id,
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      });

      // Handle photo upload notifications
      socket.on('photo-uploaded', (data) => {
        const { eventId, photoData } = data;
        if (eventId) {
          socket.to(`event-${eventId}`).emit('new-photo', {
            ...photoData,
            timestamp: new Date().toISOString()
          });
          
          // Notify admins
          this.notifyAdmins('photo-uploaded', {
            eventId,
            photoData,
            uploadedBy: socket.userId
          });
        }
      });

      // Handle message notifications
      socket.on('message-sent', (data) => {
        const { eventId, messageData } = data;
        if (eventId) {
          socket.to(`event-${eventId}`).emit('new-message', {
            ...messageData,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle event status updates
      socket.on('event-status-update', (data) => {
        if (socket.isAdmin) {
          const { eventId, status } = data;
          this.io.to(`event-${eventId}`).emit('event-status-changed', {
            eventId,
            status,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        if (this.connectedClients.has(socket.id)) {
          this.connectedClients.get(socket.id).lastActivity = new Date();
        }
        socket.emit('heartbeat-ack', { timestamp: new Date().toISOString() });
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id} (Reason: ${reason})`);
        
        // Remove from admin sockets
        this.adminSockets.delete(socket.id);
        
        // Remove from event rooms
        for (const [eventId, clients] of this.eventRooms.entries()) {
          if (clients.has(socket.id)) {
            clients.delete(socket.id);
            if (clients.size === 0) {
              this.eventRooms.delete(eventId);
            }
            
            // Notify others in the event
            socket.to(`event-${eventId}`).emit('user-left', {
              socketId: socket.id,
              userId: socket.userId,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        // Remove from connected clients
        this.connectedClients.delete(socket.id);
      });

      // Send welcome message
      socket.emit('connected', {
        socketId: socket.id,
        userId: socket.userId,
        isAdmin: socket.isAdmin,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Utility methods for sending notifications
  notifyEvent(eventId, type, data) {
    this.io.to(`event-${eventId}`).emit(type, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  notifyAdmins(type, data) {
    this.io.to('admin-room').emit(type, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  notifyAll(type, data) {
    this.io.emit(type, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  start() {
    this.server.listen(this.port, '0.0.0.0', () => {
      const environment = process.env.NODE_ENV || 'production';
      const isProduction = environment === 'production';
      const baseUrl = isProduction ? 'https://wbs.zeabur.app' : `http://localhost:${this.port}`;
      
      console.log(`🚀 HafiPortrait Socket.IO Server running on port ${this.port}`);
      console.log(`📡 Environment: ${environment}`);
      console.log(`🔗 Health check: ${baseUrl}/health`);
      console.log(`📊 Status: ${baseUrl}/status`);
      console.log(`🌐 Public URL: ${baseUrl}`);
      
      // Debug environment variables
      console.log(`🔍 ENV Debug - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
      console.log(`🔍 ENV Debug - PORT: ${process.env.PORT || 'NOT SET'}`);
      console.log(`🔍 ENV Debug - JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
      console.log(`🔍 ENV Debug - FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
      console.log(`🔍 ENV Debug - FRONTEND_URL_SECONDARY: ${process.env.FRONTEND_URL_SECONDARY || 'NOT SET'}`);
      
      if (!isProduction) {
        console.log(`⚠️  Set NODE_ENV=production in Zeabur environment variables`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      this.server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      this.server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  }
}

// Start the server
const server = new ZeaburSocketIOServer();
server.start();

module.exports = { ZeaburSocketIOServer };