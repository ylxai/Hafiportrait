/**
 * WebSocket Connection Test
 * Test koneksi ke WebSocket server
 */

const WebSocket = require('ws');

const wsUrl = process.env.WS_URL || 'ws://localhost:3001/ws';

console.log(`🔌 Testing WebSocket connection to: ${wsUrl}`);

const ws = new WebSocket(wsUrl);

let messageCount = 0;
let testTimeout;

ws.on('open', function open() {
  console.log('✅ Connected to WebSocket server');
  
  // Subscribe to all channels
  const channels = ['dslr_status', 'backup_progress', 'upload_events', 'system_notifications'];
  
  channels.forEach(channel => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      payload: { channel },
      timestamp: new Date().toISOString()
    }));
    console.log(`📺 Subscribed to channel: ${channel}`);
  });

  // Send heartbeat
  ws.send(JSON.stringify({
    type: 'heartbeat',
    payload: {},
    timestamp: new Date().toISOString()
  }));

  // Request current status
  ws.send(JSON.stringify({
    type: 'get_status',
    payload: {},
    timestamp: new Date().toISOString()
  }));

  // Set timeout for test completion
  testTimeout = setTimeout(() => {
    console.log(`\n📊 Test completed. Received ${messageCount} messages.`);
    ws.close();
  }, 10000); // 10 seconds test
});

ws.on('message', function message(data) {
  try {
    const msg = JSON.parse(data.toString());
    messageCount++;
    
    console.log(`📨 [${messageCount}] Received:`, {
      type: msg.type,
      timestamp: msg.timestamp,
      payload: typeof msg.payload === 'object' ? JSON.stringify(msg.payload).substring(0, 100) + '...' : msg.payload
    });

    // Handle specific message types
    switch (msg.type) {
      case 'connected':
        console.log('🎉 Welcome message received:', msg.payload.clientId);
        break;
      case 'subscribed':
        console.log(`✅ Subscription confirmed for: ${msg.payload.channel}`);
        break;
      case 'heartbeat_response':
        console.log('💓 Heartbeat acknowledged');
        break;
      case 'current_status':
        console.log('📊 Current status received');
        break;
      case 'dslr_update':
        console.log('📸 DSLR status update received');
        break;
      case 'backup_update':
        console.log('💾 Backup status update received');
        break;
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('close', function close(code, reason) {
  console.log(`🔌 Disconnected from WebSocket server (Code: ${code}, Reason: ${reason})`);
  if (testTimeout) {
    clearTimeout(testTimeout);
  }
  
  if (messageCount > 0) {
    console.log('✅ Connection test PASSED');
    process.exit(0);
  } else {
    console.log('❌ Connection test FAILED - No messages received');
    process.exit(1);
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
  if (testTimeout) {
    clearTimeout(testTimeout);
  }
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  if (testTimeout) {
    clearTimeout(testTimeout);
  }
  ws.close();
  process.exit(0);
});