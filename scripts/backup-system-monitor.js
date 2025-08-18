#!/usr/bin/env node

/**
 * Backup System Monitor for HafiPortrait
 * Monitors Google Drive backup operations, storage usage, and backup integrity
 */

const fs = require('fs');
const path = require('path');

class BackupSystemMonitor {
  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      checkInterval: 60000, // 1 minute
      backupTimeoutThreshold: 300000, // 5 minutes
      logFile: path.join(__dirname, '../logs/backup-system.log')
    };

    this.metrics = {
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      avgBackupTime: 0,
      storageUsage: 0,
      lastBackupCheck: null,
      activeBackups: new Map(),
      backupQueue: []
    };

    this.startTime = new Date();
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
      data,
      metrics: this.getQuickMetrics()
    };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) console.log('Data:', JSON.stringify(data, null, 2));
    
    fs.appendFileSync(this.config.logFile, JSON.stringify(logEntry) + '\n');
  }

  getQuickMetrics() {
    const successRate = this.metrics.totalBackups > 0 ? 
      (this.metrics.successfulBackups / this.metrics.totalBackups * 100).toFixed(1) : 0;

    return {
      totalBackups: this.metrics.totalBackups,
      successRate: `${successRate}%`,
      avgBackupTimeMin: (this.metrics.avgBackupTime / 60000).toFixed(1),
      activeBackups: this.metrics.activeBackups.size,
      queuedBackups: this.metrics.backupQueue.length,
      storageUsageMB: (this.metrics.storageUsage / (1024 * 1024)).toFixed(1)
    };
  }

  async makeRequest(endpoint, options = {}) {
    const https = require('https');
    const http = require('http');
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const url = `${this.config.baseUrl}${endpoint}`;
      const isHttps = url.startsWith('https');
      const client = isHttps ? https : http;
      
      const req = client.request(url, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'HafiPortrait-BackupMonitor/1.0',
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 15000
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

  async checkBackupStatus() {
    try {
      const response = await this.makeRequest('/api/admin/backup/status');
      
      if (response.statusCode !== 200) {
        this.log('error', 'Failed to get backup status', { statusCode: response.statusCode });
        return null;
      }

      const backupData = JSON.parse(response.data);
      this.metrics.lastBackupCheck = new Date();
      
      this.log('info', 'Backup status checked', {
        activeBackups: backupData.activeBackups || 0,
        queuedBackups: backupData.queuedBackups || 0,
        lastBackup: backupData.lastBackup,
        storageUsed: backupData.storageUsed
      });

      return backupData;
    } catch (error) {
      this.log('error', 'Error checking backup status', { error: error.message });
      return null;
    }
  }

  async checkStorageUsage() {
    try {
      const response = await this.makeRequest('/api/admin/storage/status');
      
      if (response.statusCode !== 200) {
        this.log('error', 'Failed to get storage status', { statusCode: response.statusCode });
        return null;
      }

      const storageData = JSON.parse(response.data);
      this.metrics.storageUsage = storageData.usedSpace || 0;
      
      this.log('info', 'Storage usage checked', {
        usedSpace: storageData.usedSpace,
        totalSpace: storageData.totalSpace,
        usagePercent: storageData.usagePercent
      });

      return storageData;
    } catch (error) {
      this.log('error', 'Error checking storage usage', { error: error.message });
      return null;
    }
  }

  async getActiveEvents() {
    try {
      const response = await this.makeRequest('/api/admin/events');
      
      if (response.statusCode !== 200) {
        this.log('error', 'Failed to get events', { statusCode: response.statusCode });
        return [];
      }

      const events = JSON.parse(response.data);
      return events.filter(event => event.status === 'active' || event.status === 'completed');
    } catch (error) {
      this.log('error', 'Error getting active events', { error: error.message });
      return [];
    }
  }

  async checkEventBackups() {
    const events = await this.getActiveEvents();
    const backupChecks = [];

    for (const event of events) {
      try {
        const response = await this.makeRequest(`/api/admin/events/${event.id}/backup`);
        
        const backupInfo = {
          eventId: event.id,
          eventName: event.name,
          status: 'unknown',
          lastBackup: null,
          photoCount: 0
        };

        if (response.statusCode === 200) {
          const backupData = JSON.parse(response.data);
          backupInfo.status = backupData.status || 'unknown';
          backupInfo.lastBackup = backupData.lastBackup;
          backupInfo.photoCount = backupData.photoCount || 0;
        }

        backupChecks.push(backupInfo);
        
        this.log('debug', `Event backup checked: ${event.name}`, backupInfo);
      } catch (error) {
        this.log('warn', `Failed to check backup for event ${event.id}`, { error: error.message });
      }
    }

    return backupChecks;
  }

  async testBackupIntegrity() {
    try {
      // Test Google Drive connection
      const response = await this.makeRequest('/api/test/google-drive');
      
      if (response.statusCode === 200) {
        const testResult = JSON.parse(response.data);
        this.log('info', 'Backup integrity test completed', testResult);
        return testResult;
      } else {
        this.log('error', 'Backup integrity test failed', { statusCode: response.statusCode });
        return { success: false, error: 'API call failed' };
      }
    } catch (error) {
      this.log('error', 'Backup integrity test error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async monitorBackupProgress() {
    const backupStatus = await this.checkBackupStatus();
    
    if (backupStatus && backupStatus.activeBackups) {
      for (const backup of backupStatus.activeBackups) {
        const backupId = backup.eventId;
        const startTime = this.metrics.activeBackups.get(backupId);
        
        if (!startTime) {
          // New backup detected
          this.metrics.activeBackups.set(backupId, Date.now());
          this.log('info', 'New backup started', {
            eventId: backupId,
            photoCount: backup.photoCount
          });
        } else {
          // Check if backup is taking too long
          const duration = Date.now() - startTime;
          if (duration > this.config.backupTimeoutThreshold) {
            this.log('warn', 'Backup taking longer than expected', {
              eventId: backupId,
              duration: `${(duration / 60000).toFixed(1)} minutes`,
              threshold: `${(this.config.backupTimeoutThreshold / 60000)} minutes`
            });
          }
        }
      }
    }

    // Check for completed backups
    for (const [backupId, startTime] of this.metrics.activeBackups.entries()) {
      const isStillActive = backupStatus?.activeBackups?.some(b => b.eventId === backupId);
      
      if (!isStillActive) {
        // Backup completed or failed
        const duration = Date.now() - startTime;
        this.metrics.activeBackups.delete(backupId);
        this.metrics.totalBackups++;
        
        // Assume successful if no error reported
        this.metrics.successfulBackups++;
        
        // Update average backup time
        const totalTime = this.metrics.avgBackupTime * (this.metrics.totalBackups - 1) + duration;
        this.metrics.avgBackupTime = totalTime / this.metrics.totalBackups;
        
        this.log('info', 'Backup completed', {
          eventId: backupId,
          duration: `${(duration / 60000).toFixed(1)} minutes`,
          avgBackupTime: `${(this.metrics.avgBackupTime / 60000).toFixed(1)} minutes`
        });
      }
    }
  }

  generateBackupReport() {
    const uptime = Date.now() - this.startTime.getTime();
    const metrics = this.getQuickMetrics();
    
    const report = {
      timestamp: new Date().toISOString(),
      uptime: `${(uptime / (1000 * 60 * 60)).toFixed(2)} hours`,
      backupMetrics: {
        total: this.metrics.totalBackups,
        successful: this.metrics.successfulBackups,
        failed: this.metrics.failedBackups,
        successRate: metrics.successRate,
        averageTime: `${metrics.avgBackupTimeMin} minutes`,
        activeBackups: metrics.activeBackups,
        queuedBackups: metrics.queuedBackups
      },
      storage: {
        usedSpace: `${metrics.storageUsageMB} MB`,
        lastCheck: this.metrics.lastBackupCheck
      },
      alerts: this.generateBackupAlerts()
    };

    return report;
  }

  generateBackupAlerts() {
    const alerts = [];
    
    // Check backup success rate
    const successRate = this.metrics.totalBackups > 0 ? 
      this.metrics.successfulBackups / this.metrics.totalBackups : 1;
    
    if (successRate < 0.95 && this.metrics.totalBackups > 5) {
      alerts.push({
        type: 'backup_failure_rate',
        severity: 'high',
        message: `Backup success rate ${(successRate * 100).toFixed(1)}% is below 95%`
      });
    }

    // Check for long-running backups
    for (const [backupId, startTime] of this.metrics.activeBackups.entries()) {
      const duration = Date.now() - startTime;
      if (duration > this.config.backupTimeoutThreshold) {
        alerts.push({
          type: 'backup_timeout',
          severity: 'medium',
          message: `Backup for event ${backupId} has been running for ${(duration / 60000).toFixed(1)} minutes`
        });
      }
    }

    // Check average backup time
    if (this.metrics.avgBackupTime > this.config.backupTimeoutThreshold) {
      alerts.push({
        type: 'backup_slow',
        severity: 'medium',
        message: `Average backup time ${(this.metrics.avgBackupTime / 60000).toFixed(1)} minutes exceeds threshold`
      });
    }

    // Check storage usage (if over 80% of some assumed limit)
    const storageGB = this.metrics.storageUsage / (1024 * 1024 * 1024);
    if (storageGB > 8) { // Assuming 10GB limit, alert at 80%
      alerts.push({
        type: 'storage_usage_high',
        severity: 'medium',
        message: `Storage usage ${storageGB.toFixed(1)}GB is approaching limits`
      });
    }

    return alerts;
  }

  async runBackupSystemCheck() {
    this.log('info', 'Running backup system check...');
    
    const checks = await Promise.allSettled([
      this.checkBackupStatus(),
      this.checkStorageUsage(),
      this.checkEventBackups(),
      this.testBackupIntegrity()
    ]);

    const results = {
      backupStatus: checks[0].status === 'fulfilled' ? checks[0].value : null,
      storageStatus: checks[1].status === 'fulfilled' ? checks[1].value : null,
      eventBackups: checks[2].status === 'fulfilled' ? checks[2].value : [],
      integrityTest: checks[3].status === 'fulfilled' ? checks[3].value : null
    };

    await this.monitorBackupProgress();
    
    const report = this.generateBackupReport();
    report.checkResults = results;
    
    this.log('info', 'Backup system check completed', report);
    return report;
  }

  async startMonitoring() {
    this.log('info', 'Starting backup system monitoring...');

    // Run initial check
    await this.runBackupSystemCheck();

    // Set up periodic monitoring
    setInterval(async () => {
      try {
        await this.runBackupSystemCheck();
      } catch (error) {
        this.log('error', 'Backup monitoring cycle failed', { error: error.message });
      }
    }, this.config.checkInterval);

    this.log('info', 'Backup system monitoring started');
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new BackupSystemMonitor();
  
  const command = process.argv[2];
  
  if (command === 'start') {
    monitor.startMonitoring();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down backup monitor...');
      process.exit(0);
    });
    
  } else if (command === 'check') {
    monitor.runBackupSystemCheck().then(report => {
      console.log('\n=== BACKUP SYSTEM REPORT ===');
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    }).catch(error => {
      console.error('Backup system check failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  node backup-system-monitor.js start  # Start continuous monitoring');
    console.log('  node backup-system-monitor.js check  # Run single backup system check');
  }
}

module.exports = BackupSystemMonitor;