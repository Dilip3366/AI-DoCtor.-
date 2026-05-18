const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { analyzeSymptoms } = require('../ai-agents/diagnosisAgent');

// @GET /api/appointments — Get all (admin) or own appointments
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;

    // Filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar bloodGroup')
      .populate('doctor', 'name email specialization avatar consultationFee')
      .populate('prescription')
      .sort({ date: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/appointments — Book appointment
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type, symptoms, notes, isVirtual } = req.body;

    // Check for slot conflict
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $nin: ['cancelled', 'no-show'] },
    });
    if (conflict) return res.status(400).json({ success: false, message: 'This time slot is already booked.' });

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // AI Symptom Analysis
    let aiSuggestions = {};
    if (symptoms && symptoms.length > 0) {
      try {
        aiSuggestions = await analyzeSymptoms(symptoms, req.user);
      } catch (aiErr) {
        console.log('AI analysis skipped:', aiErr.message);
      }
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'consultation',
      symptoms,
      notes,
      isVirtual: isVirtual || false,
      consultationFee: doctor.consultationFee,
      aiSuggestions,
    });

    const populated = await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email specialization' },
    ]);

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(`doctor_${doctorId}`).emit('new_appointment', {
      message: `New appointment from ${req.user.name}`,
      appointment: populated,
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully!', appointment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/appointments/:id/status — Update status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, diagnosis, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, ...(diagnosis && { diagnosis }), ...(notes && { notes }) },
      { new: true }
    ).populate('patient', 'name email').populate('doctor', 'name specialization');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const io = req.app.get('io');
    io.to(`patient_${appointment.patient._id}`).emit('appointment_update', {
      message: `Your appointment status updated to: ${status}`,
      appointment,
    });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/appointments/available-slots/:doctorId
router.get('/available-slots/:doctorId', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const bookedSlots = await Appointment.find({
      doctor: req.params.doctorId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
      status: { $nin: ['cancelled', 'no-show'] },
    }).select('timeSlot');

    const allSlots = [
      '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
      '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
      '04:00 PM','04:30 PM','05:00 PM',
    ];

    const booked = bookedSlots.map((a) => a.timeSlot);
    const available = allSlots.filter((s) => !booked.includes(s));

    res.json({ success: true, available, booked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/appointments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    if (
      req.user.role !== 'admin' &&
      appointment.patient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
