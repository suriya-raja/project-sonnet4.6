'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import ThreeBackground from '@/components/ThreeBackground';

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
      <ThreeBackground />
      
      <Navbar />
      <div className="page-container" style={{ position: 'relative', zIndex: 10, paddingTop: '100px', color: '#fff' }}>
        {/* Welcome Section */}
        <div className="page-header" style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          <h1 className="page-title animate-fade-in-up" style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mission Control, <span style={{ color: 'var(--accent-emerald)', textShadow: '0 0 15px rgba(0, 229, 255, 0.4)' }}>{user?.name || 'Operator'}</span>
          </h1>
          <p className="page-subtitle animate-fade-in-up delay-1" style={{ fontSize: '1.2rem', color: '#86948a', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '10px' }}>
            {user?.is_ngo
              ? `NGO REGION: ${user?.ngo_name} • ${user?.city}`
              : `SECTOR: ${user?.city} • TOGETHER WE END HUNGER`
            }
          </p>
        </div>

        {/* Action Cards */}
        <div className="dashboard-grid" style={{ marginTop: '50px' }}>
          
          <div
            className="glass-card dashboard-action-card give animate-fade-in-up delay-2"
            onClick={() => router.push('/dashboard/give')}
            style={{ border: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 229, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)'; }}
          >
            <span className="dashboard-action-icon animate-float" style={{ filter: 'drop-shadow(0 0 10px rgba(0,229,255,0.4))' }}>🛰️</span>
            <h2 className="dashboard-action-title" style={{ color: '#00e5ff', textTransform: 'uppercase' }}>Donate Food</h2>
            <p className="dashboard-action-desc" style={{ color: '#bbcabf' }}>
              Upload surplus food details into the global repository.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', color: '#00e5ff', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Share Surplus →
            </div>
          </div>

          <div
            className="glass-card dashboard-action-card take animate-fade-in-up delay-3"
            onClick={() => router.push('/dashboard/take')}
            style={{ border: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 229, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)'; }}
          >
            <span className="dashboard-action-icon animate-float" style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 0 10px rgba(255,185,95,0.4))' }}>📡</span>
            <h2 className="dashboard-action-title" style={{ color: '#00e5ff', textTransform: 'uppercase' }}>Rescue Food</h2>
            <p className="dashboard-action-desc" style={{ color: '#bbcabf' }}>
              Find free, fresh, and perfectly edible surplus meals shared locally.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', color: '#ffb95f', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Search Map →
            </div>
          </div>

          <div
            className="glass-card dashboard-action-card farm animate-fade-in-up delay-4"
            onClick={() => router.push('/dashboard/farm')}
            style={{ border: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 229, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)'; }}
          >
            <span className="dashboard-action-icon animate-float" style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 10px rgba(208,188,255,0.4))' }}>🧬</span>
            <h2 className="dashboard-action-title" style={{ color: '#00e5ff', textTransform: 'uppercase' }}>Farm Intel</h2>
            <p className="dashboard-action-desc" style={{ color: '#bbcabf' }}>
              Connect directly with farmers to rescue unsellable crop yields before they waste.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', color: '#d0bcff', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Browse Farms →
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)', marginTop: '60px', flexWrap: 'wrap' }}>
            <div className="glass-card animate-fade-in-up delay-4" style={{ padding: 'var(--space-lg) var(--space-xl)', textAlign: 'center', minWidth: '180px', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffb95f', textShadow: '0 0 15px rgba(255,185,95,0.3)' }}>
                {user?.score || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#00e5ff', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Clearance Level
              </div>
            </div>
            
            <div className="glass-card animate-fade-in-up delay-5" style={{ padding: 'var(--space-lg) var(--space-xl)', textAlign: 'center', minWidth: '180px', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.15)' }}>
               <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00e5ff', textShadow: '0 0 15px rgba(0,229,255,0.3)' }}>
                {user?.donation_count || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#00e5ff', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Meals Shared
              </div>
            </div>

            <div className="glass-card animate-fade-in-up delay-5" 
                 style={{ padding: 'var(--space-lg) var(--space-xl)', textAlign: 'center', minWidth: '180px', cursor: 'pointer', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.15)', transition: 'background 0.3s' }}
                 onClick={() => router.push('/dashboard/scoreboard')}
                 onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0, 229, 255, 0.05)'; }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d0bcff', textShadow: '0 0 15px rgba(208,188,255,0.3)' }}>
                🏆
              </div>
              <div style={{ fontSize: '0.85rem', color: '#00e5ff', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Global Rankings
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
