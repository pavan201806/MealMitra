import { useState } from 'react';

/**
 * LocationPicker Component
 * Reusable component for selecting location (city dropdown + geolocation option)
 * 
 * Outputs canonical coordinates: { city, latitude, longitude }
 * Never returns address strings alone.
 */

// Predefined city locations with coordinates
const CITY_LOCATIONS = {
  'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'Bengaluru': { latitude: 12.9716, longitude: 77.5946 },
  'Chennai': { latitude: 13.0827, longitude: 80.2707 },
  'Mumbai': { latitude: 19.0760, longitude: 72.8777 }
};

const LocationPicker = ({ value, onChange, required = true, disabled = false }) => {
  const [location, setLocation] = useState({
    city: value?.city || '',
    latitude: value?.latitude || '',
    longitude: value?.longitude || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle city selection - auto-fill coordinates
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    const cityData = CITY_LOCATIONS[selectedCity];
    
    if (cityData) {
      const newLocation = {
        city: selectedCity,
        latitude: cityData.latitude,
        longitude: cityData.longitude
      };
      
      setLocation(newLocation);
      setError('');
      
      // Notify parent component
      if (onChange) {
        onChange(newLocation);
      }
    } else {
      setLocation({
        city: selectedCity,
        latitude: '',
        longitude: ''
      });
      setError('');
    }
  };

  // Handle browser geolocation (alternative option)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          city: 'Current Location',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        setLocation(newLocation);
        setLoading(false);
        
        // Notify parent component
        if (onChange) {
          onChange(newLocation);
        }
      },
      (err) => {
        setError('Unable to retrieve your location. Please select a city from the dropdown.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="form-group">
      <label>Location {required && '*'}</label>
      <select
        value={location.city}
        onChange={handleCityChange}
        required={required}
        disabled={disabled || loading}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      >
        <option value="">Select a city</option>
        {Object.keys(CITY_LOCATIONS).map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
      
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={disabled || loading}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '8px',
          fontSize: '0.9em',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: disabled || loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Getting location...' : 'Or Use My Current Location'}
      </button>
      
      {error && (
        <div style={{ color: 'red', fontSize: '0.9em', marginTop: '4px' }}>
          {error}
        </div>
      )}
      
      {/* Hidden fields for canonical coordinates */}
      <input
        type="hidden"
        name="latitude"
        value={location.latitude}
      />
      <input
        type="hidden"
        name="longitude"
        value={location.longitude}
      />
    </div>
  );
};

export default LocationPicker;


