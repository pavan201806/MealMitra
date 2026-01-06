const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { normalizeLocation, validateLocation } = require('../utils/locationNormalizer');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, latitude, longitude, city } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['donor', 'volunteer', 'ngo', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Normalize location data (required for all roles)
    let normalizedLocation;
    try {
      normalizedLocation = normalizeLocation({ latitude, longitude, city });
      validateLocation(normalizedLocation);
    } catch (locationError) {
      return res.status(400).json({ 
        error: `Location error: ${locationError.message}` 
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      phone, 
      address, 
      latitude: normalizedLocation.latitude, 
      longitude: normalizedLocation.longitude, 
      city: normalizedLocation.city 
    });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, latitude, longitude, city } = req.body;
    const userId = req.user.userId;

    // If location data is provided, normalize and validate it
    if (latitude !== undefined || longitude !== undefined || city !== undefined) {
      let normalizedLocation;
      try {
        normalizedLocation = normalizeLocation({ latitude, longitude, city });
        validateLocation(normalizedLocation);
      } catch (locationError) {
        return res.status(400).json({ 
          error: `Location error: ${locationError.message}` 
        });
      }

      // Update with normalized location data
      await User.update(userId, {
        name,
        phone,
        address,
        latitude: normalizedLocation.latitude,
        longitude: normalizedLocation.longitude,
        city: normalizedLocation.city
      });
    } else {
      // Update without location data
      await User.update(userId, { name, phone, address });
    }

    const updatedUser = await User.findById(userId);
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };

