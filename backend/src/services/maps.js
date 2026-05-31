// src/services/maps.js
const axios = require('axios');

const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Company base location (Madanapalle, AP)
const BASE_LAT = parseFloat(process.env.COMPANY_LAT) || 13.5504;
const BASE_LNG = parseFloat(process.env.COMPANY_LNG) || 78.5027;

/**
 * Get road distance in KM between two coordinates
 * Uses Google Maps Distance Matrix API when available
 */
async function getDistanceKm(origin, destination) {
  // Validate coordinates before any calculation
  if (!isValidCoord(origin.lat, origin.lng) || !isValidCoord(destination.lat, destination.lng)) {
    console.warn('Invalid coordinates detected, using fallback distance of 10 km');
    return 10;
  }

  if (!MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key_here') {
    console.warn('No Google Maps API key — using straight-line distance estimate');
    const d = haversineKm(origin, destination);
    // Cap at 200 km for sanity
    return Math.min(d * 1.3, 200);
  }

  try {
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const { data } = await axios.get(url, {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        mode: 'driving',
        key: MAPS_KEY,
      },
      timeout: 5000,
    });

    const element = data.rows?.[0]?.elements?.[0];
    if (element?.status === 'OK') {
      return element.distance.value / 1000; // metres → km
    }
    throw new Error('Distance not available from Maps API');
  } catch (err) {
    console.error('Maps API error:', err.message);
    const d = haversineKm(origin, destination);
    return Math.min(d * 1.3, 200);
  }
}

/**
 * Geocode a pincode to coordinates.
 * Falls back to a location very close to the company when no Maps API key is available.
 * The old approach of (pinNum - 517325) * 0.005 generated wildly out-of-range values.
 */
async function geocodePincode(pincode) {
  if (!MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key_here') {
    console.warn(`No Google Maps API key — using approximate location near company for PIN ${pincode}`);
    // Generate a small, bounded offset based on pincode digits (max ±0.5 degrees ≈ ±55 km)
    const pinNum = parseInt(pincode) || 517325;
    const seed = pinNum % 1000; // last 3 digits, 0–999
    const latOffset = ((seed % 100) / 100 - 0.5) * 1.0;   // ±0.5 deg
    const lngOffset = ((Math.floor(seed / 100)) / 10 - 0.45) * 1.0; // ±0.5 deg
    return {
      lat: clamp(BASE_LAT + latOffset, BASE_LAT - 1, BASE_LAT + 1),
      lng: clamp(BASE_LNG + lngOffset, BASE_LNG - 1, BASE_LNG + 1),
    };
  }

  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address: `${pincode}, India`, key: MAPS_KEY },
      timeout: 5000,
    });
    const loc = data.results?.[0]?.geometry?.location;
    return loc ? { lat: loc.lat, lng: loc.lng } : null;
  } catch {
    return null;
  }
}

/**
 * Geocode a full address string
 */
async function geocodeAddress(address) {
  if (!MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key_here') {
    return {
      lat: BASE_LAT + (Math.random() - 0.5) * 0.5,
      lng: BASE_LNG + (Math.random() - 0.5) * 0.5,
    };
  }
  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: MAPS_KEY },
      timeout: 5000,
    });
    const loc = data.results?.[0]?.geometry?.location;
    return loc ? { lat: loc.lat, lng: loc.lng } : null;
  } catch {
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────

function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function toRad(deg) { return deg * Math.PI / 180; }

function isValidCoord(lat, lng) {
  return (
    typeof lat === 'number' && isFinite(lat) && lat >= -90 && lat <= 90 &&
    typeof lng === 'number' && isFinite(lng) && lng >= -180 && lng <= 180
  );
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

module.exports = { getDistanceKm, geocodePincode, geocodeAddress };
