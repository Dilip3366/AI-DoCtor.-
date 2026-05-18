const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/doctors — List all doctors
router.get('/', protect, async (req, res) => {
  try {
    const filter = { role: 'doctor', isActive: true };
    if (req.query.specialization) filter.specialization = new RegExp(req.query.specialization, 'i');

    const doctors = await User.find(filter)
      .select('name email specialization experience consultationFee avatar availableSlots licenseNumber');

    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/doctors/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
