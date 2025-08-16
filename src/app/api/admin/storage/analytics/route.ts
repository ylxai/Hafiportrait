import { NextRequest, NextResponse } from 'next/server';
import { smartDatabase } from '@/lib/database-with-smart-storage';
import { storageAdapter } from '@/lib/storage-adapter';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching storage analytics...');
    
    // Get comprehensive storage analytics
    const analytics = await smartDatabase.getStorageAnalytics();
    
    console.log('✅ Storage analytics retrieved successfully');
    
    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching storage analytics:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch storage analytics',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, retentionDays } = body;
    
    if (action === 'cleanup') {
      console.log(`🧹 Starting cleanup with retention: ${retentionDays || 30} days`);
      
      await smartDatabase.cleanupOldFiles(retentionDays || 30);
      
      console.log('✅ Cleanup completed successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Cleanup completed successfully',
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'storage-report') {
      console.log('📊 Generating detailed storage report...');
      
      const report = await storageAdapter.getStorageReport();
      
      return NextResponse.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Supported actions: cleanup, storage-report' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ Error in storage analytics POST:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false,
        error: 'Storage operation failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}