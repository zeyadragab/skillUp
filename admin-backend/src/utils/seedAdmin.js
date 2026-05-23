import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin exists
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });

    if (existingAdmin) {
      console.log('Super admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@swaply.com',
      password: 'password123',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Super Admin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password: password123');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
