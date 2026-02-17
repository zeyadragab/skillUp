import mongoose from 'mongoose';
import User from '../models/User.js';
import Session from '../models/Session.js';
import SessionSummary from '../models/SessionSummary.js';
import Transaction from '../models/Transaction.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Fake realistic transcript generator
const generateFakeTranscript = (teacherName, learnerName, skill) => {
  const transcript = [
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Hello! Welcome to our ${skill} session today. I'm excited to work with you. How are you feeling about getting started?`,
      timestamp: 0,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3590000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Hi! I'm really excited to learn ${skill}. I've been wanting to improve my skills in this area for a while now.`,
      timestamp: 15,
      startTime: new Date(Date.now() - 3590000),
      endTime: new Date(Date.now() - 3580000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `That's great to hear! Let me start by explaining the fundamental concepts. ${skill} is all about understanding the core principles and applying them practically. What's your current experience level?`,
      timestamp: 30,
      startTime: new Date(Date.now() - 3580000),
      endTime: new Date(Date.now() - 3560000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `I'm a beginner. I've watched some tutorials online, but I haven't had much hands-on practice yet.`,
      timestamp: 50,
      startTime: new Date(Date.now() - 3560000),
      endTime: new Date(Date.now() - 3545000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Perfect! Let's start with the basics then. The first thing you need to understand is the foundational theory. Once you grasp that, the practical application becomes much easier. Let me show you an example.`,
      timestamp: 70,
      startTime: new Date(Date.now() - 3545000),
      endTime: new Date(Date.now() - 3520000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Okay, that makes sense. Could you explain how this concept applies to real-world scenarios?`,
      timestamp: 95,
      startTime: new Date(Date.now() - 3520000),
      endTime: new Date(Date.now() - 3505000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Absolutely! In real-world applications, you'll encounter situations where you need to apply these principles creatively. For example, when working on a project, you'll need to analyze the requirements first, then plan your approach, and finally implement the solution step by step.`,
      timestamp: 115,
      startTime: new Date(Date.now() - 3505000),
      endTime: new Date(Date.now() - 3470000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `I see. That's really helpful. What are some common mistakes beginners make that I should avoid?`,
      timestamp: 150,
      startTime: new Date(Date.now() - 3470000),
      endTime: new Date(Date.now() - 3455000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Great question! The most common mistakes are rushing through the fundamentals, not practicing enough, and being afraid to make errors. Remember, mistakes are part of the learning process. Let me demonstrate some best practices.`,
      timestamp: 170,
      startTime: new Date(Date.now() - 3455000),
      endTime: new Date(Date.now() - 3425000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Thank you! This is already so much clearer than the tutorials I watched. Could we go through a practical exercise together?`,
      timestamp: 200,
      startTime: new Date(Date.now() - 3425000),
      endTime: new Date(Date.now() - 3410000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Of course! Let's work through this exercise step by step. I'll guide you through the process, and you can ask questions whenever something isn't clear. Ready?`,
      timestamp: 220,
      startTime: new Date(Date.now() - 3410000),
      endTime: new Date(Date.now() - 3390000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Yes, I'm ready! Let's do this.`,
      timestamp: 240,
      startTime: new Date(Date.now() - 3390000),
      endTime: new Date(Date.now() - 3380000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Excellent! Now, start by identifying the main components you need. Take your time and think it through. What would be your first step?`,
      timestamp: 250,
      startTime: new Date(Date.now() - 3380000),
      endTime: new Date(Date.now() - 3360000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Hmm, I think I would start by analyzing the requirements and breaking down the problem into smaller parts. Is that correct?`,
      timestamp: 275,
      startTime: new Date(Date.now() - 3360000),
      endTime: new Date(Date.now() - 3340000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Perfect! You're absolutely right. Breaking down complex problems is a crucial skill. Now let's move to the next step and implement your first component.`,
      timestamp: 300,
      startTime: new Date(Date.now() - 3340000),
      endTime: new Date(Date.now() - 3315000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Okay, I'm working on it... Is this approach correct? I'm a bit unsure about this part.`,
      timestamp: 330,
      startTime: new Date(Date.now() - 3315000),
      endTime: new Date(Date.now() - 3295000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `You're on the right track! Let me give you a hint: think about how the different components interact with each other. Try to visualize the flow of information.`,
      timestamp: 355,
      startTime: new Date(Date.now() - 3295000),
      endTime: new Date(Date.now() - 3270000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `Oh, I think I understand now! So each component should have a specific responsibility, and they communicate through well-defined interfaces?`,
      timestamp: 385,
      startTime: new Date(Date.now() - 3270000),
      endTime: new Date(Date.now() - 3245000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Exactly! You've got it. That's one of the most important principles in ${skill}. Now let's apply this understanding to complete the exercise.`,
      timestamp: 415,
      startTime: new Date(Date.now() - 3245000),
      endTime: new Date(Date.now() - 3220000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `This is making so much more sense now. I feel like I've learned more in this session than I have in weeks of studying on my own!`,
      timestamp: 445,
      startTime: new Date(Date.now() - 3220000),
      endTime: new Date(Date.now() - 3195000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `I'm so glad to hear that! You're doing really well. Now, let me share some advanced tips and resources that will help you continue learning after our session.`,
      timestamp: 475,
      startTime: new Date(Date.now() - 3195000),
      endTime: new Date(Date.now() - 3165000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `That would be amazing! I really want to keep practicing and improving.`,
      timestamp: 505,
      startTime: new Date(Date.now() - 3165000),
      endTime: new Date(Date.now() - 3150000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `Here are some key resources I recommend: practice exercises, online communities, and project ideas. The most important thing is consistent practice. Try to dedicate at least 30 minutes daily to practicing what we covered today.`,
      timestamp: 525,
      startTime: new Date(Date.now() - 3150000),
      endTime: new Date(Date.now() - 3110000)
    },
    {
      speaker: 'learner',
      speakerName: learnerName,
      text: `I'll definitely do that. Thank you so much for this session! This has been incredibly valuable.`,
      timestamp: 565,
      startTime: new Date(Date.now() - 3110000),
      endTime: new Date(Date.now() - 3090000)
    },
    {
      speaker: 'teacher',
      speakerName: teacherName,
      text: `You're very welcome! You've been an excellent student. Keep practicing, don't be afraid to experiment, and feel free to book another session when you're ready to dive deeper. Good luck!`,
      timestamp: 590,
      startTime: new Date(Date.now() - 3090000),
      endTime: new Date(Date.now() - 3060000)
    }
  ];

  return transcript;
};

// Generate fake AI summary
const generateFakeSummary = (transcript, skill, teacherName, learnerName) => {
  const totalDuration = 600; // 10 minutes in seconds
  const teacherSpeakTime = 360; // 6 minutes
  const learnerSpeakTime = 200; // 3.3 minutes
  const silenceTime = 40; // 40 seconds

  return {
    transcript: transcript,
    summary: {
      overview: `This ${skill} session was highly productive and engaging. The teacher provided comprehensive instruction starting from fundamental concepts and progressing to practical applications. The learner demonstrated strong engagement, asking thoughtful questions and actively participating in hands-on exercises. The session successfully covered core principles, common pitfalls, and best practices, with the learner showing clear understanding and skill progression throughout.`,
      mainTopics: [
        {
          topic: 'Fundamental Concepts',
          description: `Introduction to core ${skill} principles and theoretical foundation`,
          timestamp: 30
        },
        {
          topic: 'Real-World Applications',
          description: 'Discussion of how to apply concepts in practical scenarios and project work',
          timestamp: 115
        },
        {
          topic: 'Common Mistakes and Best Practices',
          description: 'Overview of typical beginner errors and strategies to avoid them',
          timestamp: 170
        },
        {
          topic: 'Hands-On Exercise',
          description: 'Guided practical exercise with step-by-step problem-solving approach',
          timestamp: 240
        },
        {
          topic: 'Advanced Tips and Resources',
          description: 'Sharing of learning resources, practice materials, and next steps',
          timestamp: 475
        }
      ],
      keyLearningPoints: [
        `Understanding the fundamental principles and theoretical foundation of ${skill}`,
        'Breaking down complex problems into smaller, manageable components',
        'Importance of component responsibility and interface design',
        'Learning from mistakes as part of the educational process',
        'Consistent daily practice is essential for skill development',
        'Real-world application requires creative problem-solving and adaptability'
      ],
      actionItems: [
        {
          description: 'Practice fundamental concepts for at least 30 minutes daily',
          assignedTo: 'learner'
        },
        {
          description: 'Complete the exercise covered in the session independently',
          assignedTo: 'learner'
        },
        {
          description: 'Explore recommended resources and online communities',
          assignedTo: 'learner'
        },
        {
          description: 'Prepare advanced exercises for potential follow-up session',
          assignedTo: 'teacher'
        },
        {
          description: 'Share additional reference materials and project ideas',
          assignedTo: 'teacher'
        }
      ],
      highlights: [
        {
          description: 'Learner demonstrated excellent comprehension of component responsibility and interface design',
          timestamp: 385,
          importance: 'high'
        },
        {
          description: 'Breakthrough moment when learner connected theory to practical application',
          timestamp: 415,
          importance: 'high'
        },
        {
          description: 'Strong engagement with thoughtful questions throughout the session',
          timestamp: 150,
          importance: 'medium'
        },
        {
          description: 'Positive feedback and enthusiasm for continued learning',
          timestamp: 445,
          importance: 'medium'
        }
      ]
    },
    analysis: {
      engagement: {
        score: 9.2,
        teacherParticipation: 8.5,
        learnerParticipation: 9.0,
        interactionQuality: 9.5,
        notes: 'Excellent two-way communication with active participation from both parties. The learner asked insightful questions and the teacher provided clear, encouraging responses.'
      },
      teachingQuality: {
        score: 9.0,
        clarity: 9.5,
        pacing: 8.8,
        responsiveness: 9.2,
        feedback: 8.7,
        notes: 'The teacher demonstrated exceptional clarity in explanations, adapted well to the learner\'s pace, and provided constructive feedback throughout the session.'
      },
      learningProgress: {
        score: 8.8,
        questionsAsked: 8,
        conceptsGrasped: ['fundamental principles', 'problem decomposition', 'component design', 'best practices'],
        areasNeedingImprovement: ['advanced optimization techniques', 'complex scenario handling'],
        notes: 'Learner showed strong progress from beginner to intermediate understanding. Demonstrated ability to apply concepts and ask relevant questions.'
      },
      overallRating: 9.0,
      recommendations: [
        `Continue with daily practice exercises to solidify ${skill} fundamentals`,
        'Schedule a follow-up session in 2-3 weeks to cover advanced topics',
        'Join online communities to engage with other learners and share experiences',
        'Work on small personal projects to apply learned concepts',
        'Explore the recommended resources shared during the session',
        'Focus on building confidence through hands-on experimentation'
      ]
    },
    statistics: {
      totalDuration: totalDuration,
      teacherSpeakTime: teacherSpeakTime,
      learnerSpeakTime: learnerSpeakTime,
      silenceTime: silenceTime,
      wordsSpoken: {
        teacher: 520,
        learner: 280
      }
    },
    processingStatus: 'completed',
    generatedAt: new Date()
  };
};

// Main function to create test data
const createTestSession = async () => {
  try {
    await connectDB();

    console.log('\n🚀 Creating test session with 2 users and AI summary...\n');

    // 1. Create or find test users
    console.log('📝 Step 1: Creating test users...');

    const teacherData = {
      fullName: 'Sarah Johnson',
      email: 'teacher@test.com',
      password: 'password123',
      bio: 'Experienced web developer with 8 years of teaching experience',
      skills: [
        {
          name: 'React Development',
          category: 'Programming',
          experienceLevel: 'expert',
          hourlyRate: 15
        }
      ],
      country: 'United States',
      languages: ['English', 'Spanish'],
      isTeacher: true,
      isVerified: true,
      tokenBalance: 50,
      totalSessionsTaught: 25,
      averageRating: 4.7
    };

    const learnerData = {
      fullName: 'Michael Chen',
      email: 'learner@test.com',
      password: 'password123',
      bio: 'Aspiring web developer eager to learn React',
      country: 'Canada',
      languages: ['English', 'Mandarin'],
      isTeacher: false,
      isVerified: true,
      tokenBalance: 100,
      totalSessionsAttended: 5,
      averageRating: 4.9
    };

    // Check if users already exist
    let teacher = await User.findOne({ email: teacherData.email });
    let learner = await User.findOne({ email: learnerData.email });

    if (!teacher) {
      teacher = new User(teacherData);
      await teacher.save();
      console.log('✅ Created teacher:', teacher.fullName, `(ID: ${teacher._id})`);
    } else {
      console.log('✅ Found existing teacher:', teacher.fullName, `(ID: ${teacher._id})`);
    }

    if (!learner) {
      learner = new User(learnerData);
      await learner.save();
      console.log('✅ Created learner:', learner.fullName, `(ID: ${learner._id})`);
    } else {
      console.log('✅ Found existing learner:', learner.fullName, `(ID: ${learner._id})`);
    }

    // 2. Create a completed session
    console.log('\n📝 Step 2: Creating completed session...');

    const sessionData = {
      teacher: teacher._id,
      learner: learner._id,
      skill: 'React Development',
      skillCategory: 'Programming',
      title: 'Introduction to React Hooks and State Management',
      description: 'A comprehensive session covering React fundamentals, hooks, and best practices for state management.',
      scheduledAt: new Date(Date.now() - 7200000), // 2 hours ago
      duration: 60,
      sessionType: 'one-on-one',
      tokensCharged: 15,
      status: 'completed',
      videoRoomId: `session_${Date.now()}`,
      agoraChannel: `channel_${Date.now()}`,
      teacherJoinedAt: new Date(Date.now() - 7200000),
      learnerJoinedAt: new Date(Date.now() - 7195000),
      actualStartTime: new Date(Date.now() - 7200000),
      actualEndTime: new Date(Date.now() - 3600000), // 1 hour ago
      remindersSent: true
    };

    const session = new Session(sessionData);
    await session.save();
    console.log('✅ Created session:', session.title);
    console.log(`   Session ID: ${session._id}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Skill: ${session.skill}`);

    // 3. Create transaction for the session
    console.log('\n📝 Step 3: Creating transaction record...');

    const transactionData = {
      user: learner._id,
      type: 'session_payment',
      amount: -15,
      balanceAfter: learner.tokenBalance - 15,
      description: `Payment for session: ${session.title}`,
      relatedSession: session._id,
      status: 'completed'
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();
    console.log('✅ Created transaction:', transaction.description);

    // 4. Generate fake transcript and summary
    console.log('\n📝 Step 4: Generating fake AI summary...');

    const transcript = generateFakeTranscript(teacher.fullName, learner.fullName, session.skill);
    const summaryData = generateFakeSummary(transcript, session.skill, teacher.fullName, learner.fullName);

    summaryData.session = session._id;

    const sessionSummary = new SessionSummary(summaryData);
    await sessionSummary.save();
    console.log('✅ Created AI summary with transcript and analysis');
    console.log(`   Summary ID: ${sessionSummary._id}`);
    console.log(`   Overall Rating: ${sessionSummary.analysis.overallRating}/10`);
    console.log(`   Engagement Score: ${sessionSummary.analysis.engagement.score}/10`);
    console.log(`   Teaching Quality: ${sessionSummary.analysis.teachingQuality.score}/10`);
    console.log(`   Learning Progress: ${sessionSummary.analysis.learningProgress.score}/10`);

    // 5. Print access information
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 ACCESS INFORMATION:');
    console.log('\n🔐 Teacher Login:');
    console.log('   Email: teacher@test.com');
    console.log('   Password: password123');
    console.log(`   User ID: ${teacher._id}`);

    console.log('\n🔐 Learner Login:');
    console.log('   Email: learner@test.com');
    console.log('   Password: password123');
    console.log(`   User ID: ${learner._id}`);

    console.log('\n📖 Session Details:');
    console.log(`   Session ID: ${session._id}`);
    console.log(`   Title: ${session.title}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Scheduled: ${session.scheduledAt}`);

    console.log('\n🤖 AI Summary:');
    console.log(`   Summary ID: ${sessionSummary._id}`);
    console.log(`   View at: /sessions/${session._id}/summary`);

    console.log('\n🔗 Quick Links:');
    console.log(`   Session Details: http://localhost:5173/sessions/${session._id}`);
    console.log(`   Session Summary: http://localhost:5173/sessions/${session._id}/summary`);
    console.log(`   Sessions List: http://localhost:5173/sessions`);

    console.log('\n' + '='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating test data:', error);
    process.exit(1);
  }
};

// Run the script
createTestSession();
