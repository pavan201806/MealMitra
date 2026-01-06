import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyDonations } from '../services/donationService';
import { logout, getCurrentUser } from '../services/authService';
import '../styles/Dashboard.css';

const NGODashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const response = await getNearbyDonations(user?.address || '');
      setDonations(response.donations || []);
    } catch (err) {
      console.error('Error loading donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="container">
          <h1>FEEDILINK - NGO Dashboard</h1>
          <div className="nav-actions">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="container">
          <h2>Delivered Donations</h2>
          {loading ? (
            <p>Loading...</p>
          ) : donations.length === 0 ? (
            <div className="empty-state">
              <p>No delivered donations available at the moment.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Pickup Address</th>
                  <th>Donor</th>
                  <th>Contact</th>
                  <th>Delivered Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{donation.food_name}</td>
                    <td>{donation.food_type}</td>
                    <td>{donation.quantity}</td>
                    <td>{donation.pickup_address}</td>
                    <td>{donation.donor_name}</td>
                    <td>{donation.donor_phone || 'N/A'}</td>
                    <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default NGODashboard;

