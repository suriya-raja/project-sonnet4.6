import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const foodId = parseInt(id);
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['delivering', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: delivering or completed' },
        { status: 400 }
      );
    }

    // Verify user is the donor of this listing
    const { data: listing, error: fetchError } = await supabase
      .from('food_listings')
      .select('*')
      .eq('id', foodId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.donor_id !== decoded.id) {
      return NextResponse.json(
        { error: 'Only the donor can update the status' },
        { status: 403 }
      );
    }

    // Update food listing status
    const updateData = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('food_listings')
      .update(updateData)
      .eq('id', foodId);

    if (updateError) {
      console.error('Status update error:', updateError);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // Update order status too
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('food_listing_id', foodId);

    // If completed, update donor's score
    if (status === 'completed') {
      // Get current donor stats
      const { data: donor } = await supabase
        .from('users')
        .select('score, donation_count')
        .eq('id', decoded.id)
        .single();

      if (donor) {
        const newCount = (donor.donation_count || 0) + 1;
        let pointsToAdd = 10; // Base points per donation

        // First donation bonus
        if (newCount === 1) {
          pointsToAdd += 50;
        }

        // Every 5th donation streak bonus
        if (newCount % 5 === 0) {
          pointsToAdd += 25;
        }

        await supabase
          .from('users')
          .update({
            score: (donor.score || 0) + pointsToAdd,
            donation_count: newCount,
          })
          .eq('id', decoded.id);
      }
    }

    return NextResponse.json({ message: `Status updated to ${status}` });
  } catch (err) {
    console.error('Status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
