'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Immediate redirect to the optimized landing page
    window.location.replace('/landing.html');
  }, []);

  return null; // No flash, no UI, just a clean jump
}
