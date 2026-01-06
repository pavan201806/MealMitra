/**
 * User Routes
 * Endpoints for AI service to fetch volunteers and NGOs
 */
const express = require('express');
const router = express.Router();
const { getVolunteers, getNGOs } = require('../controllers/userController');

// Public endpoints for AI service (in production, add API key auth)
router.get('/volunteers', getVolunteers);
router.get('/ngos', getNGOs);

module.exports = router;




