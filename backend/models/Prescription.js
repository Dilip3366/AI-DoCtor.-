const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String, required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true }, // "Twice daily"
        duration: { type: String, required: true },  // "7 days"
        instructions: { type: String },              // "Take after food"
        quantity: { type: Number },
      },
    ],
    labTests: [
      {
        name: String,
        instructions: String,
        urgent: { type: Boolean, default: false },
      },
    ],
    advice: { type: String },
    followUpAfter: { type: String }, // "1 week", "1 month"
    aiInteractionWarnings: [String],
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
