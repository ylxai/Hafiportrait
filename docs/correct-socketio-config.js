/**
 * Correct Socket.IO Configuration for HafiPortrait System
 * Based on your existing server setup
 */

import { io } from 'socket.io-client';

// ✅ CORRECT Configuration
const socket = io('https://xcyrexmwrwjq.ap-southeast-1.clawcloudrun.com', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,        // Increased for stability
  reconnectionDelay: 1000,         // Faster initial reconnect
  reconnectionDelayMax: 5000,      // Max delay cap
  upgrade: true,                   // Allow transport upgrade
  rememberUpgrade: true,           // Remember best transport
  forceNew: false                  // Reuse connection
});

// ✅ Connection Event Handlers
socket.on('connect', () => {
  console.log('✅ Socket.IO connected:', socket.id);
  console.log('Transport:', socket.io.engine.transport.name);
  
  // ✅ Join rooms (NOT channels) - based on your server
  socket.emit('join-room', 'dslr-monitoring');
  socket.emit('join-room', 'backup-status');
  socket.emit('join-room', 'admin-notifications');
  socket.emit('join-room', 'upload-progress');
});

socket.on('connected', (data) => {
  console.log('📡 Server welcome:', data);
});

socket.on('room-joined', (data) => {
  console.log('📍 Joined room:', data);
});

// ✅ Real-time Event Listeners (based on your system)
socket.on('dslr_status', (data) => {
  console.log('📸 DSLR update:', data);
  // Handle DSLR status updates
});

socket.on('backup_status', (data) => {
  console.log('💾 Backup progress:', data);
  // Handle backup progress updates
});

socket.on('notification', (data) => {
  console.log('🔔 System notification:', data);
  // Handle system notifications
});

socket.on('upload_progress', (data) => {
  console.log('📤 Upload progress:', data);
  // Handle upload progress
});

// ✅ Error Handling
socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

export default socket;