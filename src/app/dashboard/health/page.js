'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import ThreeBackground from '@/components/ThreeBackground';

export default function YourHealthPage() {
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
            Your <span style={{ color: 'var(--accent-emerald)', textShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>Health Menu</span>
          </h1>
          <p className="page-subtitle animate-fade-in-up delay-1" style={{ fontSize: '1.2rem', color: '#86948a', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '10px' }}>
            AI-DRIVEN NUTRITION & WELLNESS HUB
          </p>
        </div>

        {/* Action Cards */}
        <div className="dashboard-grid" style={{ marginTop: '50px' }}>
          
          {/* Calorie Tracker */}
          <div
            className="glass-card dashboard-action-card give animate-fade-in-up delay-2"
            onClick={() => router.push('/dashboard/health/tracker')}
            style={{ border: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 229, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)'; }}
          >
            <span className="dashboard-action-icon animate-float" style={{ filter: 'drop-shadow(0 0 10px rgba(0,229,255,0.4))' }}>🍎</span>
            <h2 className="dashboard-action-title" style={{ color: '#00e5ff', textTransform: 'uppercase' }}>Calorie Tracker</h2>
            <p className="dashboard-action-desc" style={{ color: '#bbcabf' }}>
              Inputs what you eat. Let AI map macros, calories, and missing nutrients against your daily goal.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', color: '#00e5ff', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Track Meal →
            </div>
          </div>

          {/* AI Diet Plan */}
          <div
            className="glass-card dashboard-action-card take animate-fade-in-up delay-3"
            onClick={() => router.push('/dashboard/health/diet')}
            style={{ border: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 229, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)'; }}
          >
            <span className="dashboard-action-icon animate-float" style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 0 10px rgba(255,185,95,0.4))' }}>🧬</span>
            <h2 className="dashboard-action-title" style={{ color: '#00e5ff', textTransform: 'uppercase' }}>AI Diet Plan</h2>
            <p className="dashboard-action-desc" style={{ color: '#bbcabf' }}>
              Provide your medical history & health issues. Gemini AI will architect a survival & wellness diet for you.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', color: '#ffb95f', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Generate Plan →
            </div>
          </div>

          {/* Community Hub */}
          <div
            className="glass-card dashboard-action-card farm animate-fade-in-up delay-4"
            onClick={() => router.push('/dashboard/health/community')}
            style={{ border: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(16px)', transition: 'all 0.3s', gridColumn: '1 / -1', maxWidth: '500px', margin: '0 auto' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 229, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)'; }}
          >
            <span className="dashboard-action-icon animate-float" style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 10px rgba(208,188,255,0.4))' }}>🌍</span>
            <h2 className="dashboard-action-title" style={{ color: '#00e5ff', textTransform: 'uppercase' }}>Community Hub</h2>
            <p className="dashboard-action-desc" style={{ color: '#bbcabf' }}>
              A geo-fenced space to share healthy recipes and diet plans with people within 50km or worldwide.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', color: '#d0bcff', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              View Feed →
            </div>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
