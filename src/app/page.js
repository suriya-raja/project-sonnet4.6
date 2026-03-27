'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IntroAnimation from '@/components/IntroAnimation';

export default function HomePage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('nogirr_token');
    if (token) {
      if (introComplete) {
        router.push('/dashboard');
      }
    }
  }, [introComplete, router]);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    setShowIntro(false);
    
    const token = localStorage.getItem('nogirr_token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      {/* Fallback content while intro plays */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center', opacity: showIntro ? 0 : 1, transition: 'opacity 0.5s' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #34d399, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            NOGIRR
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Share Food, Share Love
          </p>
        </div>
      </div>
    </>
  );
}
