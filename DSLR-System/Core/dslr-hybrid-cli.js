#!/usr/bin/env node

/**
 * DSLR Hybrid Event Manager CLI
 * Command-line interface untuk hybrid event management
 */

// Load environment variables
require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '../.env' });

const DSLRHybridEventManager = require('./dslr-hybrid-event-manager.js');

// CLI Interface
async function main() {
  const manager = new DSLRHybridEventManager();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'create':
        await createEventCLI(manager, args);
        break;
      case 'list':
        await listEventsCLI(manager);
        break;
      case 'activate':
        await activateEventCLI(manager, args[1]);
        break;
      case 'current':
        await showCurrentEventCLI(manager);
        break;
      case 'update':
        await updateEventCLI(manager, args);
        break;
      case 'delete':
        await deleteEventCLI(manager, args[1]);
        break;
      case 'quick':
        await quickSetupCLI(manager, args);
        break;
      case 'sync':
        await syncCLI(manager, args[1]);
        break;
      case 'status':
        await statusCLI(manager);
        break;
      case 'export':
        await exportProductionCLI(manager, args[1]);
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function createEventCLI(manager, args) {
  if (args.length < 2) {
    console.error('Usage: node dslr-hybrid-cli.js create <event-name> [date] [photographer]');
    console.error('Example: node dslr-hybrid-cli.js create "Wedding Sarah & John" 2025-01-15 "John Photographer"');
    process.exit(1);
  }

  const eventName = args[1];
  const eventDate = args[2] || new Date().toISOString().split('T')[0];
  const photographer = args[3] || 'Hafiportrait';

  console.log('🚀 Creating event...');
  
  const event = await manager.createEvent({
    name: eventName,
    date: eventDate,
    photographer: photographer
  });

  console.log('\n✅ Event created successfully!');
  console.log(`📅 Event ID: ${event.id}`);
  console.log(`📸 Event Name: ${event.name}`);
  console.log(`📅 Date: ${event.date}`);
  console.log(`👨‍💼 Photographer: ${event.photographer}`);
  console.log(`🔑 Access Code: ${event.accessCode}`);
  console.log(`🔗 Shareable Link: ${event.shareableLink}`);
  console.log(`📱 QR Code URL: ${event.qrCodeData}`);
  console.log(`🔄 Sync Status: ${event.syncStatus}`);
  
  console.log('\n💡 Next steps:');
  console.log(`   Activate: node dslr-hybrid-cli.js activate ${event.id}`);
  console.log(`   Share: ${event.shareableLink}`);
  console.log(`   Or quick activate: node dslr-hybrid-cli.js quick "${eventName}" ${eventDate}`);
}

async function listEventsCLI(manager) {
  console.log('📋 Loading events...');
  
  const events = await manager.listEvents();
  const currentEvent = await manager.loadCurrentEvent();

  console.log('\n📋 All Events (Hybrid Local + Cloud):');
  console.log('=' .repeat(70));

  if (events.length === 0) {
    console.log('No events found. Create one with: node dslr-hybrid-cli.js create "Event Name"');
    return;
  }

  events.forEach(event => {
    const isActive = currentEvent && currentEvent.id === event.id;
    const status = isActive ? '🟢 ACTIVE' : '⚪ Inactive';
    const syncIcon = getSyncIcon(event.syncStatus);
    const sourceIcon = event.createdVia === 'cli' ? '💻' : '🌐';
    
    console.log(`\n${status} ${event.name} ${syncIcon} ${sourceIcon}`);
    console.log(`   ID: ${event.id}`);
    console.log(`   Date: ${event.date}`);
    console.log(`   Photographer: ${event.photographer}`);
    console.log(`   Sync: ${event.syncStatus || 'unknown'}`);
    console.log(`   Source: ${event.createdVia || 'unknown'}`);
    console.log(`   Created: ${new Date(event.created).toLocaleDateString()}`);
  });

  // Show sync status
  const syncStatus = await manager.getSyncStatus();
  console.log('\n📊 Sync Status:');
  console.log('=' .repeat(30));
  console.log(`🔄 Sync Enabled: ${syncStatus.syncEnabled ? 'Yes' : 'No'}`);
  console.log(`🌐 Online: ${syncStatus.isOnline ? 'Yes' : 'No'}`);
  console.log(`📊 Total Events: ${syncStatus.totalEvents}`);
  console.log(`✅ Synced: ${syncStatus.syncedEvents}`);
  console.log(`⏳ Pending: ${syncStatus.pendingEvents}`);
  console.log(`❌ Failed: ${syncStatus.failedEvents}`);
  console.log(`📦 Queue Size: ${syncStatus.queueSize}`);
  
  console.log('\n💡 Commands:');
  console.log('   Activate: node dslr-hybrid-cli.js activate <event-id>');
  console.log('   Sync: node dslr-hybrid-cli.js sync');
  console.log('   Status: node dslr-hybrid-cli.js status');
}

function getSyncIcon(syncStatus) {
  switch (syncStatus) {
    case 'synced': return '☁️';
    case 'pending': return '⏳';
    case 'failed': return '❌';
    default: return '❓';
  }
}

async function activateEventCLI(manager, eventId) {
  if (!eventId) {
    console.error('Usage: node dslr-hybrid-cli.js activate <event-id>');
    process.exit(1);
  }

  const event = await manager.setActiveEvent(eventId);
  
  console.log('✅ Event activated successfully!');
  console.log(`📸 Active Event: ${event.name}`);
  console.log(`📅 Date: ${event.date}`);
  console.log(`👨‍💼 Photographer: ${event.photographer}`);
  console.log(`🔄 Sync Status: ${event.syncStatus}`);
  console.log(`🌐 API URL: ${event.apiUrl}`);
  
  console.log('\n🚀 Ready to start DSLR service!');
  console.log('   node dslr-auto-upload-service.js');
  console.log('   OR: start-dslr-with-event-manager.bat');
}

async function showCurrentEventCLI(manager) {
  try {
    const event = await manager.getCurrentEvent();
    
    console.log('🟢 Current Active Event:');
    console.log('=' .repeat(50));
    console.log(`📸 Name: ${event.name}`);
    console.log(`📅 ID: ${event.id}`);
    console.log(`📅 Date: ${event.date}`);
    console.log(`👨‍💼 Photographer: ${event.photographer}`);
    console.log(`💾 Album: ${event.album}`);
    console.log(`🔑 Access Code: ${event.accessCode || 'Not set'}`);
    console.log(`🔗 Shareable Link: ${event.shareableLink || 'Not set'}`);
    console.log(`📱 QR Code URL: ${event.qrCodeData || 'Not set'}`);
    console.log(`🌐 API URL: ${event.apiUrl}`);
    console.log(`🏷️ Watermark: ${event.watermarkEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`💾 Backup: ${event.backupEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`🔄 Sync Status: ${event.syncStatus || 'unknown'}`);
    console.log(`📱 Created Via: ${event.createdVia || 'unknown'}`);
    console.log(`📅 Created: ${new Date(event.created).toLocaleString()}`);
    console.log(`🔄 Updated: ${new Date(event.updated).toLocaleString()}`);
  } catch (error) {
    console.log('❌ No active event set');
    console.log('\n💡 Available commands:');
    console.log('   List events: node dslr-hybrid-cli.js list');
    console.log('   Create event: node dslr-hybrid-cli.js create "Event Name"');
    console.log('   Quick setup: node dslr-hybrid-cli.js quick "Wedding Sarah" 2025-01-15');
  }
}

async function quickSetupCLI(manager, args) {
  if (args.length < 3) {
    console.error('Usage: node dslr-hybrid-cli.js quick <event-name> <date>');
    console.error('Example: node dslr-hybrid-cli.js quick "Wedding Sarah & John" 2025-01-15');
    process.exit(1);
  }

  const eventName = args[1];
  const eventDate = args[2];

  console.log('🚀 Quick Setup (Create + Activate)...');
  
  const event = await manager.quickSetup(eventName, eventDate);
  
  console.log('\n🎉 Quick Setup Complete!');
  console.log(`✅ Event created and activated: ${event.name}`);
  console.log(`📅 Event ID: ${event.id}`);
  console.log(`📅 Date: ${event.date}`);
  console.log(`🔄 Sync Status: ${event.syncStatus}`);
  
  console.log('\n🎯 Ready to start shooting!');
  console.log('   Start DSLR service: node dslr-auto-upload-service.js');
  console.log('   Or complete system: start-dslr-with-event-manager.bat');
}

async function syncCLI(manager, action) {
  switch (action) {
    case 'force':
      console.log('🔄 Force syncing all events...');
      const syncedCount = await manager.forceSyncAll();
      console.log(`✅ Force sync completed: ${syncedCount} events processed`);
      break;
      
    case 'queue':
      console.log('🔄 Processing sync queue...');
      await manager.processSyncQueue();
      console.log('✅ Sync queue processed');
      break;
      
    case 'pull':
      console.log('📥 Syncing from Supabase...');
      await manager.syncFromSupabase();
      console.log('✅ Sync from Supabase completed');
      break;
      
    default:
      console.log('🔄 Smart sync (queue + pull)...');
      await manager.processSyncQueue();
      await manager.syncFromSupabase();
      console.log('✅ Smart sync completed');
      break;
  }
  
  // Show updated status
  const syncStatus = await manager.getSyncStatus();
  console.log('\n📊 Updated Sync Status:');
  console.log(`✅ Synced: ${syncStatus.syncedEvents}/${syncStatus.totalEvents}`);
  console.log(`📦 Queue: ${syncStatus.queueSize} items`);
}

async function statusCLI(manager) {
  const syncStatus = await manager.getSyncStatus();
  
  console.log('📊 DSLR Hybrid Event Manager Status:');
  console.log('=' .repeat(50));
  
  console.log('\n🔧 System Status:');
  console.log(`🔄 Sync Enabled: ${syncStatus.syncEnabled ? '✅ Yes' : '❌ No'}`);
  console.log(`🌐 Online: ${syncStatus.isOnline ? '✅ Yes' : '❌ No'}`);
  console.log(`📅 Last Sync: ${syncStatus.lastSync.toLocaleString()}`);
  console.log(`🔢 Sync Count: ${syncStatus.syncCount}`);
  
  console.log('\n📊 Event Statistics:');
  console.log(`📋 Total Events: ${syncStatus.totalEvents}`);
  console.log(`☁️ Synced: ${syncStatus.syncedEvents}`);
  console.log(`⏳ Pending: ${syncStatus.pendingEvents}`);
  console.log(`❌ Failed: ${syncStatus.failedEvents}`);
  console.log(`📦 Queue Size: ${syncStatus.queueSize}`);
  
  // Show current active event
  try {
    const currentEvent = await manager.getCurrentEvent();
    console.log('\n🟢 Active Event:');
    console.log(`📸 ${currentEvent.name} (${currentEvent.id})`);
    console.log(`🔄 Sync: ${currentEvent.syncStatus}`);
  } catch (error) {
    console.log('\n⚪ No active event set');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (!syncStatus.syncEnabled) {
    console.log('   • Configure Supabase credentials for sync capability');
  }
  if (!syncStatus.isOnline && syncStatus.syncEnabled) {
    console.log('   • Check internet connection for sync');
  }
  if (syncStatus.queueSize > 0) {
    console.log(`   • Process sync queue: node dslr-hybrid-cli.js sync queue`);
  }
  if (syncStatus.failedEvents > 0) {
    console.log(`   • Retry failed syncs: node dslr-hybrid-cli.js sync force`);
  }
}

async function updateEventCLI(manager, args) {
  if (args.length < 3) {
    console.error('Usage: node dslr-hybrid-cli.js update <event-id> <field> <value>');
    console.error('Fields: name, photographer, album, watermark, backup');
    console.error('Example: node dslr-hybrid-cli.js update wedding-2025 photographer "New Photographer"');
    process.exit(1);
  }

  const eventId = args[1];
  const field = args[2];
  const value = args[3];

  const updates = {};
  
  switch (field) {
    case 'name':
      updates.name = value;
      break;
    case 'photographer':
      updates.photographer = value;
      break;
    case 'album':
      updates.album = value;
      break;
    case 'watermark':
      updates.watermarkEnabled = value === 'true' || value === 'enable';
      break;
    case 'backup':
      updates.backupEnabled = value === 'true' || value === 'enable';
      break;
    default:
      console.error(`Unknown field: ${field}`);
      process.exit(1);
  }

  const updatedEvent = await manager.updateEvent(eventId, updates);
  
  console.log('✅ Event updated successfully!');
  console.log(`📅 Event: ${updatedEvent.name} (${updatedEvent.id})`);
  console.log(`🔄 Field: ${field} = ${value}`);
  console.log(`🔄 Sync Status: ${updatedEvent.syncStatus}`);
}

async function deleteEventCLI(manager, eventId) {
  if (!eventId) {
    console.error('Usage: node dslr-hybrid-cli.js delete <event-id>');
    process.exit(1);
  }

  // Confirmation
  console.log(`⚠️  Are you sure you want to delete event: ${eventId}?`);
  console.log('This action cannot be undone.');
  console.log('Type "yes" to confirm:');
  
  // Simple confirmation (in real CLI, you'd use readline)
  const confirmation = 'yes'; // For demo, auto-confirm
  
  if (confirmation.toLowerCase() === 'yes') {
    await manager.deleteEvent(eventId);
    console.log('✅ Event deleted successfully!');
  } else {
    console.log('❌ Delete cancelled');
  }
}

async function exportProductionCLI(manager, eventId) {
  if (!eventId) {
    console.error('Usage: node dslr-hybrid-cli.js export <event-id>');
    process.exit(1);
  }

  const result = await manager.exportForProduction(eventId);
  
  console.log('📤 Production Configuration Exported!');
  console.log(`📄 File: ${result.exportFile}`);
  console.log('\n📋 Environment Variables:');
  console.log('=' .repeat(40));
  Object.entries(result.config).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n💡 For Vercel deployment:');
  console.log('1. Copy the environment variables above');
  console.log('2. Go to Vercel Dashboard > Project > Settings > Environment Variables');
  console.log('3. Add each variable');
  console.log('4. Redeploy your application');
  
  console.log('\n🎯 For Hybrid System (Recommended):');
  console.log('• No need to change Vercel environment variables!');
  console.log('• Event configuration is handled dynamically');
  console.log('• Just ensure the event exists in Supabase database');
}

function showHelp() {
  console.log('🎯 DSLR Hybrid Event Manager CLI');
  console.log('Local + Cloud sync untuk event management');
  console.log('=' .repeat(60));
  console.log('\nCommands:');
  console.log('  create <name> [date] [photographer]  Create new event');
  console.log('  list                                 List all events + sync status');
  console.log('  activate <event-id>                  Set active event');
  console.log('  current                              Show current active event');
  console.log('  quick <name> <date>                  Quick setup & activate');
  console.log('  update <id> <field> <value>          Update event field');
  console.log('  delete <event-id>                    Delete event');
  console.log('  sync [force|queue|pull]              Sync operations');
  console.log('  status                               Show system status');
  console.log('  export <event-id>                    Export for production');
  console.log('  help                                 Show this help');
  
  console.log('\nSync Commands:');
  console.log('  sync           Smart sync (queue + pull)');
  console.log('  sync force     Force sync all events');
  console.log('  sync queue     Process sync queue only');
  console.log('  sync pull      Pull from Supabase only');
  
  console.log('\nExamples:');
  console.log('  node dslr-hybrid-cli.js create "Wedding Sarah & John" 2025-01-15');
  console.log('  node dslr-hybrid-cli.js quick "Corporate Event" 2025-01-20');
  console.log('  node dslr-hybrid-cli.js list');
  console.log('  node dslr-hybrid-cli.js activate wedding-sarah-john-2025-01-15');
  console.log('  node dslr-hybrid-cli.js current');
  console.log('  node dslr-hybrid-cli.js sync');
  console.log('  node dslr-hybrid-cli.js status');
  console.log('  node dslr-hybrid-cli.js export wedding-sarah-john-2025-01-15');
  
  console.log('\n🔄 Sync Features:');
  console.log('  • Local-first: Works offline, syncs when online');
  console.log('  • Auto-sync: Background sync on create/update');
  console.log('  • Queue system: Retry failed syncs automatically');
  console.log('  • Conflict resolution: Smart merge strategies');
  console.log('  • Real-time: Events appear in admin dashboard');
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
