import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Variabel untuk URL dan kunci API Supabase (untuk database operations)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Variabel untuk S3 API Supabase Storage
const supabaseS3Endpoint = process.env.SUPABASE_ENDPOINT || '';
const supabaseAccessKey = process.env.SUPABASE_ACCESS_KEY || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';
const supabaseBucketName = process.env.SUPABASE_BUCKET_NAME || 'host';

if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL dan SUPABASE_KEY harus disediakan di variabel lingkungan');
}

if (!supabaseS3Endpoint || !supabaseAccessKey || !supabaseSecretKey) {
  console.warn('SUPABASE S3 credentials (ENDPOINT, ACCESS_KEY, SECRET_KEY) harus disediakan di variabel lingkungan');
}

// Membuat klien Supabase untuk operasi database
export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

// Membuat klien Supabase untuk operasi admin database
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Membuat S3 client untuk Supabase Storage operations
export const s3Client = new S3Client({
  endpoint: supabaseS3Endpoint,
  region: 'us-east-1', // Supabase uses us-east-1
  credentials: {
    accessKeyId: supabaseAccessKey,
    secretAccessKey: supabaseSecretKey,
  },
  forcePathStyle: true, // Required for Supabase S3 API
});

// Bucket untuk menyimpan foto
export const PHOTOS_BUCKET = supabaseBucketName;

// Fungsi untuk upload file ke S3
export async function uploadToS3(filePath: string, buffer: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: PHOTOS_BUCKET,
    Key: filePath,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // Make files publicly accessible
  });

  try {
    const response = await s3Client.send(command);
    console.log('S3 upload successful:', response);
    
    // Generate public URL
    const publicUrl = `${supabaseS3Endpoint.replace('/s3', '')}/object/public/${PHOTOS_BUCKET}/${filePath}`;
    return { success: true, publicUrl };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

// Fungsi untuk hapus file dari S3
export async function deleteFromS3(filePath: string) {
  const command = new DeleteObjectCommand({
    Bucket: PHOTOS_BUCKET,
    Key: filePath,
  });

  try {
    const response = await s3Client.send(command);
    console.log('S3 delete successful:', response);
    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error);
    throw error;
  }
}

// Fungsi untuk memeriksa konfigurasi S3
export async function setupS3Storage() {
  try {
    console.log('🔧 Supabase S3 Storage Configuration:');
    console.log('   Endpoint:', supabaseS3Endpoint);
    console.log('   Bucket:', PHOTOS_BUCKET);
    console.log('   Access Key:', supabaseAccessKey ? `${supabaseAccessKey.substring(0, 8)}...` : 'Not provided');
    
    if (!supabaseS3Endpoint || !supabaseAccessKey || !supabaseSecretKey) {
      console.warn('⚠️  S3 credentials tidak lengkap!');
      console.warn('   Pastikan environment variables berikut sudah diset:');
      console.warn('   - SUPABASE_ENDPOINT');
      console.warn('   - SUPABASE_ACCESS_KEY');
      console.warn('   - SUPABASE_SECRET_KEY');
      console.warn('   - SUPABASE_BUCKET_NAME');
      return;
    }

    console.log('✅ S3 Storage configuration ready');
    
    // Test connection dengan list objects (opsional)
    try {
      // Simple test - we can implement this later if needed
      console.log('💡 S3 client initialized successfully');
    } catch (testError) {
      console.warn('⚠️  S3 connection test failed:', testError);
    }

  } catch (error) {
    console.error('Error setting up S3 storage:', error);
    console.warn('🔧 Please check your S3 configuration');
  }
} 