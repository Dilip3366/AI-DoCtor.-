const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'doctor', 'patient'], default: 'patient' },
    phone: { type: String },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Doctor-specific
    specialization: { type: String },
    licenseNumber: { type: String },
    experience: { type: Number },
    consultationFee: { type: Number },
    availableSlots: [
      {
        day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
        startTime: String,
        endTime: String,
      },
    ],
    // Patient-specific
    dateOfBirth: { type: Date },
    bloodGroup: { type: String },
    allergies: [String],
    medicalHistory: [
      {
        condition: String,
        since: Date,
        notes: String,
      },
    ],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    // Common
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
