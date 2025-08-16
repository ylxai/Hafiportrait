#!/usr/bin/env node

/**
 * Rovodev Performance Monitor
 * Monitor token usage, response time, dan efisiensi operasi
 */

const fs = require('fs');
const path = require('path');

class RovodevPerformanceMonitor {
  constructor() {
    this.logPath = '/home/ubuntu/.rovodev/rovodev.log';
    this.metricsPath = '/home/ubuntu/.rovodev/performance-metrics.json';
    this.sessionPath = '/home/ubuntu/.rovodev/sessions';
  }

  // Analisis log untuk token usage dan response time
  async analyzeLogFile() {
    try {
      if (!fs.existsSync(this.logPath)) {
        console.log('❌ Log file tidak ditemukan');
        return null;
      }

      const logContent = fs.readFileSync(this.logPath, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      const metrics = {
        totalRequests: 0,
        tokenUsage: [],
        responseTimes: [],
        errorCount: 0,
        toolCalls: [],
        sessionCount: 0,
        lastAnalyzed: new Date().toISOString()
      };

      // Parse log entries
      lines.forEach(line => {
        try {
          // Cari pattern token usage
          if (line.includes('token') || line.includes('usage')) {
            const tokenMatch = line.match(/(\d+)\s*token/i);
            if (tokenMatch) {
              metrics.tokenUsage.push(parseInt(tokenMatch[1]));
            }
          }

          // Cari pattern response time
          if (line.includes('response') || line.includes('time')) {
            const timeMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:ms|seconds?)/i);
            if (timeMatch) {
              metrics.responseTimes.push(parseFloat(timeMatch[1]));
            }
          }

          // Cari pattern tool calls
          if (line.includes('tool') || line.includes('function')) {
            const toolMatch = line.match(/(\w+_\w+|\w+)/);
            if (toolMatch) {
              metrics.toolCalls.push(toolMatch[1]);
            }
          }

          // Cari pattern error
          if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')) {
            metrics.errorCount++;
          }

          metrics.totalRequests++;
        } catch (e) {
          // Skip malformed lines
        }
      });

      return metrics;
    } catch (error) {
      console.error('❌ Error analyzing log:', error.message);
      return null;
    }
  }

  // Analisis session files
  async analyzeSessionData() {
    try {
      if (!fs.existsSync(this.sessionPath)) {
        return { sessionCount: 0, avgSessionLength: 0 };
      }

      const sessions = fs.readdirSync(this.sessionPath);
      let totalInteractions = 0;
      let sessionCount = 0;

      sessions.forEach(sessionDir => {
        const sessionFullPath = path.join(this.sessionPath, sessionDir);
        if (fs.statSync(sessionFullPath).isDirectory()) {
          sessionCount++;
          
          // Coba baca file session untuk hitung interaksi
          try {
            const files = fs.readdirSync(sessionFullPath);
            totalInteractions += files.length;
          } catch (e) {
            // Skip jika tidak bisa dibaca
          }
        }
      });

      return {
        sessionCount,
        avgSessionLength: sessionCount > 0 ? Math.round(totalInteractions / sessionCount) : 0,
        totalInteractions
      };
    } catch (error) {
      console.error('❌ Error analyzing sessions:', error.message);
      return { sessionCount: 0, avgSessionLength: 0 };
    }
  }

  // Hitung statistik performance
  calculateStats(metrics) {
    const stats = {
      tokenStats: {
        total: metrics.tokenUsage.reduce((a, b) => a + b, 0),
        average: metrics.tokenUsage.length > 0 ? 
          Math.round(metrics.tokenUsage.reduce((a, b) => a + b, 0) / metrics.tokenUsage.length) : 0,
        max: metrics.tokenUsage.length > 0 ? Math.max(...metrics.tokenUsage) : 0,
        min: metrics.tokenUsage.length > 0 ? Math.min(...metrics.tokenUsage) : 0
      },
      responseStats: {
        average: metrics.responseTimes.length > 0 ? 
          Math.round(metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length) : 0,
        max: metrics.responseTimes.length > 0 ? Math.max(...metrics.responseTimes) : 0,
        min: metrics.responseTimes.length > 0 ? Math.min(...metrics.responseTimes) : 0
      },
      toolStats: {
        totalCalls: metrics.toolCalls.length,
        uniqueTools: [...new Set(metrics.toolCalls)].length,
        mostUsed: this.getMostUsedTool(metrics.toolCalls)
      },
      errorRate: metrics.totalRequests > 0 ? 
        Math.round((metrics.errorCount / metrics.totalRequests) * 100) : 0
    };

    return stats;
  }

  // Cari tool yang paling sering digunakan
  getMostUsedTool(toolCalls) {
    if (toolCalls.length === 0) return 'none';
    
    const frequency = {};
    toolCalls.forEach(tool => {
      frequency[tool] = (frequency[tool] || 0) + 1;
    });

    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }

  // Generate recommendations untuk optimasi
  generateRecommendations(stats, sessionData) {
    const recommendations = [];

    // Token usage recommendations
    if (stats.tokenStats.average > 5000) {
      recommendations.push({
        type: 'token',
        priority: 'high',
        message: 'Token usage tinggi. Pertimbangkan perpendek system prompt atau kurangi verbose output.'
      });
    }

    if (stats.tokenStats.average < 1000) {
      recommendations.push({
        type: 'token',
        priority: 'low',
        message: 'Token usage rendah. Bisa tambah detail di system prompt untuk guidance yang lebih baik.'
      });
    }

    // Response time recommendations
    if (stats.responseStats.average > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Response time lambat. Cek network atau pertimbangkan kurangi tool calls simultan.'
      });
    }

    // Error rate recommendations
    if (stats.errorRate > 10) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Error rate tinggi. Review tool permissions dan bash command patterns.'
      });
    }

    // Session length recommendations
    if (sessionData.avgSessionLength > 50) {
      recommendations.push({
        type: 'session',
        priority: 'medium',
        message: 'Session panjang. Pertimbangkan auto-cleanup atau context compression.'
      });
    }

    return recommendations;
  }

  // Save metrics ke file
  saveMetrics(data) {
    try {
      fs.writeFileSync(this.metricsPath, JSON.stringify(data, null, 2));
      console.log(`✅ Metrics saved to ${this.metricsPath}`);
    } catch (error) {
      console.error('❌ Error saving metrics:', error.message);
    }
  }

  // Main monitoring function
  async monitor() {
    console.log('🔍 Rovodev Performance Monitor Starting...\n');

    // Analyze log file
    console.log('📊 Analyzing log file...');
    const logMetrics = await this.analyzeLogFile();
    
    if (!logMetrics) {
      console.log('❌ Tidak bisa analyze log file');
      return;
    }

    // Analyze session data
    console.log('📁 Analyzing session data...');
    const sessionData = await this.analyzeSessionData();

    // Calculate statistics
    const stats = this.calculateStats(logMetrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(stats, sessionData);

    // Display results
    this.displayResults(stats, sessionData, recommendations);

    // Save metrics
    const fullMetrics = {
      timestamp: new Date().toISOString(),
      stats,
      sessionData,
      recommendations,
      rawMetrics: logMetrics
    };

    this.saveMetrics(fullMetrics);
  }

  // Display hasil monitoring
  displayResults(stats, sessionData, recommendations) {
    console.log('\n📈 ROVODEV PERFORMANCE REPORT');
    console.log('=' .repeat(50));

    // Token Statistics
    console.log('\n🎯 TOKEN USAGE:');
    console.log(`   Total: ${stats.tokenStats.total.toLocaleString()}`);
    console.log(`   Average: ${stats.tokenStats.average.toLocaleString()}`);
    console.log(`   Range: ${stats.tokenStats.min} - ${stats.tokenStats.max}`);

    // Response Statistics
    console.log('\n⚡ RESPONSE TIME:');
    console.log(`   Average: ${stats.responseStats.average}ms`);
    console.log(`   Range: ${stats.responseStats.min}ms - ${stats.responseStats.max}ms`);

    // Tool Statistics
    console.log('\n🔧 TOOL USAGE:');
    console.log(`   Total calls: ${stats.toolStats.totalCalls}`);
    console.log(`   Unique tools: ${stats.toolStats.uniqueTools}`);
    console.log(`   Most used: ${stats.toolStats.mostUsed}`);

    // Session Statistics
    console.log('\n📱 SESSION DATA:');
    console.log(`   Total sessions: ${sessionData.sessionCount}`);
    console.log(`   Avg length: ${sessionData.avgSessionLength} interactions`);
    console.log(`   Total interactions: ${sessionData.totalInteractions}`);

    // Error Rate
    console.log('\n❌ ERROR RATE:');
    console.log(`   Error rate: ${stats.errorRate}%`);

    // Recommendations
    if (recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : 
                        rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priority} [${rec.type.toUpperCase()}] ${rec.message}`);
      });
    } else {
      console.log('\n✅ No recommendations - performance looks good!');
    }

    console.log('\n' + '='.repeat(50));
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new RovodevPerformanceMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'monitor':
    case undefined:
      monitor.monitor();
      break;
    
    case 'watch':
      console.log('👀 Watching performance (Ctrl+C to stop)...');
      setInterval(() => {
        console.clear();
        monitor.monitor();
      }, 30000); // Monitor setiap 30 detik
      break;
    
    case 'help':
      console.log(`
🔍 Rovodev Performance Monitor

Usage:
  node rovodev-performance-monitor.js [command]

Commands:
  monitor    Run one-time performance analysis (default)
  watch      Continuous monitoring every 30 seconds
  help       Show this help message

Examples:
  node rovodev-performance-monitor.js
  node rovodev-performance-monitor.js monitor
  node rovodev-performance-monitor.js watch
      `);
      break;
    
    default:
      console.log('❌ Unknown command. Use "help" for usage information.');
  }
}

module.exports = RovodevPerformanceMonitor;