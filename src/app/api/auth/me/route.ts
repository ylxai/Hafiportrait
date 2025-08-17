/**
 * Get Current User API Endpoint
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { corsResponse, corsErrorResponse, handleOptions } from '@/lib/cors';

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth me endpoint called');
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;
    console.log('🍪 Session ID from cookie:', sessionId ? 'exists' : 'missing');

    if (!sessionId) {
      return corsErrorResponse('No active session', 401);
    }

    // Validate session with error handling
    let user;
    try {
      user = await validateSession(sessionId);
      console.log('🔍 Session validation result:', user ? 'valid user found' : 'no user found');
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return corsErrorResponse('Session validation failed', 500);
    }
    
    if (!user) {
      console.log('🚫 Invalid session, clearing cookie');
      // Clear invalid session cookie
      const cookieStoreForClear = await cookies();
      cookieStoreForClear.set('admin_session', '', {
        httpOnly: true,
        secure: false, // Match login cookie setting
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });

      return corsErrorResponse('Invalid or expired session', 401);
    }

    // Return user data (without sensitive info)
    return corsResponse({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        last_login: user.last_login
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return corsErrorResponse('Internal server error', 500);
  }
}