import { NextRequest, NextResponse } from 'next/server';

/**
 * Send test notification
 * POST /api/notifications/test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, title, body: message, data = {} } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'FCM token is required' },
        { status: 400 }
      );
    }

    // Create test notification
    const testNotification = {
      title: title || '🧪 Test Notification',
      body: message || 'This is a test notification from Hafi Portrait Admin Dashboard',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        type: 'test',
        url: '/admin',
        timestamp: new Date().toISOString(),
        testId: `test_${Date.now()}`,
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'Open Dashboard'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    // Send test notification
    const result = await sendTestNotification(token, testNotification);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Test notification sent successfully',
          notificationId: testNotification.data.testId,
          sentAt: testNotification.data.timestamp
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}

async function sendTestNotification(token: string, notification: any): Promise<{ success: boolean, error?: string }> {
  try {
    // In production, use Firebase Admin SDK
    // const admin = require('firebase-admin');
    // const messaging = admin.messaging();
    
    // TODO: Replace with actual Firebase Admin SDK call
    // const result = await messaging.send({
    //   token: token,
    //   notification: {
    //     title: notification.title,
    //     body: notification.body
    //   },
    //   data: notification.data,
    //   webpush: {
    //     notification: {
    //       icon: notification.icon,
    //       badge: notification.badge,
    //       actions: notification.actions,
    //       requireInteraction: true,
    //       tag: 'test-notification'
    //     }
    //   }
    // });

    // Mock success for now
    console.log(`✅ Test notification sent to: ${token.substring(0, 16)}...`);
    console.log('📧 Notification content:', {
      title: notification.title,
      body: notification.body,
      data: notification.data
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}