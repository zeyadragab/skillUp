import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import Session from '../src/models/Session.js';
import User from '../src/models/User.js';

const MENTOR_EMAIL = 'loaie.omar@gmail.com';
const LEARNER_EMAIL = 'zeyadragab12@gmail.com';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Promote mentor user to teacher
  const mentor = await User.findOne({ email: MENTOR_EMAIL });
  if (!mentor) {
    console.error(`❌ User ${MENTOR_EMAIL} not found in DB`);
    process.exit(1);
  }

  if (!mentor.isTeacher) {
    mentor.isTeacher = true;
    mentor.role = 'teacher';
    if (!mentor.skillsToTeach || mentor.skillsToTeach.length === 0) {
      mentor.skillsToTeach = [{
        name: 'General Mentorship',
        category: 'Other',
        level: 'expert',
        tokensPerHour: 10
      }];
    }
    await mentor.save();
    console.log(`✅ ${MENTOR_EMAIL} promoted to teacher`);
  } else {
    console.log(`ℹ️  ${MENTOR_EMAIL} is already a teacher`);
  }

  const learner = await User.findOne({ email: LEARNER_EMAIL });
  if (!learner) {
    console.error(`❌ User ${LEARNER_EMAIL} not found in DB`);
    process.exit(1);
  }

  const skill = mentor.skillsToTeach[0];
  const agoraChannel = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Session starts now (1 minute ago so "join" window is open)
  const scheduledAt = new Date(Date.now() - 60 * 1000);

  const session = await Session.create({
    teacher: mentor._id,
    learner: learner._id,
    skill: skill.name,
    skillCategory: skill.category,
    title: `Test Session: ${skill.name}`,
    description: 'Live test session created for immediate use',
    scheduledAt,
    duration: 60,
    sessionType: 'one-on-one',
    isSkillExchange: false,
    tokensCharged: 0,
    status: 'scheduled',
    agoraChannel
  });

  console.log('\n🎉 Session created!');
  console.log(`   ID:          ${session._id}`);
  console.log(`   Teacher:     ${mentor.name} (${mentor.email})`);
  console.log(`   Learner:     ${learner.name} (${learner.email})`);
  console.log(`   Skill:       ${skill.name}`);
  console.log(`   Channel:     ${agoraChannel}`);
  console.log(`   Scheduled:   ${scheduledAt.toLocaleString()} (joinable now)`);
  console.log('\n✨ Both users can join at: http://localhost:5173/sessions');

  process.exit(0);
}

run().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
