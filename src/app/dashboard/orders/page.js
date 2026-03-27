'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ThreeBackground from '@/components/ThreeBackground';
import AuthGuard from '@/components/AuthGuard';
import OrderStatus from '@/components/OrderStatus';

export default function OrdersPage() {
  const [donorOrders, setDonorOrders] = useState([]);
  const [receiverOrders, setReceiverOrders] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('nogirr_token');
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDonorOrders(data.donorOrders || []);
        setReceiverOrders(data.receiverOrders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  const fetchMyListings = useCallback(async () => {
    const token = localStorage.getItem('nogirr_token');
    try {
      const res = await fetch('/api/food/my-listings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMyListings(data.listings || []);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchMyListings()]).then(() => setLoading(false));
  }, [fetchOrders, fetchMyListings]);

  const handleUpdateStatus = async (foodId, newStatus) => {
    const token = localStorage.getItem('nogirr_token');
    try {
      const res = await fetch(`/api/food/${foodId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
        fetchMyListings();

        if (newStatus === 'completed') {
          try {
            const userData = JSON.parse(localStorage.getItem('nogirr_user') || '{}');
            userData.donation_count = (userData.donation_count || 0) + 1;
            userData.score = (userData.score || 0) + 10;
            if (userData.donation_count === 1) userData.score += 50;
            if (userData.donation_count % 5 === 0) userData.score += 25;
            localStorage.setItem('nogirr_user', JSON.stringify(userData));
          } catch {}
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      available: { class: 'badge-available', label: '🟢 Waiting for acceptance', icon: '⏳' },
      accepted: { class: 'badge-accepted', label: '✅ Accepted', icon: '✅' },
      delivering: { class: 'badge-accepted', label: '🚗 Delivering', icon: '🚗' },
      completed: { class: 'badge-completed', label: '🎉 Completed', icon: '🎉' },
    };
    return map[status] || map.available;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========== MY DONATIONS TAB ==========
  const renderDonations = () => {
    // Combine: listings that haven't been accepted yet + orders (accepted/delivering/completed)
    const pendingListings = myListings.filter(l => l.status === 'available');
    const activeOrders = donorOrders.filter(o => o.status !== 'completed');
    const completedOrders = donorOrders.filter(o => o.status === 'completed');

    if (pendingListings.length === 0 && donorOrders.length === 0) {
      return (
        <div className="empty-state glass-card">
          <div className="empty-state-icon">🍽️</div>
          <p className="empty-state-text">No donations yet. Start sharing food!</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/dashboard/give'}
            style={{ marginTop: 'var(--space-md)' }}
          >
            ➕ Donate Food
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Pending listings (not yet accepted) */}
        {pendingListings.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--accent-amber)',
              marginBottom: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⏳ Waiting for Acceptance ({pendingListings.length})
            </h3>
            {pendingListings.map((listing, idx) => (
              <div
                key={`listing-${listing.id}`}
                className="glass-card animate-fade-in-up"
                style={{
                  padding: 'var(--space-lg)',
                  marginBottom: 'var(--space-md)',
                  animationDelay: `${idx * 0.08}s`,
                  opacity: 0,
                  borderLeft: '3px solid var(--accent-amber)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.1rem' }}>
                      {listing.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      📦 {listing.quantity}
                    </p>
                    {listing.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {listing.description}
                      </p>
                    )}
                  </div>
                  <span className={`food-card-badge ${getStatusBadge('available').class}`}>
                    {getStatusBadge('available').label}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
                  Posted: {formatTime(listing.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active orders (accepted/delivering) */}
        {activeOrders.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--accent-emerald)',
              marginBottom: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🔄 Active Orders ({activeOrders.length})
            </h3>
            {activeOrders.map((order, idx) => renderOrderCard(order, 'donor', idx))}
          </div>
        )}

        {/* Completed orders */}
        {completedOrders.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--accent-purple)',
              marginBottom: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ✅ Completed ({completedOrders.length})
            </h3>
            {completedOrders.map((order, idx) => renderOrderCard(order, 'donor', idx))}
          </div>
        )}
      </div>
    );
  };

  // ========== RECEIVED TAB ==========
  const renderReceived = () => {
    if (receiverOrders.length === 0) {
      return (
        <div className="empty-state glass-card">
          <div className="empty-state-icon">🤲</div>
          <p className="empty-state-text">No received orders. Browse available food!</p>
          <button
            className="btn btn-amber"
            onClick={() => window.location.href = '/dashboard/take'}
            style={{ marginTop: 'var(--space-md)' }}
          >
            🗺️ Find Food Near Me
          </button>
        </div>
      );
    }

    const active = receiverOrders.filter(o => o.status !== 'completed');
    const completed = receiverOrders.filter(o => o.status === 'completed');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {active.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600,
              color: 'var(--accent-emerald)', marginBottom: 'var(--space-md)',
            }}>
              🔄 Active ({active.length})
            </h3>
            {active.map((order, idx) => renderOrderCard(order, 'receiver', idx))}
          </div>
        )}
        {completed.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600,
              color: 'var(--accent-purple)', marginBottom: 'var(--space-md)',
            }}>
              ✅ Completed ({completed.length})
            </h3>
            {completed.map((order, idx) => renderOrderCard(order, 'receiver', idx))}
          </div>
        )}
      </div>
    );
  };

  // ========== ORDER CARD ==========
  const renderOrderCard = (order, role, idx) => {
    const statusBadge = getStatusBadge(order.status);
    const borderColor = order.status === 'completed'
      ? 'var(--accent-purple)'
      : order.status === 'delivering'
        ? 'var(--accent-blue)'
        : 'var(--accent-emerald)';

    return (
      <div
        key={order.id}
        className="glass-card animate-fade-in-up"
        style={{
          padding: 'var(--space-lg)',
          marginBottom: 'var(--space-md)',
          animationDelay: `${idx * 0.08}s`,
          opacity: 0,
          borderLeft: `3px solid ${borderColor}`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.1rem' }}>
              {order.food?.title || 'Food Order'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              📦 {order.food?.quantity || 'N/A'}
            </p>
          </div>
          <span className={`food-card-badge ${statusBadge.class}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Contact info */}
        {role === 'donor' && order.receiver && (
          <div className="donor-info-card" style={{
            marginBottom: 'var(--space-md)',
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}>
            <h3 style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>📩 Receiver Info</h3>
            <div className="donor-info-row">
              <span className="donor-info-label">👤 Name:</span>
              <strong>{order.receiver.name}</strong>
            </div>
            <div className="donor-info-row">
              <span className="donor-info-label">📱 Phone:</span>
              <a href={`tel:${order.receiver.phone}`} style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                {order.receiver.phone}
              </a>
            </div>
            {order.receiver.is_ngo && (
              <div className="donor-info-row">
                <span className="donor-info-label">🏢 NGO:</span>
                <span>{order.receiver.ngo_name}</span>
              </div>
            )}
          </div>
        )}

        {role === 'receiver' && order.donor && (
          <div className="donor-info-card" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 style={{ fontSize: '0.9rem' }}>🍽️ Donor Info</h3>
            <div className="donor-info-row">
              <span className="donor-info-label">👤 Name:</span>
              <strong>{order.donor.name}</strong>
            </div>
            <div className="donor-info-row">
              <span className="donor-info-label">📱 Phone:</span>
              <a href={`tel:${order.donor.phone}`} style={{ color: 'var(--accent-emerald-light)', fontWeight: 600 }}>
                {order.donor.phone}
              </a>
            </div>
            {order.donor.is_ngo && (
              <div className="donor-info-row">
                <span className="donor-info-label">🏢 NGO:</span>
                <span>{order.donor.ngo_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Status pipeline */}
        <OrderStatus
          status={order.status}
          isDonor={role === 'donor'}
          onUpdateStatus={(newStatus) =>
            handleUpdateStatus(order.food_listing_id, newStatus)
          }
        />

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
          Created: {formatTime(order.created_at)}
          {order.updated_at && order.updated_at !== order.created_at && (
            <span> • Updated: {formatTime(order.updated_at)}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <ThreeBackground />
      <Navbar />
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title">📋 My Orders</h1>
          <p className="page-subtitle">Track all your food donations and received orders</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-xl)',
        }}>
          <button
            className={`btn ${activeTab === 'donations' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('donations')}
          >
            🍽️ My Donations ({myListings.filter(l => l.status === 'available').length + donorOrders.length})
          </button>
          <button
            className={`btn ${activeTab === 'received' ? 'btn-amber' : 'btn-secondary'}`}
            onClick={() => setActiveTab('received')}
          >
            🤲 Received ({receiverOrders.length})
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setLoading(true);
              Promise.all([fetchOrders(), fetchMyListings()]).then(() => setLoading(false));
            }}
            style={{ marginLeft: 'auto' }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          activeTab === 'donations' ? renderDonations() : renderReceived()
        )}
      </div>
    </AuthGuard>
  );
}
