import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get orders where user is donor OR receiver
    const { data: donorOrders, error: donorErr } = await supabase
      .from('orders')
      .select(`
        *,
        food:food_listings (*),
        receiver:users!receiver_id (id, name, phone, city, address, is_ngo, ngo_name)
      `)
      .eq('donor_id', decoded.id)
      .order('created_at', { ascending: false });

    const { data: receiverOrders, error: receiverErr } = await supabase
      .from('orders')
      .select(`
        *,
        food:food_listings (*),
        donor:users!donor_id (id, name, phone, city, address, is_ngo, ngo_name)
      `)
      .eq('receiver_id', decoded.id)
      .order('created_at', { ascending: false });

    if (donorErr || receiverErr) {
      console.error('Orders fetch error:', donorErr, receiverErr);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({
      donorOrders: donorOrders || [],
      receiverOrders: receiverOrders || [],
    });
  } catch (err) {
    console.error('Orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
