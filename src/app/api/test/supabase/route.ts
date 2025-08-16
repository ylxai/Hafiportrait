import { NextResponse } from 'next/server';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Bucket list error: ${bucketsError.message}`);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1 });

    return NextResponse.json({ 
      success: true, 
      message: "Supabase Storage connection successful!",
      bucket: STORAGE_BUCKET,
      bucketExists,
      buckets: buckets?.map(b => b.name) || [],
      filesError: filesError?.message || null,
      config: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
        anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set", 
        service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set",
        bucket_name: process.env.SUPABASE_STORAGE_BUCKET ? "✅ Set" : "❌ Using default"
      }
    });
  } catch (error: any) {
    console.error('Supabase test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Supabase Storage connection failed", 
        error: error.message,
        config: {
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
          anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set",
          service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set",
          bucket_name: process.env.SUPABASE_STORAGE_BUCKET ? "✅ Set" : "❌ Using default"
        }
      },
      { status: 500 }
    );
  }
} 