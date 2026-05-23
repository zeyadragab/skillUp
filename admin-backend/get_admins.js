import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Admin from './src/models/Admin.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    const admins = await Admin.find({});
    console.log('Admins:', admins);
    // Let's create an admin if 0 admins.
    if (admins.length === 0) {
      console.log('No admins found, creating one...');
      const admin = await Admin.create({
        name: 'Super Admin',
        email: 'admin@swaply.com',
        password: 'password123',
        role: 'super_admin'
      });
      console.log('Created Admin:', admin);
    } else {
        // override password for the first admin to 'password123'
        const admin = admins[0];
        console.log('Resetting password for admin:', admin.email);
        admin.password = 'password123';
        await admin.save();
        console.log('Password reset to password123');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
