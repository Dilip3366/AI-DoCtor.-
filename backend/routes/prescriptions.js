const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { checkDrugInteractions } = require('../ai-agents/prescriptionAgent');

// @POST /api/prescriptions
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const { appointmentId, patientId, diagnosis, medicines, labTests, advice, followUpAfter } = req.body;

    // AI Drug Interaction Check
    let aiInteractionWarnings = [];
    if (medicines && medicines.length > 1) {
      try {
        aiInteractionWarnings = await checkDrugInteractions(medicines.map(m => m.name));
      } catch (e) {
        console.log('Drug interaction check skipped');
      }
    }

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: req.user._id,
      diagnosis,
      medicines,
      labTests,
      advice,
      followUpAfter,
      aiInteractionWarnings,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Link to appointment
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        prescription: prescription._id,
        diagnosis,
        status: 'completed',
      });
    }

    const populated = await prescription.populate([
      { path: 'patient', select: 'name email bloodGroup allergies' },
      { path: 'doctor', select: 'name specialization licenseNumber' },
    ]);

    res.status(201).json({ success: true, prescription: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/prescriptions/patient/:patientId
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
