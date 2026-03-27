import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { filterByRadius } from '@/lib/geolocation';

// GET: List available food within 5km
export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get all available food listings (not by current user)
    const { data: listings, error } = await supabase
      .from('food_listings')
      .select(`
        *,
        donor:users!donor_id (id, name, phone, city, is_ngo, ngo_name)
      `)
      .eq('status', 'available')
      .neq('donor_id', decoded.id);

    if (error) {
      console.error('Fetch food error:', error);
      return NextResponse.json({ error: 'Failed to fetch food listings' }, { status: 500 });
    }

    // Filter within 5km
    const nearbyFood = filterByRadius(listings || [], lat, lng, 5);

    return NextResponse.json({ listings: nearbyFood });
  } catch (err) {
    console.error('Food GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new food listing
export async function POST(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, quantity, photo_url, latitude, longitude } = body;

    if (!title || !quantity || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Title, quantity, and location are required' },
        { status: 400 }
      );
    }

    const { data: listing, error } = await supabase
      .from('food_listings')
      .insert({
        donor_id: decoded.id,
        title: title.trim(),
        description: (description || '').trim(),
        quantity: quantity.trim(),
        photo_url: photo_url || null,
        latitude,
        longitude,
        status: 'available',
      })
      .select()
      .single();

    if (error) {
      console.error('Create food error:', error);
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error('Food POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
