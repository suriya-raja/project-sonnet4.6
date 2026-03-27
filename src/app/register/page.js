'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { INDIAN_CITIES } from '@/lib/cities';

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

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.city) {
      setError('Please fill in all required fields');
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

      // Store token and user data
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

          <div className="form-group">
            <label className="form-label" htmlFor="register-city">City</label>
            <select
              id="register-city"
              className="form-select"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            >
              <option value="">Select your city</option>
              {INDIAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
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

          {/* NGO Name (conditional) */}
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
            disabled={loading}
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
