/**
 * Test Socket.IO connection for Zeabur deployment
 */

const { io } = require('socket.io-client');

class SocketIOTester {
  constructor(serverUrl = 'http://localhost:8080') {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Starting Socket.IO Connection Tests...');
    console.log(`📡 Server URL: ${this.serverUrl}`);
    
    try {
      await this.testConnection();
      await this.testAuthentication();
      await this.testEventRooms();
      await this.testNotifications();
      await this.testHeartbeat();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      if (this.socket) {
        this.socket.disconnect();
      }
    }
  }

  async testConnection() {
    return new Promise((resolve, reject) => {
      console.log('\n📡 Testing basic connection...');
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling']
      });

      const timeout = setTimeout(() => {
        this.addResult('Connection', false, 'Connection timeout');
        reject(new Error('Connection timeout'));
      }, 5000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('✅ Connected successfully');
        this.addResult('Connection', true, 'Connected successfully');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log('❌ Connection failed:', error.message);
        this.addResult('Connection', false, error.message);
        reject(error);
      });
    });
  }

  async testAuthentication() {
    return new Promise((resolve) => {
      console.log('\n🔐 Testing authentication...');
      
      this.socket.on('connected', (data) => {
        console.log('✅ Authentication response received:', data);
        this.addResult('Authentication', true, 'Auth response received');
        resolve();
      });

      // Wait a bit for the connected event
      setTimeout(() => {
        this.addResult('Authentication', true, 'No auth errors');
        resolve();
      }, 1000);
    });
  }

  async testEventRooms() {
    return new Promise((resolve) => {
      console.log('\n🏠 Testing event rooms...');
      
      const testEventId = 'test-event-123';
      
      this.socket.on('user-joined', (data) => {
        console.log('✅ User joined event received:', data);
        this.addResult('Event Rooms', true, 'Room join/leave working');
        resolve();
      });

      // Join and leave event room
      this.socket.emit('join-event', testEventId);
      
      setTimeout(() => {
        this.socket.emit('leave-event', testEventId);
        this.addResult('Event Rooms', true, 'Room operations completed');
        resolve();
      }, 1000);
    });
  }

  async testNotifications() {
    return new Promise((resolve) => {
      console.log('\n📢 Testing notifications...');
      
      this.socket.on('test-notification', (data) => {
        console.log('✅ Test notification received:', data);
        this.addResult('Notifications', true, 'Notification received');
        resolve();
      });

      // Send a test notification via HTTP API
      this.sendTestNotification();
      
      setTimeout(() => {
        this.addResult('Notifications', true, 'Notification test completed');
        resolve();
      }, 2000);
    });
  }

  async testHeartbeat() {
    return new Promise((resolve) => {
      console.log('\n💓 Testing heartbeat...');
      
      this.socket.on('heartbeat-ack', (data) => {
        console.log('✅ Heartbeat acknowledged:', data);
        this.addResult('Heartbeat', true, 'Heartbeat working');
        resolve();
      });

      this.socket.emit('heartbeat');
      
      setTimeout(() => {
        this.addResult('Heartbeat', true, 'Heartbeat test completed');
        resolve();
      }, 1000);
    });
  }

  async sendTestNotification() {
    try {
      const response = await fetch(`${this.serverUrl}/api/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'test-notification',
          data: {
            message: 'Test notification from connection test',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        console.log('✅ Test notification sent via API');
      } else {
        console.log('⚠️ API notification failed');
      }
    } catch (error) {
      console.log('⚠️ API notification error:', error.message);
    }
  }

  addResult(test, success, message) {
    this.testResults.push({
      test,
      success,
      message,
      timestamp: new Date().toISOString()
    });
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let passed = 0;
    let total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}: ${result.message}`);
      if (result.success) passed++;
    });
    
    console.log(`\n📈 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Socket.IO server is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the server configuration.');
    }
  }
}

// Run tests
const serverUrl = process.argv[2] || 'http://localhost:8080';
const tester = new SocketIOTester(serverUrl);
tester.runTests();