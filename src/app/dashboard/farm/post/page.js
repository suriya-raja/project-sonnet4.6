'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';

const FarmMap = dynamic(() => import('@/components/FarmMap'), {
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

const CROP_CATEGORIES = [
  { emoji: '🍚', name: 'Rice', color: '#f5f5dc' },
  { emoji: '🌾', name: 'Wheat', color: '#daa520' },
  { emoji: '🍅', name: 'Tomato', color: '#ff6347' },
  { emoji: '🥔', name: 'Potato', color: '#d2b48c' },
  { emoji: '🧅', name: 'Onion', color: '#dda0dd' },
  { emoji: '🍌', name: 'Banana', color: '#ffe135' },
  { emoji: '🥭', name: 'Mango', color: '#ff8243' },
  { emoji: '🥬', name: 'Spinach', color: '#2e8b57' },
  { emoji: '🥕', name: 'Carrot', color: '#ed9121' },
  { emoji: '🌽', name: 'Corn', color: '#fbec5d' },
  { emoji: '🍆', name: 'Brinjal', color: '#614051' },
  { emoji: '🫑', name: 'Capsicum', color: '#228b22' },
  { emoji: '🥒', name: 'Cucumber', color: '#77ab59' },
  { emoji: '🍋', name: 'Lemon', color: '#fff44f' },
  { emoji: '🫘', name: 'Pulses/Dal', color: '#cd853f' },
  { emoji: '📦', name: 'Other', color: '#9ca3af' },
];

export default function PostFarmProducePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    crop_type: '',
    description: '',
    quantity: '',
    price_per_kg: '',
    is_free: false,
    freshness_hours: 48,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Getting your farm location...');
  const [aiDetecting, setAiDetecting] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Post success state
  const [posted, setPosted] = useState(false);
  const [postedListing, setPostedListing] = useState(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationStatus('📍 Farm location captured');
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
      router.push('/dashboard/farm');
    }
  }, [posted, countdown, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const selectCrop = (cropName) => {
    setFormData(prev => ({ ...prev, crop_type: cropName }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      
      // Simulate AI crop detection
      setAiDetecting(true);
      setTimeout(() => {
        // In a real app, this would call Gemini API
        const detectedCrops = ['Tomato', 'Rice', 'Potato', 'Onion', 'Banana', 'Wheat', 'Mango', 'Spinach'];
        const randomCrop = detectedCrops[Math.floor(Math.random() * detectedCrops.length)];
        setAiResult({
          crop: randomCrop,
          confidence: (85 + Math.random() * 14).toFixed(1),
          estimatedWeight: `~${(5 + Math.random() * 45).toFixed(0)} kg`,
          freshness: `${(24 + Math.random() * 48).toFixed(0)} hours`,
        });
        setFormData(prev => ({ ...prev, crop_type: randomCrop }));
        setAiDetecting(false);
      }, 2000);
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

    if (!formData.crop_type || !formData.quantity) {
      setError('Please fill in crop type and quantity');
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

      const res = await fetch('/api/farm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          photo_url,
          ai_detected_crop: aiResult?.crop || null,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to post produce');
        setLoading(false);
        return;
      }

      setPostedListing({ ...data.listing, photo_url });
      setPosted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  // ============ POST-SUCCESS VIEW ============
  if (posted && postedListing) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="page-container">
          <div className="alert alert-success animate-scale-in" style={{
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
            padding: 'var(--space-lg)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌾🎉</div>
            <strong style={{ fontSize: '1.2rem' }}>Farm Produce Posted Successfully!</strong>
            <p style={{ marginTop: '4px', opacity: 0.8 }}>
              NGOs, restaurants & buyers within 10km can now see your produce on the map
            </p>
          </div>

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
                alt={postedListing.crop_type}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.3rem' }}>
                🌿 {postedListing.crop_type}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                📦 {postedListing.quantity}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                💰 {postedListing.is_free ? '🆓 FREE' : `₹${postedListing.price_per_kg}/kg`}
              </p>
              <span className="food-card-badge badge-available" style={{ marginTop: '8px' }}>
                🟢 Waiting for someone to claim
              </span>
            </div>
          </div>

          {location && (
            <div className="animate-fade-in-up delay-2">
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 600,
                marginBottom: 'var(--space-md)',
              }}>
                🗺️ Your produce is visible on the map
              </h2>
              <FarmMap
                center={[location.lat, location.lng]}
                listings={[{
                  ...postedListing,
                  latitude: location.lat,
                  longitude: location.lng,
                  distance: 0,
                  farmer: { name: 'You' },
                }]}
                userLocation={[location.lat, location.lng]}
                radiusKm={10}
                onClaim={() => {}}
              />
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-xl)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard/farm')}>
              🌾 View Farm Listings
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setPosted(false);
                setPostedListing(null);
                setFormData({ crop_type: '', description: '', quantity: '', price_per_kg: '', is_free: false, freshness_hours: 48 });
                setPhoto(null);
                setPhotoPreview(null);
                setAiResult(null);
                setCountdown(10);
              }}
            >
              ➕ Post More Produce
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Redirecting to Farm page in {countdown}s...
          </div>
        </div>
      </AuthGuard>
    );
  }

  // ============ POSTING FORM VIEW ============
  return (
    <AuthGuard>
      <Navbar />
      <div className="page-container" style={{ maxWidth: '650px' }}>
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">🌱 Post Farm Produce</h1>
          <p className="page-subtitle">
            List your unsold produce — help it reach people, not the garbage
          </p>
        </div>

        {/* Location status */}
        <div className="alert alert-info animate-fade-in-up delay-1" style={{ marginBottom: 'var(--space-xl)' }}>
          {locationStatus}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>⚠️ {error}</div>}

        <form className="auth-form glass-card animate-fade-in-up delay-2" style={{ padding: 'var(--space-2xl)' }} onSubmit={handleSubmit}>

          {/* Photo Upload with AI */}
          <div className="form-group">
            <label className="form-label" htmlFor="farm-photo">📸 Produce Photo (AI will detect crop type)</label>
            <input
              id="farm-photo"
              className="form-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              style={{ padding: '10px' }}
            />
            {photoPreview && (
              <div style={{ marginTop: '8px', position: 'relative' }}>
                <img
                  src={photoPreview}
                  alt="Produce preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
                {aiDetecting && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div className="loading-spinner" style={{ width: '30px', height: '30px', margin: 0 }}></div>
                    <p style={{ color: 'white', marginTop: '8px', fontSize: '0.85rem' }}>🤖 AI analyzing crop...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Detection Result */}
          {aiResult && (
            <div className="alert alert-success animate-scale-in" style={{ marginBottom: 'var(--space-lg)' }}>
              <strong>🤖 AI Detection Result:</strong>
              <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.9rem' }}>
                <span>🌿 Crop: <strong>{aiResult.crop}</strong></span>
                <span>📊 Confidence: <strong>{aiResult.confidence}%</strong></span>
                <span>⚖️ Est. Weight: <strong>{aiResult.estimatedWeight}</strong></span>
                <span>⏰ Freshness: <strong>{aiResult.freshness}</strong></span>
              </div>
            </div>
          )}

          {/* Crop Type Selection */}
          <div className="form-group">
            <label className="form-label">🌿 Crop Type *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {CROP_CATEGORIES.map(crop => (
                <button
                  key={crop.name}
                  type="button"
                  className={`farm-chip ${formData.crop_type === crop.name ? 'active' : ''}`}
                  onClick={() => selectCrop(crop.name)}
                >
                  {crop.emoji} {crop.name}
                </button>
              ))}
            </div>
            <input
              className="form-input"
              type="text"
              name="crop_type"
              placeholder="Or type custom crop name..."
              value={formData.crop_type}
              onChange={handleChange}
            />
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label className="form-label" htmlFor="farm-quantity">📦 Quantity *</label>
            <input
              id="farm-quantity"
              className="form-input"
              type="text"
              name="quantity"
              placeholder="e.g., 50 kg, 20 bunches, 100 pieces"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          {/* Price Section */}
          <div className="form-group">
            <label className="form-label">💰 Pricing</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                color: formData.is_free ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  name="is_free"
                  checked={formData.is_free}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-emerald)' }}
                />
                🆓 Donate for FREE
              </label>
            </div>
            {!formData.is_free && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>₹</span>
                <input
                  className="form-input"
                  type="number"
                  name="price_per_kg"
                  placeholder="Price per kg"
                  value={formData.price_per_kg}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  style={{ flex: 1 }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/kg</span>
              </div>
            )}
          </div>

          {/* Freshness */}
          <div className="form-group">
            <label className="form-label" htmlFor="farm-freshness">⏰ Stays fresh for (hours)</label>
            <input
              id="farm-freshness"
              className="form-input"
              type="number"
              name="freshness_hours"
              placeholder="e.g., 48"
              value={formData.freshness_hours}
              onChange={handleChange}
              min="1"
              max="168"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="farm-description">📝 Description (optional)</label>
            <textarea
              id="farm-description"
              className="form-input"
              name="description"
              placeholder="e.g., Organic tomatoes, freshly harvested today. Good quality, slightly oversized for market standards."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
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
              '🌾 Post Farm Produce'
            )}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
