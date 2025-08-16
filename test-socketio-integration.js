#!/usr/bin/env node

/**
 * Socket.IO External Integration Test
 * Test koneksi ke server Socket.IO eksternal
 */

const { io } = require('socket.io-client');

// Konfigurasi dari environment
const SOCKETIO_SERVERS = [
  'https://wbs.zeabur.app'  // Server utama Socket.IO
];

async function testSocketIOConnection(serverUrl) {
  console.log(`\n🔌 Testing Socket.IO connection to: ${serverUrl}`);
  
  return new Promise((resolve) => {
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: false,
      query: {
        clientType: 'test',
        source: 'integration-test'
      }
    });

    const startTime = Date.now();
    let resolved = false;

    // Connection success
    socket.on('connect', () => {
      const duration = Date.now() - startTime;
      console.log(`✅ Connected successfully in ${duration}ms`);
      console.log(`   Transport: ${socket.io.engine.transport.name}`);
      console.log(`   Socket ID: ${socket.id}`);
      
      // Test basic communication
      socket.emit('test-message', { 
        message: 'Hello from HafiPortrait test',
        timestamp: new Date().toISOString()
      });
      
      if (!resolved) {
        resolved = true;
        resolve({
          success: true,
          duration,
          transport: socket.io.engine.transport.name,
          socketId: socket.id
        });
      }
      
      socket.disconnect();
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.log(`❌ Connection failed: ${error.message}`);
      if (!resolved) {
        resolved = true;
        resolve({
          success: false,
          error: error.message,
          duration: Date.now() - startTime
        });
      }
    });

    // Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        console.log(`⏰ Connection timeout after 10s`);
        resolved = true;
        resolve({
          success: false,
          error: 'Connection timeout',
          duration: 10000
        });
        socket.disconnect();
      }
    }, 10000);
  });
}

async function testHealthEndpoint(serverUrl) {
  console.log(`\n🏥 Testing health endpoint: ${serverUrl}/health`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${serverUrl}/health`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HafiPortrait-Integration-Test'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Health check passed`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data:`, data);
      return { success: true, data };
    } else {
      console.log(`⚠️ Health check returned ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runIntegrationTests() {
  console.log('🚀 HafiPortrait Socket.IO Integration Test');
  console.log('=' .repeat(50));
  
  const results = {
    servers: [],
    summary: {
      total: SOCKETIO_SERVERS.length,
      successful: 0,
      failed: 0
    }
  };

  for (const serverUrl of SOCKETIO_SERVERS) {
    console.log(`\n📡 Testing server: ${serverUrl}`);
    console.log('-'.repeat(40));
    
    // Test health endpoint
    const healthResult = await testHealthEndpoint(serverUrl);
    
    // Test Socket.IO connection
    const socketResult = await testSocketIOConnection(serverUrl);
    
    const serverResult = {
      url: serverUrl,
      health: healthResult,
      socket: socketResult,
      overall: healthResult.success || socketResult.success
    };
    
    results.servers.push(serverResult);
    
    if (serverResult.overall) {
      results.summary.successful++;
      console.log(`\n🎉 Server ${serverUrl} - WORKING`);
    } else {
      results.summary.failed++;
      console.log(`\n💥 Server ${serverUrl} - FAILED`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total servers tested: ${results.summary.total}`);
  console.log(`✅ Successful: ${results.summary.successful}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  const workingServers = results.servers.filter(s => s.overall);
  
  if (workingServers.length > 0) {
    console.log('✅ Working servers found:');
    workingServers.forEach(server => {
      console.log(`   - ${server.url}`);
      if (server.socket.success) {
        console.log(`     Socket.IO: ✅ (${server.socket.duration}ms, ${server.socket.transport})`);
      }
      if (server.health.success) {
        console.log(`     Health: ✅`);
      }
    });
    
    console.log('\n🔧 Environment Configuration:');
    console.log(`NEXT_PUBLIC_USE_SOCKETIO=true`);
    console.log(`NEXT_PUBLIC_SOCKETIO_URL=${workingServers[0].url}`);
  } else {
    console.log('❌ No working servers found');
    console.log('🔧 Fallback to WebSocket mode:');
    console.log(`NEXT_PUBLIC_USE_SOCKETIO=false`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Update .env.local with working server URL');
  console.log('2. Test in browser with: localStorage.setItem("use-socketio", "true")');
  console.log('3. Check browser console for real-time connection status');
  
  return results;
}

// Run tests
if (require.main === module) {
  runIntegrationTests()
    .then(results => {
      const exitCode = results.summary.successful > 0 ? 0 : 1;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };