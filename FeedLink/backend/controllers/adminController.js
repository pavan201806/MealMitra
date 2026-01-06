const User = require('../models/User');
const Donation = require('../models/Donation');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ users });
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

module.exports = { getAllUsers, getAllDonations };

