#!/usr/bin/env node

/**
 * Check Cloudflare R2 Bucket Contents
 * List all files in the bucket
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function checkBucketContents() {
  console.log('\n📁 CHECKING CLOUDFLARE R2 BUCKET CONTENTS\n');
  
  try {
    const CloudflareR2Storage = require('./src/lib/cloudflare-r2-storage');
    const r2 = new CloudflareR2Storage();
    
    console.log('🔍 Listing all files in bucket...');
    const files = await r2.listFiles('', 50); // List up to 50 files
    
    if (files.length === 0) {
      console.log('📂 Bucket is empty');
      return;
    }
    
    console.log(`📊 Found ${files.length} files:\n`);
    
    files.forEach((file, index) => {
      const sizeKB = (file.size / 1024).toFixed(2);
      const fileType = file.key.split('.').pop().toUpperCase();
      const uploadDate = new Date(file.lastModified).toLocaleString();
      
      console.log(`${index + 1}. ${file.key}`);
      console.log(`   📊 Size: ${sizeKB} KB`);
      console.log(`   📅 Uploaded: ${uploadDate}`);
      console.log(`   🔗 URL: ${file.url}`);
      console.log(`   📄 Type: ${fileType}`);
      console.log('');
    });
    
    // Categorize files
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.key));
    const testFiles = files.filter(f => /\.(txt)$/i.test(f.key));
    const otherFiles = files.filter(f => !/\.(jpg|jpeg|png|webp|txt)$/i.test(f.key));
    
    console.log('📊 FILE SUMMARY:');
    console.log(`   🖼️ Images: ${imageFiles.length} files`);
    console.log(`   🧪 Test files: ${testFiles.length} files`);
    console.log(`   📄 Other: ${otherFiles.length} files`);
    
    if (testFiles.length > 0) {
      console.log('\n💡 Test files (.txt) are from connection tests and can be ignored');
      console.log('   They will be automatically cleaned up or you can delete them manually');
    }
    
    if (imageFiles.length > 0) {
      console.log('\n🎉 Image uploads are working! Your photos are stored in Cloudflare R2');
    }
    
  } catch (error) {
    console.error('❌ Failed to check bucket contents:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  checkBucketContents().catch(console.error);
}

module.exports = { checkBucketContents };