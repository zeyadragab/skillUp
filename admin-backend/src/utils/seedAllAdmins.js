import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Admin from '../models/Admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const accounts = [
  {
    name: 'Super Admin',
    email: 'superadmin@swaply.com',
    password: 'SuperAdmin@2024',
    role: 'super_admin',
  },
  {
    name: 'Moderator',
    email: 'moderator@swaply.com',
    password: 'Moderator@2024',
    role: 'moderator',
    permissions: {
      users: true,
      teachers: true,
      skills: true,
      sessions: true,
      transactions: false,
      reports: true,
      reviews: true,
      notifications: true,
      settings: false,
      analytics: true,
    },
  },
  {
    name: 'Support Agent',
    email: 'support@swaply.com',
    password: 'Support@2024',
    role: 'support',
    permissions: {
      users: true,
      teachers: false,
      skills: false,
      sessions: true,
      transactions: false,
      reports: true,
      reviews: false,
      notifications: false,
      settings: false,
      analytics: false,
    },
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    for (const account of accounts) {
      const existing = await Admin.findOne({ email: account.email });
      if (existing) {
        console.log(`⚠️  Already exists: ${account.email} (${account.role})`);
        continue;
      }
      await Admin.create(account);
      console.log(`✅ Created [${account.role}]`);
      console.log(`   Email   : ${account.email}`);
      console.log(`   Password: ${account.password}\n`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seed();
