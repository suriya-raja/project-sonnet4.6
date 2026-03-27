'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobeBackground from '@/components/GlobeBackground';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (path) => {
    const token = localStorage.getItem('nogirr_token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push(path);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0b101e' }}>
      
      {/* 3D Background */}
      <GlobeBackground />
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none' // Let clicks pass through to background if needed, but we'll enable it for buttons
      }}>
        
        {/* Main Title Group */}
        <div style={{ textAlign: 'center', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 'clamp(5rem, 15vw, 12rem)',
            fontWeight: 900,
            color: '#1dfc6a', /* Neon green */
            margin: 0,
            lineHeight: 1,
            letterSpacing: '-2px',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(29, 252, 106, 0.4), 0 0 50px rgba(29, 252, 106, 0.2)'
          }}>
            NOGIRR
          </h1>
          
          <h2 style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 'clamp(1rem, 3vw, 2rem)',
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            marginTop: '1rem',
            textAlign: 'center',
            opacity: 0.9
          }}>
            ZERO HUNGER. ZERO WASTE.
          </h2>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '60px',
          pointerEvents: 'auto'
        }}>
          <button 
            onClick={() => handleNavigate('/login')}
            style={{
              padding: '16px 32px',
              background: '#1dfc6a',
              color: '#0b101e',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '1.2rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 0 15px rgba(29, 252, 106, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 0 25px rgba(29, 252, 106, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 0 15px rgba(29, 252, 106, 0.4)';
            }}
          >
            DONATE FOOD
          </button>
          
          <button 
            onClick={() => handleNavigate('/register')}
            style={{
              padding: '16px 32px',
              background: '#2a3143',
              color: '#1dfc6a',
              border: '1px solid #1dfc6a',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '1.2rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#323a4f';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#2a3143';
            }}
          >
            RESCUE PRODUCE
          </button>
        </div>

      </div>
    </div>
  );
}
