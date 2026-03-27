'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('nogirr_user') || 'null');
      setUser(userData);
    } catch {}
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <div className="page-container">
        {/* Welcome Section */}
        <div className="page-header" style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <h1 className="page-title animate-fade-in-up" style={{ fontSize: '2.2rem' }}>
            Welcome, <span style={{ color: 'var(--accent-emerald-light)' }}>{user?.name || 'Friend'}</span> 👋
          </h1>
          <p className="page-subtitle animate-fade-in-up delay-1">
            {user?.is_ngo
              ? `NGO: ${user?.ngo_name} • ${user?.city}`
              : `${user?.city} • What would you like to do today?`
            }
          </p>
        </div>

        {/* Action Cards */}
        <div className="dashboard-grid">
          <div
            className="glass-card dashboard-action-card give animate-fade-in-up delay-2"
            onClick={() => router.push('/dashboard/give')}
          >
            <span className="dashboard-action-icon animate-float">🍽️</span>
            <h2 className="dashboard-action-title">Donate Food</h2>
            <p className="dashboard-action-desc">
              Share your surplus food with people nearby who need it
            </p>
            <div style={{
              marginTop: 'var(--space-lg)',
              color: 'var(--accent-emerald)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              Post a listing →
            </div>
          </div>

          <div
            className="glass-card dashboard-action-card take animate-fade-in-up delay-3"
            onClick={() => router.push('/dashboard/take')}
          >
            <span className="dashboard-action-icon animate-float" style={{ animationDelay: '0.5s' }}>🤲</span>
            <h2 className="dashboard-action-title">Get Food</h2>
            <p className="dashboard-action-desc">
              Browse available food donations within 5km of you
            </p>
            <div style={{
              marginTop: 'var(--space-lg)',
              color: 'var(--accent-amber)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              View on map →
            </div>
          </div>

          <div
            className="glass-card dashboard-action-card farm animate-fade-in-up delay-4"
            onClick={() => router.push('/dashboard/farm')}
          >
            <span className="dashboard-action-icon animate-float" style={{ animationDelay: '1s' }}>🌾</span>
            <h2 className="dashboard-action-title">Farm Rescue</h2>
            <p className="dashboard-action-desc">
              Save unsold farm produce — post or claim crops from nearby farmers
            </p>
            <div style={{
              marginTop: 'var(--space-lg)',
              color: '#a78bfa',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              Rescue produce →
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-xl)',
            marginTop: 'var(--space-3xl)',
            flexWrap: 'wrap',
          }}>
            <div className="glass-card animate-fade-in-up delay-4" style={{
              padding: 'var(--space-lg) var(--space-xl)',
              textAlign: 'center',
              minWidth: '140px',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                ⭐ {user?.score || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your Score
              </div>
            </div>
            <div className="glass-card animate-fade-in-up delay-5" style={{
              padding: 'var(--space-lg) var(--space-xl)',
              textAlign: 'center',
              minWidth: '140px',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                🎁 {user?.donation_count || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Donations
              </div>
            </div>
            <div
              className="glass-card animate-fade-in-up delay-5"
              style={{
                padding: 'var(--space-lg) var(--space-xl)',
                textAlign: 'center',
                minWidth: '140px',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/dashboard/scoreboard')}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                🏆
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Scoreboard
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
