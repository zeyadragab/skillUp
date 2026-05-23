import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

const { default: User }    = await import('./src/models/User.js');
const { default: Session } = await import('./src/models/Session.js');

const learner = await User.findOne({ email: 'zeyadragab12@gmail.com' });
if (!learner) { console.error('❌ Learner not found'); process.exit(1); }

const teacher = await User.findOne({ name: /james harrison/i });
if (!teacher) { console.error('❌ Teacher James Harrison not found'); process.exit(1); }

console.log(`✅ Learner : ${learner.name} (${learner.email})`);
console.log(`✅ Teacher : ${teacher.name} (${teacher.email})`);

// Start RIGHT NOW, lasts 60 min
const now = new Date();
const endTime = new Date(now.getTime() + 60 * 60 * 1000);

// Remove any previous live sessions between them
await Session.deleteMany({
  teacher: teacher._id,
  learner: learner._id,
  status: 'scheduled'
});

const session = await Session.create({
  teacher:         teacher._id,
  learner:         learner._id,
  skill:           'English Language',
  skillCategory:   'Languages',
  title:           'English Language — Live Session',
  description:     'One-on-one English lesson with James Harrison.',
  scheduledAt:     now,
  endTime,
  duration:        60,
  sessionType:     'one-on-one',
  isSkillExchange: false,
  tokensCharged:   0,
  status:          'scheduled',
  actualStartTime: now,
});

console.log('\n🎉 Live session created!');
console.log('─────────────────────────────────────────────');
console.log(`   Session ID : ${session._id}`);
console.log(`   Teacher    : ${teacher.name}`);
console.log(`   Learner    : ${learner.name}`);
console.log(`   Started    : NOW`);
console.log(`   Ends at    : ${endTime.toLocaleTimeString()}`);
console.log('─────────────────────────────────────────────');
console.log('\n🔗 JOIN VIDEO SESSION:');
console.log(`   http://localhost:5173/sessions/${session._id}/video`);
console.log('\n📋 Sessions list:');
console.log(`   http://localhost:5173/sessions`);

await mongoose.disconnect();
process.exit(0);
