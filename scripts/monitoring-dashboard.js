#!/usr/bin/env node

/**
 * HafiPortrait Production Monitoring Dashboard
 * Centralized monitoring dashboard that combines all monitoring systems
 */

const ProductionMonitor = require('./production-monitoring');
const RealtimePerformanceMonitor = require('./realtime-performance-monitor');
const BackupSystemMonitor = require('./backup-system-monitor');
const fs = require('fs');
const path = require('path');

class MonitoringDashboard {
  constructor() {
    this.config = {
      dashboardPort: process.env.MONITORING_PORT || 3002,
      updateInterval: 30000, // 30 seconds
      logFile: path.join(__dirname, '../logs/monitoring-dashboard.log'),
      reportFile: path.join(__dirname, '../logs/dashboard-report.json')
    };

    this.monitors = {
      production: new ProductionMonitor(),
      realtime: new RealtimePerformanceMonitor(),
      backup: new BackupSystemMonitor()
    };

    this.dashboardData = {
      lastUpdate: null,
      systemStatus: 'unknown',
      overallHealth: 'unknown',
      alerts: [],
      metrics: {},
      reports: {}
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
      data
    };
    
    console.log(`[${timestamp}] DASHBOARD ${level.toUpperCase()}: ${message}`);
    if (data) console.log('Data:', JSON.stringify(data, null, 2));
    
    fs.appendFileSync(this.config.logFile, JSON.stringify(logEntry) + '\n');
  }

  async collectAllMetrics() {
    this.log('info', 'Collecting metrics from all monitoring systems...');
    
    const results = await Promise.allSettled([
      this.monitors.production.runOnce(),
      this.monitors.realtime.runPerformanceTest(),
      this.monitors.backup.runBackupSystemCheck()
    ]);

    const reports = {
      production: results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason?.message },
      realtime: results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason?.message },
      backup: results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason?.message }
    };

    this.dashboardData.reports = reports;
    this.dashboardData.lastUpdate = new Date().toISOString();
    
    return reports;
  }

  calculateOverallHealth() {
    const reports = this.dashboardData.reports;
    let healthScore = 0;
    let totalChecks = 0;

    // Production health (40% weight)
    if (reports.production && !reports.production.error) {
      const prodMetrics = reports.production.metrics;
      const errorRate = prodMetrics.totalTests > 0 ? 
        prodMetrics.failedTests / prodMetrics.totalTests : 0;
      
      if (errorRate <= 0.05) healthScore += 40;
      else if (errorRate <= 0.10) healthScore += 30;
      else if (errorRate <= 0.20) healthScore += 20;
      else healthScore += 10;
    }
    totalChecks += 40;

    // Realtime performance (30% weight)
    if (reports.realtime && !reports.realtime.error) {
      const rtPerf = reports.realtime.performance;
      const photoSyncGood = rtPerf.photoSync?.status === 'EXCELLENT' || rtPerf.photoSync?.status === 'GOOD';
      const wsConnected = rtPerf.websocket?.status === 'connected';
      
      if (photoSyncGood && wsConnected) healthScore += 30;
      else if (photoSyncGood || wsConnected) healthScore += 20;
      else healthScore += 10;
    }
    totalChecks += 30;

    // Backup system (30% weight)
    if (reports.backup && !reports.backup.error) {
      const backupMetrics = reports.backup.backupMetrics;
      const successRate = parseFloat(backupMetrics.successRate) || 0;
      
      if (successRate >= 95) healthScore += 30;
      else if (successRate >= 90) healthScore += 25;
      else if (successRate >= 80) healthScore += 20;
      else healthScore += 10;
    }
    totalChecks += 30;

    const healthPercentage = totalChecks > 0 ? (healthScore / totalChecks) * 100 : 0;
    
    if (healthPercentage >= 90) return 'excellent';
    else if (healthPercentage >= 80) return 'good';
    else if (healthPercentage >= 70) return 'fair';
    else if (healthPercentage >= 50) return 'poor';
    else return 'critical';
  }

  aggregateAlerts() {
    const allAlerts = [];
    const reports = this.dashboardData.reports;

    // Collect alerts from all systems
    if (reports.production?.alerts) {
      allAlerts.push(...reports.production.alerts.map(alert => ({
        ...alert,
        source: 'production',
        timestamp: new Date().toISOString()
      })));
    }

    if (reports.realtime?.alerts) {
      allAlerts.push(...reports.realtime.alerts.map(alert => ({
        ...alert,
        source: 'realtime',
        timestamp: new Date().toISOString()
      })));
    }

    if (reports.backup?.alerts) {
      allAlerts.push(...reports.backup.alerts.map(alert => ({
        ...alert,
        source: 'backup',
        timestamp: new Date().toISOString()
      })));
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allAlerts.sort((a, b) => (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4));

    return allAlerts;
  }

  generateDashboardSummary() {
    const reports = this.dashboardData.reports;
    const uptime = Date.now() - this.startTime.getTime();
    
    this.dashboardData.overallHealth = this.calculateOverallHealth();
    this.dashboardData.alerts = this.aggregateAlerts();
    
    const summary = {
      timestamp: new Date().toISOString(),
      uptime: `${(uptime / (1000 * 60 * 60)).toFixed(2)} hours`,
      overallHealth: this.dashboardData.overallHealth,
      systemStatus: this.dashboardData.systemStatus,
      totalAlerts: this.dashboardData.alerts.length,
      criticalAlerts: this.dashboardData.alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length,
      
      quickMetrics: {
        production: {
          status: reports.production?.error ? 'error' : 'ok',
          errorRate: reports.production?.metrics ? 
            `${((reports.production.metrics.failedTests / reports.production.metrics.totalTests) * 100 || 0).toFixed(1)}%` : 'unknown',
          avgResponseTime: reports.production?.metrics ? 
            `${reports.production.metrics.avgResponseTime.toFixed(0)}ms` : 'unknown'
        },
        
        realtime: {
          status: reports.realtime?.error ? 'error' : 'ok',
          photoSyncStatus: reports.realtime?.performance?.photoSync?.status || 'unknown',
          websocketStatus: reports.realtime?.performance?.websocket?.status || 'unknown'
        },
        
        backup: {
          status: reports.backup?.error ? 'error' : 'ok',
          successRate: reports.backup?.backupMetrics?.successRate || 'unknown',
          activeBackups: reports.backup?.backupMetrics?.activeBackups || 0
        }
      },
      
      detailedReports: reports
    };

    return summary;
  }

  saveDashboardReport(summary) {
    try {
      fs.writeFileSync(this.config.reportFile, JSON.stringify(summary, null, 2));
      this.log('debug', 'Dashboard report saved', { file: this.config.reportFile });
    } catch (error) {
      this.log('error', 'Failed to save dashboard report', { error: error.message });
    }
  }

  async updateDashboard() {
    try {
      await this.collectAllMetrics();
      const summary = this.generateDashboardSummary();
      this.saveDashboardReport(summary);
      
      this.log('info', 'Dashboard updated', {
        overallHealth: summary.overallHealth,
        totalAlerts: summary.totalAlerts,
        criticalAlerts: summary.criticalAlerts
      });

      return summary;
    } catch (error) {
      this.log('error', 'Dashboard update failed', { error: error.message });
      throw error;
    }
  }

  generateHealthReport() {
    const summary = this.generateDashboardSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 HAFIPORTRAIT PRODUCTION MONITORING DASHBOARD');
    console.log('='.repeat(60));
    console.log(`📊 Overall Health: ${this.getHealthEmoji(summary.overallHealth)} ${summary.overallHealth.toUpperCase()}`);
    console.log(`⏱️  System Uptime: ${summary.uptime}`);
    console.log(`🚨 Total Alerts: ${summary.totalAlerts} (${summary.criticalAlerts} critical/high)`);
    console.log(`🕐 Last Update: ${summary.timestamp}`);
    
    console.log('\n📈 QUICK METRICS:');
    console.log(`   Production API: ${this.getStatusEmoji(summary.quickMetrics.production.status)} Error Rate: ${summary.quickMetrics.production.errorRate}, Avg Response: ${summary.quickMetrics.production.avgResponseTime}`);
    console.log(`   Real-time Sync: ${this.getStatusEmoji(summary.quickMetrics.realtime.status)} Photo Sync: ${summary.quickMetrics.realtime.photoSyncStatus}, WebSocket: ${summary.quickMetrics.realtime.websocketStatus}`);
    console.log(`   Backup System:  ${this.getStatusEmoji(summary.quickMetrics.backup.status)} Success Rate: ${summary.quickMetrics.backup.successRate}, Active: ${summary.quickMetrics.backup.activeBackups}`);
    
    if (summary.totalAlerts > 0) {
      console.log('\n🚨 ACTIVE ALERTS:');
      summary.alerts.slice(0, 5).forEach(alert => {
        console.log(`   ${this.getSeverityEmoji(alert.severity)} [${alert.source.toUpperCase()}] ${alert.message}`);
      });
      
      if (summary.totalAlerts > 5) {
        console.log(`   ... and ${summary.totalAlerts - 5} more alerts`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    return summary;
  }

  getHealthEmoji(health) {
    const emojis = {
      excellent: '🟢',
      good: '🟡',
      fair: '🟠',
      poor: '🔴',
      critical: '💀'
    };
    return emojis[health] || '❓';
  }

  getStatusEmoji(status) {
    return status === 'ok' ? '✅' : '❌';
  }

  getSeverityEmoji(severity) {
    const emojis = {
      critical: '💀',
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    return emojis[severity] || '❓';
  }

  async startDashboard() {
    this.log('info', 'Starting monitoring dashboard...');
    
    // Run initial update
    await this.updateDashboard();
    
    // Set up periodic updates
    setInterval(async () => {
      try {
        await this.updateDashboard();
      } catch (error) {
        this.log('error', 'Dashboard update cycle failed', { error: error.message });
      }
    }, this.config.updateInterval);

    // Generate health report every 5 minutes
    setInterval(() => {
      this.generateHealthReport();
    }, 5 * 60 * 1000);

    this.log('info', 'Monitoring dashboard started', {
      updateInterval: `${this.config.updateInterval / 1000}s`,
      reportFile: this.config.reportFile
    });
  }

  async runOnce() {
    return await this.updateDashboard();
  }
}

// CLI interface
if (require.main === module) {
  const dashboard = new MonitoringDashboard();
  
  const command = process.argv[2];
  
  if (command === 'start') {
    dashboard.startDashboard();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down monitoring dashboard...');
      process.exit(0);
    });
    
  } else if (command === 'report') {
    dashboard.runOnce().then(() => {
      dashboard.generateHealthReport();
      process.exit(0);
    }).catch(error => {
      console.error('Dashboard report failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  node monitoring-dashboard.js start   # Start continuous monitoring dashboard');
    console.log('  node monitoring-dashboard.js report  # Generate single health report');
    console.log('');
    console.log('Environment variables:');
    console.log('  MONITORING_PORT - Port for monitoring dashboard (default: 3002)');
  }
}

module.exports = MonitoringDashboard;