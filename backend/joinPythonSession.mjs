import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './src/models/User.js';
import Session from './src/models/Session.js';
import { isAgoraConfigured, generateSessionCredentials } from './src/services/agoraService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI;

async function joinPythonSession() {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is undefined. Check your .env file.');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const LEARNER_EMAIL  = 'zeyadragab12@gmail.com';
    const TEACHER_EMAIL  = 'n9ne.eg1@gmail.com';

    const [learner, teacher] = await Promise.all([
      User.findOne({ email: LEARNER_EMAIL }),
      User.findOne({ email: TEACHER_EMAIL })
    ]);

    if (!learner) { console.error(`❌ Learner not found: ${LEARNER_EMAIL}`); return; }
    if (!teacher) { console.error(`❌ Teacher not found: ${TEACHER_EMAIL}`); return; }

    console.log(`✅ Learner : ${learner.name} (${learner._id})`);
    console.log(`✅ Teacher : ${teacher.name} (${teacher._id})`);

    const now = new Date();

    // Create the session as in-progress so both users can join immediately
    const session = await Session.create({
      teacher: teacher._id,
      learner: learner._id,
      skill: 'Python Programming',
      skillCategory: 'Programming & Tech',
      title: 'Python Programming Session',
      description: 'Live one-on-one Python mentoring session.',
      scheduledAt: now,
      duration: 60,
      sessionType: 'one-on-one',
      tokensCharged: 60,
      status: 'in-progress',
      actualStartTime: now
    });

    console.log(`\n✅ Session created: ${session._id}`);

    // Generate Agora credentials if configured
    const channelName = `session_${session._id}`;
    let agoraNote = '⚠️  Agora not configured — channel name set, tokens skipped.';

    if (isAgoraConfigured()) {
      const creds = generateSessionCredentials(session._id.toString(), learner._id.toString(), 'publisher');
      await Session.findByIdAndUpdate(session._id, {
        agoraChannel: creds.channelName,
        videoRoomId: creds.channelName,
        videoToken: creds.rtcToken
      });
      agoraNote = `✅ Agora channel & token generated`;
    } else {
      await Session.findByIdAndUpdate(session._id, {
        agoraChannel: channelName,
        videoRoomId: channelName
      });
    }

    console.log(agoraNote);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀  JOIN URL (open in your browser):');
    console.log(`    http://localhost:5173/sessions/${session._id}/video`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   Session ID : ${session._id}`);
    console.log(`   Channel    : ${channelName}`);
    console.log(`   Status     : in-progress`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

joinPythonSession();
