'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import GlobeBackground from '@/components/GlobeBackground';

export default function LoginPage() {
  const router = useRouter();
  
  // viewMode can be: 'login' | 'forgot' | 'reset'
  const [viewMode, setViewMode] = useState('login');
  
  // Login State
  const [formData, setFormData] = useState({ email: '', password: '' });
  // Forgot/Reset State
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ---------- STANDARD LOGIN ----------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('nogirr_token', data.token);
      localStorage.setItem('nogirr_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ---------- GOOGLE OAUTH LOGIN ----------
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();
        
        const authRes = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: googleUser }), 
        });
        
        const data = await authRes.json();
        
        if (!authRes.ok) throw new Error(data.error);
        
        localStorage.setItem('nogirr_token', data.token);
        localStorage.setItem('nogirr_user', JSON.stringify(data.user));
        router.push('/dashboard');
      } catch (err) {
        console.error('Google login failed:', err);
        setError('Google login failed.');
        setLoading(false);
      }
    },
    onError: errorResponse => {
      console.error(errorResponse);
      setError('Google login was cancelled.');
    },
  });

  // ---------- FORGOT PASSWORD FLOW ----------
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to request reset');
        setLoading(false);
        return;
      }
      
      setSuccess('OTP sent! Please check your email.');
      if (data._mockOtp) {
        // FOR DEVELOPMENT ONLY - SHOW MOCK OTP
        alert(`MOCK EMAIL DELIVERY\n\nTo: ${resetData.email}\nYour OTP is: ${data._mockOtp}`);
      }
      setViewMode('reset');
    } catch (err) {
      setError('Something went wrong.');
    }
    setLoading(false);
  };

  // ---------- RESET PASSWORD FLOW ----------
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }
      
      setSuccess('Password reset successfully! You can now login.');
      setViewMode('login');
      setFormData({ ...formData, email: resetData.email, password: '' });
      setResetData({ email: '', otp: '', newPassword: '' });
    } catch (err) {
      setError('Something went wrong.');
    }
    setLoading(false);
  };

  // ---------- RENDER HELPERS ----------
  const renderLogin = () => (
    <form style={styles.form} onSubmit={handleLoginSubmit}>
      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        name="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      
      <button style={styles.submitBtn} type="submit" disabled={loading}>
        {loading ? 'LOGGING IN...' : 'LOGIN'}
      </button>

      <div style={styles.linksRow}>
        <span style={styles.link} onClick={() => { setViewMode('forgot'); setError(''); setSuccess(''); }}>
          Forgot Password ?
        </span>
        <Link href="/register" style={styles.link}>
          Sign Up
        </Link>
      </div>

      <div style={styles.divider}></div>
      <div style={styles.orLoginText}>OR LOGIN WITH</div>
      
      <div style={styles.socialRow}>
        <button type="button" onClick={() => googleLogin()} style={styles.socialBtn}>
          <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>
        <button type="button" onClick={() => alert('Facebook login coming soon!')} style={styles.socialBtn}>
          <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
      </div>
    </form>
  );

  const renderForgot = () => (
    <form style={styles.form} onSubmit={handleForgotSubmit}>
      <p style={styles.subtitle}>Enter your email to receive a password reset OTP.</p>
      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={resetData.email}
        onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
        required
      />
      <button style={styles.submitBtn} type="submit" disabled={loading}>
        {loading ? 'SENDING...' : 'SEND OTP'}
      </button>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <span style={styles.link} onClick={() => { setViewMode('login'); setError(''); setSuccess(''); }}>
          Back to Login
        </span>
      </div>
    </form>
  );

  const renderReset = () => (
    <form style={styles.form} onSubmit={handleResetSubmit}>
      <p style={styles.subtitle}>Enter the 6-digit OTP sent to your email and a new password.</p>
      <input
        style={styles.input}
        type="text"
        placeholder="6-Digit OTP"
        value={resetData.otp}
        onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
        required
        maxLength={6}
      />
      <input
        style={styles.input}
        type="password"
        placeholder="New Password (min 6 chars)"
        value={resetData.newPassword}
        onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
        required
        minLength={6}
      />
      <button style={styles.submitBtn} type="submit" disabled={loading}>
        {loading ? 'RESETTING...' : 'RESET PASSWORD'}
      </button>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <span style={styles.link} onClick={() => { setViewMode('login'); setError(''); setSuccess(''); }}>
          Back to Login
        </span>
      </div>
    </form>
  );

  return (
    <div style={styles.container}>
      <GlobeBackground />
      <div style={styles.overlay}></div>
      
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoText}>NOGIRR</div>
        </div>
        <h1 style={styles.title}>
          {viewMode === 'login' && 'Welcome Back'}
          {viewMode === 'forgot' && 'Reset Password'}
          {viewMode === 'reset' && 'Create New Password'}
        </h1>
        
        {error && <div style={styles.errorBanner}>{error}</div>}
        {success && <div style={styles.successBanner}>{success}</div>}
        
        {viewMode === 'login' && renderLogin()}
        {viewMode === 'forgot' && renderForgot()}
        {viewMode === 'reset' && renderReset()}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b101e',
    fontFamily: 'var(--font-heading), sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(11, 16, 30, 0.05)', // Very light overlay so globe is highly visible
    zIndex: 1,
  },
  card: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '430px',
    backgroundColor: 'rgba(20, 25, 40, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 210, 255, 0.2)', // Wave blue subtle border
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 210, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: '20px'
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    fontWeight: 900,
    color: '#00d2ff', // Wave blue
    letterSpacing: '-1px',
    textShadow: '0 0 10px rgba(0, 210, 255, 0.4)'
  },
  title: {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: 500,
    marginBottom: '30px',
    letterSpacing: '0.5px',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#00d2ff', // Wave blue button
    color: '#0b101e', // Dark text
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    letterSpacing: '0.5px',
    boxShadow: '0 0 15px rgba(0, 210, 255, 0.3)',
  },
  linksRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '10px',
    padding: '0 5px',
  },
  link: {
    color: '#00d2ff',
    fontSize: '0.85rem',
    textDecoration: 'none',
    cursor: 'pointer',
    opacity: 0.9,
    transition: 'opacity 0.2s',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    margin: '30px 0 20px',
  },
  orLoginText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textAlign: 'center',
    letterSpacing: '1px',
    marginBottom: '15px',
  },
  socialRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  socialBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  errorBanner: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '0.85rem',
  },
  successBanner: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '0.85rem',
  }
};
