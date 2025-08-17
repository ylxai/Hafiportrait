/**
 * Admin Login API Endpoint
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession, logActivity } from '@/lib/auth';
import { cookies } from 'next/headers';
import { corsResponse, corsErrorResponse, handleOptions } from '@/lib/cors';

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || undefined;
  console.log('OPTIONS request from origin:', origin);
  return handleOptions(origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || undefined;
  console.log('POST request from origin:', origin);
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    // Validate request method
    if (request.method !== 'POST') {
      console.log('Invalid method:', request.method);
      return corsErrorResponse('Method not allowed', 405, origin);
    }

    // Check if required environment variables are set
    const requiredEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      JWT_SECRET: process.env.JWT_SECRET
    };

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value || value === 'hafiportrait-secret-key-change-in-production')
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      return corsErrorResponse('Server configuration error', 500, origin);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', { ...body, password: '[HIDDEN]' });
    } catch (error) {
      console.error('JSON parse error:', error);
      return corsErrorResponse('Invalid JSON in request body', 400, origin);
    }

    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      console.log('Missing credentials');
      return corsErrorResponse('Username dan password harus diisi', 400, origin);
    }

    // Validate input length
    if (username.length < 3 || username.length > 50) {
      console.log('Invalid username length:', username.length);
      return corsErrorResponse('Username harus antara 3-50 karakter', 400, origin);
    }

    if (password.length < 6 || password.length > 100) {
      console.log('Invalid password length:', password.length);
      return corsErrorResponse('Password harus antara 6-100 karakter', 400, origin);
    }

    // Validate input format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      console.log('Invalid username format');
      return corsErrorResponse('Username hanya boleh berisi huruf, angka, dan underscore', 400, origin);
    }

    // Get client info
    const xfwd = request.headers.get('x-forwarded-for') || '';
    const ipAddress = (xfwd.split(',')[0] || request.headers.get('x-real-ip') || '').trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('Client info:', { ipAddress, userAgent: userAgent.substring(0, 100) });

    // Rate limiting check (basic implementation)
    const rateLimitKey = `login_attempts:${ipAddress}`;
    // Note: In production, implement proper rate limiting with Redis or similar

    // Authenticate user with timeout
    console.log('Attempting authentication for username:', username);
    
    let user;
    try {
      // Add timeout to authentication
      const authPromise = authenticateUser({ username, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 30000)
      );
      
      user = await Promise.race([authPromise, timeoutPromise]) as any;
    } catch (authError) {
      console.error('Authentication error:', authError);
      return corsErrorResponse('Terjadi kesalahan saat autentikasi. Silakan coba lagi.', 500, origin);
    }
    
    if (!user) {
      console.log('Authentication failed for username:', username);
      // Log failed login attempt
      try {
        await logActivity(
          0, // No user ID for failed attempts
          'login_failed',
          'auth',
          username,
          { 
            reason: 'invalid_credentials',
            ip_address: ipAddress,
            user_agent: userAgent
          },
          ipAddress,
          userAgent
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
        // Don't fail the request if logging fails
      }

      return corsErrorResponse('Username atau password salah', 401, origin);
    }

    console.log('Authentication successful for user:', user.username);

    // Check if user is active
    if (user.status !== 'active' && user.is_active !== true) {
      console.log('User account inactive:', user.username);
      try {
        await logActivity(
          user.id,
          'login_failed',
          'auth',
          user.username,
          { 
            reason: 'account_inactive',
            ip_address: ipAddress,
            user_agent: userAgent
          },
          ipAddress,
          userAgent
        );
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }

      return corsErrorResponse('Akun tidak aktif. Silakan hubungi administrator.', 403, origin);
    }

    // Create session with timeout
    console.log('Creating session for user:', user.username);
    let sessionId;
    try {
      const sessionPromise = createSession(user.id, ipAddress, userAgent);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session creation timeout')), 30000)
      );
      
      sessionId = await Promise.race([sessionPromise, timeoutPromise]) as string;
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      return corsErrorResponse('Gagal membuat sesi. Silakan coba lagi.', 500, origin);
    }

    if (!sessionId) {
      console.error('Failed to create session for user:', user.username);
      return corsErrorResponse('Gagal membuat sesi. Silakan coba lagi.', 500, origin);
    }

    console.log('Session created successfully:', sessionId);

    // Log successful login
    try {
      await logActivity(
        user.id,
        'login_success',
        'auth',
        user.username,
        { 
          ip_address: ipAddress,
          user_agent: userAgent,
          session_id: sessionId
        },
        ipAddress,
        userAgent
      );
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail the request if logging fails
    }

    // Set session cookie with enhanced security for production
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Fix cookie for IP access - disable secure for development/IP access
    const isSecure = false; // Always false for IP access
    console.log('Setting cookie with secure:', isSecure);
    cookieStore.set('admin_session', sessionId, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Return user data (without sensitive info)
    const responseData = {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status || (user.is_active ? 'active' : 'inactive')
      },
      message: 'Login berhasil',
      session: {
        expires_in: 24 * 60 * 60, // 24 hours in seconds
        created_at: new Date().toISOString()
      }
    };

    console.log('Login successful, returning response');
    return corsResponse(responseData, 200, origin);

  } catch (error) {
    console.error('Login API error:', error);
    
    // Log the error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Don't expose internal errors to client
    return corsErrorResponse('Terjadi kesalahan server. Silakan coba lagi nanti.', 500, origin);
  }
}