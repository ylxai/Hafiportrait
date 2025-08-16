/**
 * Health Check Script
 * Untuk Docker healthcheck dan monitoring
 */

const http = require('http');

const healthPort = process.env.HEALTH_PORT || 3002;
const host = process.env.HOST || 'localhost';

function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: host,
      port: healthPort,
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
          if (healthData.status === 'healthy') {
            console.log('✅ Health check passed:', healthData);
            resolve(healthData);
          } else {
            console.error('❌ Health check failed:', healthData);
            reject(new Error('Health check failed'));
          }
        } catch (error) {
          console.error('❌ Error parsing health response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Health check request failed:', error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('❌ Health check timeout');
      req.destroy();
      reject(new Error('Health check timeout'));
    });

    req.end();
  });
}

// Run health check
if (require.main === module) {
  checkHealth()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { checkHealth };