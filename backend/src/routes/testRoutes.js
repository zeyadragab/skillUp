import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import SessionSummary from '../models/SessionSummary.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();
// Test routes for creating demo sessions with fake data

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
const generateFakeSummary = (transcript, skill) => {
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

// POST /api/test/create-session - Create test session with fake data
router.post('/create-session', async (req, res) => {
  try {
    console.log('Creating test session with 2 users and AI summary...');

    // 1. Get the actual user from the request or use default
    const userEmail = req.body.email || 'zeyadragab12@gmail.com';

    // Find the actual user from database
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with email ${userEmail} not found. Please login or signup first.`,
        suggestion: 'Go to http://localhost:5173/signup to create an account first'
      });
    }

    // Create a test teacher to join session with
    const teacherData = {
      name: 'Sarah Johnson (AI Teacher)',
      email: 'ai.teacher@skillswap.com',
      password: 'password123',
      bio: 'Experienced web developer with 8 years of teaching experience',
      skills: [
        {
          name: 'React Development',
          category: 'Programming',
          level: 'expert',
          tokensPerHour: 15
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

    // Check if AI teacher exists
    let teacher = await User.findOne({ email: teacherData.email });

    if (!teacher) {
      teacher = new User(teacherData);
      await teacher.save();
      console.log('✅ Created AI teacher');
    } else {
      // Update existing teacher with test data
      teacher.tokenBalance = teacherData.tokenBalance;
      await teacher.save();
      console.log('✅ Updated AI teacher');
    }

    // Update user to have tokens and be verified
    if (!user.tokenBalance || user.tokenBalance < 100) {
      user.tokenBalance = 100;
    }
    user.isVerified = true;
    await user.save();
    console.log(`✅ Updated user ${user.name} - Tokens: ${user.tokenBalance}, Verified: ${user.isVerified}`);

    // 2. Create a session scheduled for RIGHT NOW (joinable immediately)
    const sessionData = {
      teacher: teacher._id,
      learner: user._id,
      skill: 'React Development',
      skillCategory: 'Programming',
      title: 'Live React Hooks Session - Join Now!',
      description: 'A live session where you can join right now! We will cover React fundamentals, hooks, and best practices for state management.',
      scheduledAt: new Date(), // RIGHT NOW - can join immediately!
      duration: 60,
      sessionType: 'one-on-one',
      tokensCharged: 15,
      status: 'scheduled', // scheduled status allows joining
      videoRoomId: `session_${Date.now()}`,
      agoraChannel: `channel_${Date.now()}`,
      remindersSent: true
    };

    const session = new Session(sessionData);
    await session.save();

    // Also create a COMPLETED session with AI summary for viewing
    const completedSessionData = {
      teacher: teacher._id,
      learner: user._id,
      skill: 'React Development',
      skillCategory: 'Programming',
      title: 'Introduction to React Hooks and State Management (Completed)',
      description: 'A comprehensive session covering React fundamentals, hooks, and best practices for state management.',
      scheduledAt: new Date(Date.now() - 7200000), // 2 hours ago
      duration: 60,
      sessionType: 'one-on-one',
      tokensCharged: 15,
      status: 'completed',
      videoRoomId: `session_completed_${Date.now()}`,
      agoraChannel: `channel_completed_${Date.now()}`,
      teacherJoinedAt: new Date(Date.now() - 7200000),
      learnerJoinedAt: new Date(Date.now() - 7195000),
      actualStartTime: new Date(Date.now() - 7200000),
      actualEndTime: new Date(Date.now() - 3600000), // 1 hour ago
      remindersSent: true
    };

    const completedSession = new Session(completedSessionData);
    await completedSession.save();

    // 3. Create transaction for the user (spending tokens)
    const transactionData = {
      user: user._id,
      type: 'debit',
      reason: 'session_learning',
      amount: 15,
      balanceBefore: user.tokenBalance,
      balanceAfter: user.tokenBalance - 15,
      description: `Payment for session: ${session.title}`,
      session: session._id
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    // 4. Generate fake transcript and summary for COMPLETED session only
    const transcript = generateFakeTranscript(teacher.name, user.name, completedSession.skill);
    const summaryData = generateFakeSummary(transcript, completedSession.skill);

    summaryData.session = completedSession._id;

    const sessionSummary = new SessionSummary(summaryData);
    await sessionSummary.save();

    res.status(201).json({
      success: true,
      message: 'Test sessions created successfully! You now have a JOINABLE session and a COMPLETED session with AI summary.',
      data: {
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          note: 'AI Teacher - for demo purposes'
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          tokenBalance: user.tokenBalance,
          isVerified: user.isVerified
        },
        joinableSession: {
          id: session._id,
          title: session.title,
          status: session.status,
          scheduledAt: session.scheduledAt,
          canJoinNow: true,
          message: 'You can join this session RIGHT NOW!'
        },
        completedSession: {
          id: completedSession._id,
          title: completedSession.title,
          status: completedSession.status,
          scheduledAt: completedSession.scheduledAt,
          hasSummary: true
        },
        summary: {
          id: sessionSummary._id,
          overallRating: sessionSummary.analysis.overallRating,
          engagementScore: sessionSummary.analysis.engagement.score
        },
        urls: {
          loginPage: 'http://localhost:5173/signin',
          joinableSessionDetails: `http://localhost:5173/sessions/${session._id}`,
          completedSessionDetails: `http://localhost:5173/sessions/${completedSession._id}`,
          sessionSummary: `http://localhost:5173/sessions/${completedSession._id}/summary`,
          sessionsList: 'http://localhost:5173/sessions'
        }
      }
    });

  } catch (error) {
    console.error('Error creating test session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test session',
      error: error.message
    });
  }
});

export default router;
