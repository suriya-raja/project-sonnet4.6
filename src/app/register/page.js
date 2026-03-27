'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  // Auto-detect city from GPS on page load
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
      setError('Please fill in all required fields. City is auto-detected — allow location access.');
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
    <div className="auth-container">
      <div className="auth-card glass-card">
        <div className="auth-logo">
          <div className="auth-logo-text">NOGIRR</div>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the food sharing community</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              className="form-input"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-phone">Phone Number</label>
            <input
              id="register-phone"
              className="form-input"
              type="tel"
              name="phone"
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              className="form-input"
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {/* Auto-detected city */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-city">
              City {detectingCity && '— detecting...'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-city"
                className="form-input"
                type="text"
                name="city"
                placeholder={detectingCity ? 'Detecting your city via GPS...' : 'Your city (auto-detected)'}
                value={formData.city}
                onChange={handleChange}
                required
                readOnly={detectingCity}
                style={{
                  paddingLeft: cityDetected ? '36px' : '16px',
                }}
              />
              {cityDetected && (
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1rem',
                }}>📍</span>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                ✅ Auto-detected from your location
              </span>
            )}
            {!detectingCity && !cityDetected && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Allow location access for auto-detection, or type manually
              </span>
            )}
          </div>

          {/* NGO Toggle */}
          <div className="form-group">
            <div className="toggle-container">
              <div
                className={`toggle ${formData.is_ngo ? 'active' : ''}`}
                onClick={handleToggleNgo}
                role="switch"
                aria-checked={formData.is_ngo}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleToggleNgo()}
              >
                <div className="toggle-knob" />
              </div>
              <span className="form-label" style={{ margin: 0 }}>
                Are you an NGO? {formData.is_ngo ? '🏢' : ''}
              </span>
            </div>
          </div>

          {formData.is_ngo && (
            <div className="form-group animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
              <label className="form-label" htmlFor="register-ngo-name">NGO Name</label>
              <input
                id="register-ngo-name"
                className="form-input"
                type="text"
                name="ngo_name"
                placeholder="Enter your NGO name"
                value={formData.ngo_name}
                onChange={handleChange}
                required={formData.is_ngo}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading || detectingCity}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', margin: 0 }} />
                Creating Account...
              </span>
            ) : (
              '🚀 Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
