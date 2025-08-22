#!/usr/bin/env node

/**
 * Debug Tier Selection
 * Check why photos go to local instead of Cloudflare R2
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function debugTierSelection() {
  console.log('\n🔍 DEBUGGING TIER SELECTION\n');
  
  try {
    const SmartStorageManager = require('./src/lib/smart-storage-manager');
    const storageManager = new SmartStorageManager();
    
    // Test metadata
    const testMetadata = {
      eventId: 'test-event',
      albumName: 'Test',
      uploaderName: 'Debug Test',
      isHomepage: false,
      isPremium: false,
      isFeatured: false,
      fileSize: 320000 // 320KB
    };
    
    console.log('📋 Test metadata:');
    console.log('   Event ID:', testMetadata.eventId);
    console.log('   Album:', testMetadata.albumName);
    console.log('   File size:', (testMetadata.fileSize / 1024).toFixed(2), 'KB');
    console.log('   Is homepage:', testMetadata.isHomepage);
    console.log('   Is premium:', testMetadata.isPremium);
    
    console.log('\n🎯 Testing tier selection...');
    
    // Test tier selection
    const storagePlan = await storageManager.determineStorageTier(testMetadata);
    
    console.log('\n📊 TIER SELECTION RESULT:');
    console.log('   Selected tier:', storagePlan.tier);
    console.log('   Compression:', storagePlan.compression);
    console.log('   Priority:', storagePlan.priority);
    
    // Check storage availability
    console.log('\n🔍 STORAGE AVAILABILITY CHECK:');
    
    // Check Cloudflare R2
    console.log('\n1. Cloudflare R2:');
    try {
      const CloudflareR2Storage = require('./src/lib/cloudflare-r2-storage');
      const r2 = new CloudflareR2Storage();
      
      const hasCredentials = !!(
        process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
        process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
        process.env.CLOUDFLARE_R2_BUCKET_NAME
      );
      
      console.log('   Credentials available:', hasCredentials ? '✅ Yes' : '❌ No');
      
      if (hasCredentials) {
        const connectionOk = await r2.testConnection();
        console.log('   Connection test:', connectionOk ? '✅ Success' : '❌ Failed');
        
        const storageInfo = await r2.getStorageInfo();
        if (storageInfo) {
          console.log('   Storage used:', storageInfo.usedGB, 'GB /', storageInfo.limitGB, 'GB');
          console.log('   Available space:', storageInfo.availableGB, 'GB');
          console.log('   Has space for file:', storageInfo.available > testMetadata.fileSize ? '✅ Yes' : '❌ No');
        }
      }
    } catch (error) {
      console.log('   Error:', error.message);
    }
    
    // Check Google Drive
    console.log('\n2. Google Drive:');
    try {
      const GoogleDriveStorage = require('./src/lib/google-drive-storage');
      const drive = new GoogleDriveStorage();
      
      const hasCredentials = !!(
        process.env.GOOGLE_DRIVE_CLIENT_ID &&
        process.env.GOOGLE_DRIVE_CLIENT_SECRET
      );
      
      console.log('   Credentials available:', hasCredentials ? '✅ Yes' : '❌ No');
      
      if (hasCredentials) {
        try {
          const connectionOk = await drive.testConnection();
          console.log('   Connection test:', connectionOk ? '✅ Success' : '❌ Failed');
        } catch (error) {
          console.log('   Connection test: ❌ Failed -', error.message.substring(0, 50));
        }
      }
    } catch (error) {
      console.log('   Error:', error.message);
    }
    
    // Check Local Storage
    console.log('\n3. Local Storage:');
    const fs = require('fs');
    const backupFolder = './dslr-backup';
    
    try {
      if (!fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder, { recursive: true });
      }
      console.log('   Backup folder:', '✅ Available');
      console.log('   Path:', backupFolder);
      console.log('   Always has space:', '✅ Yes');
    } catch (error) {
      console.log('   Error:', error.message);
    }
    
    // Analyze why tier was selected
    console.log('\n🧠 TIER SELECTION ANALYSIS:');
    
    if (storagePlan.tier === 'cloudflareR2') {
      console.log('   ✅ Cloudflare R2 selected - Perfect!');
    } else if (storagePlan.tier === 'googleDrive') {
      console.log('   ⚠️ Google Drive selected - Cloudflare R2 might be unavailable');
    } else if (storagePlan.tier === 'local') {
      console.log('   ⚠️ Local storage selected - Both cloud providers unavailable');
      console.log('   💡 This usually means:');
      console.log('      - Cloudflare R2 credentials missing or invalid');
      console.log('      - Google Drive not authenticated');
      console.log('      - Network connectivity issues');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run debug
if (require.main === module) {
  debugTierSelection().catch(console.error);
}

module.exports = { debugTierSelection };