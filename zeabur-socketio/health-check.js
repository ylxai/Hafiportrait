/**
 * Health check script for Socket.IO server
 * Used by Zeabur for monitoring server health
 */

const http = require('http');

class HealthChecker {
  constructor(port = process.env.PORT || 8080) {
    this.port = port;
    this.host = 'localhost';
  }

  async checkHealth() {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: this.host,
        port: this.port,
        path: '/health',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const healthData = JSON.parse(data);
            
            if (res.statusCode === 200 && healthData.status === 'healthy') {
              resolve({
                healthy: true,
                statusCode: res.statusCode,
                data: healthData
              });
            } else {
              reject({
                healthy: false,
                statusCode: res.statusCode,
                data: healthData
              });
            }
          } catch (error) {
            reject({
              healthy: false,
              error: 'Invalid JSON response',
              data: data
            });
          }
        });
      });

      req.on('error', (error) => {
        reject({
          healthy: false,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          healthy: false,
          error: 'Health check timeout'
        });
      });

      req.end();
    });
  }

  async run() {
    try {
      console.log(`🏥 Checking health of Socket.IO server on port ${this.port}...`);
      
      const result = await this.checkHealth();
      
      console.log('✅ Server is healthy!');
      console.log('📊 Health data:', JSON.stringify(result.data, null, 2));
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Server health check failed!');
      console.error('Error:', error);
      
      process.exit(1);
    }
  }
}

// Run health check if called directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.run();
}

module.exports = { HealthChecker };