'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    window.location.href = '/landing.html';
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <h1 style={{ color: '#00e5ff', fontFamily: 'monospace', letterSpacing: '0.2em' }}>INITIALIZING NOGIRR NEURAL NETWORK...</h1>
    </div>
  );
}
