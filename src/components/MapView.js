'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default marker icon issue in Next.js
const createCustomIcon = (color = '#10b981') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${color};
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

export default function MapView({ center, listings, onAccept, userLocation }) {
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

  return (
    <div className="map-container">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <SetView center={center} zoom={14} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location circle (5km radius) */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={5000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '10 5',
              }}
            />
            <Marker
              position={userLocation}
              icon={createCustomIcon('#3b82f6')}
            >
              <Popup>
                <div className="map-popup">
                  <h3>📍 Your Location</h3>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Food listing markers */}
        {listings?.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={createCustomIcon('#10b981')}
          >
            <Popup>
              <div className="map-popup" style={{ minWidth: '200px' }}>
                {listing.photo_url && (
                  <img src={listing.photo_url} alt={listing.title} />
                )}
                <h3>{listing.title}</h3>
                <p><strong>Quantity:</strong> {listing.quantity}</p>
                {listing.description && <p>{listing.description}</p>}
                <p>📍 {listing.distance ? `${listing.distance} km away` : 'Nearby'}</p>
                {listing.donor?.is_ngo && (
                  <p style={{ color: '#f59e0b', fontWeight: 600 }}>🏢 NGO: {listing.donor.ngo_name}</p>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onAccept?.(listing.id)}
                  style={{ marginTop: '8px', width: '100%' }}
                >
                  ✅ Accept Food
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
