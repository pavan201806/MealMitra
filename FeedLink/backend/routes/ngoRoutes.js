const express = require('express');
const router = express.Router();
const { getNearbyDonations } = require('../controllers/donationController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/nearby-donations', authenticate, authorize('ngo'), getNearbyDonations);

module.exports = router;

