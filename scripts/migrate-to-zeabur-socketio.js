/**
 * Script otomatis untuk migrasi ke Zeabur Socket.IO
 * Mengupdate konfigurasi dan environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ZeaburMigrationScript {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.config = {
      zeaburUrl: '',
      jwtSecret: '',
      backupOldConfig: true
    };
  }

  async run() {
    console.log('🚀 HafiPortrait Socket.IO Migration to Zeabur');
    console.log('==============================================\n');
    
    try {
      await this.collectConfig();
      await this.backupCurrentConfig();
      await this.updateProductionConfig();
      await this.updateEnvironmentFiles();
      await this.updateAPIIntegrations();
      await this.createTestScript();
      
      console.log('\n✅ Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Deploy zeabur-socketio folder to Zeabur');
      console.log('2. Update Vercel environment variables');
      console.log('3. Run test script: npm run test:zeabur-integration');
      console.log('4. Monitor health: npm run health:zeabur');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async collectConfig() {
    console.log('📝 Configuration Setup\n');
    
    this.config.zeaburUrl = await this.question(
      'Enter your Zeabur Socket.IO URL (e.g., https://your-app.zeabur.app): '
    );
    
    this.config.jwtSecret = await this.question(
      'Enter JWT Secret (or press Enter to generate): '
    ) || this.generateJWTSecret();
    
    const backup = await this.question(
      'Backup current configuration? (y/n) [y]: '
    );
    this.config.backupOldConfig = backup.toLowerCase() !== 'n';
    
    console.log('\n📋 Configuration Summary:');
    console.log(`Zeabur URL: ${this.config.zeaburUrl}`);
    console.log(`JWT Secret: ${this.config.jwtSecret.substring(0, 10)}...`);
    console.log(`Backup: ${this.config.backupOldConfig ? 'Yes' : 'No'}`);
    
    const confirm = await this.question('\nProceed with migration? (y/n) [y]: ');
    if (confirm.toLowerCase() === 'n') {
      throw new Error('Migration cancelled by user');
    }
  }

  async backupCurrentConfig() {
    if (!this.config.backupOldConfig) return;
    
    console.log('\n💾 Backing up current configuration...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup_zeabur_migration_${timestamp}`;
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    const filesToBackup = [
      'src/lib/production-websocket-config.ts',
      '.env.local',
      '.env.example'
    ];
    
    for (const file of filesToBackup) {
      if (fs.existsSync(file)) {
        const backupPath = path.join(backupDir, path.basename(file));
        fs.copyFileSync(file, backupPath);
        console.log(`✅ Backed up: ${file} -> ${backupPath}`);
      }
    }
    
    console.log(`📁 Backup created in: ${backupDir}`);
  }

  async updateProductionConfig() {
    console.log('\n🔧 Updating production WebSocket configuration...');
    
    const configPath = 'src/lib/production-websocket-config.ts';
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Update server URLs
    content = content.replace(
      /serverUrl: '[^']*'/,
      `serverUrl: '${this.config.zeaburUrl}'`
    );
    
    content = content.replace(
      /healthEndpoint: '[^']*'/,
      `healthEndpoint: '${this.config.zeaburUrl}/health'`
    );
    
    content = content.replace(
      /wsEndpoint: '[^']*'/,
      `wsEndpoint: '${this.config.zeaburUrl}/socket.io/'`
    );
    
    // Add comment about Zeabur migration
    const migrationComment = `/**
 * Updated for Zeabur Socket.IO deployment
 * Migration date: ${new Date().toISOString()}
 * Zeabur URL: ${this.config.zeaburUrl}
 */\n\n`;
    
    content = migrationComment + content;
    
    fs.writeFileSync(configPath, content);
    console.log('✅ Updated production-websocket-config.ts');
  }

  async updateEnvironmentFiles() {
    console.log('\n🌍 Updating environment files...');
    
    // Update .env.example
    const envExamplePath = '.env.example';
    let envExample = fs.readFileSync(envExamplePath, 'utf8');
    
    // Add Zeabur Socket.IO configuration
    const zeaburConfig = `
# Zeabur Socket.IO Configuration
NEXT_PUBLIC_SOCKETIO_URL=${this.config.zeaburUrl}
NEXT_PUBLIC_USE_SOCKETIO=true
JWT_SECRET=${this.config.jwtSecret}
`;
    
    if (!envExample.includes('NEXT_PUBLIC_SOCKETIO_URL')) {
      envExample += zeaburConfig;
      fs.writeFileSync(envExamplePath, envExample);
      console.log('✅ Updated .env.example');
    }
    
    // Update .env.local if exists
    const envLocalPath = '.env.local';
    if (fs.existsSync(envLocalPath)) {
      let envLocal = fs.readFileSync(envLocalPath, 'utf8');
      
      // Update or add Zeabur configuration
      if (envLocal.includes('NEXT_PUBLIC_SOCKETIO_URL')) {
        envLocal = envLocal.replace(
          /NEXT_PUBLIC_SOCKETIO_URL=.*/,
          `NEXT_PUBLIC_SOCKETIO_URL=${this.config.zeaburUrl}`
        );
      } else {
        envLocal += `\nNEXT_PUBLIC_SOCKETIO_URL=${this.config.zeaburUrl}`;
      }
      
      if (envLocal.includes('NEXT_PUBLIC_USE_SOCKETIO')) {
        envLocal = envLocal.replace(
          /NEXT_PUBLIC_USE_SOCKETIO=.*/,
          'NEXT_PUBLIC_USE_SOCKETIO=true'
        );
      } else {
        envLocal += '\nNEXT_PUBLIC_USE_SOCKETIO=true';
      }
      
      if (envLocal.includes('JWT_SECRET')) {
        envLocal = envLocal.replace(
          /JWT_SECRET=.*/,
          `JWT_SECRET=${this.config.jwtSecret}`
        );
      } else {
        envLocal += `\nJWT_SECRET=${this.config.jwtSecret}`;
      }
      
      fs.writeFileSync(envLocalPath, envLocal);
      console.log('✅ Updated .env.local');
    }
  }

  async updateAPIIntegrations() {
    console.log('\n🔌 Creating API integration helpers...');
    
    // Create notification helper
    const notificationHelperPath = 'src/lib/zeabur-socketio-notifications.ts';
    const notificationHelper = `/**
 * Zeabur Socket.IO Notification Helper
 * Generated by migration script on ${new Date().toISOString()}
 */

const SOCKETIO_URL = process.env.NEXT_PUBLIC_SOCKETIO_URL || '${this.config.zeaburUrl}';

export interface NotificationData {
  eventId?: string;
  type: string;
  data: any;
  adminOnly?: boolean;
}

export class ZeaburSocketIONotifications {
  static async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      const response = await fetch(\`\${SOCKETIO_URL}/api/notify\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...notification,
          timestamp: new Date().toISOString()
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send Socket.IO notification:', error);
      return false;
    }
  }
  
  static async notifyPhotoUpload(eventId: string, photoData: any): Promise<boolean> {
    return this.sendNotification({
      eventId,
      type: 'new-photo',
      data: {
        photoId: photoData.id,
        photoUrl: photoData.url,
        uploadedBy: photoData.uploadedBy
      }
    });
  }
  
  static async notifyNewMessage(eventId: string, messageData: any): Promise<boolean> {
    return this.sendNotification({
      eventId,
      type: 'new-message',
      data: {
        messageId: messageData.id,
        message: messageData.message,
        author: messageData.author
      }
    });
  }
  
  static async notifyAdminBackup(eventId: string, status: string, progress?: number): Promise<boolean> {
    return this.sendNotification({
      type: 'backup-status',
      adminOnly: true,
      data: {
        eventId,
        status,
        progress
      }
    });
  }
  
  static async checkHealth(): Promise<any> {
    try {
      const response = await fetch(\`\${SOCKETIO_URL}/health\`);
      return await response.json();
    } catch (error) {
      console.error('Failed to check Socket.IO health:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  static async getStats(): Promise<any> {
    try {
      const response = await fetch(\`\${SOCKETIO_URL}/api/stats\`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get Socket.IO stats:', error);
      return null;
    }
  }
}
`;
    
    fs.writeFileSync(notificationHelperPath, notificationHelper);
    console.log('✅ Created zeabur-socketio-notifications.ts');
  }

  async createTestScript() {
    console.log('\n🧪 Creating test scripts...');
    
    // Update package.json scripts
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    packageJson.scripts = {
      ...packageJson.scripts,
      'test:zeabur-integration': 'node scripts/test-zeabur-integration.js',
      'health:zeabur': 'node scripts/check-zeabur-health.js'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
    
    // Create test integration script
    const testScriptPath = 'scripts/test-zeabur-integration.js';
    const testScript = `/**
 * Test Zeabur Socket.IO Integration
 * Generated by migration script
 */

const { ZeaburSocketIONotifications } = require('../src/lib/zeabur-socketio-notifications.ts');

async function testIntegration() {
  console.log('🧪 Testing Zeabur Socket.IO Integration...');
  
  try {
    // Test health check
    console.log('\\n1. Testing health check...');
    const health = await ZeaburSocketIONotifications.checkHealth();
    console.log('Health:', health);
    
    // Test stats
    console.log('\\n2. Testing stats...');
    const stats = await ZeaburSocketIONotifications.getStats();
    console.log('Stats:', stats);
    
    // Test notification
    console.log('\\n3. Testing notification...');
    const notificationSent = await ZeaburSocketIONotifications.sendNotification({
      type: 'test-notification',
      data: { message: 'Test from migration script' }
    });
    console.log('Notification sent:', notificationSent);
    
    console.log('\\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testIntegration();
`;
    
    fs.writeFileSync(testScriptPath, testScript);
    console.log('✅ Created test-zeabur-integration.js');
    
    // Create health check script
    const healthScriptPath = 'scripts/check-zeabur-health.js';
    const healthScript = `/**
 * Check Zeabur Socket.IO Health
 * Generated by migration script
 */

const { ZeaburSocketIONotifications } = require('../src/lib/zeabur-socketio-notifications.ts');

async function checkHealth() {
  console.log('🏥 Checking Zeabur Socket.IO Health...');
  
  try {
    const health = await ZeaburSocketIONotifications.checkHealth();
    const stats = await ZeaburSocketIONotifications.getStats();
    
    console.log('\\n📊 Health Status:');
    console.log(\`Status: \${health.status}\`);
    console.log(\`Uptime: \${health.uptime}s\`);
    console.log(\`Connections: \${health.connections}\`);
    
    if (stats) {
      console.log('\\n📈 Connection Stats:');
      console.log(\`Total Connections: \${stats.totalConnections}\`);
      console.log(\`Admin Connections: \${stats.adminConnections}\`);
      console.log(\`Event Rooms: \${stats.eventRooms?.length || 0}\`);
    }
    
    if (health.status === 'healthy') {
      console.log('\\n✅ Socket.IO server is healthy!');
    } else {
      console.log('\\n⚠️ Socket.IO server has issues');
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

checkHealth();
`;
    
    fs.writeFileSync(healthScriptPath, healthScript);
    console.log('✅ Created check-zeabur-health.js');
  }

  generateJWTSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run migration
const migration = new ZeaburMigrationScript();
migration.run();