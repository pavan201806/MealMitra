/**
 * Location Normalization Utility
 * Converts various location inputs into canonical latitude/longitude coordinates
 * 
 * Core Principle: Location is user-friendly at edges, canonical at core
 * 
 * @param {Object} input - Location input (city, GPS, or coordinates)
 * @returns {Object} - Normalized location { latitude, longitude, city }
 * @throws {Error} - If location cannot be resolved
 */

// Predefined city coordinates (can be expanded or loaded from database)
const CITY_COORDINATES = {
  'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'Bengaluru': { latitude: 12.9716, longitude: 77.5946 },
  'Bangalore': { latitude: 12.9716, longitude: 77.5946 }, // Alias
  'Chennai': { latitude: 13.0827, longitude: 80.2707 },
  'Mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'Delhi': { latitude: 28.6139, longitude: 77.2090 },
  'Kolkata': { latitude: 22.5726, longitude: 88.3639 },
  'Pune': { latitude: 18.5204, longitude: 73.8567 },
  'Ahmedabad': { latitude: 23.0225, longitude: 72.5714 }
};

/**
 * Normalize location input to canonical coordinates
 * 
 * Accepts:
 * - { city: string } - City name (looked up in predefined list)
 * - { latitude: number, longitude: number } - Direct coordinates
 * - { latitude: number, longitude: number, city: string } - Complete location
 * 
 * Returns:
 * - { latitude: number, longitude: number, city: string }
 * 
 * @param {Object} input - Location input
 * @returns {Object} Normalized location
 * @throws {Error} If location cannot be resolved
 */
function normalizeLocation(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Location input must be an object');
  }

  // Case 1: Direct coordinates provided
  if (input.latitude !== undefined && input.longitude !== undefined) {
    const lat = parseFloat(input.latitude);
    const lng = parseFloat(input.longitude);

    // Validate coordinates
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error('Invalid latitude. Must be a number between -90 and 90');
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      throw new Error('Invalid longitude. Must be a number between -180 and 180');
    }

    // Extract city if provided, otherwise use empty string
    const city = input.city || '';

    return {
      latitude: lat,
      longitude: lng,
      city: city.trim()
    };
  }

  // Case 2: City name provided (lookup coordinates)
  if (input.city) {
    const cityName = String(input.city).trim();
    
    if (cityName.length === 0) {
      throw new Error('City name cannot be empty');
    }

    // Lookup city in predefined coordinates
    const cityKey = Object.keys(CITY_COORDINATES).find(
      key => key.toLowerCase() === cityName.toLowerCase()
    );

    if (!cityKey) {
      throw new Error(`City "${cityName}" not found in supported cities. Supported: ${Object.keys(CITY_COORDINATES).join(', ')}`);
    }

    const coords = CITY_COORDINATES[cityKey];
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      city: cityKey
    };
  }

  // Case 3: Invalid input
  throw new Error('Location input must include either (latitude, longitude) or city name');
}

/**
 * Validate that location data is complete and valid
 * 
 * @param {Object} location - Location object to validate
 * @returns {boolean} True if valid
 * @throws {Error} If invalid
 */
function validateLocation(location) {
  if (!location || typeof location !== 'object') {
    throw new Error('Location must be an object');
  }

  if (location.latitude === undefined || location.longitude === undefined) {
    throw new Error('Location must include latitude and longitude');
  }

  const lat = parseFloat(location.latitude);
  const lng = parseFloat(location.longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error('Invalid latitude. Must be a number between -90 and 90');
  }

  if (isNaN(lng) || lng < -180 || lng > 180) {
    throw new Error('Invalid longitude. Must be a number between -180 and 180');
  }

  return true;
}

/**
 * Check if user has complete location data
 * 
 * @param {Object} user - User object from database
 * @returns {boolean} True if user has valid location
 */
function hasLocation(user) {
  if (!user) return false;
  
  const lat = user.latitude;
  const lng = user.longitude;

  // Check if coordinates exist and are valid numbers
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return false;
  }

  // Validate ranges
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return false;
  }

  return true;
}

module.exports = {
  normalizeLocation,
  validateLocation,
  hasLocation,
  CITY_COORDINATES
};


