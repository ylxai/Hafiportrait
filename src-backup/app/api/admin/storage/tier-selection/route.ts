import { NextRequest, NextResponse } from 'next/server';
import { storageAdapter } from '@/lib/storage-adapter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fileSize, 
      eventId, 
      albumName, 
      uploaderName, 
      isHomepage = false,
      isPremium = false,
      isFeatured = false,
      eventType = 'standard',
      fileType = 'image/jpeg'
    } = body;

    if (!fileSize) {
      return NextResponse.json(
        { error: 'File size is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Determining storage tier for file size: ${fileSize} bytes`);

    // Prepare metadata for tier selection
    const metadata = {
      eventId,
      albumName: albumName || 'Tamu',
      uploaderName: uploaderName || 'Anonymous',
      isHomepage,
      isPremium,
      isFeatured,
      fileSize,
      eventType,
      fileType
    };

    // Get optimal storage tier
    const tierSelection = await storageAdapter.determineStorageTier(metadata);
    
    // Get storage space availability for each tier
    const spaceCheck = {
      cloudflareR2: await storageAdapter.hasStorageSpace('cloudflareR2', fileSize),
      googleDrive: await storageAdapter.hasStorageSpace('googleDrive', fileSize),
      local: await storageAdapter.hasStorageSpace('local', fileSize)
    };

    console.log(`✅ Tier selection completed:`, {
      selectedTier: tierSelection.tier,
      compression: tierSelection.compression,
      priority: tierSelection.priority
    });

    return NextResponse.json({
      success: true,
      data: {
        selectedTier: tierSelection,
        spaceAvailability: spaceCheck,
        metadata,
        recommendations: {
          tier: tierSelection.tier,
          reason: getTierSelectionReason(tierSelection, spaceCheck),
          compression: tierSelection.compression,
          priority: tierSelection.priority
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in tier selection:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Tier selection failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

function getTierSelectionReason(tierSelection: any, spaceCheck: any): string {
  const tier = tierSelection.tier;
  
  if (tier === 'cloudflareR2') {
    if (spaceCheck.cloudflareR2) {
      return 'Cloudflare R2 selected for optimal performance and global CDN access';
    } else {
      return 'Cloudflare R2 preferred but no space available';
    }
  }
  
  if (tier === 'googleDrive') {
    return 'Google Drive selected as secondary storage with good reliability';
  }
  
  if (tier === 'local') {
    return 'Local storage selected as fallback option';
  }
  
  return 'Tier selection based on availability and file characteristics';
}