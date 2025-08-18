#!/usr/bin/env node

/**
 * CI/CD Monitoring Integration untuk HafiPortrait
 * Script untuk integrasi monitoring dengan pipeline CI/CD
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class CIMonitoringIntegration {
  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000',
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || process.env.CI_COMMIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || process.env.VERCEL_ENV || 'development',
      branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.CI_COMMIT_REF_NAME || 'unknown',
      timeout: 30000, // 30 detik
      maxRetries: 5,
      retryDelay: 10000, // 10 detik
      healthChecks: [
        { name: 'api', endpoint: '/api/health', critical: true },
        { name: 'database', endpoint: '/api/test/db', critical: true },
        { name: 'storage', endpoint: '/api/admin/storage/status', critical: false },
        { name: 'monitoring', endpoint: '/api/monitoring/health', critical: false }
      ],
      notifications: {
        slack: process.env.SLACK_WEBHOOK,
        discord: process.env.DISCORD_WEBHOOK
      }
    };
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      deployment: this.config.deploymentId,
      environment: this.config.environment,
      branch: this.config.branch,
      data
    };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) console.log('Data:', JSON.stringify(data, null, 2));
    
    return logEntry;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
      const isHttps = fullUrl.startsWith('https');
      const client = isHttps ? https : http;
      
      const req = client.request(fullUrl, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'HafiPortrait-CI-Monitor/1.0',
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: this.config.timeout
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime,
            url: fullUrl
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error(`Request timeout after ${this.config.timeout}ms`)));
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  async waitForDeployment() {
    this.log('info', 'Waiting for deployment to be ready...');
    
    let attempts = 0;
    while (attempts < this.config.maxRetries) {
      try {
        const response = await this.makeRequest('/api/health');
        
        if (response.statusCode === 200) {
          this.log('info', 'Deployment is ready', {
            responseTime: response.responseTime,
            attempt: attempts + 1
          });
          return true;
        }
        
        this.log('warning', `Deployment not ready yet (attempt ${attempts + 1}/${this.config.maxRetries})`, {
          statusCode: response.statusCode,
          responseTime: response.responseTime
        });
        
      } catch (error) {
        this.log('warning', `Health check failed (attempt ${attempts + 1}/${this.config.maxRetries})`, {
          error: error.message
        });
      }
      
      attempts++;
      if (attempts < this.config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }
    
    throw new Error(`Deployment failed to become ready after ${this.config.maxRetries} attempts`);
  }

  async runHealthChecks() {
    this.log('info', 'Running post-deployment health checks...');
    
    const results = [];
    
    for (const check of this.config.healthChecks) {
      try {
        const response = await this.makeRequest(check.endpoint);
        const isHealthy = response.statusCode >= 200 && response.statusCode < 300;
        
        const result = {
          name: check.name,
          endpoint: check.endpoint,
          status: isHealthy ? 'passed' : 'failed',
          critical: check.critical,
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          url: response.url
        };
        
        if (!isHealthy && response.data) {
          try {
            result.error = JSON.parse(response.data);
          } catch {
            result.error = response.data;
          }
        }
        
        results.push(result);
        
        this.log(isHealthy ? 'info' : 'error', 
          `Health check ${check.name}: ${result.status}`, result);
        
      } catch (error) {
        const result = {
          name: check.name,
          endpoint: check.endpoint,
          status: 'failed',
          critical: check.critical,
          error: error.message,
          responseTime: 0
        };
        
        results.push(result);
        this.log('error', `Health check ${check.name} failed`, result);
      }
    }
    
    return results;
  }

  async runSmokeTests() {
    this.log('info', 'Running smoke tests...');
    
    const tests = [
      {
        name: 'Homepage Load',
        test: async () => {
          const response = await this.makeRequest('/');
          return response.statusCode === 200;
        }
      },
      {
        name: 'API Ping',
        test: async () => {
          const response = await this.makeRequest('/api/ping');
          return response.statusCode === 200;
        }
      },
      {
        name: 'Admin Login Page',
        test: async () => {
          const response = await this.makeRequest('/admin/login');
          return response.statusCode === 200;
        }
      }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const startTime = Date.now();
        const passed = await test.test();
        const responseTime = Date.now() - startTime;
        
        const result = {
          name: test.name,
          status: passed ? 'passed' : 'failed',
          responseTime
        };
        
        results.push(result);
        this.log(passed ? 'info' : 'error', `Smoke test ${test.name}: ${result.status}`, result);
        
      } catch (error) {
        const result = {
          name: test.name,
          status: 'failed',
          error: error.message,
          responseTime: 0
        };
        
        results.push(result);
        this.log('error', `Smoke test ${test.name} failed`, result);
      }
    }
    
    return results;
  }

  async sendDeploymentNotification(success, healthResults, smokeResults) {
    const emoji = success ? '✅' : '❌';
    const status = success ? 'SUCCESS' : 'FAILED';
    
    const message = {
      text: `${emoji} HafiPortrait Deployment ${status}`,
      attachments: [{
        color: success ? 'good' : 'danger',
        fields: [
          { title: 'Environment', value: this.config.environment, short: true },
          { title: 'Branch', value: this.config.branch, short: true },
          { title: 'Deployment ID', value: this.config.deploymentId, short: true },
          { title: 'URL', value: this.config.baseUrl, short: true }
        ]
      }]
    };

    // Add health check results
    if (healthResults.length > 0) {
      const healthSummary = healthResults.map(result => 
        `${result.status === 'passed' ? '✅' : '❌'} ${result.name} (${result.responseTime}ms)`
      ).join('\n');
      
      message.attachments[0].fields.push({
        title: 'Health Checks',
        value: healthSummary,
        short: false
      });
    }

    // Add smoke test results
    if (smokeResults.length > 0) {
      const smokeSummary = smokeResults.map(result => 
        `${result.status === 'passed' ? '✅' : '❌'} ${result.name} (${result.responseTime}ms)`
      ).join('\n');
      
      message.attachments[0].fields.push({
        title: 'Smoke Tests',
        value: smokeSummary,
        short: false
      });
    }

    // Send to Slack
    if (this.config.notifications.slack) {
      try {
        await this.makeRequest(this.config.notifications.slack, {
          method: 'POST',
          body: message
        });
        this.log('info', 'Slack notification sent');
      } catch (error) {
        this.log('error', 'Failed to send Slack notification', error);
      }
    }

    // Send to Discord
    if (this.config.notifications.discord) {
      try {
        const discordMessage = {
          embeds: [{
            title: `${emoji} HafiPortrait Deployment ${status}`,
            color: success ? 0x00ff00 : 0xff0000,
            fields: message.attachments[0].fields.map(field => ({
              name: field.title,
              value: field.value,
              inline: field.short
            })),
            timestamp: new Date().toISOString()
          }]
        };

        await this.makeRequest(this.config.notifications.discord, {
          method: 'POST',
          body: discordMessage
        });
        this.log('info', 'Discord notification sent');
      } catch (error) {
        this.log('error', 'Failed to send Discord notification', error);
      }
    }
  }

  async run() {
    try {
      this.log('info', 'Starting CI monitoring integration', {
        baseUrl: this.config.baseUrl,
        environment: this.config.environment,
        deploymentId: this.config.deploymentId,
        branch: this.config.branch
      });

      // Wait for deployment to be ready
      await this.waitForDeployment();

      // Run health checks
      const healthResults = await this.runHealthChecks();

      // Run smoke tests
      const smokeResults = await this.runSmokeTests();

      // Check if deployment is successful
      const criticalHealthFailed = healthResults.some(result => 
        result.critical && result.status === 'failed'
      );
      const smokeTestsFailed = smokeResults.some(result => 
        result.status === 'failed'
      );

      const success = !criticalHealthFailed && !smokeTestsFailed;

      // Send notification
      await this.sendDeploymentNotification(success, healthResults, smokeResults);

      // Generate summary
      const summary = {
        success,
        deployment: {
          id: this.config.deploymentId,
          environment: this.config.environment,
          branch: this.config.branch,
          url: this.config.baseUrl
        },
        healthChecks: {
          total: healthResults.length,
          passed: healthResults.filter(r => r.status === 'passed').length,
          failed: healthResults.filter(r => r.status === 'failed').length,
          results: healthResults
        },
        smokeTests: {
          total: smokeResults.length,
          passed: smokeResults.filter(r => r.status === 'passed').length,
          failed: smokeResults.filter(r => r.status === 'failed').length,
          results: smokeResults
        }
      };

      this.log('info', 'CI monitoring integration completed', summary);

      // Exit with appropriate code
      process.exit(success ? 0 : 1);

    } catch (error) {
      this.log('error', 'CI monitoring integration failed', { error: error.message });
      
      // Send failure notification
      await this.sendDeploymentNotification(false, [], []);
      
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const integration = new CIMonitoringIntegration();
  integration.run();
}

module.exports = CIMonitoringIntegration;