import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './src/models/User.js';
import Skill from './src/models/Skill.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI;

async function makePythonMentor() {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is undefined. Check your .env file.');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const TARGET_EMAIL = 'n9ne.eg1@gmail.com';

    // 1. Find the user
    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      console.error(`❌ No user found with email: ${TARGET_EMAIL}`);
      return;
    }
    console.log(`✅ Found user: ${user.name} (${user._id})`);

    // 2. Ensure Python Programming skill exists in Skill collection
    let pythonSkill = await Skill.findOne({ name: 'Python Programming' });
    if (!pythonSkill) {
      pythonSkill = await Skill.create({
        name: 'Python Programming',
        category: 'Programming & Tech',
        description: 'Learn Python from basics to advanced, including data analysis and web development.',
        icon: '🐍',
        difficulty: 'intermediate',
        tags: ['python', 'coding', 'backend', 'data science'],
        isActive: true
      });
      console.log('✅ Created Python Programming skill in Skill collection');
    } else {
      console.log('✅ Python Programming skill already exists in Skill collection');
    }

    // 3. Promote user to teacher/mentor role
    user.role = 'teacher';
    user.isTeacher = true;
    user.isActive = true;

    // 4. Add Python to skillsToTeach if not already present
    const alreadyTeaches = user.skillsToTeach.some(
      s => s.name.toLowerCase() === 'python programming'
    );
    if (!alreadyTeaches) {
      user.skillsToTeach.push({
        name: 'Python Programming',
        level: 'advanced',
        category: 'Programming & Tech',
        tokensPerHour: 60
      });
      console.log('✅ Added Python Programming to skillsToTeach');
    } else {
      console.log('ℹ️  Python Programming already in skillsToTeach');
    }

    await user.save();

    // 5. Bump Skill collection counters
    await Skill.findByIdAndUpdate(pythonSkill._id, { $inc: { totalTeachers: 1 } });

    console.log('\n🎉 Done! User summary:');
    console.log(`   Name        : ${user.name}`);
    console.log(`   Email       : ${user.email}`);
    console.log(`   Role        : ${user.role}`);
    console.log(`   isTeacher   : ${user.isTeacher}`);
    console.log(`   isActive    : ${user.isActive}`);
    console.log(`   Skills taught: ${user.skillsToTeach.map(s => s.name).join(', ')}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makePythonMentor();
