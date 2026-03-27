import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 1. Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, reset_otp, reset_otp_expires_at')
      .eq('email', lowerEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Validate OTP
    if (!user.reset_otp || user.reset_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // 3. Check expiration
    const expiresAt = new Date(user.reset_otp_expires_at);
    if (new Date() > expiresAt) {
      // Clear expired OTP
      await supabase
        .from('users')
        .update({ reset_otp: null, reset_otp_expires_at: null })
        .eq('id', user.id);
        
      return NextResponse.json({ error: 'OTP has expired' }, { status: 410 });
    }

    // 4. Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 5. Update password and clear OTP
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        reset_otp: null,
        reset_otp_expires_at: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password reset update error:', updateError);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });

  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
