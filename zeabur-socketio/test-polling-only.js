/**
 * Test Socket.IO connection dengan polling only (bypass WebSocket)
 * Untuk troubleshoot WebSocket issues di Zeabur
 */

const { io } = require('socket.io-client');

async function testPollingConnection() {
  console.log('🧪 Testing Socket.IO with Polling Only...');
  console.log('Server: https://wbs.zeabur.app');
  
  const socket = io('https://wbs.zeabur.app', {
    transports: ['polling'], // Force polling only
    timeout: 10000,
    forceNew: true
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('❌ Connection timeout');
      socket.disconnect();
      reject(new Error('Connection timeout'));
    }, 15000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log('✅ Connected successfully with polling!');
      console.log(`Socket ID: ${socket.id}`);
      console.log(`Transport: ${socket.io.engine.transport.name}`);
      
      // Test heartbeat
      socket.emit('heartbeat');
      
      socket.on('heartbeat-ack', (data) => {
        console.log('✅ Heartbeat working:', data);
        socket.disconnect();
        resolve(true);
      });
      
      // Fallback if no heartbeat response
      setTimeout(() => {
        console.log('✅ Connection successful (no heartbeat response)');
        socket.disconnect();
        resolve(true);
      }, 3000);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      console.log('❌ Connection failed:', error.message);
      console.log('Error type:', error.type);
      reject(error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
    });
  });
}

// Test dengan berbagai transport configurations
async function runTests() {
  try {
    console.log('='.repeat(50));
    console.log('Test 1: Polling Only');
    console.log('='.repeat(50));
    await testPollingConnection();
    
    console.log('\n' + '='.repeat(50));
    console.log('Test 2: WebSocket with Polling Fallback');
    console.log('='.repeat(50));
    
    const socket2 = io('https://wbs.zeabur.app', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      upgrade: true,
      rememberUpgrade: false
    });
    
    socket2.on('connect', () => {
      console.log('✅ Connected with fallback!');
      console.log(`Transport: ${socket2.io.engine.transport.name}`);
      socket2.disconnect();
    });
    
    socket2.on('connect_error', (error) => {
      console.log('❌ Fallback failed:', error.message);
    });
    
    // Wait for second test
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();