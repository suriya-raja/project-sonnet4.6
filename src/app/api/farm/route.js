import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { filterByRadius } from '@/lib/geolocation';

// GET: List available farm produce within radius
export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radiusKm = parseFloat(searchParams.get('radius')) || 10;
    const cropFilter = searchParams.get('crop') || '';

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('farm_listings')
      .select(`
        *,
        farmer:users!farmer_id (id, name, phone, city, is_ngo, ngo_name)
      `)
      .eq('status', 'available');

    if (cropFilter) {
      query = query.ilike('crop_type', `%${cropFilter}%`);
    }

    const { data: listings, error } = await query;

    if (error) {
      console.error('Fetch farm listings error:', error);
      return NextResponse.json({ error: 'Failed to fetch farm listings' }, { status: 500 });
    }

    // Filter within the given radius (default 10km for farms, larger area)
    const nearbyProduce = filterByRadius(listings || [], lat, lng, radiusKm);

    return NextResponse.json({ listings: nearbyProduce });
  } catch (err) {
    console.error('Farm GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new farm listing
export async function POST(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      crop_type,
      description,
      quantity,
      price_per_kg,
      is_free,
      photo_url,
      freshness_hours,
      ai_detected_crop,
      latitude,
      longitude,
    } = body;

    if (!crop_type || !quantity || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Crop type, quantity, and location are required' },
        { status: 400 }
      );
    }

    const { data: listing, error } = await supabase
      .from('farm_listings')
      .insert({
        farmer_id: decoded.id,
        crop_type: crop_type.trim(),
        description: (description || '').trim(),
        quantity: quantity.trim(),
        price_per_kg: is_free ? 0 : (price_per_kg || 0),
        is_free: is_free || false,
        photo_url: photo_url || null,
        freshness_hours: freshness_hours || 48,
        ai_detected_crop: ai_detected_crop || null,
        latitude,
        longitude,
        status: 'available',
      })
      .select()
      .single();

    if (error) {
      console.error('Create farm listing error:', error);
      return NextResponse.json({ error: 'Failed to create farm listing' }, { status: 500 });
    }

    // Update user's donation count and score
    await supabase.rpc('increment_score', { user_id: decoded.id, points: 15 });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error('Farm POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
