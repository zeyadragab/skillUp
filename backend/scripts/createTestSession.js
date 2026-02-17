import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Session from '../src/models/Session.js';
import User from '../src/models/User.js';

dotenv.config();

async function createTestSession() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
    console.log('✅ Connected to MongoDB');

    // Find any learner and teacher
    const teacher = await User.findOne({ isTeacher: true, 'skillsToTeach.0': { $exists: true } });
    const learner = await User.findOne({ isTeacher: false });

    if (!teacher) {
      console.log('❌ No teacher found');
      process.exit(1);
    }

    if (!learner) {
      console.log('❌ No learner found');
      process.exit(1);
    }

    // Create a COMPLETED session (so we can test AI Summary feature)
    const now = new Date();
    const scheduledTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Started 2 hours ago
    const endTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); // Ended 1 hour ago

    const teachingSkill = teacher.skillsToTeach[0];

    const sessionData = {
      teacher: teacher._id,
      learner: learner._id,
      skill: teachingSkill.name,
      skillCategory: teachingSkill.category,
      title: `Test Session: ${teachingSkill.name}`,
      description: 'Test completed session for AI Summary feature',
      scheduledAt: scheduledTime,
      duration: 60,
      sessionType: 'one-on-one',
      isSkillExchange: false,
      tokensCharged: 0, // Free test session
      status: 'completed', // Marked as completed
      actualStartTime: startTime,
      actualEndTime: endTime
    };

    const session = await Session.create(sessionData);

    console.log('\n🎉 Test COMPLETED session created successfully!');
    console.log('📋 Session Details:');
    console.log(`   ID: ${session._id}`);
    console.log(`   Teacher: ${teacher.name} (${teacher.email})`);
    console.log(`   Learner: ${learner.name} (${learner.email})`);
    console.log(`   Skill: ${teachingSkill.name}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Scheduled At: ${scheduledTime.toLocaleString()}`);
    console.log(`   Duration: ${session.duration} minutes`);
    console.log('\n✨ Test AI Summary Feature:');
    console.log(`1. Login as: ${learner.email} (or ${teacher.email})`);
    console.log('2. Go to Sessions page: http://localhost:5173/sessions');
    console.log('3. Find the completed session and click "Generate AI Summary"');
    console.log('4. Watch the AI analyze the session and create a professional summary!');
    console.log(`5. Or directly visit summary page: http://localhost:5173/sessions/${session._id}/summary`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestSession();