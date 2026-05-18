const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/patients — Admin/Doctor only
router.get('/', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', isActive: true })
      .select('name email phone avatar bloodGroup dateOfBirth createdAt');
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/patients/:id/history
router.get('/:id/history', protect, async (req, res) => {
  try {
    const patientId = req.params.id;

    // Only allow patient to see own history, or doctor/admin to see any
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name specialization avatar')
      .populate('prescription')
      .sort({ date: -1 });

    const patient = await User.findById(patientId).select('-password');

    res.json({ success: true, patient, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/patients/:id/medical-history
router.put('/:id/medical-history', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { condition, notes } = req.body;
    const patient = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { medicalHistory: { condition, notes, since: new Date() } } },
      { new: true }
    );
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
