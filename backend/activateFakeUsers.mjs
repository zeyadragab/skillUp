import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI;

async function activateUsers() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is undefined. Check your .env file.');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Update all users to be active and set them as teachers
    // The frontend filters out inactive users and non-teachers in some views
    const result = await User.updateMany(
      {}, 
      { 
        $set: { 
          isActive: true,
          isTeacher: true // Making them teachers ensures they appear in the /api/teachers endpoints too
        } 
      }
    );

    console.log(`Successfully activated and set ${result.modifiedCount} users to isTeacher: true!`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

activateUsers();
