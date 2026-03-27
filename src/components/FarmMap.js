'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom farm marker icon
const createFarmIcon = (isFree = false) => {
  const color = isFree ? '#10b981' : '#f59e0b';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "><span style="transform: rotate(45deg); font-size: 16px;">🌾</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: #3b82f6;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function SetView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function FarmMap({ center, listings, onClaim, userLocation, radiusKm = 10, claimingId }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !center) {
    return (
      <div className="map-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Adjust zoom based on radius
  const getZoom = (radius) => {
    if (radius <= 5) return 13;
    if (radius <= 10) return 12;
    if (radius <= 20) return 11;
    if (radius <= 30) return 10;
    return 9;
  };

  return (
    <div className="map-container" style={{ height: '450px' }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <MapContainer
        center={center}
        zoom={getZoom(radiusKm)}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <SetView center={center} zoom={getZoom(radiusKm)} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Search radius circle */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '10 5',
              }}
            />
            <Marker position={userLocation} icon={createUserIcon()}>
              <Popup>
                <div className="map-popup">
                  <h3>📍 Your Location</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>
                    Showing produce within {radiusKm}km
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Farm produce markers */}
        {listings?.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={createFarmIcon(listing.is_free)}
          >
            <Popup>
              <div className="map-popup" style={{ minWidth: '220px' }}>
                {listing.photo_url && (
                  <img
                    src={listing.photo_url}
                    alt={listing.crop_type}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                  />
                )}
                <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>
                  🌿 {listing.crop_type}
                </h3>
                <p style={{ margin: '2px 0' }}>
                  <strong>Quantity:</strong> {listing.quantity}
                </p>
                <p style={{ margin: '2px 0', color: listing.is_free ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  {listing.is_free ? '🆓 FREE' : `💰 ₹${listing.price_per_kg}/kg`}
                </p>
                {listing.freshness_hours && (
                  <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>
                    ⏰ Fresh for {listing.freshness_hours}h
                  </p>
                )}
                <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>
                  📍 {listing.distance ? `${listing.distance} km away` : 'Nearby'}
                </p>
                {listing.farmer?.name && (
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#888' }}>
                    👨‍🌾 {listing.farmer.name}
                  </p>
                )}
                {listing.ai_detected_crop && (
                  <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#a78bfa' }}>
                    🤖 AI Verified: {listing.ai_detected_crop}
                  </p>
                )}
                {listing.description && (
                  <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#666' }}>
                    {listing.description}
                  </p>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onClaim?.(listing.id)}
                  disabled={claimingId === listing.id}
                  style={{ marginTop: '8px', width: '100%' }}
                >
                  {claimingId === listing.id ? 'Claiming...' : '🤝 Claim Produce'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
