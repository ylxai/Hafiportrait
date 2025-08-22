import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get simple compression analytics without complex RPC
    const analytics = await database.getSimpleCompressionAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching simple compression analytics:', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: "Failed to fetch compression analytics", error: errorMessage },
      { status: 500 }
    );
  }
}