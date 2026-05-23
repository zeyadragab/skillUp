import mongoose from 'mongoose';
import User from '../models/User.js';
import Session from '../models/Session.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI.trim(), {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();

  // 1. Find the target user
  const targetEmail = 'doreyazayed4@gmail.com';
  const learner = await User.findOne({ email: targetEmail.toLowerCase() });

  if (!learner) {
    console.error(`❌ User not found: ${targetEmail}`);
    console.log('   Make sure this user is registered in the app first.');
    process.exit(1);
  }
  console.log(`✅ Found learner: ${learner.name} (ID: ${learner._id})`);

  // 2. Find or create a teacher user for this session
  let teacher = await User.findOne({ email: 'uiux.teacher@swaply.com' });

  if (!teacher) {
    teacher = await User.create({
      name: 'Alex Rivera',
      email: 'uiux.teacher@swaply.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPR5aPU4cIi', // hashed "password123"
      bio: 'Senior UI/UX Designer with 6+ years experience in product design and user research.',
      isTeacher: true,
      isVerified: true,
      isActive: true,
      role: 'teacher',
      tokens: 200,
      skillsToTeach: [
        { name: 'UI/UX Design', category: 'Design', level: 'expert', tokensPerHour: 30 }
      ],
      country: 'USA',
      languages: ['English'],
    });
    console.log(`✅ Created teacher: ${teacher.name} (ID: ${teacher._id})`);
  } else {
    console.log(`✅ Found existing teacher: ${teacher.name} (ID: ${teacher._id})`);
  }

  // 3. Create the session — scheduled for RIGHT NOW so it can be joined immediately
  const now = new Date();

  const session = await Session.create({
    teacher: teacher._id,
    learner: learner._id,
    skill: 'UI/UX Design',
    skillCategory: 'Design',
    title: 'Introduction to UI/UX Design Principles',
    description: 'A hands-on session covering core UI/UX fundamentals: user research, wireframing, prototyping, design systems, and usability testing. Perfect for beginners wanting to break into product design.',
    scheduledAt: now,
    duration: 60,
    sessionType: 'one-on-one',
    isSkillExchange: false,
    tokensCharged: 0,
    status: 'scheduled',
    videoRoomId: `uiux_session_${Date.now()}`,
    agoraChannel: `uiux_channel_${Date.now()}`,
  });

  console.log('\n' + '='.repeat(60));
  console.log('🎉 UI/UX SESSION CREATED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`\n📖 Session Details:`);
  console.log(`   Session ID  : ${session._id}`);
  console.log(`   Title       : ${session.title}`);
  console.log(`   Skill       : ${session.skill}`);
  console.log(`   Status      : ${session.status}`);
  console.log(`   Scheduled   : ${session.scheduledAt.toISOString()}`);
  console.log(`   Duration    : ${session.duration} minutes`);
  console.log(`   Agora Channel: ${session.agoraChannel}`);
  console.log(`\n👤 Learner (you):`);
  console.log(`   Name  : ${learner.name}`);
  console.log(`   Email : ${learner.email}`);
  console.log(`   ID    : ${learner._id}`);
  console.log(`\n👩‍🏫 Teacher:`);
  console.log(`   Name  : ${teacher.name}`);
  console.log(`   Email : ${teacher.email}`);
  console.log(`   ID    : ${teacher._id}`);
  console.log(`\n🔗 Join Session:`);
  console.log(`   http://localhost:5173/sessions/${session._id}`);
  console.log('='.repeat(60) + '\n');

  process.exit(0);
};

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
