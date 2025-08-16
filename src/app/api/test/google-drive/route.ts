/**
 * Test Google Drive Environment Variables
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const googleDriveConfig = {
      clientId: process.env.GOOGLE_DRIVE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN ? '✅ Set' : '❌ Missing',
      folderName: process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Not set',
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || 'Not set',
    };

    // Test Google Drive initialization
    let initTest = 'Not tested';
    try {
      const GoogleDriveStorage = require('@/lib/google-drive-storage');
      const googleDrive = new GoogleDriveStorage();
      const initResult = await googleDrive.initialize();
      initTest = initResult ? '✅ Success' : '❌ Failed';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      initTest = `❌ Error: ${message}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Google Drive environment test',
      config: googleDriveConfig,
      initialization: initTest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      message: 'Google Drive test failed',
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}