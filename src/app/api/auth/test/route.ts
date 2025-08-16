/**
 * Test API Endpoint for CORS and Connectivity
 * GET /api/auth/test
 */

import { NextRequest, NextResponse } from 'next/server';
import { corsResponse, corsErrorResponse, handleOptions } from '@/lib/cors';

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || undefined;
  console.log('TEST API - OPTIONS request from origin:', origin);
  return handleOptions(origin);
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || undefined;
  console.log('TEST API - GET request from origin:', origin);
  console.log('TEST API - Request URL:', request.url);
  console.log('TEST API - Request headers:', Object.fromEntries(request.headers.entries()));

  return corsResponse({
    success: true,
    message: 'Test API endpoint is working',
    timestamp: new Date().toISOString(),
    origin: origin,
    environment: process.env.NODE_ENV,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  }, 200, origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || undefined;
  console.log('TEST API - POST request from origin:', origin);
  console.log('TEST API - Request URL:', request.url);
  console.log('TEST API - Request headers:', Object.fromEntries(request.headers.entries()));

  try {
    const body = await request.json();
    console.log('TEST API - Request body:', body);

    return corsResponse({
      success: true,
      message: 'Test POST API endpoint is working',
      timestamp: new Date().toISOString(),
      origin: origin,
      environment: process.env.NODE_ENV,
      receivedData: body
    }, 200, origin);
  } catch (error) {
    console.error('TEST API - Error parsing body:', error);
    return corsErrorResponse('Invalid JSON in request body', 400, origin);
  }
}