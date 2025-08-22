/**
 * DSLR Notification Integration
 * Handles real-time notifications for DSLR events
 */

class DSLRNotificationIntegration {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  // Register event listener
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  // Emit event to all listeners
  async emit(eventType, data) {
    const listeners = this.listeners.get(eventType) || [];
    
    // Add to queue for processing
    this.eventQueue.push({ eventType, data, timestamp: new Date() });
    
    // Process queue
    if (!this.isProcessing) {
      await this.processEventQueue();
    }

    // Notify listeners immediately
    for (const listener of listeners) {
      try {
        await listener(data);
      } catch (error) {
        console.error(`Error in ${eventType} listener:`, error);
      }
    }
  }

  async processEventQueue() {
    this.isProcessing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      await this.handleDSLREvent(event);
    }
    
    this.isProcessing = false;
  }

  async handleDSLREvent(event) {
    const { eventType, data } = event;
    
    switch (eventType) {
      case 'upload_start':
        console.log(`📸 Starting upload: ${data.filename}`);
        break;
        
      case 'upload_success':
        console.log(`✅ Upload successful: ${data.filename}`);
        await this.checkMilestones(data);
        break;
        
      case 'upload_error':
        console.error(`❌ Upload failed: ${data.filename} - ${data.error}`);
        break;
        
      case 'camera_connected':
        console.log(`📷 Camera connected: ${data.model}`);
        break;
        
      case 'camera_disconnected':
        console.log(`📷 Camera disconnected`);
        break;
        
      case 'storage_warning':
        console.warn(`⚠️ Storage warning: ${data.message}`);
        break;
        
      case 'milestone_reached':
        console.log(`🎉 Milestone reached: ${data.count} photos uploaded!`);
        break;
        
      default:
        console.log(`📝 DSLR Event: ${eventType}`, data);
    }
  }

  async checkMilestones(data) {
    // Check if we've reached photo milestones
    const milestones = [10, 25, 50, 100, 200, 500];
    
    if (data.totalCount && milestones.includes(data.totalCount)) {
      await this.emit('milestone_reached', {
        count: data.totalCount,
        filename: data.filename,
        timestamp: new Date()
      });
    }
  }

  // Send push notification (placeholder for future implementation)
  async sendPushNotification(title, body, data = {}) {
    console.log(`🔔 Push Notification: ${title} - ${body}`);
    // Future: Implement FCM or other push notification service
  }

  // Send real-time update via WebSocket (placeholder)
  async sendRealtimeUpdate(channel, data) {
    console.log(`🔄 Realtime Update [${channel}]:`, data);
    // Future: Implement WebSocket or Server-Sent Events
  }
}

// Singleton instance
let notificationIntegration = null;

function getDSLRNotificationIntegration() {
  if (!notificationIntegration) {
    notificationIntegration = new DSLRNotificationIntegration();
  }
  return notificationIntegration;
}

module.exports = {
  DSLRNotificationIntegration,
  getDSLRNotificationIntegration
};