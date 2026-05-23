import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

// ── Load models ──────────────────────────────────────────────
const { default: User }    = await import('./src/models/User.js');
const { default: Session } = await import('./src/models/Session.js');

// ── Find Zeyad (learner) ──────────────────────────────────────
const learner = await User.findOne({ email: 'zeyadragab12@gmail.com' });
if (!learner) { console.error('❌ Learner zeyadragab12@gmail.com not found'); process.exit(1); }
console.log(`✅ Learner: ${learner.name} (${learner.email})`);

// ── Find James Harrison (teacher) – case-insensitive name search ──
const teacher = await User.findOne({ name: /james harrison/i });
if (!teacher) { console.error('❌ Teacher "James Harrison" not found in DB'); process.exit(1); }
console.log(`✅ Teacher: ${teacher.name} (${teacher.email})`);

// ── Session timing: starts 30 min from now, 60 min long ──────
const now = new Date();
const scheduledAt = new Date(now.getTime() + 30 * 60 * 1000);   // 30 min from now
const endTime     = new Date(scheduledAt.getTime() + 60 * 60 * 1000); // +60 min

// ── Create the session ────────────────────────────────────────
const session = await Session.create({
  teacher:       teacher._id,
  learner:       learner._id,
  skill:         'English Language',
  skillCategory: 'Languages',
  title:         'English Language Session — Zeyad & James Harrison',
  description:   'One-on-one English lesson. Focus on conversation and fluency.',
  scheduledAt,
  endTime,
  duration:      60,
  sessionType:   'one-on-one',
  isSkillExchange: false,
  tokensCharged: 0,
  status:        'scheduled',
});

console.log('\n🎉 Session created successfully!');
console.log('─────────────────────────────────────────');
console.log(`   ID        : ${session._id}`);
console.log(`   Teacher   : ${teacher.name}`);
console.log(`   Learner   : ${learner.name}`);
console.log(`   Skill     : ${session.skill}`);
console.log(`   Status    : ${session.status}`);
console.log(`   Starts at : ${scheduledAt.toLocaleString()}`);
console.log(`   Duration  : ${session.duration} min`);
console.log('─────────────────────────────────────────');
console.log(`\n🔗 View session: http://localhost:5173/sessions/${session._id}`);

await mongoose.disconnect();
process.exit(0);
