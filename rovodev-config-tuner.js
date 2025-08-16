#!/usr/bin/env node

/**
 * Rovodev Config Auto-Tuner
 * Automatically adjust config based on performance metrics
 */

const fs = require('fs');
const yaml = require('js-yaml');

class RovodevConfigTuner {
  constructor() {
    this.configPath = '/home/ubuntu/.rovodev/config.yml';
    this.metricsPath = '/home/ubuntu/.rovodev/performance-metrics.json';
    this.backupPath = '/home/ubuntu/.rovodev/config.yml.auto-backup';
  }

  // Load current config
  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      console.error('❌ Error loading config:', error.message);
      return null;
    }
  }

  // Load performance metrics
  loadMetrics() {
    try {
      if (!fs.existsSync(this.metricsPath)) {
        console.log('❌ No performance metrics found. Run monitor first.');
        return null;
      }
      
      const metricsContent = fs.readFileSync(this.metricsPath, 'utf8');
      return JSON.parse(metricsContent);
    } catch (error) {
      console.error('❌ Error loading metrics:', error.message);
      return null;
    }
  }

  // Auto-tune config based on metrics
  autoTuneConfig(config, metrics) {
    const tuned = JSON.parse(JSON.stringify(config)); // Deep clone
    const changes = [];

    // Tune temperature based on token usage
    if (metrics.stats.tokenStats.average > 5000) {
      // High token usage - lower temperature for more focused responses
      if (tuned.agent.temperature > 0.1) {
        tuned.agent.temperature = Math.max(0.1, tuned.agent.temperature - 0.1);
        changes.push(`Temperature lowered to ${tuned.agent.temperature} (high token usage)`);
      }
    } else if (metrics.stats.tokenStats.average < 1000) {
      // Low token usage - slightly higher temperature for more variety
      if (tuned.agent.temperature < 0.3) {
        tuned.agent.temperature = Math.min(0.3, tuned.agent.temperature + 0.05);
        changes.push(`Temperature raised to ${tuned.agent.temperature} (low token usage)`);
      }
    }

    // Tune output width based on token usage
    if (metrics.stats.tokenStats.average > 4000) {
      // High token usage - reduce output width
      if (tuned.console.maxOutputWidth > 80) {
        tuned.console.maxOutputWidth = 80;
        changes.push('Output width reduced to 80 (high token usage)');
      }
    } else if (metrics.stats.tokenStats.average < 2000) {
      // Low token usage - can increase output width
      if (tuned.console.maxOutputWidth < 120) {
        tuned.console.maxOutputWidth = 120;
        changes.push('Output width increased to 120 (low token usage)');
      }
    }

    // Tune tool permissions based on error rate
    if (metrics.stats.errorRate > 15) {
      // High error rate - make permissions more restrictive
      if (tuned.toolPermissions.default === 'allow') {
        tuned.toolPermissions.default = 'ask';
        changes.push('Default tool permission changed to ask (high error rate)');
      }
    } else if (metrics.stats.errorRate < 5) {
      // Low error rate - can be more permissive
      if (tuned.toolPermissions.default === 'ask') {
        tuned.toolPermissions.default = 'allow';
        changes.push('Default tool permission changed to allow (low error rate)');
      }
    }

    // Tune system prompt based on session length
    if (metrics.sessionData.avgSessionLength > 40) {
      // Long sessions - add context efficiency reminder
      if (!tuned.agent.additionalSystemPrompt.includes('CONTEXT LIMIT')) {
        tuned.agent.additionalSystemPrompt += '\n\nCONTEXT LIMIT: Keep responses concise due to long session detected.';
        changes.push('Added context efficiency reminder to system prompt');
      }
    }

    // Tune bash permissions based on tool usage
    if (metrics.stats.toolStats.totalCalls > 100) {
      // High tool usage - optimize bash permissions
      const bashCommands = tuned.toolPermissions.bash.commands;
      const highUsageCommands = ['ls.*', 'cat.*', 'echo.*', 'git.*', 'pnpm.*'];
      
      let bashOptimized = false;
      highUsageCommands.forEach(cmd => {
        const existing = bashCommands.find(c => c.command === cmd);
        if (!existing) {
          bashCommands.push({ command: cmd, permission: 'allow' });
          bashOptimized = true;
        }
      });
      
      if (bashOptimized) {
        changes.push('Optimized bash commands for high usage patterns');
      }
    }

    return { tuned, changes };
  }

  // Save tuned config
  saveConfig(config) {
    try {
      // Backup current config
      if (fs.existsSync(this.configPath)) {
        fs.copyFileSync(this.configPath, this.backupPath);
        console.log(`✅ Backup saved to ${this.backupPath}`);
      }

      // Save tuned config
      const yamlContent = yaml.dump(config, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true 
      });
      
      fs.writeFileSync(this.configPath, yamlContent);
      console.log(`✅ Tuned config saved to ${this.configPath}`);
    } catch (error) {
      console.error('❌ Error saving config:', error.message);
    }
  }

  // Main tuning function
  async tune() {
    console.log('🔧 Rovodev Config Auto-Tuner Starting...\n');

    // Load current config
    const config = this.loadConfig();
    if (!config) return;

    // Load performance metrics
    const metrics = this.loadMetrics();
    if (!metrics) return;

    console.log('📊 Current Performance Metrics:');
    console.log(`   Token average: ${metrics.stats.tokenStats.average}`);
    console.log(`   Error rate: ${metrics.stats.errorRate}%`);
    console.log(`   Session length: ${metrics.sessionData.avgSessionLength}`);
    console.log(`   Tool calls: ${metrics.stats.toolStats.totalCalls}\n`);

    // Auto-tune config
    const { tuned, changes } = this.autoTuneConfig(config, metrics);

    if (changes.length === 0) {
      console.log('✅ No tuning needed - config is already optimal!');
      return;
    }

    console.log('🎯 Proposed Changes:');
    changes.forEach((change, index) => {
      console.log(`   ${index + 1}. ${change}`);
    });

    // Save tuned config
    this.saveConfig(tuned);

    console.log('\n🚀 Config tuning completed!');
    console.log('💡 Restart Rovodev session to apply changes.');
  }

  // Show current config status
  showStatus() {
    const config = this.loadConfig();
    if (!config) return;

    console.log('📋 Current Rovodev Config Status:');
    console.log('=' .repeat(40));
    console.log(`Temperature: ${config.agent.temperature}`);
    console.log(`Output Width: ${config.console.maxOutputWidth}`);
    console.log(`Default Tool Permission: ${config.toolPermissions.default}`);
    console.log(`Bash Default: ${config.toolPermissions.bash.default}`);
    console.log(`Streaming: ${config.agent.streaming}`);
    console.log(`Shadow Mode: ${config.agent.experimental.enableShadowMode}`);
    console.log(`Show Tool Results: ${config.console.showToolResults}`);
  }
}

// CLI interface
if (require.main === module) {
  const tuner = new RovodevConfigTuner();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'tune':
    case undefined:
      tuner.tune();
      break;
    
    case 'status':
      tuner.showStatus();
      break;
    
    case 'help':
      console.log(`
🔧 Rovodev Config Auto-Tuner

Usage:
  node rovodev-config-tuner.js [command]

Commands:
  tune      Auto-tune config based on performance metrics (default)
  status    Show current config status
  help      Show this help message

Examples:
  node rovodev-config-tuner.js
  node rovodev-config-tuner.js tune
  node rovodev-config-tuner.js status
      `);
      break;
    
    default:
      console.log('❌ Unknown command. Use "help" for usage information.');
  }
}

module.exports = RovodevConfigTuner;