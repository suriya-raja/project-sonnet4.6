'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import Podium3D from '@/components/Podium3D';
import { INDIAN_CITIES } from '@/lib/cities';

export default function ScoreboardPage() {
  const [scoreboard, setScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [noService, setNoService] = useState(false);
  const [detectedName, setDetectedName] = useState('');
  const [locationError, setLocationError] = useState('');
  const [userRank, setUserRank] = useState(null);
  const [userId, setUserId] = useState(null);

  const matchCity = (detected) => {
    if (!detected) return null;
    const lower = detected.toLowerCase().trim();
    const exact = INDIAN_CITIES.find(c => c.toLowerCase() === lower);
    if (exact) return exact;
    const partial = INDIAN_CITIES.find(c =>
      lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower)
    );
    return partial || null;
  };

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();

      if (data?.address) {
        const name =
          data.address.city ||
          data.address.town ||
          data.address.state_district ||
          data.address.county ||
          data.address.state;

        setDetectedName(name || 'Unknown');

        const matched = matchCity(name);
        if (matched) {
          setCity(matched);
          setNoService(false);
          return matched;
        } else {
          setNoService(true);
          setLoading(false);
          return null;
        }
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setLocationError('Failed to detect your location. Please try again.');
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('nogirr_user') || '{}');
      setUserId(user.id);
    } catch {}

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const detectedCity = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          if (detectedCity) {
            fetchScoreboard(detectedCity, user.id);
          }
        },
        () => {
          setLocationError('Location access denied. Please enable GPS to view the scoreboard of your current city.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, [reverseGeocode]);

  const fetchScoreboard = async (cityName, uid) => {
    try {
      const res = await fetch(`/api/scoreboard?city=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      if (res.ok) {
        setScoreboard(data.scoreboard || []);
        const myRank = data.scoreboard?.find(d => d.id === uid);
        setUserRank(myRank || null);
      }
    } catch (err) {
      console.error('Scoreboard error:', err);
    }
    setLoading(false);
  };

  const topThree = scoreboard.slice(0, 3);
  const restOfList = scoreboard.slice(3);

  return (
    <AuthGuard>
      <Navbar />
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div className="page-header animate-fade-in-up" style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ fontSize: '2.2rem' }}>
            🏆 City Scoreboard
          </h1>
          {city && (
            <p className="page-subtitle">
              Top 50 food donors in <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{city}</span>
            </p>
          )}
        </div>

        {/* Location error */}
        {locationError && (
          <div className="alert alert-error animate-scale-in" style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
            ⚠️ {locationError}
          </div>
        )}

        {/* No service in this city */}
        {noService && (
          <div className="glass-card animate-scale-in" style={{
            padding: 'var(--space-3xl)',
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🚫</div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: 'var(--space-md)',
              color: 'var(--accent-amber)',
            }}>
              No Service in {detectedName}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '400px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              NOGIRR is not yet available in <strong style={{ color: 'var(--text-primary)' }}>{detectedName}</strong>.
              We currently serve {INDIAN_CITIES.length} major Indian cities. We&apos;re expanding soon!
            </p>
            <div style={{
              marginTop: 'var(--space-xl)',
              padding: 'var(--space-md)',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                📍 Your detected location: <strong style={{ color: 'var(--text-secondary)' }}>{detectedName}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !noService && !locationError && (
          <div className="loading-page">
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>📍 Detecting your location...</p>
          </div>
        )}

        {/* Scoreboard content - only show when city is detected and in our list */}
        {!loading && !noService && !locationError && city && (
          <>
            {/* Location badge */}
            <div className="alert alert-success animate-fade-in-up" style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
              📍 You&apos;re currently in <strong>{city}</strong> — showing local scoreboard
            </div>

            {/* Your rank card */}
            {userRank && (
              <div className="glass-card animate-scale-in" style={{
                padding: 'var(--space-lg)',
                textAlign: 'center',
                marginBottom: 'var(--space-xl)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Your Rank
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  color: 'var(--accent-amber)',
                }}>
                  #{userRank.rank}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  ⭐ {userRank.score} points • 🎁 {userRank.donation_count} donations
                </div>
              </div>
            )}

            {scoreboard.length === 0 ? (
              <div className="empty-state glass-card">
                <div className="empty-state-icon">🏆</div>
                <p className="empty-state-text">
                  No donors in {city} yet. Be the first to donate and top the leaderboard!
                </p>
              </div>
            ) : (
              <>
                <Podium3D topThree={topThree} />

                {restOfList.length > 0 && (
                  <div style={{ marginTop: 'var(--space-xl)' }}>
                    <h2 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      marginBottom: 'var(--space-md)',
                      color: 'var(--text-secondary)',
                    }}>
                      Full Leaderboard
                    </h2>
                    <div className="leaderboard-list">
                      {restOfList.map((donor, idx) => (
                        <div
                          key={donor.id}
                          className="leaderboard-item"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="leaderboard-rank">{donor.rank}</div>
                          <div className="leaderboard-info">
                            <div className="leaderboard-name">
                              {donor.name}
                              {donor.is_ngo && (
                                <span className="food-card-badge badge-ngo" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>
                                  NGO
                                </span>
                              )}
                            </div>
                            <div className="leaderboard-stats">
                              🎁 {donor.donation_count} donation{donor.donation_count !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="leaderboard-score">⭐ {donor.score}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="glass-card" style={{
                  padding: 'var(--space-lg)',
                  textAlign: 'center',
                  marginTop: 'var(--space-xl)',
                }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Showing top {scoreboard.length} donor{scoreboard.length !== 1 ? 's' : ''} in {city}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
