'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="map-container" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-secondary)',
    }}>
      <div className="loading-spinner"></div>
    </div>
  ),
});

export default function GiveFoodPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Getting location...');

  // Post-donation state
  const [posted, setPosted] = useState(false);
  const [postedListing, setPostedListing] = useState(null);
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationStatus('📍 Location captured');
        },
        (err) => {
          setLocationStatus('⚠️ Location access denied. Please enable location.');
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus('⚠️ Geolocation not supported');
    }
  }, []);

  // Countdown timer after posting
  useEffect(() => {
    if (posted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (posted && countdown === 0) {
      router.push('/dashboard/orders');
    }
  }, [posted, countdown, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!location) {
      setError('Location is required. Please enable location access.');
      setLoading(false);
      return;
    }

    if (!formData.title || !formData.quantity) {
      setError('Please fill in food title and quantity');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('nogirr_token');

    try {
      let photo_url = null;
      if (photo) {
        const photoFormData = new FormData();
        photoFormData.append('file', photo);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: photoFormData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photo_url = uploadData.url;
        }
      }

      const res = await fetch('/api/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          photo_url,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create listing');
        setLoading(false);
        return;
      }

      // Show post-donation map view
      setPostedListing({
        ...data.listing,
        photo_url,
      });
      setPosted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  // ============ POST-DONATION VIEW ============
  if (posted && postedListing) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="page-container">
          {/* Success banner */}
          <div className="alert alert-success animate-scale-in" style={{
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
            padding: 'var(--space-lg)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
            <strong style={{ fontSize: '1.1rem' }}>Food Posted Successfully!</strong>
            <p style={{ marginTop: '4px', opacity: 0.8 }}>
              People within 5km can now see your donation on the map
            </p>
          </div>

          {/* Listing details card */}
          <div className="glass-card animate-fade-in-up delay-1" style={{
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            gap: 'var(--space-lg)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {postedListing.photo_url && (
              <img
                src={postedListing.photo_url}
                alt={postedListing.title}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.2rem' }}>
                {postedListing.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                📦 {postedListing.quantity}
              </p>
              {postedListing.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {postedListing.description}
                </p>
              )}
              <span className="food-card-badge badge-available" style={{ marginTop: '8px' }}>
                🟢 Waiting for someone to accept
              </span>
            </div>
          </div>

          {/* Map showing 5km radius */}
          <div className="animate-fade-in-up delay-2">
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 600,
              marginBottom: 'var(--space-md)',
            }}>
              🗺️ Your food is visible to people within 5km
            </h2>
            <MapView
              center={location ? [location.lat, location.lng] : null}
              listings={[{
                ...postedListing,
                latitude: location.lat,
                longitude: location.lng,
                distance: 0,
                donor: { name: 'You', is_ngo: false },
              }]}
              userLocation={location ? [location.lat, location.lng] : null}
              onAccept={() => {}}
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-xl)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => router.push('/dashboard/orders')}
            >
              📋 View My Orders & Track Status
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setPosted(false);
                setPostedListing(null);
                setFormData({ title: '', description: '', quantity: '' });
                setPhoto(null);
                setPhotoPreview(null);
                setCountdown(8);
              }}
            >
              ➕ Donate More Food
            </button>
          </div>

          {/* Auto-redirect notice */}
          <div style={{
            textAlign: 'center',
            marginTop: 'var(--space-lg)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}>
            Auto-redirecting to Orders in {countdown}s...
          </div>
        </div>
      </AuthGuard>
    );
  }

  // ============ DONATION FORM VIEW ============
  return (
    <AuthGuard>
      <Navbar />
      <div className="page-container" style={{ maxWidth: '600px' }}>
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">🍽️ Donate Food</h1>
          <p className="page-subtitle">
            Share your surplus food with people nearby
          </p>
        </div>

        {/* Location status */}
        <div className="alert alert-info animate-fade-in-up delay-1" style={{ marginBottom: 'var(--space-xl)' }}>
          {locationStatus}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>⚠️ {error}</div>}

        <form className="auth-form glass-card animate-fade-in-up delay-2" style={{ padding: 'var(--space-2xl)' }} onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="food-title">Food Title *</label>
            <input
              id="food-title"
              className="form-input"
              type="text"
              name="title"
              placeholder="e.g., Fresh Rice and Curry"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="food-description">Description</label>
            <textarea
              id="food-description"
              className="form-input"
              name="description"
              placeholder="Describe the food (optional)"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="food-quantity">Quantity *</label>
            <input
              id="food-quantity"
              className="form-input"
              type="text"
              name="quantity"
              placeholder="e.g., Serves 10 people, 5 kg"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="food-photo">Food Photo</label>
            <input
              id="food-photo"
              className="form-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ padding: '10px' }}
            />
            {photoPreview && (
              <div style={{ marginTop: '8px' }}>
                <img
                  src={photoPreview}
                  alt="Food preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading || !location}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', margin: 0 }} />
                Posting...
              </span>
            ) : (
              '📤 Post Food Donation'
            )}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
