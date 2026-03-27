import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, google_id')
      .eq('email', lowerEmail)
      .single();

    if (userError || !user) {
      // For security, don't reveal if user exists, just return success
      // But in this prototype, we'll return an error if user not found for easier testing
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Generate OTP and Expiry (15 mins)
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 3. Save to database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_otp: otp,
        reset_otp_expires_at: expiresAt.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('OTP save error:', updateError);
      return NextResponse.json({ error: 'Failed to generate reset code' }, { status: 500 });
    }

    // 4. Send Email (MOCKED for dev)
    console.log(`\n==============================================`);
    console.log(`🔒 EMAIL MOCK: Password Reset Request`);
    console.log(`To: ${user.email}`);
    console.log(`Your NOGIRR password reset OTP is: ${otp}`);
    console.log(`==============================================\n`);

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      _mockOtp: otp // Included for dev testing so the frontend can display it in an alert
    }, { status: 200 });

  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
