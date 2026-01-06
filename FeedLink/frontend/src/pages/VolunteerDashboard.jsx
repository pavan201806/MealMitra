import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDonations, getVolunteerDonations, assignDonation, completeDonation } from '../services/donationService';
import { logout, getCurrentUser } from '../services/authService';
import '../styles/Dashboard.css';

const VolunteerDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [availableRes, myRes] = await Promise.all([
        getAvailableDonations(),
        getVolunteerDonations()
      ]);
      setDonations(availableRes.donations || []);
      setMyDonations(myRes.donations || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (donationId) => {
    try {
      await assignDonation(donationId);
      alert('Donation assigned successfully!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign donation');
    }
  };

  const handleComplete = async (donationId) => {
    try {
      await completeDonation(donationId);
      alert('Donation completed successfully!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete donation');
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
          <h1>FEEDILINK - Volunteer Dashboard</h1>
          <div className="nav-actions">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="container">
          <div className="tabs">
            <button
              className={activeTab === 'available' ? 'tab-active' : 'tab'}
              onClick={() => setActiveTab('available')}
            >
              Available Donations
            </button>
            <button
              className={activeTab === 'my' ? 'tab-active' : 'tab'}
              onClick={() => setActiveTab('my')}
            >
              My Assignments
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : activeTab === 'available' ? (
            donations.length === 0 ? (
              <div className="empty-state">
                <p>No available donations at the moment.</p>
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
                    <th>Expiry</th>
                    <th>Action</th>
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
                      <td>{donation.expiry_time}</td>
                      <td>
                        <button
                          onClick={() => handleAssign(donation.id)}
                          className="btn-primary btn-sm"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : myDonations.length === 0 ? (
            <div className="empty-state">
              <p>You haven't assigned any donations yet.</p>
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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td>{donation.food_name}</td>
                    <td>{donation.food_type}</td>
                    <td>{donation.quantity}</td>
                    <td>{donation.pickup_address}</td>
                    <td>{donation.donor_name}</td>
                    <td>{donation.donor_phone || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${donation.status}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td>
                      {donation.status === 'assigned' && (
                        <button
                          onClick={() => handleComplete(donation.id)}
                          className="btn-primary btn-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                      {donation.status === 'delivered' && (
                        <span className="badge badge-delivered">Completed</span>
                      )}
                    </td>
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

export default VolunteerDashboard;

