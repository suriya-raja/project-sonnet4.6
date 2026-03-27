import os
import re

# 1. Update dashboard page
dashboard_path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\src\app\dashboard\page.js"
dashboard_content = """'use client';

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
      {/* Warm SDG Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'linear-gradient(135deg, #f8fafc, #dcfce7, #fef3c7)' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 60%)', filter: 'blur(40px)', animation: 'pulse 8s infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 60%)', filter: 'blur(40px)' }} />
      </div>
      
      <Navbar />
      <div className="page-container" style={{ position: 'relative', zIndex: 10, paddingTop: '100px', color: '#0f172a' }}>
        {/* Welcome Section */}
        <div className="page-header" style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          <h1 className="page-title animate-fade-in-up" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#064e3b', textTransform: 'none' }}>
            Welcome back, <span style={{ color: '#10b981', textShadow: 'none' }}>{user?.name || 'Friend'}</span> 🌾
          </h1>
          <p className="page-subtitle animate-fade-in-up delay-1" style={{ fontSize: '1.2rem', color: '#475569', marginTop: '10px', textTransform: 'none', letterSpacing: 'normal' }}>
            {user?.is_ngo
              ? `NGO Partner: ${user?.ngo_name} • ${user?.city}`
              : `Community Member • ${user?.city} • Together we can end hunger.`
            }
          </p>
        </div>

        {/* Action Cards */}
        <div className="dashboard-grid" style={{ marginTop: '50px' }}>
          
          <div
            className="dashboard-action-card animate-fade-in-up delay-2"
            onClick={() => router.push('/dashboard/give')}
            style={{ padding: '30px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.05)', transition: 'all 0.3s', cursor: 'pointer' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.05)'; }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🍲</div>
            <h2 style={{ color: '#064e3b', fontWeight: 700, fontSize: '1.5rem', marginBottom: '10px' }}>Donate Food</h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Share your perfectly good surplus food with someone in your community who needs it today.
            </p>
            <div style={{ marginTop: '24px', color: '#10b981', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Post a listing <span>→</span>
            </div>
          </div>

          <div
            className="dashboard-action-card animate-fade-in-up delay-3"
            onClick={() => router.push('/dashboard/take')}
            style={{ padding: '30px', border: '1px solid rgba(251, 191, 36, 0.4)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(251, 191, 36, 0.05)', transition: 'all 0.3s', cursor: 'pointer' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(251, 191, 36, 0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(251, 191, 36, 0.05)'; }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤲</div>
            <h2 style={{ color: '#b45309', fontWeight: 700, fontSize: '1.5rem', marginBottom: '10px' }}>Receive Food</h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Find free, fresh, and perfectly edible surplus meals shared locally within your radius.
            </p>
            <div style={{ marginTop: '24px', color: '#d97706', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Search Map <span>→</span>
            </div>
          </div>

          <div
            className="dashboard-action-card animate-fade-in-up delay-4"
            onClick={() => router.push('/dashboard/farm')}
            style={{ padding: '30px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(139, 92, 246, 0.05)', transition: 'all 0.3s', cursor: 'pointer' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.05)'; }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚜</div>
            <h2 style={{ color: '#5b21b6', fontWeight: 700, fontSize: '1.5rem', marginBottom: '10px' }}>Farm Rescue</h2>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>
              Connect directly with farmers to rescue unsellable crop yields before they go to waste.
            </p>
            <div style={{ marginTop: '24px', color: '#8b5cf6', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Browse Farms <span>→</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)', marginTop: '80px', flexWrap: 'wrap' }}>
            <div className="animate-fade-in-up delay-4" style={{ padding: 'var(--space-lg) var(--space-xl)', textAlign: 'center', minWidth: '180px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>
                {user?.score || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#b45309', marginTop: '8px', fontWeight: 600 }}>
                Impact Score
              </div>
            </div>
            
            <div className="animate-fade-in-up delay-5" style={{ padding: 'var(--space-lg) var(--space-xl)', textAlign: 'center', minWidth: '180px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
               <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>
                {user?.donation_count || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#064e3b', marginTop: '8px', fontWeight: 600 }}>
                Meals Shared
              </div>
            </div>

            <div className="animate-fade-in-up delay-5" 
                 style={{ padding: 'var(--space-lg) var(--space-xl)', textAlign: 'center', minWidth: '180px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', transition: 'background 0.3s' }}
                 onClick={() => router.push('/dashboard/scoreboard')}
                 onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(241, 245, 249, 1)'; }}
                 onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'; }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6' }}>
                🏆
              </div>
              <div style={{ fontSize: '0.9rem', color: '#5b21b6', marginTop: '8px', fontWeight: 600 }}>
                Community Board
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
"""
with open(dashboard_path, "w", encoding="utf-8") as f:
    f.write(dashboard_content)

# 2. Update landing.html
landing_path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(landing_path, "r", encoding="utf-8") as f:
    html = f.read()

# Swap tailwind dark mode off
html = html.replace('<html class="dark"', '<html class="light"')
html = html.replace('background-color: #030303;', 'background-color: #f8fafc;')
html = html.replace('color: #dfe2f3;', 'color: #0f172a;')

# Swap UI elements to light mode matching SDG
html = html.replace('bg-slate-900/40', 'bg-white/80')
html = html.replace('bg-slate-950/80', 'bg-white/90')
html = html.replace('border-cyan-500/10', 'border-emerald-500/20')
html = html.replace('text-cyan-400', 'text-emerald-600')
html = re.sub(r'from-cyan-400 to-cyan-600', 'from-emerald-500 to-amber-500', html)
html = html.replace('text-slate-400', 'text-slate-600')
html = html.replace('text-slate-500', 'text-slate-500')
html = html.replace('bg-transparent', 'bg-emerald-50')
html = re.sub(r'glow-cyan', 'glow-emerald', html)
html = html.replace('rgba(0, 229, 255, 0.3)', 'rgba(16, 185, 129, 0.3)')

html = html.replace('rgba(49, 52, 66, 0.4)', 'rgba(255, 255, 255, 0.6)')
html = html.replace('rgba(0, 229, 255, 0.1)', 'rgba(16, 185, 129, 0.15)')

# Change colors
html = html.replace('#00e5ff', '#10b981')
html = html.replace('#00b4d8', '#059669')

# Three JS
html = html.replace('alpha: true', 'alpha: false')
html = html.replace('renderer.setSize(window.innerWidth, window.innerHeight);', 
                    'renderer.setSize(window.innerWidth, window.innerHeight);\n        renderer.setClearColor(0xf8fafc, 1);')

# Proper daylight
html = html.replace('new THREE.AmbientLight(0xffffff, 0.05)', 'new THREE.AmbientLight(0xffffff, 0.8)')
html = html.replace('new THREE.DirectionalLight(0xffffff, 3.0)', 'new THREE.DirectionalLight(0xffffff, 1.2)')

# Nature falling leaves instead of stars
html = html.replace('color: 0xffffff, size: 0.05', 'color: 0x10b981, size: 0.2')

# Total wipe of astronaut logic since SDG theme is requested
html = re.sub(r'// Astronaut and Asteroids.*?scene\.add\(astronaut\);\n        \}\);', '', html, flags=re.DOTALL)
html = re.sub(r'if \(astronaut\) \{.*?\}', '', html, flags=re.DOTALL)
html = re.sub(r'astronaut\.[a-zA-Z\.]+ *= .*?;', '', html, flags=re.DOTALL)

with open(landing_path, "w", encoding="utf-8") as f:
    f.write(html)
