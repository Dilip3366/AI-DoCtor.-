require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@clinic.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9999999999',
    });

    // Create Doctors
    const doctors = await User.insertMany([
      {
        name: 'Dr. Priya Sharma',
        email: 'doctor@clinic.com',
        password: 'Doctor@123',
        role: 'doctor',
        specialization: 'General Physician',
        licenseNumber: 'MH-12345',
        experience: 10,
        consultationFee: 500,
        phone: '9876543210',
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '13:00' },
        ],
      },
      {
        name: 'Dr. Rahul Verma',
        email: 'rahul@clinic.com',
        password: 'Doctor@123',
        role: 'doctor',
        specialization: 'Cardiologist',
        licenseNumber: 'DL-67890',
        experience: 15,
        consultationFee: 1200,
        phone: '9876543211',
        availableSlots: [
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
        ],
      },
      {
        name: 'Dr. Anjali Patel',
        email: 'anjali@clinic.com',
        password: 'Doctor@123',
        role: 'doctor',
        specialization: 'Pediatrician',
        licenseNumber: 'GJ-11111',
        experience: 8,
        consultationFee: 700,
        phone: '9876543212',
      },
    ]);

    // Create Patient
    const patient = await User.create({
      name: 'Ravi Kumar',
      email: 'patient@clinic.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '8888888888',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1990-05-15'),
      allergies: ['Penicillin'],
    });

    console.log('✅ Users seeded');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('  Admin:   admin@clinic.com   / Admin@123');
    console.log('  Doctor:  doctor@clinic.com  / Doctor@123');
    console.log('  Patient: patient@clinic.com / Patient@123');

    mongoose.disconnect();
    console.log('\n✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedData();
