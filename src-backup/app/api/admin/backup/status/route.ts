/**
 * API Endpoint for Global Backup Status Monitoring
 * Provides overview of all backup operations
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting global backup status');
    
    // Import EventStorageManager
    const EventStorageManager = require('@/lib/event-storage-manager');
    const eventStorageManager = new EventStorageManager();
    
    // Get all backup statuses
    const allBackups: any[] = await eventStorageManager.getAllBackupStatuses();
    
    // Calculate summary statistics
    const summary = {
      totalBackups: allBackups.length,
      activeBackups: allBackups.filter((b: any) => b.status === 'backing_up' || b.status === 'initializing').length,
      completedBackups: allBackups.filter((b: any) => b.status === 'completed').length,
      failedBackups: allBackups.filter((b: any) => b.status === 'failed').length,
      totalPhotosBackedUp: allBackups.reduce((sum: number, b: any) => sum + (b.successfulUploads || 0), 0),
      totalPhotosFailed: allBackups.reduce((sum: number, b: any) => sum + (b.failedUploads || 0), 0)
    };
    
    // Get recent backups (last 10)
    const recentBackups = allBackups
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10);
    
    return NextResponse.json({
      success: true,
      data: {
        summary,
        recentBackups,
        allBackups: allBackups.length > 10 ? allBackups : recentBackups
      }
    });
    
  } catch (error: any) {
    console.error('❌ Failed to get backup status:', error);
    
    return NextResponse.json({
      success: false,
      message: `Failed to get backup status: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxAge = parseInt(searchParams.get('maxAge') || '7'); // days
    
    console.log(`🧹 Cleaning up backup statuses older than ${maxAge} days`);
    
    // Import EventStorageManager
    const EventStorageManager = require('@/lib/event-storage-manager');
    const eventStorageManager = new EventStorageManager();
    
    // Clean up old backup statuses
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
    eventStorageManager.cleanupOldBackupStatuses(maxAgeMs);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up backup statuses older than ${maxAge} days`
    });
    
  } catch (error: any) {
    console.error('❌ Failed to cleanup backup statuses:', error);
    
    return NextResponse.json({
      success: false,
      message: `Failed to cleanup backup statuses: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}