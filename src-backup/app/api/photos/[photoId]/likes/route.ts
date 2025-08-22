import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase'; // Mengimpor supabaseAdmin langsung

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;
    const body = await request.json();
    const { likes } = body;

    if (typeof likes !== 'number') {
      return NextResponse.json(
        { message: "Likes must be a number" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin langsung
      .from('photos')
      .update({ likes })
      .eq('id', photoId)
      .select()
      .single();

    if (error) {
      throw new Error(`Update likes failed: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { message: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update photo likes error:', error);
    return NextResponse.json(
      { message: "Failed to update likes", error: error.message },
      { status: 500 }
    );
  }
} 