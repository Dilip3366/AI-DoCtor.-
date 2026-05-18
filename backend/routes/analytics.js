const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/analytics/dashboard — Admin dashboard stats
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, todayAppointments, statusBreakdown] =
      await Promise.all([
        User.countDocuments({ role: 'patient', isActive: true }),
        User.countDocuments({ role: 'doctor', isActive: true }),
        Appointment.countDocuments(),
        Appointment.countDocuments({
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        }),
        Appointment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          count: { $sum: 1 },
          revenue: { $sum: '$consultationFee' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top doctors by appointments
    const topDoctors = await Appointment.aggregate([
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorInfo',
        },
      },
      { $unwind: '$doctorInfo' },
      { $project: { name: '$doctorInfo.name', specialization: '$doctorInfo.specialization', count: 1 } },
    ]);

    res.json({
      success: true,
      stats: { totalPatients, totalDoctors, totalAppointments, todayAppointments },
      statusBreakdown,
      monthlyTrend,
      topDoctors,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/analytics/doctor — Doctor's own stats
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctorId = req.user._id;

    const [total, completed, pending, todayCount] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      Appointment.countDocuments({ doctor: doctorId, status: { $in: ['scheduled', 'confirmed'] } }),
      Appointment.countDocuments({
        doctor: doctorId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ]);

    const revenue = await Appointment.aggregate([
      { $match: { doctor: doctorId, status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$consultationFee' } } },
    ]);

    res.json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        todayCount,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
