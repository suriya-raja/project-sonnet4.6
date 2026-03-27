import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

// POST: Claim farm produce
export async function POST(request, { params }) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const listingId = parseInt(id);

    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    // Get the farm listing
    const { data: listing, error: fetchError } = await supabase
      .from('farm_listings')
      .select(`
        *,
        farmer:users!farmer_id (id, name, phone, city, is_ngo, ngo_name, latitude, longitude)
      `)
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'available') {
      return NextResponse.json({ error: 'This produce has already been claimed' }, { status: 400 });
    }

    if (listing.farmer_id === decoded.id) {
      return NextResponse.json({ error: 'You cannot claim your own produce' }, { status: 400 });
    }

    // Update listing status
    const { error: updateError } = await supabase
      .from('farm_listings')
      .update({
        status: 'claimed',
        claimed_by: decoded.id,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateError) {
      console.error('Claim update error:', updateError);
      return NextResponse.json({ error: 'Failed to claim produce' }, { status: 500 });
    }

    // Create order record
    await supabase.from('orders').insert({
      food_listing_id: listingId,
      donor_id: listing.farmer_id,
      receiver_id: decoded.id,
      status: 'accepted',
      order_type: 'farm',
    });

    return NextResponse.json({
      message: 'Produce claimed successfully!',
      farmer: listing.farmer,
      produce: {
        id: listing.id,
        crop_type: listing.crop_type,
        quantity: listing.quantity,
        price_per_kg: listing.price_per_kg,
        is_free: listing.is_free,
      },
    });
  } catch (err) {
    console.error('Farm claim error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
