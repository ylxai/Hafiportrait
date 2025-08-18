#!/usr/bin/env node

/**
 * HafiPortrait Production Monitoring Script
 * Automated testing and monitoring for production environment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class ProductionMonitor {
  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      testInterval: 30000, // 30 seconds
      alertThreshold: {
        responseTime: 5000, // 5 seconds
        errorRate: 0.05, // 5%
        backupTime: 300000 // 5 minutes
      },
      logFile: path.join(__dirname, '../logs/production-monitor.log')
    };
    
    this.metrics = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      avgResponseTime: 0,
      lastBackupTime: null,
      systemHealth: 'unknown'
    };

    this.testResults = [];
    this.startTime = new Date();
    
    // Ensure logs directory exists
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.config.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) console.log('Data:', data);
    
    // Write to log file
    fs.appendFileSync(this.config.logFile, JSON.stringify(logEntry) + '\n');
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const url = `${this.config.baseUrl}${endpoint}`;
      const isHttps = url.startsWith('https');
      const client = isHttps ? https : http;
      
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'HafiPortrait-Monitor/1.0',
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  async testHealthEndpoint() {
    try {
      const response = await this.makeRequest('/api/health');
      const success = response.statusCode === 200;
      
      this.recordTest('health-check', success, response.responseTime, {
        statusCode: response.statusCode,
        responseTime: response.responseTime
      });

      return success;
    } catch (error) {
      this.recordTest('health-check', false, null, { error: error.message });
      return false;
    }
  }

  async testDatabaseConnection() {
    try {
      const response = await this.makeRequest('/api/test/db');
      const success = response.statusCode === 200;
      
      let dbData = null;
      try {
        dbData = JSON.parse(response.data);
      } catch (e) {
        // Ignore JSON parse errors
      }

      this.recordTest('database-connection', success, response.responseTime, {
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        dbStatus: dbData?.status
      });

      return success;
    } catch (error) {
      this.recordTest('database-connection', false, null, { error: error.message });
      return false;
    }
  }

  async testEventAPI() {
    try {
      const response = await this.makeRequest('/api/events');
      const success = response.statusCode === 200;
      
      let eventsData = null;
      try {
        eventsData = JSON.parse(response.data);
      } catch (e) {
        // Ignore JSON parse errors
      }

      this.recordTest('events-api', success, response.responseTime, {
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        eventCount: Array.isArray(eventsData) ? eventsData.length : 0
      });

      return success;
    } catch (error) {
      this.recordTest('events-api', false, null, { error: error.message });
      return false;
    }
  }

  async testBackupSystem() {
    try {
      const response = await this.makeRequest('/api/admin/backup/status');
      const success = response.statusCode === 200;
      
      let backupData = null;
      try {
        backupData = JSON.parse(response.data);
      } catch (e) {
        // Ignore JSON parse errors
      }

      this.recordTest('backup-system', success, response.responseTime, {
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        backupStatus: backupData?.status,
        lastBackup: backupData?.lastBackup
      });

      if (backupData?.lastBackup) {
        this.metrics.lastBackupTime = new Date(backupData.lastBackup);
      }

      return success;
    } catch (error) {
      this.recordTest('backup-system', false, null, { error: error.message });
      return false;
    }
  }

  async testStorageSystem() {
    try {
      const response = await this.makeRequest('/api/admin/storage/status');
      const success = response.statusCode === 200;
      
      let storageData = null;
      try {
        storageData = JSON.parse(response.data);
      } catch (e) {
        // Ignore JSON parse errors
      }

      this.recordTest('storage-system', success, response.responseTime, {
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        storageStatus: storageData?.status,
        usedSpace: storageData?.usedSpace,
        totalSpace: storageData?.totalSpace
      });

      return success;
    } catch (error) {
      this.recordTest('storage-system', false, null, { error: error.message });
      return false;
    }
  }

  recordTest(testName, passed, responseTime, metadata = {}) {
    this.metrics.totalTests++;
    if (passed) {
      this.metrics.passedTests++;
    } else {
      this.metrics.failedTests++;
    }

    // Update average response time
    if (responseTime) {
      const totalResponseTime = this.metrics.avgResponseTime * (this.metrics.totalTests - 1) + responseTime;
      this.metrics.avgResponseTime = totalResponseTime / this.metrics.totalTests;
    }

    const testResult = {
      timestamp: new Date().toISOString(),
      testName,
      passed,
      responseTime,
      metadata
    };

    this.testResults.push(testResult);
    
    // Keep only last 100 test results
    if (this.testResults.length > 100) {
      this.testResults = this.testResults.slice(-100);
    }

    this.log(passed ? 'info' : 'error', `Test ${testName}: ${passed ? 'PASSED' : 'FAILED'}`, {
      responseTime,
      metadata
    });
  }

  calculateSystemHealth() {
    const recentTests = this.testResults.slice(-20); // Last 20 tests
    if (recentTests.length === 0) return 'unknown';

    const passRate = recentTests.filter(t => t.passed).length / recentTests.length;
    const avgResponseTime = recentTests
      .filter(t => t.responseTime)
      .reduce((sum, t) => sum + t.responseTime, 0) / recentTests.length;

    if (passRate >= 0.95 && avgResponseTime < this.config.alertThreshold.responseTime) {
      return 'excellent';
    } else if (passRate >= 0.90 && avgResponseTime < this.config.alertThreshold.responseTime * 1.5) {
      return 'good';
    } else if (passRate >= 0.80) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  generateReport() {
    const uptime = Date.now() - this.startTime.getTime();
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
    
    this.metrics.systemHealth = this.calculateSystemHealth();
    
    const report = {
      timestamp: new Date().toISOString(),
      uptime: `${uptimeHours} hours`,
      metrics: this.metrics,
      recentTests: this.testResults.slice(-10),
      alerts: this.generateAlerts()
    };

    return report;
  }

  generateAlerts() {
    const alerts = [];
    
    // Check error rate
    const errorRate = this.metrics.totalTests > 0 ? 
      this.metrics.failedTests / this.metrics.totalTests : 0;
    
    if (errorRate > this.config.alertThreshold.errorRate) {
      alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: `Error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold ${(this.config.alertThreshold.errorRate * 100)}%`
      });
    }

    // Check response time
    if (this.metrics.avgResponseTime > this.config.alertThreshold.responseTime) {
      alerts.push({
        type: 'response_time',
        severity: 'medium',
        message: `Average response time ${this.metrics.avgResponseTime.toFixed(0)}ms exceeds threshold ${this.config.alertThreshold.responseTime}ms`
      });
    }

    // Check backup freshness
    if (this.metrics.lastBackupTime) {
      const backupAge = Date.now() - this.metrics.lastBackupTime.getTime();
      if (backupAge > 24 * 60 * 60 * 1000) { // 24 hours
        alerts.push({
          type: 'backup_age',
          severity: 'medium',
          message: `Last backup is ${(backupAge / (1000 * 60 * 60)).toFixed(1)} hours old`
        });
      }
    }

    return alerts;
  }

  async runTestSuite() {
    this.log('info', 'Starting production monitoring test suite...');
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealthEndpoint() },
      { name: 'Database Connection', fn: () => this.testDatabaseConnection() },
      { name: 'Events API', fn: () => this.testEventAPI() },
      { name: 'Backup System', fn: () => this.testBackupSystem() },
      { name: 'Storage System', fn: () => this.testStorageSystem() }
    ];

    let passedCount = 0;
    
    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) passedCount++;
      } catch (error) {
        this.log('error', `Test ${test.name} threw exception`, { error: error.message });
      }
    }

    const report = this.generateReport();
    this.log('info', `Test suite completed: ${passedCount}/${tests.length} tests passed`, report);
    
    return report;
  }

  async startMonitoring() {
    this.log('info', 'Production monitoring started', {
      baseUrl: this.config.baseUrl,
      interval: this.config.testInterval
    });

    // Run initial test
    await this.runTestSuite();

    // Set up periodic monitoring
    setInterval(async () => {
      try {
        await this.runTestSuite();
      } catch (error) {
        this.log('error', 'Monitoring cycle failed', { error: error.message });
      }
    }, this.config.testInterval);

    // Set up report generation every 5 minutes
    setInterval(() => {
      const report = this.generateReport();
      this.log('info', 'Periodic report generated', report);
    }, 5 * 60 * 1000);
  }

  async runOnce() {
    return await this.runTestSuite();
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new ProductionMonitor();
  
  const command = process.argv[2];
  
  if (command === 'start') {
    monitor.startMonitoring();
  } else if (command === 'test') {
    monitor.runOnce().then(report => {
      console.log('\n=== PRODUCTION MONITORING REPORT ===');
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    }).catch(error => {
      console.error('Monitoring failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  node production-monitoring.js start  # Start continuous monitoring');
    console.log('  node production-monitoring.js test   # Run single test suite');
  }
}

module.exports = ProductionMonitor;