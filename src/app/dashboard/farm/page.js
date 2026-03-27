'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import ThreeBackground from '@/components/ThreeBackground';
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

export default function FarmPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [claimedInfo, setClaimedInfo] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [radius, setRadius] = useState(10);
  const [cropFilter, setCropFilter] = useState('');
  const [viewMode, setViewMode] = useState('map');

  const fetchFarmListings = useCallback(async (lat, lng) => {
    const token = localStorage.getItem('nogirr_token');
    try {
      let url = `/api/farm?lat=${lat}&lng=${lng}&radius=${radius}`;
      if (cropFilter) url += `&crop=${encodeURIComponent(cropFilter)}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings || []);
      } else {
        setError(data.error || 'Failed to fetch farm listings');
      }
    } catch (err) {
      setError('Failed to fetch nearby farm produce');
    }
    setLoading(false);
  }, [radius, cropFilter]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          fetchFarmListings(loc.lat, loc.lng);
        },
        () => {
          setError('Location access denied. Please enable location to see nearby produce.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  }, [fetchFarmListings]);

  const handleClaim = async (listingId) => {
    const token = localStorage.getItem('nogirr_token');
    setClaimingId(listingId);

    try {
      const res = await fetch(`/api/farm/${listingId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setClaimedInfo(data);
        setListings(prev => prev.filter(l => l.id !== listingId));
      } else {
        alert(data.error || 'Failed to claim produce');
      }
    } catch (err) {
      alert('Something went wrong');
    }

    setClaimingId(null);
  };

  const cropTypes = ['Rice', 'Wheat', 'Tomato', 'Potato', 'Onion', 'Banana', 'Mango', 'Spinach', 'Carrot', 'Cauliflower'];

  return (
    <AuthGuard>
      <ThreeBackground />
      <Navbar />
      <div className="page-container">
        <div className="page-header animate-fade-in-up" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ fontSize: '2.2rem' }}>
            🌾 Farm Fresh Rescue
          </h1>
          <p className="page-subtitle">
            Rescue unsold farm produce directly from farmers near you
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Claimed produce info */}
        {claimedInfo && (
          <div className="donor-info-card glass-card animate-scale-in" style={{ marginBottom: 'var(--space-xl)' }}>
            <h3>✅ Produce Claimed! Contact the Farmer:</h3>
            <div className="donor-info-row">
              <span className="donor-info-label">👨‍🌾 Farmer:</span>
              <strong>{claimedInfo.farmer?.name}</strong>
            </div>
            <div className="donor-info-row">
              <span className="donor-info-label">📱 Phone:</span>
              <strong>
                <a href={`tel:${claimedInfo.farmer?.phone}`} style={{ color: 'var(--accent-emerald-light)' }}>
                  {claimedInfo.farmer?.phone}
                </a>
              </strong>
            </div>
            <div className="donor-info-row">
              <span className="donor-info-label">📍 City:</span>
              <span>{claimedInfo.farmer?.city}</span>
            </div>
            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm) 0', borderTop: '1px solid var(--border-subtle)' }}>
              <div className="donor-info-row">
                <span className="donor-info-label">🌿 Crop:</span>
                <span>{claimedInfo.produce?.crop_type} — {claimedInfo.produce?.quantity}</span>
              </div>
              <div className="donor-info-row">
                <span className="donor-info-label">💰 Price:</span>
                <span>{claimedInfo.produce?.is_free ? '🆓 FREE' : `₹${claimedInfo.produce?.price_per_kg}/kg`}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="glass-card animate-fade-in-up delay-1" style={{
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)',
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--space-md)',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Post produce button */}
            <button
              className="btn btn-primary btn-lg"
              onClick={() => router.push('/dashboard/farm/post')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ fontSize: '1.2rem' }}>🌱</span> Post Your Produce
            </button>

            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
              <button
                className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ Map
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                📋 List
              </button>
            </div>
          </div>

          {/* Crop Filter Chips */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: 'var(--space-md)',
          }}>
            <button
              className={`farm-chip ${!cropFilter ? 'active' : ''}`}
              onClick={() => setCropFilter('')}
            >
              All Crops
            </button>
            {cropTypes.map(crop => (
              <button
                key={crop}
                className={`farm-chip ${cropFilter === crop ? 'active' : ''}`}
                onClick={() => setCropFilter(cropFilter === crop ? '' : crop)}
              >
                {crop}
              </button>
            ))}
          </div>

          {/* Radius Slider */}
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              📏 Radius: <strong style={{ color: 'var(--accent-emerald-light)' }}>{radius} km</strong>
            </span>
            <input
              type="range"
              min="2"
              max="50"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--accent-emerald)',
              }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>🌾 Finding farm produce near you...</p>
          </div>
        ) : (
          <>
            {/* Map View */}
            {viewMode === 'map' && (
              <div className="animate-fade-in-up delay-2">
                <FarmMap
                  center={location ? [location.lat, location.lng] : null}
                  listings={listings}
                  onClaim={handleClaim}
                  userLocation={location ? [location.lat, location.lng] : null}
                  radiusKm={radius}
                  claimingId={claimingId}
                />
              </div>
            )}

            {/* List View / Cards below map */}
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 600,
                marginBottom: 'var(--space-md)',
              }}>
                🌾 Available Farm Produce ({listings.length})
              </h2>

              {listings.length === 0 ? (
                <div className="empty-state glass-card">
                  <div className="empty-state-icon">🔍</div>
                  <p className="empty-state-text">
                    No farm produce available within {radius}km right now.
                    <br />Try increasing the radius or check back later!
                  </p>
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: 'var(--space-lg)' }}
                    onClick={() => router.push('/dashboard/farm/post')}
                  >
                    🌱 Be the first farmer — Post your produce
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                  {listings.map((listing, idx) => (
                    <div
                      key={listing.id}
                      className="glass-card farm-produce-card"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {listing.photo_url && (
                        <img
                          src={listing.photo_url}
                          alt={listing.crop_type}
                          className="farm-card-image"
                        />
                      )}
                      <div className="farm-card-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 className="farm-card-title">{listing.crop_type}</h3>
                          <span className={`farm-price-tag ${listing.is_free ? 'free' : ''}`}>
                            {listing.is_free ? '🆓 FREE' : `₹${listing.price_per_kg}/kg`}
                          </span>
                        </div>
                        <div className="farm-card-meta">
                          <span>📦 {listing.quantity}</span>
                          <span>📍 {listing.distance} km</span>
                          {listing.freshness_hours && (
                            <span>⏰ {listing.freshness_hours}h fresh</span>
                          )}
                        </div>
                        {listing.description && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            {listing.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                          <span className="food-card-badge badge-available">Available</span>
                          {listing.ai_detected_crop && (
                            <span className="food-card-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                              🤖 AI Verified
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                          👨‍🌾 {listing.farmer?.name} • {listing.farmer?.city}
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                          onClick={() => handleClaim(listing.id)}
                          disabled={claimingId === listing.id}
                        >
                          {claimingId === listing.id ? 'Claiming...' : '🤝 Claim This Produce'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
