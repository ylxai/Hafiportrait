/**
 * DSLR Auto Upload Service
 * Monitors folder untuk foto baru dari Nikon D7100
 * Auto upload JPG ke Supabase dengan album "Official"
 */

const chokidar = require('chokidar');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Import notification integration
const { getDSLRNotificationIntegration } = require('../src/lib/dslr-notification-integration.js');

// Import watermark processor
const { WatermarkProcessor } = require('../src/lib/watermark-processor.js');

// Import optimized configuration
const { config: CONFIG, validateConfig } = require('../Config/dslr.config.js');

// Import hybrid event manager
const DSLRHybridEventManager = require('./dslr-hybrid-event-manager.js');

// Validate configuration on startup
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.error('❌ Configuration errors:');
  configErrors.forEach(error => console.error(`  - ${error}`));
  console.error('Please fix configuration errors before starting the service.');
  process.exit(1);
}

class DSLRAutoUploader {
  constructor() {
    this.isProcessing = false;
    this.processedFiles = new Set();
    this.uploadStats = {
      totalUploaded: 0,
      totalFailed: 0,
      sessionStartTime: new Date().toISOString()
    };
    
    // Initialize notification integration
    this.notificationIntegration = getDSLRNotificationIntegration();
    
    // Initialize config manager
    const { DSLRConfigManager } = require('./src/lib/dslr-config-manager.js');
    this.configManager = new DSLRConfigManager(CONFIG);
    
    // Initialize hybrid event manager
    this.eventManager = new DSLRHybridEventManager();
    this.currentEvent = null;
    
    // Initialize watermark processor
    this.watermarkProcessor = new WatermarkProcessor(CONFIG);
  }

  // Load current event configuration
  async loadCurrentEvent() {
    try {
      this.currentEvent = await this.eventManager.getCurrentEvent();
      console.log(`✅ Loaded event: ${this.currentEvent.name} (${this.currentEvent.id})`);
      return this.currentEvent;
    } catch (error) {
      console.error('❌ No active event found!');
      console.error('💡 Please set an active event first:');
      console.error('   node dslr-event-manager.js list');
      console.error('   node dslr-event-manager.js activate <event-id>');
      console.error('   OR create new event:');
      console.error('   node dslr-event-manager.js quick "Event Name" 2025-01-15');
      throw error;
    }
  }

  // Get current event configuration for uploads
  getEventConfig() {
    if (!this.currentEvent) {
      throw new Error('No active event loaded. Call loadCurrentEvent() first.');
    }
    
    return {
      eventId: this.currentEvent.id,
      uploaderName: this.currentEvent.photographer,
      albumName: this.currentEvent.album,
      apiUrl: this.currentEvent.apiUrl,
      watermarkEnabled: this.currentEvent.watermarkEnabled,
      backupEnabled: this.currentEvent.backupEnabled
    };
  }

  // Initialize service with event loading
  async initialize() {
    console.log('🚀 Initializing DSLR Auto Upload Service...');
    
    // Load current event
    await this.loadCurrentEvent();
    
    // Initialize watermark if enabled for this event
    if (this.currentEvent.watermarkEnabled) {
      console.log('🏷️ Initializing watermark processor...');
      await this.watermarkProcessor.initialize();
    }
    
    // Start monitoring
    this.startFileWatcher();
    this.startCameraMonitoring();
    this.startHeartbeat();
    
    console.log('✅ DSLR Auto Upload Service initialized successfully!');
    console.log(`📸 Active Event: ${this.currentEvent.name}`);
    console.log(`📅 Event ID: ${this.currentEvent.id}`);
    console.log(`👨‍💼 Photographer: ${this.currentEvent.photographer}`);
    console.log(`🌐 API URL: ${this.currentEvent.apiUrl}`);
    console.log(`🏷️ Watermark: ${this.currentEvent.watermarkEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`💾 Backup: ${this.currentEvent.backupEnabled ? 'Enabled' : 'Disabled'}`);
  }

  // Start file watcher
  startFileWatcher() {
    
    this.init();
  }

  async init() {
    console.log('🚀 DSLR Auto Upload Service Starting...');
    
    // Buat folder backup jika belum ada
    await this.createBackupFolders();
    
    // Start file watcher
    this.startWatcher();
    
    // Trigger camera connected notification
    this.notificationIntegration.triggerEvent('camera_connected', {
      cameraModel: 'Nikon D7100',
      status: 'connected',
      message: 'DSLR Auto Upload Service started successfully',
      lastSeen: new Date().toISOString()
    });
    
    // Monitor camera connection
    this.startCameraMonitoring();
    
    // Start heartbeat for status updates
    this.startHeartbeat();
    
    console.log(`📁 Watching folder: ${CONFIG.CAMERA.WATCH_FOLDER}`);
    console.log(`📸 Event ID: ${CONFIG.EVENT.ID}`);
    console.log(`👨‍💼 Photographer: ${CONFIG.EVENT.UPLOADER_NAME}`);
    console.log(`⚡ Performance profile: ${CONFIG.PERFORMANCE.PROFILE}`);
    console.log(`🔔 Notifications: ${CONFIG.NOTIFICATIONS.ENABLED ? 'Enabled' : 'Disabled'}`);
    console.log(`🏷️ Watermark: ${CONFIG.WATERMARK.ENABLED ? 'Enabled' : 'Disabled'}`);
    
    // Initialize watermark processor
    if (CONFIG.WATERMARK.ENABLED) {
      await this.watermarkProcessor.initialize();
    }
    
    // Initial status update
    await this.updateDSLRStatus();
  }

  async createBackupFolders() {
    if (!CONFIG.STORAGE.ENABLE_BACKUP) {
      console.log('📁 Backup disabled, skipping folder creation');
      return;
    }

    try {
      await fs.mkdir(CONFIG.STORAGE.BACKUP_FOLDER, { recursive: true });
      await fs.mkdir(CONFIG.STORAGE.RAW_FOLDER, { recursive: true });
      await fs.mkdir(CONFIG.STORAGE.JPG_FOLDER, { recursive: true });
      console.log('✅ Backup folders created');
      
      // Check storage space if monitoring enabled
      if (CONFIG.MONITORING.ENABLE_METRICS) {
        await this.checkStorageSpace();
      }
    } catch (error) {
      console.error('❌ Error creating backup folders:', error);
    }
  }

  startWatcher() {
    const watcher = chokidar.watch(CONFIG.CAMERA.WATCH_FOLDER, {
      ignored: /^\./, // ignore dotfiles
      persistent: true,
      ignoreInitial: true, // ignore existing files
      awaitWriteFinish: {
        stabilityThreshold: CONFIG.PERFORMANCE.stabilityThreshold,
        pollInterval: CONFIG.PERFORMANCE.pollInterval
      }
    });

    watcher
      .on('add', (filePath) => this.handleNewFile(filePath))
      .on('error', (error) => console.error('❌ Watcher error:', error))
      .on('ready', () => console.log('👀 File watcher ready'));
  }

  async handleNewFile(filePath) {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).toLowerCase();
    
    // Skip jika file sudah diproses
    if (this.processedFiles.has(fileName)) {
      return;
    }

    console.log(`📸 New file detected: ${fileName}`);

    try {
      // Backup file ke local storage
      await this.backupFile(filePath, fileName);
      
      // Check if file should be processed
      const shouldProcess = this.shouldProcessFile(fileName, fileExt);
      if (shouldProcess) {
        // Trigger upload start notification
        await this.notificationIntegration.triggerEvent('upload_start', {
          fileName,
          fileSize: (await fs.stat(filePath)).size,
          filePath,
          albumName: CONFIG.EVENT.ALBUM_NAME,
          eventName: CONFIG.EVENT.ID,
          uploaderName: CONFIG.EVENT.UPLOADER_NAME
        });

        await this.uploadToSupabase(filePath, fileName);
      }
      
      // Mark as processed
      this.processedFiles.add(fileName);
      
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error);
      
      // Trigger upload failed notification
      await this.notificationIntegration.triggerEvent('upload_failed', {
        fileName,
        filePath,
        albumName: CONFIG.EVENT.ALBUM_NAME,
        eventName: CONFIG.EVENT.ID,
        uploaderName: CONFIG.EVENT.UPLOADER_NAME,
        error: error.message
      });
      
      // Update failed count
      this.uploadStats.totalFailed++;
    }
  }

  async backupFile(sourcePath, fileName) {
    if (!CONFIG.STORAGE.ENABLE_BACKUP) {
      return;
    }

    try {
      const fileExt = path.extname(fileName).toLowerCase();
      let targetFolder;
      
      if (CONFIG.FILES.JPG_PATTERN.test(fileExt)) {
        targetFolder = CONFIG.STORAGE.JPG_FOLDER;
      } else if (CONFIG.FILES.RAW_PATTERN.test(fileExt)) {
        targetFolder = CONFIG.STORAGE.RAW_FOLDER;
      } else {
        targetFolder = CONFIG.STORAGE.BACKUP_FOLDER;
      }
      
      const targetPath = path.join(targetFolder, fileName);
      
      // Check file size limit
      const stats = await fs.stat(sourcePath);
      if (stats.size > CONFIG.FILES.MAX_FILE_SIZE_MB * 1024 * 1024) {
        console.warn(`⚠️ File ${fileName} exceeds size limit, skipping backup`);
        return;
      }
      
      // Copy file
      const data = await fs.readFile(sourcePath);
      await fs.writeFile(targetPath, data);
      
      console.log(`💾 Backed up: ${fileName} → ${targetFolder}`);
      
    } catch (error) {
      console.error(`❌ Backup failed for ${fileName}:`, error);
    }
  }

  async uploadToSupabase(filePath, fileName) {
    try {
      console.log(`🚀 Processing ${fileName} for upload...`);
      
      let processedFilePath = filePath;
      let watermarkResult = null;
      
      // Apply watermark if enabled
      if (CONFIG.WATERMARK.ENABLED) {
        const watermarkedPath = path.join(CONFIG.STORAGE.JPG_FOLDER, `watermarked_${fileName}`);
        
        console.log(`🏷️ Applying watermark to ${fileName}...`);
        watermarkResult = await this.watermarkProcessor.processImage(filePath, watermarkedPath);
        
        if (watermarkResult.success && watermarkResult.watermarked) {
          processedFilePath = watermarkedPath;
          console.log(`✅ Watermark applied successfully`);
        } else {
          console.log(`⚠️ Watermark processing: ${watermarkResult.message}`);
        }
      }
      
      console.log(`📤 Uploading ${fileName} to Supabase...`);
      
      // Read processed file
      const fileBuffer = await fs.readFile(processedFilePath);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);
      const eventConfig = this.getEventConfig();
      formData.append('uploaderName', eventConfig.uploaderName);
      formData.append('albumName', eventConfig.albumName);
      
      // Upload via API
      const response = await fetch(
        `${this.getEventConfig().apiUrl}/api/events/${this.getEventConfig().eventId}/photos`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Upload success: ${fileName}`);
        console.log(`📷 Photo ID: ${result.id}`);
        
        // Update stats
        this.uploadStats.totalUploaded++;
        
        // Get file stats
        const fileStats = await fs.stat(filePath);
        
        // Trigger upload success notification
        await this.notificationIntegration.triggerEvent('upload_success', {
          fileName,
          fileSize: fileStats.size,
          filePath,
          albumName: CONFIG.EVENT.ALBUM_NAME,
          eventName: CONFIG.EVENT.ID,
          uploaderName: CONFIG.EVENT.UPLOADER_NAME,
          photoId: result.id,
          total: this.uploadStats.totalUploaded
        });

        // Check for milestones
        this.checkEventMilestone();
        
        // Update DSLR status
        await this.updateDSLRStatus();
        
      } else {
        const error = await response.text();
        this.uploadStats.totalFailed++;
        throw new Error(`Upload failed: ${response.status} - ${error}`);
      }
      
    } catch (error) {
      console.error(`❌ Upload failed for ${fileName}:`, error);
      
      // Retry logic (optional)
      setTimeout(() => {
        console.log(`🔄 Retrying upload for ${fileName}...`);
        this.uploadToSupabase(filePath, fileName);
      }, 5000);
    }
  }

  // Update DSLR status
  async updateDSLRStatus() {
    try {
      const status = {
        isConnected: true,
        isProcessing: this.isProcessing,
        totalUploaded: this.uploadStats.totalUploaded,
        failedUploads: this.uploadStats.totalFailed,
        lastUpload: this.uploadStats.totalUploaded > 0 ? new Date().toISOString() : null,
        watchFolder: CONFIG.CAMERA.WATCH_FOLDER,
        eventId: CONFIG.EVENT.ID,
        uploaderName: CONFIG.EVENT.UPLOADER_NAME,
        queueSize: this.processedFiles.size,
        uploadSpeed: 0, // Will be calculated based on recent uploads
        serviceRunning: true,
        lastHeartbeat: new Date().toISOString()
      };

      // Write status to runtime file
      await this.writeRuntimeStatus(status);
      
      // Also update notification integration
      await this.notificationIntegration.updateDSLRStatus(status);
    } catch (error) {
      console.error('❌ Failed to update DSLR status:', error);
    }
  }

  // Write runtime status to file
  async writeRuntimeStatus(status) {
    try {
      const runtimeFile = path.join(process.cwd(), 'dslr-status.json');
      await fs.writeFile(runtimeFile, JSON.stringify(status, null, 2));
    } catch (error) {
      console.error('❌ Failed to write runtime status:', error);
    }
  }

  // Method untuk set event ID secara dinamis
  setEventId(eventId) {
    this.configManager.set('EVENT.ID', eventId);
    console.log(`📝 Event ID updated: ${eventId}`);
  }

  // Check if file should be processed
  shouldProcessFile(fileName, fileExt) {
    // Check file extension
    if (CONFIG.FILES.JPG_PATTERN.test(fileExt)) {
      return true;
    }
    
    if (CONFIG.FILES.RAW_PATTERN.test(fileExt) && CONFIG.FILES.PROCESS_RAW_FILES) {
      return true;
    }
    
    if (CONFIG.FILES.VIDEO_PATTERN.test(fileExt) && CONFIG.FILES.PROCESS_VIDEO_FILES) {
      return true;
    }
    
    return false;
  }

  // Check storage space
  async checkStorageSpace() {
    try {
      const stats = await fs.stat(CONFIG.STORAGE.BACKUP_FOLDER);
      // This is a simplified check - in production you'd use a proper disk space library
      console.log(`💾 Storage check completed for: ${CONFIG.STORAGE.BACKUP_FOLDER}`);
    } catch (error) {
      console.warn('⚠️ Could not check storage space:', error.message);
    }
  }

  // Method untuk pause/resume
  pause() {
    this.isProcessing = false;
    console.log('⏸️ Auto upload paused');
  }

  resume() {
    this.isProcessing = true;
    console.log('▶️ Auto upload resumed');
  }

  // Check for event milestones
  checkEventMilestone() {
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    const current = this.uploadStats.totalUploaded;
    
    if (milestones.includes(current)) {
      this.notificationIntegration.triggerEvent('event_milestone', {
        eventName: this.getEventConfig().eventId,
        eventId: this.getEventConfig().eventId,
        milestone: current,
        totalPhotos: current,
        albumName: this.getEventConfig().albumName
      });
    }
  }

  // Monitor camera connection
  startCameraMonitoring() {
    setInterval(() => {
      this.checkCameraConnection();
    }, 30000); // Check every 30 seconds
  }

  // Start heartbeat for status updates
  startHeartbeat() {
    setInterval(() => {
      this.updateDSLRStatus();
    }, 10000); // Update status every 10 seconds
  }

  async checkCameraConnection() {
    try {
      // Check if watch folder is accessible
      await fs.access(CONFIG.WATCH_FOLDER);
      // Camera is connected
    } catch (error) {
      // Camera disconnected
      this.notificationIntegration.triggerEvent('camera_disconnected', {
        cameraModel: 'Nikon D7100',
        status: 'disconnected',
        message: 'Camera folder not accessible',
        lastSeen: new Date().toISOString()
      });
    }
  }

  // Get statistics
  getStats() {
    return {
      processedFiles: this.processedFiles.size,
      isProcessing: this.isProcessing,
      watchFolder: CONFIG.WATCH_FOLDER,
      eventId: this.currentEvent ? this.currentEvent.id : 'no-event',
      uploadStats: this.uploadStats
    };
  }
}

// Start service
async function startService() {
  try {
    const uploader = new DSLRAutoUploader();
    await uploader.initialize();
    
    console.log('\n🎯 DSLR Auto Upload Service is running!');
    console.log('📸 Monitoring camera folder for new photos...');
    console.log('🌐 Web dashboard: http://localhost:3000/admin');
    console.log('⏹️  Press Ctrl+C to stop');
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down DSLR Auto Upload Service...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start DSLR service:', error.message);
    process.exit(1);
  }
}

// Start if called directly
if (require.main === module) {
  startService();
}

// Export untuk testing
module.exports = DSLRAutoUploader;