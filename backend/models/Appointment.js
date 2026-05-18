const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // "09:00 AM"
    duration: { type: Number, default: 30 }, // minutes
    type: {
      type: String,
      enum: ['consultation', 'follow-up', 'emergency', 'checkup', 'procedure'],
      default: 'consultation',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    symptoms: [String],
    notes: { type: String },
    diagnosis: { type: String },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    aiSuggestions: {
      possibleConditions: [String],
      urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
      recommendedTests: [String],
      aiNotes: String,
    },
    followUpDate: { type: Date },
    consultationFee: { type: Number },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    reminderSent: { type: Boolean, default: false },
    videoCallLink: { type: String },
    isVirtual: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast queries
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
