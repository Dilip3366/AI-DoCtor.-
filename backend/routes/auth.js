const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['patient', 'doctor', 'admin']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { name, email, password, role, phone, specialization, licenseNumber } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ success: false, message: 'Email already registered' });

      const user = await User.create({ name, email, password, role, phone, specialization, licenseNumber });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ success: false, message: 'Invalid email or password' });

      if (!user.isActive)
        return res.status(401).json({ success: false, message: 'Account is deactivated' });

      res.json({
        success: true,
        message: 'Login successful',
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, specialization: user.specialization },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/auth/update-profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'dateOfBirth', 'bloodGroup', 'allergies', 'emergencyContact', 'availableSlots', 'consultationFee', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
