import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all listings created by this user
    const { data: listings, error } = await supabase
      .from('food_listings')
      .select('*')
      .eq('donor_id', decoded.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Listings error:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    return NextResponse.json({ listings: listings || [] });
  } catch (err) {
    console.error('My listings error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
