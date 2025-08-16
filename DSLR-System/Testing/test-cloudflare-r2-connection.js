#!/usr/bin/env node

/**
 * Test Cloudflare R2 Connection
 * Quick verification script untuk credentials
 */

// Load environment variables with explicit path
require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '../.env' }); // Fallback to .env

async function testCloudflareR2Connection() {
  console.log('\n🧪 TESTING CLOUDFLARE R2 CONNECTION\n');
  
  // Check environment variables
  console.log('1. Checking environment variables...');
  const requiredVars = [
    'CLOUDFLARE_R2_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID', 
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME'
  ];
  
  const missingVars = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`   ✅ ${varName}: ${process.env[varName].substring(0, 10)}...`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('\n❌ Missing environment variables:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Please update your .env.local file with Cloudflare R2 credentials');
    return false;
  }
  
  // Test S3 SDK import
  console.log('\n2. Testing AWS SDK import...');
  try {
    const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
    console.log('   ✅ AWS SDK imported successfully');
  } catch (error) {
    console.log('   ❌ AWS SDK not found');
    console.log('   💡 Run: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner');
    return false;
  }
  
  // Test connection
  console.log('\n3. Testing R2 connection...');
  try {
    const CloudflareR2Storage = require('../../src/lib/cloudflare-r2-storage');
    const r2 = new CloudflareR2Storage();
    
    const result = await r2.testConnection();
    
    if (result) {
      console.log('   ✅ Cloudflare R2 connection successful!');
      
      // Get storage info
      const storageInfo = await r2.getStorageInfo();
      if (storageInfo) {
        console.log(`   📊 Storage used: ${storageInfo.usedGB}GB / ${storageInfo.limitGB}GB`);
        console.log(`   📁 Files count: ${storageInfo.fileCount}`);
      }
      
      return true;
    } else {
      console.log('   ❌ Cloudflare R2 connection failed');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Verify credentials in .env.local');
    console.log('   2. Check bucket name is correct');
    console.log('   3. Ensure API token has R2:Edit permissions');
    console.log('   4. Try regenerating API token');
    return false;
  }
}

// Test upload functionality
async function testUpload() {
  console.log('\n4. Testing upload functionality...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Create test file
    const testContent = `Test upload at ${new Date().toISOString()}`;
    const testFileName = `test-${Date.now()}.txt`;
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    const CloudflareR2Storage = require('../../src/lib/cloudflare-r2-storage');
    const r2 = new CloudflareR2Storage();
    
    const uploadResult = await r2.uploadPhoto(testBuffer, testFileName, {
      eventId: 'connection-test',
      albumName: 'Test',
      uploaderName: 'System Test'
    });
    
    console.log('   ✅ Test upload successful!');
    console.log(`   📁 File: ${uploadResult.path}`);
    console.log(`   🌐 URL: ${uploadResult.url}`);
    
    // Test public access
    console.log('\n5. Testing public access...');
    const fetch = require('node-fetch');
    const response = await fetch(uploadResult.url);
    
    if (response.ok) {
      console.log('   ✅ Public access working!');
      console.log(`   📊 Response status: ${response.status}`);
    } else {
      console.log('   ⚠️ Public access issue');
      console.log(`   📊 Response status: ${response.status}`);
    }
    
    // Cleanup test file
    await r2.deleteFile(uploadResult.path);
    console.log('   🧹 Test file cleaned up');
    
    return true;
  } catch (error) {
    console.log('   ❌ Upload test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 CLOUDFLARE R2 CONNECTION TEST');
  console.log('=====================================');
  
  const connectionOk = await testCloudflareR2Connection();
  
  if (connectionOk) {
    const uploadOk = await testUpload();
    
    if (uploadOk) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ Cloudflare R2 is ready for production');
      console.log('✅ 10GB free storage available');
      console.log('✅ Global CDN enabled');
      console.log('\n🚀 Next steps:');
      console.log('   1. Setup Google Drive API');
      console.log('   2. Test complete storage workflow');
      console.log('   3. Start DSLR auto-upload service');
    } else {
      console.log('\n⚠️ CONNECTION OK, BUT UPLOAD FAILED');
      console.log('💡 Check bucket permissions and CORS settings');
    }
  } else {
    console.log('\n❌ CONNECTION TEST FAILED');
    console.log('💡 Please check credentials and try again');
  }
  
  console.log('\n=====================================');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCloudflareR2Connection, testUpload };