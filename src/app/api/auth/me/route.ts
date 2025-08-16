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
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;

    if (!sessionId) {
      return corsErrorResponse('No active session', 401);
    }

    // Validate session
    const user = await validateSession(sessionId);
    
    if (!user) {
      // Clear invalid session cookie
      const cookieStoreForClear = await cookies();
      cookieStoreForClear.set('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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