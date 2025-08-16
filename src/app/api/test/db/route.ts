import { NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET() {
  try {
    const stats = await database.getStats();
    
    return NextResponse.json({ 
      success: true, 
      message: "Supabase Database connection successful!",
      stats,
      config: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
        service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set"
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Supabase Database connection failed", 
        error: error.message,
        config: {
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
          service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Not set"
        }
      },
      { status: 500 }
    );
  }
} 