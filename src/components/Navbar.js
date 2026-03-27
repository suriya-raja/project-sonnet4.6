'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  let user = null;
  if (typeof window !== 'undefined') {
    try {
      user = JSON.parse(localStorage.getItem('nogirr_user') || 'null');
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('nogirr_token');
    localStorage.removeItem('nogirr_user');
    router.push('/login');
  };

  const isActive = (path) => pathname === path ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar">
      <Link href="/dashboard" className="navbar-brand">NOGIRR</Link>

      <div className="navbar-links">
        <Link href="/dashboard" className={isActive('/dashboard')}>Home</Link>
        <Link href="/dashboard/give" className={isActive('/dashboard/give')}>Donate</Link>
        <Link href="/dashboard/take" className={isActive('/dashboard/take')}>Get Food</Link>
        <Link href="/dashboard/orders" className={isActive('/dashboard/orders')}>Orders</Link>
        <Link href="/dashboard/scoreboard" className={isActive('/dashboard/scoreboard')}>🏆 Score</Link>
      </div>

      <div className="navbar-user">
        <div className="navbar-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {user?.name || 'User'}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            marginLeft: '8px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-red)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
