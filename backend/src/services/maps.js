// src/services/maps.js
const axios = require('axios');

const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get road distance in KM between two coordinates
 * Uses Google Maps Distance Matrix API
 */
async function getDistanceKm(origin, destination) {
  if (!MAPS_KEY) {
    console.warn('No Google Maps API key — using straight-line distance estimate');
    return haversineKm(origin, destination) * 1.3; // road factor ~1.3x
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
    });

    const element = data.rows?.[0]?.elements?.[0];
    if (element?.status === 'OK') {
      return element.distance.value / 1000; // convert metres → km
    }
    throw new Error('Distance not available');
  } catch (err) {
    console.error('Maps API error:', err.message);
    return haversineKm(origin, destination) * 1.3;
  }
}

/**
 * Geocode a pincode to coordinates
 */
async function geocodePincode(pincode) {
  if (!MAPS_KEY) {
    console.warn('No Google Maps API key — using mock coordinates centered near company');
    const pinNum = parseInt(pincode) || 517325;
    // Generates coordinates dynamically based on pincode offset from Madanapalle Town (517325)
    const lat = 13.5504 + ((pinNum - 517325) * 0.005);
    const lng = 78.5027 + ((pinNum - 517325) * 0.005);
    return { lat, lng };
  }

  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address: `${pincode}, India`, key: MAPS_KEY },
    });
    const loc = data.results?.[0]?.geometry?.location;
    return loc ? { lat: loc.lat, lng: loc.lng } : null;
  } catch {
    return null;
  }
}

/**
 * Geocode a full address
 */
async function geocodeAddress(address) {
  if (!MAPS_KEY) {
    console.warn('No Google Maps API key — using mock coordinates for address');
    return {
      lat: 13.5504 + (Math.random() - 0.5) * 0.05,
      lng: 78.5027 + (Math.random() - 0.5) * 0.05
    };
  }
  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: MAPS_KEY },
    });
    const loc = data.results?.[0]?.geometry?.location;
    return loc ? { lat: loc.lat, lng: loc.lng } : null;
  } catch {
    return null;
  }
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function toRad(deg) { return deg * Math.PI / 180; }

module.exports = { getDistanceKm, geocodePincode, geocodeAddress };
