'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GlobeBackground from '@/components/GlobeBackground';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    is_ngo: false,
    ngo_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectingCity, setDetectingCity] = useState(false);
  const [cityDetected, setCityDetected] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      setDetectingCity(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            if (data?.address) {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.state_district ||
                data.address.county ||
                data.address.village ||
                data.address.state ||
                '';
              if (city) {
                setFormData(prev => ({ ...prev, city }));
                setCityDetected(true);
              }
            }
          } catch (err) {
            console.error('Reverse geocode error:', err);
          }
          setDetectingCity(false);
        },
        () => {
          setDetectingCity(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleNgo = () => {
    setFormData({ ...formData, is_ngo: !formData.is_ngo, ngo_name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.city) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.is_ngo && !formData.ngo_name) {
      setError('Please enter your NGO name');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
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

  return (
    <div style={styles.container}>
      <GlobeBackground />
      <div style={styles.overlay}></div>
      
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoText}>NOGIRR</div>
        </div>
        <h1 style={styles.title}>Create Account</h1>
        
        {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email (you@example.com)"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="tel"
            name="phone"
            placeholder="Phone (+91 XXXXX XXXXX)"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password (Min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {/* Auto-detected city */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              style={{
                ...styles.input,
                paddingLeft: cityDetected || detectingCity ? '36px' : '20px'
              }}
              type="text"
              name="city"
              placeholder={detectingCity ? 'Detecting your city via GPS...' : 'Your city (auto-detected)'}
              value={formData.city}
              onChange={handleChange}
              required
              readOnly={detectingCity}
            />
            {cityDetected && (
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>
                📍
              </span>
            )}
            {detectingCity && (
              <div className="loading-spinner" style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                margin: 0,
              }} />
            )}
          </div>
          {cityDetected && (
            <span style={{ fontSize: '0.75rem', color: '#00d2ff', marginTop: '-10px', alignSelf: 'flex-start', paddingLeft: '10px' }}>
              ✅ Auto-detected from location
            </span>
          )}

          {/* NGO Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start', marginLeft: '10px', marginTop: '10px' }}>
            <div
              className={`toggle ${formData.is_ngo ? 'active' : ''}`}
              onClick={handleToggleNgo}
              style={{
                width: '40px', height: '22px', borderRadius: '15px',
                background: formData.is_ngo ? '#00d2ff' : 'rgba(255,255,255,0.3)',
                position: 'relative', cursor: 'pointer', transition: '0.3s',
                boxShadow: formData.is_ngo ? '0 0 10px rgba(0, 210, 255, 0.4)' : 'none'
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: formData.is_ngo ? '#0b101e' : '#fff',
                position: 'absolute', top: '2px', left: formData.is_ngo ? '20px' : '2px', transition: '0.3s'
              }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
              Are you an NGO? {formData.is_ngo ? '🏢' : ''}
            </span>
          </div>

          {formData.is_ngo && (
            <input
              style={{ ...styles.input, marginTop: '10px' }}
              type="text"
              name="ngo_name"
              placeholder="Enter your NGO name"
              value={formData.ngo_name}
              onChange={handleChange}
              required={formData.is_ngo}
            />
          )}

          <button style={styles.submitBtn} type="submit" disabled={loading || detectingCity}>
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
            Already have an account?{' '}
          </span>
          <Link href="/login" style={styles.link}>Sign In</Link>
        </div>
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
    backgroundColor: 'rgba(11, 16, 30, 0.05)',
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
    padding: '30px 40px 40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 210, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '30px 0'
  },
  logoContainer: {
    marginBottom: '15px'
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
    marginBottom: '20px',
    letterSpacing: '0.5px',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '14px 20px',
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
    marginTop: '15px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    letterSpacing: '0.5px',
    boxShadow: '0 0 15px rgba(0, 210, 255, 0.3)',
  },
  link: {
    color: '#00d2ff', // Wave blue link
    fontSize: '0.85rem',
    textDecoration: 'none',
    cursor: 'pointer',
    opacity: 0.9,
    transition: 'opacity 0.2s',
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
  }
};
