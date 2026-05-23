import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

const { default: User }           = await import('./src/models/User.js');
const { default: Session }        = await import('./src/models/Session.js');
const { default: SessionSummary } = await import('./src/models/SessionSummary.js');
const { generateSessionSummary }  = await import('./src/services/aiSummaryService.js');

// ── Find users ───────────────────────────────────────────────
const learner = await User.findOne({ email: 'zeyadragab12@gmail.com' });
if (!learner) { console.error('❌ Learner not found'); process.exit(1); }

const teacher = await User.findOne({ name: /james harrison/i });
if (!teacher) { console.error('❌ Teacher James Harrison not found'); process.exit(1); }

console.log(`✅ Learner : ${learner.name}`);
console.log(`✅ Teacher : ${teacher.name}`);

// ── Timing: session ended 30 min ago, lasted 60 min ─────────
const now            = new Date();
const actualEndTime  = new Date(now.getTime() - 30 * 60 * 1000);   // ended 30 min ago
const actualStartTime = new Date(actualEndTime.getTime() - 60 * 60 * 1000); // 60 min duration
const scheduledAt    = actualStartTime;

// ── Delete old test session if exists ───────────────────────
await Session.deleteMany({
  teacher: teacher._id,
  learner:  learner._id,
  skill:    'English Language',
  status:   { $in: ['scheduled', 'completed'] }
});

// ── Create COMPLETED session ──────────────────────────────────
const session = await Session.create({
  teacher:          teacher._id,
  learner:          learner._id,
  skill:            'English Language',
  skillCategory:    'Languages',
  title:            'English Language Session — Zeyad & James Harrison',
  description:      'One-on-one English lesson. Focus on conversation and fluency.',
  scheduledAt,
  duration:         60,
  endTime:          actualEndTime,
  sessionType:      'one-on-one',
  isSkillExchange:  false,
  tokensCharged:    0,
  status:           'completed',
  actualStartTime,
  actualEndTime,
});

console.log(`\n✅ Completed session created: ${session._id}`);

// ── Build a realistic English-lesson transcript ───────────────
const transcript = [
  { speaker: 'teacher', speakerName: teacher.name, text: "Good morning! How are you feeling today?", timestamp: 0 },
  { speaker: 'learner', speakerName: learner.name, text: "I'm good, thank you. A little nervous about speaking.", timestamp: 12 },
  { speaker: 'teacher', speakerName: teacher.name, text: "That's completely normal. Let's start with some warm-up conversation. Can you tell me about your week?", timestamp: 20 },
  { speaker: 'learner', speakerName: learner.name, text: "Yes, I had a busy week. I was working on a project and I also read an English article about technology.", timestamp: 35 },
  { speaker: 'teacher', speakerName: teacher.name, text: "Excellent! I noticed you used 'I was working' – that's the past continuous tense, well done. Let's explore that tense a bit more.", timestamp: 60 },
  { speaker: 'learner', speakerName: learner.name, text: "Okay. I sometimes confuse it with simple past.", timestamp: 90 },
  { speaker: 'teacher', speakerName: teacher.name, text: "Great observation. Simple past describes a finished action. Past continuous describes an ongoing action at a specific time. For example: 'I was reading when the phone rang.'", timestamp: 105 },
  { speaker: 'learner', speakerName: learner.name, text: "Ah, so the phone ringing interrupted the reading?", timestamp: 140 },
  { speaker: 'teacher', speakerName: teacher.name, text: "Exactly! Perfect understanding. Now let's practice pronunciation. Repeat after me: 'Throughout'.", timestamp: 155 },
  { speaker: 'learner', speakerName: learner.name, text: "Throughout.", timestamp: 175 },
  { speaker: 'teacher', speakerName: teacher.name, text: "Very good. Now let's work on word stress. In English the stress often falls on the second syllable in longer words. Let's do some vocabulary from your article.", timestamp: 185 },
  { speaker: 'learner', speakerName: learner.name, text: "I learned words like 'artificial intelligence', 'algorithm', and 'innovation'.", timestamp: 220 },
  { speaker: 'teacher', speakerName: teacher.name, text: "Perfect tech vocabulary! Let's use them in sentences to reinforce retention.", timestamp: 245 },
  { speaker: 'learner', speakerName: learner.name, text: "Artificial intelligence is changing how we work. Algorithms help computers make decisions.", timestamp: 265 },
  { speaker: 'teacher', speakerName: teacher.name, text: "Excellent sentences! For homework, I want you to write a short paragraph — about 100 words — using these three words. Also review conditional sentences for next time.", timestamp: 295 },
  { speaker: 'learner', speakerName: learner.name, text: "Sure, I will. Can you recommend any podcast for listening practice?", timestamp: 330 },
  { speaker: 'teacher', speakerName: teacher.name, text: "Absolutely — try 'BBC Learning English' or '6 Minute English'. They're perfect for your level.", timestamp: 345 },
  { speaker: 'learner', speakerName: learner.name, text: "Great, thank you so much for the session!", timestamp: 370 },
  { speaker: 'teacher', speakerName: teacher.name, text: "You're very welcome. Your speaking is improving every session. See you next week!", timestamp: 382 },
];

// ── Generate AI summary ───────────────────────────────────────
console.log('\n🤖 Generating AI summary...');

let summaryRecord;
try {
  const aiResult = await generateSessionSummary({
    transcript,
    sessionInfo: {
      skill:       session.skill,
      duration:    session.duration,
      teacherName: teacher.name,
      learnerName: learner.name,
    },
  });

  summaryRecord = await SessionSummary.create({
    session:          session._id,
    transcript,
    summary:          aiResult.summary,
    analysis:         aiResult.analysis,
    statistics:       aiResult.statistics,
    processingStatus: 'completed',
    generatedAt:      new Date(),
  });

  console.log('✅ AI summary generated and saved!');
} catch (err) {
  console.warn(`⚠️  AI generation failed (${err.message}). Creating fallback summary...`);

  // Fallback: create a basic structured summary manually
  summaryRecord = await SessionSummary.create({
    session:   session._id,
    transcript,
    summary: {
      overview: 'A 60-minute one-on-one English lesson focused on past continuous tense, pronunciation, and technology vocabulary.',
      mainTopics: [
        { topic: 'Past Continuous Tense', description: 'Difference between simple past and past continuous, with examples.' },
        { topic: 'Pronunciation Practice', description: 'Word stress and difficult words like "throughout".' },
        { topic: 'Technology Vocabulary', description: 'Words: artificial intelligence, algorithm, innovation — used in sentences.' },
      ],
      keyLearningPoints: [
        'Past continuous describes an ongoing action interrupted by a simple past event.',
        'Word stress often falls on the second syllable in longer English words.',
        'Technology vocabulary can be learned effectively through sentence construction.',
      ],
      actionItems: [
        { description: 'Write a 100-word paragraph using: artificial intelligence, algorithm, innovation.', assignedTo: 'learner' },
        { description: 'Review conditional sentences for the next session.', assignedTo: 'learner' },
        { description: 'Prepare conditional sentence exercises.', assignedTo: 'teacher' },
      ],
      highlights: [
        { moment: 'Learner correctly identified that the phone ringing interrupted the reading action.' },
        { moment: 'Strong use of technology vocabulary in full sentences.' },
      ],
    },
    analysis: {
      overallProgress: 'Good',
      strengths: ['Vocabulary acquisition', 'Sentence construction', 'Active participation'],
      areasForImprovement: ['Tense consistency', 'Listening practice'],
      recommendedNextSteps: ['Practice conditional sentences', 'Listen to BBC Learning English daily'],
    },
    statistics: {
      totalWords:       transcript.reduce((n, e) => n + e.text.split(' ').length, 0),
      teacherTalkTime:  55,
      learnerTalkTime:  45,
      topicsCount:      3,
    },
    processingStatus: 'completed',
    generatedAt:      new Date(),
  });

  console.log('✅ Fallback summary saved.');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 Session + AI Summary ready!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`   Session ID  : ${session._id}`);
console.log(`   Summary ID  : ${summaryRecord._id}`);
console.log(`   Teacher     : ${teacher.name}`);
console.log(`   Learner     : ${learner.name}`);
console.log(`   Skill       : English Language`);
console.log(`   Status      : completed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n🔗 Learner summary page:');
console.log(`   http://localhost:5173/sessions/${session._id}/summary`);
console.log('\n🔗 Teacher debrief page:');
console.log(`   http://localhost:5173/sessions/${session._id}/mentor-debrief`);
console.log('\n📋 Login as zeyadragab12@gmail.com → Sessions → view summary');

await mongoose.disconnect();
process.exit(0);
