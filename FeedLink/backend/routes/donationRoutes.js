const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonorDonations,
  getAvailableDonations,
  getVolunteerDonations,
  assignDonation,
  completeDonation,
  getAllDonations
} = require('../controllers/donationController');
const { authenticate, authorize } = require('../middleware/auth');

// Donor routes
router.post('/create', authenticate, authorize('donor'), createDonation);
router.get('/donor', authenticate, authorize('donor'), getDonorDonations);

// Volunteer routes
router.get('/available', authenticate, authorize('volunteer'), getAvailableDonations);
router.get('/volunteer', authenticate, authorize('volunteer'), getVolunteerDonations);
router.post('/assign', authenticate, authorize('volunteer'), assignDonation);
router.post('/complete', authenticate, authorize('volunteer'), completeDonation);

// Admin routes
router.get('/all', authenticate, authorize('admin'), getAllDonations);

module.exports = router;

