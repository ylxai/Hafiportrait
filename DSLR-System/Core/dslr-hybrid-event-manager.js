/**
 * DSLR Hybrid Event Manager
 * Manages events locally and syncs with Supabase
 */

// Load environment variables
require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '../.env' });

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

class DSLRHybridEventManager {
  constructor() {
    this.configDir = path.join(__dirname, '..', 'Config');
    this.eventsFile = path.join(this.configDir, 'dslr-events.json');
    this.currentEventFile = path.join(this.configDir, 'dslr-current-event.json');
    
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async ensureConfigDir() {
    try {
      await fs.access(this.configDir);
    } catch {
      await fs.mkdir(this.configDir, { recursive: true });
    }
  }

  async loadEvents() {
    try {
      const data = await fs.readFile(this.eventsFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Handle array format (convert to object with event IDs as keys)
      if (Array.isArray(parsed)) {
        const eventsObj = {};
        parsed.forEach(event => {
          if (event && event.id) {
            eventsObj[event.id] = event;
          }
        });
        // Save in correct format
        await this.saveEvents(eventsObj);
        return eventsObj;
      }
      
      return parsed;
    } catch {
      return {};
    }
  }

  async saveEvents(events) {
    await this.ensureConfigDir();
    await fs.writeFile(this.eventsFile, JSON.stringify(events, null, 2));
  }

  async getCurrentEvent() {
    try {
      const data = await fs.readFile(this.currentEventFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async setCurrentEvent(eventId) {
    await this.ensureConfigDir();
    const events = await this.loadEvents();
    const event = events[eventId];
    
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const currentEventData = {
      eventId,
      id: event.id,
      name: event.name,
      date: event.date,
      photographer: event.photographer_name || 'Official Photographer',
      album: event.album_name || 'Official',
      accessCode: event.access_code,
      shareableLink: event.share_url,
      qrCodeData: event.qr_code_url,
      apiUrl: 'https://hafiportrait.photography',
      watermarkEnabled: event.watermark_enabled !== false,
      backupEnabled: event.backup_enabled !== false,
      syncStatus: event.synced_at ? 'synced' : 'pending',
      createdVia: event.created_via || 'unknown',
      created: event.created_at,
      updated: new Date().toISOString(),
      activatedAt: new Date().toISOString()
    };

    await fs.writeFile(this.currentEventFile, JSON.stringify(currentEventData, null, 2));

    return currentEventData;
  }

  async createEvent(eventData) {
    const events = await this.loadEvents();
    const eventId = this.generateEventId(eventData.name, eventData.date);
    
    const newEvent = {
      id: eventId,
      name: eventData.name,
      date: eventData.date,
      photographer_name: eventData.photographer_name || 'Official Photographer',
      album_name: eventData.album_name || 'Official',
      watermark_enabled: eventData.watermark_enabled !== false,
      backup_enabled: eventData.backup_enabled !== false,
      created_at: new Date().toISOString(),
      created_via: 'hybrid-cli',
      access_code: this.generateAccessCode(),
      share_url: `https://hafiportrait.photography/event/${eventId}`,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://hafiportrait.photography/event/${eventId}`
    };

    events[eventId] = newEvent;
    await this.saveEvents(events);

    // Try to sync to Supabase
    try {
      await this.syncEventToSupabase(newEvent);
    } catch (error) {
      console.warn('⚠️ Failed to sync to Supabase:', error.message);
    }

    return newEvent;
  }

  async updateEvent(eventId, updates) {
    const events = await this.loadEvents();
    if (!events[eventId]) {
      throw new Error(`Event ${eventId} not found`);
    }

    events[eventId] = { ...events[eventId], ...updates };
    await this.saveEvents(events);

    // Update current event if it's the active one
    const currentEvent = await this.getCurrentEvent();
    if (currentEvent && currentEvent.eventId === eventId) {
      await this.setCurrentEvent(eventId);
    }

    // Try to sync to Supabase
    try {
      await this.syncEventToSupabase(events[eventId]);
    } catch (error) {
      console.warn('⚠️ Failed to sync to Supabase:', error.message);
    }

    return events[eventId];
  }

  async syncEventToSupabase(event) {
    // Simplified sync - only sync basic fields that exist in database
    const { error } = await this.supabase
      .from('events')
      .upsert({
        id: event.id,
        name: event.name,
        date: event.date,
        created_at: event.created_at
      });

    if (error) {
      console.warn(`Supabase sync failed: ${error.message}`);
      // Don't throw error, just warn - allow offline operation
    } else {
      // Mark as synced
      event.synced_at = new Date().toISOString();
    }
  }

  generateEventId(name, date) {
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return `${cleanName}-${date}`;
  }

  generateAccessCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async listEvents() {
    const events = await this.loadEvents();
    // Convert object to array for CLI compatibility
    return Object.values(events);
  }

  async getEventConfig(eventId) {
    const events = await this.loadEvents();
    return events[eventId] || null;
  }

  // Missing methods for CLI compatibility
  async loadCurrentEvent() {
    return await this.getCurrentEvent();
  }

  async quickSetup(eventName, eventDate) {
    // Create event
    const event = await this.createEvent({
      name: eventName,
      date: eventDate,
      photographer_name: 'Official Photographer',
      album_name: 'Official'
    });

    // Activate it immediately
    await this.setCurrentEvent(event.id);

    // Return the activated event with current event data
    return await this.getCurrentEvent();
  }

  async setActiveEvent(eventId) {
    return await this.setCurrentEvent(eventId);
  }

  async getSyncStatus() {
    const events = await this.loadEvents();
    const eventList = Object.values(events);
    
    return {
      syncEnabled: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      isOnline: true, // Simplified for now
      totalEvents: eventList.length,
      syncedEvents: eventList.filter(e => e.synced_at).length,
      pendingEvents: eventList.filter(e => !e.synced_at).length,
      failedEvents: 0, // Simplified for now
      queueSize: 0, // Simplified for now
      lastSync: new Date(),
      syncCount: 0
    };
  }

  async processSyncQueue() {
    console.log('📦 Processing sync queue...');
    // Simplified implementation
    return true;
  }

  async forceSyncAll() {
    const events = await this.loadEvents();
    let syncedCount = 0;
    
    for (const event of Object.values(events)) {
      try {
        await this.syncEventToSupabase(event);
        syncedCount++;
      } catch (error) {
        console.warn(`Failed to sync ${event.id}:`, error.message);
      }
    }
    
    return syncedCount;
  }

  async syncFromSupabase() {
    console.log('📥 Syncing from Supabase...');
    // Simplified implementation
    return true;
  }
}

module.exports = DSLRHybridEventManager;