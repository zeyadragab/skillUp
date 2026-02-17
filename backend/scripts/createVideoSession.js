import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Session from '../src/models/Session.js';
import User from '../src/models/User.js';

dotenv.config();

async function createVideoSession() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const userEmail = 'zeyadragab12@gmail.com';
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      console.log('Available users:');
      const users = await User.find({}).select('name email isTeacher');
      users.forEach(u => console.log(`  - ${u.name} (${u.email}) - Teacher: ${u.isTeacher}`));
      process.exit(1);
    }

    // Find another user to be the other participant
    let otherUser;
    if (user.isTeacher) {
      // If user is teacher, find a learner
      otherUser = await User.findOne({
        _id: { $ne: user._id },
        isTeacher: false
      });
    } else {
      // If user is learner, find a teacher with skills
      otherUser = await User.findOne({
        _id: { $ne: user._id },
        isTeacher: true,
        'skillsToTeach.0': { $exists: true }
      });
    }

    if (!otherUser) {
      console.log('❌ No other user found to create session with');
      process.exit(1);
    }

    // Determine teacher and learner
    const teacher = user.isTeacher ? user : otherUser;
    const learner = user.isTeacher ? otherUser : user;

    // Get skill from teacher
    const teachingSkill = teacher.skillsToTeach?.[0];
    if (!teachingSkill) {
      console.log('❌ Teacher has no skills to teach');
      process.exit(1);
    }

    // Create a SCHEDULED session for live video (starting in 5 minutes)
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    // Generate Agora channel name
    const agoraChannel = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const sessionData = {
      teacher: teacher._id,
      learner: learner._id,
      skill: teachingSkill.name,
      skillCategory: teachingSkill.category,
      title: `Live Video Session: ${teachingSkill.name}`,
      description: 'Scheduled session ready for live video call',
      scheduledAt: scheduledTime,
      duration: 60,
      sessionType: 'one-on-one',
      isSkillExchange: false,
      tokensCharged: 0, // Free session
      status: 'scheduled',
      agoraChannel: agoraChannel
    };

    const session = await Session.create(sessionData);

    console.log('\n🎉 Live Video Session created successfully!');
    console.log('📋 Session Details:');
    console.log(`   ID: ${session._id}`);
    console.log(`   Teacher: ${teacher.name} (${teacher.email})`);
    console.log(`   Learner: ${learner.name} (${learner.email})`);
    console.log(`   Skill: ${teachingSkill.name}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Scheduled At: ${scheduledTime.toLocaleString()}`);
    console.log(`   Duration: ${session.duration} minutes`);
    console.log(`   Agora Channel: ${agoraChannel}`);
    console.log('\n✨ To Join Video Session:');
    console.log(`1. Login as: ${user.email}`);
    console.log('2. Go to Sessions page: http://localhost:5173/sessions');
    console.log('3. Find the scheduled session and click "Join"');
    console.log(`4. Or use API: POST /api/sessions/${session._id}/join`);
    console.log('5. The system will generate Agora RTC/RTM tokens for video call');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createVideoSession();
