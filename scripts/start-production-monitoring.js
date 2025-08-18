#!/usr/bin/env node

/**
 * Master Production Monitoring Script
 * Starts all monitoring systems for HafiPortrait production environment
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionMonitoringManager {
  constructor() {
    this.config = {
      logDir: path.join(__dirname, '../logs'),
      pidFile: path.join(__dirname, '../logs/monitoring.pid'),
      processes: []
    };

    this.monitoringScripts = [
      {
        name: 'production-monitor',
        script: 'production-monitoring.js',
        args: ['start'],
        description: 'Core production API monitoring'
      },
      {
        name: 'realtime-monitor',
        script: 'realtime-performance-monitor.js',
        args: ['start'],
        description: 'Real-time performance and WebSocket monitoring'
      },
      {
        name: 'backup-monitor',
        script: 'backup-system-monitor.js',
        args: ['start'],
        description: 'Backup system and storage monitoring'
      },
      {
        name: 'dashboard',
        script: 'monitoring-dashboard.js',
        args: ['start'],
        description: 'Centralized monitoring dashboard'
      }
    ];

    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] MANAGER: ${message}`);
    if (data) console.log('Data:', data);
  }

  async startMonitoringProcess(monitor) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, monitor.script);
      
      if (!fs.existsSync(scriptPath)) {
        reject(new Error(`Script not found: ${scriptPath}`));
        return;
      }

      this.log(`Starting ${monitor.name}...`, { script: monitor.script });

      const logFile = path.join(this.config.logDir, `${monitor.name}.log`);
      const errorFile = path.join(this.config.logDir, `${monitor.name}.error.log`);

      const child = spawn('node', [scriptPath, ...monitor.args], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      // Setup logging
      const logStream = fs.createWriteStream(logFile, { flags: 'a' });
      const errorStream = fs.createWriteStream(errorFile, { flags: 'a' });

      child.stdout.pipe(logStream);
      child.stderr.pipe(errorStream);

      child.on('spawn', () => {
        this.log(`✅ ${monitor.name} started successfully`, { 
          pid: child.pid,
          logFile,
          errorFile
        });

        this.config.processes.push({
          ...monitor,
          pid: child.pid,
          process: child,
          startTime: new Date(),
          logFile,
          errorFile
        });

        resolve(child);
      });

      child.on('error', (error) => {
        this.log(`❌ Failed to start ${monitor.name}`, { error: error.message });
        reject(error);
      });

      child.on('exit', (code, signal) => {
        this.log(`⚠️  ${monitor.name} exited`, { code, signal, pid: child.pid });
        
        // Remove from processes list
        this.config.processes = this.config.processes.filter(p => p.pid !== child.pid);
        
        // Auto-restart if not intentional shutdown
        if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
          this.log(`🔄 Auto-restarting ${monitor.name} in 5 seconds...`);
          setTimeout(() => {
            this.startMonitoringProcess(monitor).catch(error => {
              this.log(`❌ Failed to restart ${monitor.name}`, { error: error.message });
            });
          }, 5000);
        }
      });
    });
  }

  async startAllMonitoring() {
    this.log('🚀 Starting HafiPortrait Production Monitoring System...');
    
    // Check environment
    this.checkEnvironment();
    
    // Start all monitoring processes
    const startPromises = this.monitoringScripts.map(monitor => 
      this.startMonitoringProcess(monitor).catch(error => {
        this.log(`Failed to start ${monitor.name}`, { error: error.message });
        return null;
      })
    );

    const results = await Promise.allSettled(startPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    
    this.log(`📊 Monitoring startup complete: ${successful}/${this.monitoringScripts.length} processes started`);
    
    // Save PID file
    this.savePidFile();
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
    
    // Display status
    this.displayStatus();
    
    return successful === this.monitoringScripts.length;
  }

  checkEnvironment() {
    const requiredEnvVars = [
      'NEXT_PUBLIC_APP_URL',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      this.log('⚠️  Missing environment variables', { missing });
      console.log('Please ensure these environment variables are set:');
      missing.forEach(envVar => console.log(`  - ${envVar}`));
    } else {
      this.log('✅ Environment variables check passed');
    }
  }

  savePidFile() {
    const pidData = {
      masterPid: process.pid,
      startTime: new Date().toISOString(),
      processes: this.config.processes.map(p => ({
        name: p.name,
        pid: p.pid,
        startTime: p.startTime,
        logFile: p.logFile,
        errorFile: p.errorFile
      }))
    };

    fs.writeFileSync(this.config.pidFile, JSON.stringify(pidData, null, 2));
    this.log('📝 PID file saved', { file: this.config.pidFile });
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      this.log(`🛑 Received ${signal}, shutting down monitoring system...`);
      
      // Stop all child processes
      this.config.processes.forEach(proc => {
        this.log(`Stopping ${proc.name} (PID: ${proc.pid})`);
        try {
          proc.process.kill('SIGTERM');
        } catch (error) {
          this.log(`Failed to stop ${proc.name}`, { error: error.message });
        }
      });

      // Wait for processes to exit
      setTimeout(() => {
        // Force kill if still running
        this.config.processes.forEach(proc => {
          try {
            proc.process.kill('SIGKILL');
          } catch (error) {
            // Process already dead
          }
        });

        // Clean up PID file
        if (fs.existsSync(this.config.pidFile)) {
          fs.unlinkSync(this.config.pidFile);
        }

        this.log('✅ Monitoring system shutdown complete');
        process.exit(0);
      }, 5000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  displayStatus() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 HAFIPORTRAIT PRODUCTION MONITORING ACTIVE');
    console.log('='.repeat(60));
    console.log(`📊 Master Process: PID ${process.pid}`);
    console.log(`📁 Log Directory: ${this.config.logDir}`);
    console.log(`📝 PID File: ${this.config.pidFile}`);
    console.log('\n📋 ACTIVE MONITORING PROCESSES:');
    
    this.config.processes.forEach(proc => {
      console.log(`   ✅ ${proc.name.padEnd(20)} PID: ${proc.pid.toString().padEnd(8)} ${proc.description}`);
    });
    
    console.log('\n🔧 MANAGEMENT COMMANDS:');
    console.log('   node start-production-monitoring.js status   # Show current status');
    console.log('   node start-production-monitoring.js stop     # Stop all monitoring');
    console.log('   node start-production-monitoring.js restart  # Restart all monitoring');
    console.log('   node start-production-monitoring.js logs     # Show recent logs');
    
    console.log('\n📊 MONITORING ENDPOINTS:');
    console.log(`   Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`);
    console.log(`   Health Check: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`);
    console.log(`   Logs: ${this.config.logDir}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Monitoring system is now active. Press Ctrl+C to stop.');
  }

  async showStatus() {
    if (!fs.existsSync(this.config.pidFile)) {
      console.log('❌ Monitoring system is not running (no PID file found)');
      return false;
    }

    try {
      const pidData = JSON.parse(fs.readFileSync(this.config.pidFile, 'utf8'));
      
      console.log('\n📊 MONITORING SYSTEM STATUS:');
      console.log(`Master PID: ${pidData.masterPid}`);
      console.log(`Started: ${pidData.startTime}`);
      console.log(`Uptime: ${this.getUptime(pidData.startTime)}`);
      
      console.log('\n📋 PROCESSES:');
      pidData.processes.forEach(proc => {
        const isRunning = this.isProcessRunning(proc.pid);
        const status = isRunning ? '✅ RUNNING' : '❌ STOPPED';
        console.log(`   ${proc.name.padEnd(20)} PID: ${proc.pid.toString().padEnd(8)} ${status}`);
      });
      
      return true;
    } catch (error) {
      console.log('❌ Failed to read monitoring status:', error.message);
      return false;
    }
  }

  async stopMonitoring() {
    if (!fs.existsSync(this.config.pidFile)) {
      console.log('❌ Monitoring system is not running');
      return false;
    }

    try {
      const pidData = JSON.parse(fs.readFileSync(this.config.pidFile, 'utf8'));
      
      console.log('🛑 Stopping monitoring system...');
      
      // Stop master process
      if (this.isProcessRunning(pidData.masterPid)) {
        process.kill(pidData.masterPid, 'SIGTERM');
        console.log(`✅ Stopped master process (PID: ${pidData.masterPid})`);
      }
      
      // Stop individual processes
      pidData.processes.forEach(proc => {
        if (this.isProcessRunning(proc.pid)) {
          process.kill(proc.pid, 'SIGTERM');
          console.log(`✅ Stopped ${proc.name} (PID: ${proc.pid})`);
        }
      });
      
      // Clean up PID file
      fs.unlinkSync(this.config.pidFile);
      console.log('✅ Monitoring system stopped');
      
      return true;
    } catch (error) {
      console.log('❌ Failed to stop monitoring system:', error.message);
      return false;
    }
  }

  isProcessRunning(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  getUptime(startTime) {
    const uptime = Date.now() - new Date(startTime).getTime();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  async showLogs() {
    const logFiles = fs.readdirSync(this.config.logDir)
      .filter(file => file.endsWith('.log'))
      .map(file => path.join(this.config.logDir, file));

    if (logFiles.length === 0) {
      console.log('❌ No log files found');
      return;
    }

    console.log('📋 RECENT LOG ENTRIES:');
    
    for (const logFile of logFiles.slice(0, 5)) {
      const fileName = path.basename(logFile);
      console.log(`\n--- ${fileName} ---`);
      
      try {
        const content = fs.readFileSync(logFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const recentLines = lines.slice(-10);
        
        recentLines.forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            console.log(`[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`);
          } catch (e) {
            console.log(line);
          }
        });
      } catch (error) {
        console.log(`❌ Failed to read ${fileName}: ${error.message}`);
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const manager = new ProductionMonitoringManager();
  const command = process.argv[2] || 'start';
  
  switch (command) {
    case 'start':
      manager.startAllMonitoring().catch(error => {
        console.error('❌ Failed to start monitoring system:', error);
        process.exit(1);
      });
      break;
      
    case 'status':
      manager.showStatus().then(success => {
        process.exit(success ? 0 : 1);
      });
      break;
      
    case 'stop':
      manager.stopMonitoring().then(success => {
        process.exit(success ? 0 : 1);
      });
      break;
      
    case 'restart':
      manager.stopMonitoring().then(() => {
        setTimeout(() => {
          manager.startAllMonitoring().catch(error => {
            console.error('❌ Failed to restart monitoring system:', error);
            process.exit(1);
          });
        }, 2000);
      });
      break;
      
    case 'logs':
      manager.showLogs();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node start-production-monitoring.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  start    # Start all monitoring systems (default)');
      console.log('  status   # Show current monitoring status');
      console.log('  stop     # Stop all monitoring systems');
      console.log('  restart  # Restart all monitoring systems');
      console.log('  logs     # Show recent log entries');
  }
}

module.exports = ProductionMonitoringManager;