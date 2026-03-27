/**
 * Calculate the distance between two lat/lng points using the Haversine formula.
 * @returns Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Filter food listings within a given radius (in km).
 */
export function filterByRadius(listings, lat, lng, radiusKm = 5) {
  return listings
    .map(listing => {
      const distance = haversineDistance(lat, lng, listing.latitude, listing.longitude);
      return { ...listing, distance: Math.round(distance * 100) / 100 };
    })
    .filter(listing => listing.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
