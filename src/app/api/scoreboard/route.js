import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    // Get top 50 donors for the city, ordered by score
    const { data: topDonors, error } = await supabase
      .from('users')
      .select('id, name, score, donation_count, is_ngo, ngo_name, city')
      .eq('city', city.trim())
      .gt('donation_count', 0)
      .order('score', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Scoreboard error:', error);
      return NextResponse.json({ error: 'Failed to fetch scoreboard' }, { status: 500 });
    }

    // Add rank
    const ranked = (topDonors || []).map((donor, index) => ({
      ...donor,
      rank: index + 1,
    }));

    return NextResponse.json({ scoreboard: ranked, city });
  } catch (err) {
    console.error('Scoreboard error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
