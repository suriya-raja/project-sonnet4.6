import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const foodId = parseInt(id);

    // Check if listing is still available
    const { data: listing, error: fetchError } = await supabase
      .from('food_listings')
      .select('*, donor:users!donor_id (id, name, phone, city, address, is_ngo, ngo_name)')
      .eq('id', foodId)
      .eq('status', 'available')
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: 'This food listing is no longer available' },
        { status: 404 }
      );
    }

    // Cannot accept own listing
    if (listing.donor_id === decoded.id) {
      return NextResponse.json(
        { error: 'You cannot accept your own listing' },
        { status: 400 }
      );
    }

    // Update listing status to accepted
    const { error: updateError } = await supabase
      .from('food_listings')
      .update({
        status: 'accepted',
        accepted_by: decoded.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', foodId)
      .eq('status', 'available'); // Double-check still available (race condition protection)

    if (updateError) {
      console.error('Accept update error:', updateError);
      return NextResponse.json({ error: 'Failed to accept listing' }, { status: 500 });
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        food_listing_id: foodId,
        donor_id: listing.donor_id,
        receiver_id: decoded.id,
        status: 'accepted',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
    }

    return NextResponse.json({
      message: 'Food accepted successfully!',
      order,
      donor: {
        name: listing.donor.name,
        phone: listing.donor.phone,
        city: listing.donor.city,
        address: listing.donor.address,
        is_ngo: listing.donor.is_ngo,
        ngo_name: listing.donor.ngo_name,
      },
      food: {
        title: listing.title,
        quantity: listing.quantity,
        description: listing.description,
      },
    });
  } catch (err) {
    console.error('Accept error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
