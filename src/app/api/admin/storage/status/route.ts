import { NextRequest, NextResponse } from 'next/server';
import { storageAdapter } from '@/lib/storage-adapter';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching comprehensive storage status...');
    
    // Get storage report from Smart Storage Manager
    const storageReport = await storageAdapter.getStorageReport();
    
    // Get database statistics for photos with Smart Storage metadata
    const { data: smartStoragePhotos, error: smartError } = await supabaseAdmin
      .from('photos')
      .select('storage_tier, storage_provider, file_size, compression_used, uploaded_at, album_name')
      .not('storage_tier', 'is', null)
      .order('uploaded_at', { ascending: false });

    if (smartError) {
      console.warn('⚠️ Could not fetch Smart Storage photos:', smartError);
    }

    // Get total photos count
    const { count: totalPhotos, error: countError } = await supabaseAdmin
      .from('photos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('⚠️ Could not fetch total photos count:', countError);
    }

    // Analyze Smart Storage adoption
    const smartStorageCount = smartStoragePhotos?.length || 0;
    const totalCount = totalPhotos || 0;
    const adoptionRate = totalCount > 0 ? (smartStorageCount / totalCount) * 100 : 0;

    // Analyze tier distribution
    const tierDistribution = smartStoragePhotos?.reduce((acc: any, photo: any) => {
      const tier = photo.storage_tier || 'unknown';
      const provider = photo.storage_provider || 'unknown';
      
      if (!acc[tier]) {
        acc[tier] = { count: 0, totalSize: 0, providers: {} };
      }
      
      acc[tier].count++;
      acc[tier].totalSize += photo.file_size || 0;
      
      if (!acc[tier].providers[provider]) {
        acc[tier].providers[provider] = 0;
      }
      acc[tier].providers[provider]++;
      
      return acc;
    }, {}) || {};

    // Analyze album distribution
    const albumDistribution = smartStoragePhotos?.reduce((acc: any, photo: any) => {
      const album = photo.album_name || 'Unknown';
      if (!acc[album]) {
        acc[album] = { count: 0, totalSize: 0 };
      }
      acc[album].count++;
      acc[album].totalSize += photo.file_size || 0;
      return acc;
    }, {}) || {};

    // Recent uploads (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentUploads = smartStoragePhotos?.filter(photo => 
      new Date(photo.uploaded_at) > yesterday
    ) || [];

    const status = {
      storageReport,
      smartStorageAdoption: {
        totalPhotos: totalCount,
        smartStoragePhotos: smartStorageCount,
        adoptionRate: Math.round(adoptionRate * 100) / 100,
        legacyPhotos: totalCount - smartStorageCount
      },
      tierDistribution,
      albumDistribution,
      recentActivity: {
        last24Hours: recentUploads.length,
        recentUploads: recentUploads.slice(0, 10)
      },
      systemHealth: {
        cloudflareR2Available: !!(
          process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
          process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
          process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
          process.env.CLOUDFLARE_R2_BUCKET_NAME
        ),
        googleDriveAvailable: !!(
          process.env.GOOGLE_DRIVE_CLIENT_ID &&
          process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
          process.env.GOOGLE_DRIVE_REFRESH_TOKEN
        ),
        localStorageAvailable: true
      }
    };

    console.log('✅ Storage status retrieved successfully');
    console.log(`📊 Smart Storage adoption: ${adoptionRate.toFixed(1)}% (${smartStorageCount}/${totalCount})`);

    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching storage status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch storage status',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}