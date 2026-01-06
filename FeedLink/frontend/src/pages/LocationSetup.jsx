import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateProfile } from '../services/authService';
import LocationPicker from '../components/LocationPicker';
import '../styles/Auth.css';

/**
 * Mandatory Location Setup Page
 * Shown if user is missing latitude or longitude
 * Blocks dashboard access until completed
 */
const LocationSetup = () => {
  const [location, setLocation] = useState({ city: '', latitude: '', longitude: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user already has location
    const checkLocation = async () => {
      try {
        const response = await getMe();
        const user = response.user;
        
        if (user.latitude && user.longitude) {
          // User already has location, redirect to dashboard
          const role = user.role;
          if (role === 'donor') {
            navigate('/donor/dashboard');
          } else if (role === 'volunteer') {
            navigate('/volunteer/dashboard');
          } else if (role === 'ngo') {
            navigate('/ngo/dashboard');
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error('Error checking location:', err);
        setChecking(false);
      }
    };

    checkLocation();
  }, [navigate]);

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!location.city || !location.latitude || !location.longitude) {
      setError('Please select a location');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        city: location.city
      });

      // Redirect to appropriate dashboard
      const userResponse = await getMe();
      const role = userResponse.user.role;
      
      if (role === 'donor') {
        navigate('/donor/dashboard');
      } else if (role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else if (role === 'ngo') {
        navigate('/ngo/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Checking location...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Location Setup Required</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Please set your location to continue using FEEDILINK. This helps us match donations with volunteers and NGOs.
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <LocationPicker
            value={location}
            onChange={handleLocationChange}
            required={true}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !location.city}>
            {loading ? 'Saving...' : 'Save Location'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationSetup;


