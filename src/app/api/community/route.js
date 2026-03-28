import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseParams = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
};

const supabase = createClient(supabaseParams.url, supabaseParams.key);

// Haversine formula to calculate distance in km between two lat/lon points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export async function GET(req) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get('lat'));
  const lng = parseFloat(url.searchParams.get('lng'));
  const filterType = url.searchParams.get('filter') || 'local'; // 'local' or 'global'

  try {
    // 1. Fetch all posts with user data (joined)
    // Supabase JS allows joining if foreign keys are set. Let's get the core post data first.
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select('*, users (name, city)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // 2. Client-side math filtering for Geo-fencing (50km radius)
    let filteredPosts = posts;

    if (filterType === 'local' && lat && lng) {
      filteredPosts = posts.filter(post => {
        if (!post.latitude || !post.longitude) return false;
        const dist = calculateDistance(lat, lng, post.latitude, post.longitude);
        return dist <= 50; // 50km threshold
      });
    }

    return NextResponse.json(filteredPosts);

  } catch (error) {
    console.error('Community Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch community posts.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { user_id, content, post_type, latitude, longitude, city } = await req.json();

    if (!user_id || !content) {
      return NextResponse.json({ error: 'Missing required post fields.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('community_posts')
      .insert({
        user_id,
        content,
        post_type: post_type || 'chat',
        latitude,
        longitude,
        city
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Community Post Error:', error);
    return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 });
  }
}
