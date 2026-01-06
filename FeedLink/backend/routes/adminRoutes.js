const express = require('express');
const router = express.Router();
const { getAllUsers, getAllDonations } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.get('/donations', authenticate, authorize('admin'), getAllDonations);

module.exports = router;

