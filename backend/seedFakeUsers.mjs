import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const fakeUsers = [
  // Arab Users
  {
    name: 'Ahmed Youssef',
    email: 'ahmed.youssef@example.com',
    password: 'password123',
    country: 'Egypt',
    timeZone: 'Africa/Cairo',
    languages: ['Arabic', 'English'],
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Software engineer from Cairo, looking to teach Python and learn React.',
    isVerified: true,
    skillsToTeach: [{ name: 'Python', level: 'advanced', category: 'Programming', tokensPerHour: 50 }],
    skillsToLearn: [{ name: 'React', level: 'beginner', category: 'Programming', tokensPerHour: 50 }],
    tokens: 100,
    role: 'user'
  },
  {
    name: 'Fatima Al-Fassi',
    email: 'fatima.fassi@example.com',
    password: 'password123',
    country: 'Morocco',
    timeZone: 'Africa/Casablanca',
    languages: ['Arabic', 'French', 'English'],
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Graphic designer specializing in UI/UX and digital art.',
    isVerified: true,
    skillsToTeach: [{ name: 'UI/UX Design', level: 'advanced', category: 'Design', tokensPerHour: 40 }],
    skillsToLearn: [{ name: 'JavaScript', level: 'beginner', category: 'Programming', tokensPerHour: 50 }],
    tokens: 80,
    role: 'user'
  },
  {
    name: 'Tariq Al-Hashemi',
    email: 'tariq.hashemi@example.com',
    password: 'password123',
    country: 'UAE',
    timeZone: 'Asia/Dubai',
    languages: ['Arabic', 'English'],
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    bio: 'Business consultant based in Dubai. Expert in market research and business strategy.',
    isVerified: true,
    skillsToTeach: [{ name: 'Business Strategy', level: 'expert', category: 'Business', tokensPerHour: 70 }],
    skillsToLearn: [{ name: 'Digital Art', level: 'beginner', category: 'Design', tokensPerHour: 40 }],
    tokens: 110,
    role: 'teacher'
  },
  // USA Users
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'password123',
    country: 'USA',
    timeZone: 'America/New_York',
    languages: ['English'],
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    bio: 'Fitness coach based in NY, happy to help you get in shape.',
    isVerified: true,
    skillsToTeach: [{ name: 'Fitness Coaching', level: 'expert', category: 'Health', tokensPerHour: 60 }],
    skillsToLearn: [{ name: 'Spanish', level: 'beginner', category: 'Languages', tokensPerHour: 30 }],
    tokens: 150,
    role: 'user'
  },
  {
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    password: 'password123',
    country: 'USA',
    timeZone: 'America/Los_Angeles',
    languages: ['English', 'Mandarin'],
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Digital marketer and content creator. I can teach SEO and social media strategy.',
    isVerified: true,
    skillsToTeach: [{ name: 'SEO', level: 'advanced', category: 'Marketing', tokensPerHour: 45 }],
    skillsToLearn: [{ name: 'Photography', level: 'intermediate', category: 'Arts', tokensPerHour: 40 }],
    tokens: 120,
    role: 'user'
  },
  {
    name: 'Michael Davis',
    email: 'michael.davis@example.com',
    password: 'password123',
    country: 'USA',
    timeZone: 'America/Chicago',
    languages: ['English'],
    avatar: 'https://randomuser.me/api/portraits/men/90.jpg',
    bio: 'Video editor and motion graphics artist.',
    isVerified: true,
    skillsToTeach: [{ name: 'Video Editing', level: 'advanced', category: 'Media', tokensPerHour: 55 }],
    skillsToLearn: [{ name: 'Marketing', level: 'beginner', category: 'Marketing', tokensPerHour: 45 }],
    tokens: 95,
    role: 'teacher'
  },
  // Other Countries
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    password: 'password123',
    country: 'Spain',
    timeZone: 'Europe/Madrid',
    languages: ['Spanish', 'English'],
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
    bio: 'Professional chef offering Spanish cuisine cooking lessons.',
    isVerified: true,
    skillsToTeach: [{ name: 'Cooking', level: 'expert', category: 'Culinary', tokensPerHour: 55 }],
    skillsToLearn: [{ name: 'French', level: 'beginner', category: 'Languages', tokensPerHour: 35 }],
    tokens: 90,
    role: 'user'
  },
  {
    name: 'Kenji Sato',
    email: 'kenji.sato@example.com',
    password: 'password123',
    country: 'Japan',
    timeZone: 'Asia/Tokyo',
    languages: ['Japanese', 'English'],
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
    bio: 'Data scientist who loves teaching machine learning algorithms.',
    isVerified: true,
    skillsToTeach: [{ name: 'Machine Learning', level: 'expert', category: 'Programming', tokensPerHour: 80 }],
    skillsToLearn: [{ name: 'Public Speaking', level: 'intermediate', category: 'Business', tokensPerHour: 50 }],
    tokens: 200,
    role: 'teacher'
  },
  {
    name: 'David Johnson',
    email: 'david.j@example.com',
    password: 'password123',
    country: 'UK',
    timeZone: 'Europe/London',
    languages: ['English'],
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    bio: 'Musician and guitar teacher.',
    isVerified: true,
    skillsToTeach: [{ name: 'Guitar', level: 'intermediate', category: 'Music', tokensPerHour: 40 }],
    skillsToLearn: [{ name: 'Arabic', level: 'beginner', category: 'Languages', tokensPerHour: 35 }],
    tokens: 60,
    role: 'user'
  },
  {
    name: 'Elena Volkov',
    email: 'elena.volkov@example.com',
    password: 'password123',
    country: 'Russia',
    timeZone: 'Europe/Moscow',
    languages: ['Russian', 'English'],
    avatar: 'https://randomuser.me/api/portraits/women/59.jpg',
    bio: 'Professional chess player and coach.',
    isVerified: true,
    skillsToTeach: [{ name: 'Chess', level: 'advanced', category: 'Gaming', tokensPerHour: 45 }],
    skillsToLearn: [{ name: 'Guitar', level: 'beginner', category: 'Music', tokensPerHour: 40 }],
    tokens: 75,
    role: 'user'
  }
];

async function seed() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is undefined. Check your .env file.');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    let createdUsers = 0;
    for (const userData of fakeUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const newUser = new User(userData);
        await newUser.save();
        createdUsers++;
        console.log(`Created user: ${userData.name} (${userData.country})`);
      } else {
        console.log(`User ${userData.email} already exists. Skipping.`);
      }
    }
    
    console.log(`\nSuccessfully created ${createdUsers} fake users!`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
