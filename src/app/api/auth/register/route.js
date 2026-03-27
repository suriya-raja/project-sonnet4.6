import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, city, is_ngo, ngo_name } = body;

    // Validation
    if (!name || !email || !phone || !password || !city) {
      return NextResponse.json(
        { error: 'All fields are required: name, email, phone, password, city' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password_hash,
        city: city.trim(),
        is_ngo: is_ngo || false,
        ngo_name: is_ngo ? (ngo_name || '').trim() : null,
        score: 0,
        donation_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    // Generate JWT
    const token = generateToken(newUser);

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        city: newUser.city,
        is_ngo: newUser.is_ngo,
        ngo_name: newUser.ngo_name,
        score: newUser.score,
        donation_count: newUser.donation_count,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
