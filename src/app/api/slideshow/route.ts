import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET - Public endpoint for hero slideshow
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: photos, error } = await supabase
      .from('photos')
      .select('id, url, original_name, optimized_images')
      .eq('is_slideshow', true)
      .eq('slideshow_active', true)
      .order('slideshow_order', { ascending: true })
      .limit(5); // Limit to 5 photos for performance

    if (error) {
      console.error('Error fetching slideshow photos:', error);
      return NextResponse.json({ error: 'Failed to fetch slideshow photos' }, { status: 500 });
    }

    // Return empty array if no photos, hero will show fallback
    return NextResponse.json(photos || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}