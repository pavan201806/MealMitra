import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDonorDonations } from '../services/donationService';
import { logout, getCurrentUser } from '../services/authService';
import '../styles/Dashboard.css';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const response = await getDonorDonations();
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      assigned: 'badge-assigned',
      delivered: 'badge-delivered'
    };
    return badges[status] || '';
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="container">
          <h1>FEEDILINK - Donor Dashboard</h1>
          <div className="nav-actions">
            <span>Welcome, {user?.name}</span>
            <Link to="/donor/donate" className="btn-primary">Create Donation</Link>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="container">
          <h2>My Donations</h2>
          {loading ? (
            <p>Loading...</p>
          ) : donations.length === 0 ? (
            <div className="empty-state">
              <p>No donations yet. <Link to="/donor/donate">Create your first donation</Link></p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Pickup Address</th>
                  <th>Expiry Time</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{donation.food_name}</td>
                    <td>{donation.food_type}</td>
                    <td>{donation.quantity}</td>
                    <td>{donation.pickup_address}</td>
                    <td>{donation.expiry_time}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
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

export default DonorDashboard;

