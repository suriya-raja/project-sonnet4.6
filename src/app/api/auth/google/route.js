import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
    }

    // Verify token with Google's public endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const payload = await response.json();

    if (payload.error || !payload.email) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { email, name, sub: google_id } = payload;

    // Check if user exists
    let { data: user, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Database error checking user:', checkError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!user) {
      // Create new user for Google login
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email,
          name: name,
          google_id: google_id,
          // We don't require the following fields for Google OAuth users immediately 
          // (They are nullable in DB now, but if constraints fail, we'll provide defaults)
          is_ngo: false,
          score: 0,
          donation_count: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Database error creating user via Google:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      user = newUser;
    } else if (!user.google_id) {
      // Link existing account with Google ID
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ google_id })
        .eq('id', user.id)
        .select()
        .single();
        
      if (!updateError) {
        user = updatedUser;
      }
    }

    // Generate JWT
    const token = generateToken(user);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.city || '',
        is_ngo: user.is_ngo,
        ngo_name: user.ngo_name,
        score: user.score,
        donation_count: user.donation_count,
      },
    });

  } catch (err) {
    console.error('Google Auth error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
