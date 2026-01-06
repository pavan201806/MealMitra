import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getMe } from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(null);
  const location = useLocation();
  const user = getCurrentUser();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAuth = async () => {
      // Skip location check for setup-location page itself
      if (location.pathname === '/setup-location') {
        setIsChecking(false);
        return;
      }

      if (!token || !user) {
        setShouldRedirect('/login');
        setIsChecking(false);
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        setShouldRedirect('/');
        setIsChecking(false);
        return;
      }

      // Check if user has location data
      try {
        const response = await getMe();
        const userData = response.user;
        
        if (!userData.latitude || !userData.longitude) {
          // User missing location - redirect to setup
          setShouldRedirect('/setup-location');
        }
      } catch (err) {
        console.error('Error checking user location:', err);
        // On error, allow access (graceful degradation)
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [token, user, allowedRoles, location.pathname]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;

