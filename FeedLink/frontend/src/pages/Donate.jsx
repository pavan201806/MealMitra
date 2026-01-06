import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDonation } from '../services/donationService';
import '../styles/Auth.css';

const Donate = () => {
  const [formData, setFormData] = useState({
    food_name: '',
    food_type: '',
    quantity: '',
    pickup_address: '',
    expiry_time: '',
    image_url: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Structured location options (can be expanded or loaded from backend)
  const locationOptions = [
    'Downtown Area',
    'Suburban District',
    'Industrial Zone',
    'Residential Area',
    'Commercial District',
    'University Campus',
    'Hospital Area',
    'Airport Zone'
  ];

  const handleImageUrlChange = (e) => {
    const url = e.target.value.trim();
    setFormData({ ...formData, image_url: url });
    
    // Validate URL format
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Image URL must start with http:// or https://');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate image URL
    if (!formData.image_url) {
      setError('Please provide an image URL for AI safety validation');
      return;
    }
    
    // Validate URL format
    if (!formData.image_url.startsWith('http://') && !formData.image_url.startsWith('https://')) {
      setError('Image URL must start with http:// or https://');
      return;
    }

    setLoading(true);

    try {
      // Convert datetime-local to ISO format for backend
      const donationData = {
        ...formData,
        expiry_time: formData.expiry_time ? new Date(formData.expiry_time).toISOString() : formData.expiry_time
      };
      
      const response = await createDonation(donationData);
      
      // Check if donation was rejected by AI
      if (response.rejected) {
        setError(`Donation rejected: ${response.reason || 'Food safety validation failed'}`);
        return;
      }
      
      setSuccess('Donation created successfully and assigned by AI!');
      setTimeout(() => {
        navigate('/donor/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to create donation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Donation</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Food Name</label>
            <input
              type="text"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Food Type</label>
            <input
              type="text"
              value={formData.food_type}
              onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
              placeholder="e.g., Cooked, Raw, Packaged"
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="text"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="e.g., 5 kg, 10 plates"
              required
            />
          </div>
          <div className="form-group">
            <label>Pickup Location</label>
            <select
              value={formData.pickup_address}
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              required
            >
              <option value="">Select pickup location</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Food Image URL (Required for AI Validation)</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/food.jpg"
              required
            />
            {formData.image_url && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={formData.image_url} 
                  alt="Food preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                  onError={() => setError('Failed to load image from URL')}
                />
              </div>
            )}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Enter a publicly accessible image URL (http:// or https://). AI will validate food safety.
            </small>
          </div>
          <div className="form-group">
            <label>Expiry Time</label>
            <input
              type="datetime-local"
              value={formData.expiry_time}
              onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing with AI...' : 'Create Donation'}
          </button>
        </form>
        <button onClick={() => navigate('/donor/dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Donate;

