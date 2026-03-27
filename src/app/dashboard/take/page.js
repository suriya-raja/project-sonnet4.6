'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';

// Dynamic import MapView to avoid SSR issues with Leaflet
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

export default function TakeFoodPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [acceptedInfo, setAcceptedInfo] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchFood = useCallback(async (lat, lng) => {
    const token = localStorage.getItem('nogirr_token');
    try {
      const res = await fetch(`/api/food?lat=${lat}&lng=${lng}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings || []);
      } else {
        setError(data.error || 'Failed to fetch food');
      }
    } catch (err) {
      setError('Failed to fetch nearby food');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          fetchFood(loc.lat, loc.lng);
        },
        (err) => {
          setError('Location access denied. Please enable location to see nearby food.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  }, [fetchFood]);

  const handleAccept = async (foodId) => {
    const token = localStorage.getItem('nogirr_token');
    setAcceptingId(foodId);

    try {
      const res = await fetch(`/api/food/${foodId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setAcceptedInfo(data);
        // Remove accepted listing from map
        setListings(prev => prev.filter(l => l.id !== foodId));
      } else {
        alert(data.error || 'Failed to accept food');
      }
    } catch (err) {
      alert('Something went wrong');
    }

    setAcceptingId(null);
  };

  return (
    <AuthGuard>
      <Navbar />
      <div className="page-container">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">🤲 Get Food</h1>
          <p className="page-subtitle">
            Browse available food donations within 5km of you
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Accepted food info */}
        {acceptedInfo && (
          <div className="donor-info-card glass-card animate-scale-in" style={{ marginBottom: 'var(--space-xl)' }}>
            <h3>✅ Food Accepted! Contact the Donor:</h3>
            <div className="donor-info-row">
              <span className="donor-info-label">👤 Name:</span>
              <strong>{acceptedInfo.donor?.name}</strong>
            </div>
            <div className="donor-info-row">
              <span className="donor-info-label">📱 Phone:</span>
              <strong>
                <a href={`tel:${acceptedInfo.donor?.phone}`} style={{ color: 'var(--accent-emerald-light)' }}>
                  {acceptedInfo.donor?.phone}
                </a>
              </strong>
            </div>
            <div className="donor-info-row">
              <span className="donor-info-label">📍 City:</span>
              <span>{acceptedInfo.donor?.city}</span>
            </div>
            {acceptedInfo.donor?.is_ngo && (
              <div className="donor-info-row">
                <span className="donor-info-label">🏢 NGO:</span>
                <span>{acceptedInfo.donor?.ngo_name}</span>
              </div>
            )}
            <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm) 0', borderTop: '1px solid var(--border-subtle)' }}>
              <div className="donor-info-row">
                <span className="donor-info-label">🍽️ Food:</span>
                <span>{acceptedInfo.food?.title} — {acceptedInfo.food?.quantity}</span>
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Finding food near you...</p>
          </div>
        ) : (
          <>
            <div className="animate-fade-in-up delay-1">
              <MapView
                center={location ? [location.lat, location.lng] : null}
                listings={listings}
                onAccept={handleAccept}
                userLocation={location ? [location.lat, location.lng] : null}
              />
            </div>

            {/* Food listing cards below map */}
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 600,
                marginBottom: 'var(--space-md)',
              }}>
                📋 Available Food ({listings.length})
              </h2>

              {listings.length === 0 ? (
                <div className="empty-state glass-card">
                  <div className="empty-state-icon">🔍</div>
                  <p className="empty-state-text">
                    No food available within 5km right now. Check back later!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {listings.map((listing, idx) => (
                    <div
                      key={listing.id}
                      className="food-card glass-card"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {listing.photo_url && (
                        <img
                          src={listing.photo_url}
                          alt={listing.title}
                          className="food-card-image"
                        />
                      )}
                      <div className="food-card-content">
                        <h3 className="food-card-title">{listing.title}</h3>
                        <div className="food-card-meta">
                          <span>📦 {listing.quantity}</span>
                          <span>📍 {listing.distance} km</span>
                        </div>
                        {listing.description && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                            {listing.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <span className="food-card-badge badge-available">Available</span>
                          {listing.donor?.is_ngo && (
                            <span className="food-card-badge badge-ngo">🏢 NGO</span>
                          )}
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: 'var(--space-md)' }}
                          onClick={() => handleAccept(listing.id)}
                          disabled={acceptingId === listing.id}
                        >
                          {acceptingId === listing.id ? 'Accepting...' : '✅ Accept Food'}
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
