const Donation = require('../models/Donation');
const axios = require('axios');

// AI Service URL - load from environment variable
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Call AI orchestration service
 * This is the integration point with the Python AI service
 */
const callAIService = async (donationData) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/ai/orchestrate/donation`,
      donationData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60 second timeout for AI processing
      }
    );
    return response.data;
  } catch (error) {
    console.error('AI Service error:', error.message);
    if (error.response) {
      throw new Error(`AI Service error: ${error.response.data.message || error.response.statusText}`);
    }
    throw new Error(`AI Service unavailable: ${error.message}`);
  }
};

const createDonation = async (req, res) => {
  try {
    const { food_name, food_type, quantity, pickup_address, expiry_time, image_url } = req.body;

    // Validate required fields (image_url is now required)
    if (!food_name || !food_type || !quantity || !pickup_address || !expiry_time || !image_url) {
      return res.status(400).json({ 
        error: 'Missing required fields. Image URL is required for AI validation.' 
      });
    }

    // Validate image URL format
    if (!image_url.startsWith('http://') && !image_url.startsWith('https://')) {
      return res.status(400).json({ 
        error: 'Image URL must start with http:// or https://' 
      });
    }

    // Prepare donation data for AI service
    const donationDataForAI = {
      donor_id: req.user.userId,
      food_name,
      food_type,
      quantity,
      pickup_address,
      expiry_time,
      image_url // Image URL
    };

    // Call AI orchestration service
    // IMPORTANT: Donation is NOT finalized until AI validates it
    const aiResult = await callAIService(donationDataForAI);

    // Check if food was rejected by AI
    if (aiResult.rejected) {
      return res.status(200).json({
        success: false,
        rejected: true,
        message: 'Donation rejected by AI safety validation',
        reason: aiResult.summary?.reason || 'Food safety validation failed',
        confidence: aiResult.summary?.confidence || 0.0,
        ai_result: aiResult
      });
    }

    // Check if AI service returned an error
    if (aiResult.error || !aiResult.success) {
      return res.status(500).json({
        success: false,
        error: true,
        message: 'AI service error during donation processing',
        ai_result: aiResult
      });
    }

    // AI validation passed - create donation in database
    // Include AI-assigned volunteer and NGO if available
    const donation = await Donation.create({
      donor_id: req.user.userId,
      food_name,
      food_type,
      quantity,
      pickup_address,
      expiry_time,
      // Store AI results in metadata (you may want to add an ai_metadata column)
      volunteer_id: aiResult.summary?.volunteer_id || null,
      ngo_id: aiResult.summary?.ngo_id || null
    });

    // Return success with AI results
    res.status(201).json({ 
      message: 'Donation created successfully and assigned by AI',
      donation,
      ai_result: {
        ticket_id: aiResult.summary?.ticket_id,
        volunteer_id: aiResult.summary?.volunteer_id,
        ngo_id: aiResult.summary?.ngo_id,
        priority_score: aiResult.summary?.priority_score,
        rewards: aiResult.results?.rewards
      }
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getDonorDonations = async (req, res) => {
  try {
    const donations = await Donation.findByDonorId(req.user.userId);
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.findAvailable();
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVolunteerDonations = async (req, res) => {
  try {
    const donations = await Donation.findByVolunteerId(req.user.userId);
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const assignDonation = async (req, res) => {
  try {
    const { donation_id } = req.body;

    if (!donation_id) {
      return res.status(400).json({ error: 'Donation ID required' });
    }

    const result = await Donation.assign(donation_id, req.user.userId);

    if (result.changes === 0) {
      return res.status(400).json({ error: 'Donation not available or already assigned' });
    }

    res.json({ message: 'Donation assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const completeDonation = async (req, res) => {
  try {
    const { donation_id } = req.body;

    if (!donation_id) {
      return res.status(400).json({ error: 'Donation ID required' });
    }

    const result = await Donation.complete(donation_id, req.user.userId);

    if (result.changes === 0) {
      return res.status(400).json({ error: 'Donation not found or not assigned to you' });
    }

    res.json({ message: 'Donation completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNearbyDonations = async (req, res) => {
  try {
    const address = req.query.address || '';
    const donations = await Donation.findNearby(address);
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.getAll();
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDonation,
  getDonorDonations,
  getAvailableDonations,
  getVolunteerDonations,
  assignDonation,
  completeDonation,
  getNearbyDonations,
  getAllDonations
};

