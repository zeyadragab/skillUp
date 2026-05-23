import mongoose from "mongoose";
import dotenv from "dotenv";
import Session from "../src/models/Session.js";
import SessionSummary from "../src/models/SessionSummary.js";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

async function createAISession() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/skillup",
    );
    console.log("✅ Connected to MongoDB");

    // Find the target learner
    const learnerEmail = "zeyadragab12@gmail.com";
    const learner = await User.findOne({ email: learnerEmail });

    if (!learner) {
      console.log(`❌ User ${learnerEmail} not found. Please sign up first.`);
      process.exit(1);
    }
    console.log(`✅ Found learner: ${learner.name}`);

    // Find or create an AI teacher
    let teacher = await User.findOne({ email: "ai.expert@skillup.com" });
    if (!teacher) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      teacher = await User.create({
        name: "Dr. Layla Hassan",
        email: "ai.expert@skillup.com",
        password: hashedPassword,
        isTeacher: true,
        isVerified: true,
        tokenBalance: 500,
        bio: "AI/ML researcher with 10 years of experience in deep learning, NLP, and computer vision.",
        skillsToTeach: [
          {
            name: "Artificial Intelligence",
            category: "Technology",
            level: "expert",
            tokensPerHour: 20,
          },
        ],
      });
      console.log(`✅ Created teacher: ${teacher.name}`);
    } else {
      console.log(`✅ Found teacher: ${teacher.name}`);
    }

    // Create a completed session (1 week ago)
    const scheduledAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const agoraChannel = `ai_session_${Date.now()}`;

    const session = await Session.create({
      teacher: teacher._id,
      learner: learner._id,
      skill: "Artificial Intelligence",
      skillCategory: "Technology",
      title: "Introduction to AI & Machine Learning",
      description:
        "Deep dive into AI fundamentals, neural networks, and practical ML applications.",
      scheduledAt,
      duration: 60,
      sessionType: "one-on-one",
      isSkillExchange: false,
      tokensCharged: 20,
      status: "completed",
      agoraChannel,
      endTime: new Date(scheduledAt.getTime() + 60 * 60 * 1000),
    });
    console.log(`✅ Created session: ${session._id}`);

    // Build AI-specific transcript
    const transcript = [
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `Welcome! Today we'll explore the foundations of Artificial Intelligence and Machine Learning. How familiar are you with AI concepts so far?`,
        timestamp: 0,
      },
      {
        speaker: "learner",
        speakerName: learner.name,
        text: `I've heard terms like neural networks and deep learning, but I don't really understand how they work yet.`,
        timestamp: 15,
      },
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `Perfect starting point. AI is essentially teaching computers to learn from data instead of programming explicit rules. Machine Learning is a subset of AI — the model finds patterns in data automatically. Let's start with supervised learning.`,
        timestamp: 30,
      },
      {
        speaker: "learner",
        speakerName: learner.name,
        text: `What's the difference between supervised and unsupervised learning?`,
        timestamp: 75,
      },
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `Great question. Supervised learning uses labeled data — you give the model inputs and the correct outputs. Unsupervised learning finds hidden patterns in unlabeled data on its own. Clustering is a classic example.`,
        timestamp: 90,
      },
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `Now let's talk about neural networks. They're inspired by the human brain — layers of nodes (neurons) that transform input data into a prediction. The magic happens in the training phase where we minimize error through backpropagation.`,
        timestamp: 180,
      },
      {
        speaker: "learner",
        speakerName: learner.name,
        text: `How does backpropagation work exactly?`,
        timestamp: 240,
      },
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `Think of it as the model grading itself. After each prediction it calculates how wrong it was — that's the loss. Then it works backwards through the layers adjusting weights slightly to reduce that loss. Do this thousands of times and the model improves dramatically.`,
        timestamp: 255,
      },
      {
        speaker: "learner",
        speakerName: learner.name,
        text: `That makes sense. What about Large Language Models like ChatGPT?`,
        timestamp: 320,
      },
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `LLMs are neural networks trained on massive text datasets using a transformer architecture. They predict the next token given context — billions of parameters let them capture complex language patterns. The key innovation is the attention mechanism which lets the model focus on relevant parts of the input.`,
        timestamp: 335,
      },
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `For your next steps I recommend starting with Python and scikit-learn for classical ML, then move to PyTorch for deep learning. Build small projects — a sentiment classifier or image recognizer will solidify everything we discussed.`,
        timestamp: 500,
      },
      {
        speaker: "learner",
        speakerName: learner.name,
        text: `This was incredibly clear. I finally understand the big picture. Thank you so much!`,
        timestamp: 545,
      },
      {
        speaker: "teacher",
        speakerName: teacher.name,
        text: `You asked excellent questions — that shows strong intuition. Keep building, reach out if you get stuck, and I'll see you in our next session on computer vision!`,
        timestamp: 555,
      },
    ];

    // Build AI-specific summary
    const summaryData = {
      session: session._id,
      transcript,
      summary: {
        overview: `This AI & Machine Learning session was exceptionally productive. ${teacher.name} guided ${learner.name} from zero familiarity with AI to a solid conceptual understanding of supervised/unsupervised learning, neural networks, backpropagation, and large language models. The learner showed strong curiosity by asking precise questions, and the teacher provided clear, intuitive explanations with real-world analogies. The session ended with a concrete roadmap for the learner's next steps.`,
        mainTopics: [
          {
            topic: "AI vs Machine Learning",
            description:
              "Core distinction: programming explicit rules vs. learning patterns from data automatically",
            timestamp: "00:30",
          },
          {
            topic: "Supervised vs Unsupervised Learning",
            description:
              "Labeled data for supervised; hidden pattern discovery for unsupervised (clustering)",
            timestamp: "01:15",
          },
          {
            topic: "Neural Networks & Backpropagation",
            description:
              "Brain-inspired layered architecture, forward pass prediction, and backward error correction",
            timestamp: "03:00",
          },
          {
            topic: "Large Language Models (LLMs)",
            description:
              "Transformer architecture, attention mechanism, token prediction at scale",
            timestamp: "05:20",
          },
          {
            topic: "Learning Roadmap",
            description:
              "Python → scikit-learn → PyTorch → build a sentiment classifier and image recognizer",
            timestamp: "08:20",
          },
        ],
        keyLearningPoints: [
          "Machine Learning lets computers find patterns in data without being explicitly programmed",
          "Supervised learning requires labeled data; unsupervised discovers hidden structure without labels",
          "Neural networks use layers of weighted nodes — backpropagation iteratively reduces prediction error",
          "The attention mechanism in transformers lets LLMs focus on relevant tokens across long contexts",
          "Building small projects (sentiment analysis, image recognition) is the fastest path to mastery",
          "PyTorch is the industry standard for deep learning research and production",
        ],
        actionItems: [
          {
            description:
              "Install Python and complete a scikit-learn tutorial on classification",
            assignedTo: "learner",
          },
          {
            description:
              "Build a simple sentiment classifier using a movie reviews dataset",
            assignedTo: "learner",
          },
          {
            description:
              'Watch 3Blue1Brown\'s "Neural Networks" series on YouTube',
            assignedTo: "learner",
          },
          {
            description:
              "Prepare computer vision exercises (CNNs) for the next session",
            assignedTo: "teacher",
          },
          {
            description:
              "Share curated reading list on transformer architecture papers",
            assignedTo: "teacher",
          },
        ],
        highlights: [
          {
            description:
              "Learner immediately connected backpropagation concept to gradient descent",
            timestamp: 270,
            importance: "high",
          },
          {
            description:
              "Sharp question about LLMs led to an in-depth discussion of attention mechanism",
            timestamp: 320,
            importance: "high",
          },
          {
            description:
              "Clear progression from confusion to confident understanding within 60 minutes",
            timestamp: 555,
            importance: "medium",
          },
        ],
      },
      analysis: {
        engagement: {
          score: 9.4,
          teacherParticipation: 62,
          learnerParticipation: 38,
          interactionQuality:
            "Excellent — learner asked precise, on-point questions; teacher adapted depth to each answer perfectly",
          notes:
            "One of the most interactive beginner sessions — high curiosity and strong follow-up questions.",
        },
        teachingQuality: {
          score: 9.3,
          clarity: 9.6,
          pacing: 9.0,
          responsiveness: 9.4,
          feedback: 9.1,
          notes:
            "Exceptional use of analogies (brain neurons, grading system for backpropagation). Paced perfectly for a beginner.",
        },
        learningProgress: {
          score: 9.1,
          questionsAsked: 5,
          conceptsGrasped: [
            "AI vs ML distinction",
            "supervised learning",
            "unsupervised learning",
            "neural network architecture",
            "backpropagation",
            "transformers & attention",
            "LLM fundamentals",
          ],
          areasNeedingImprovement: [
            "hands-on coding practice",
            "mathematics behind gradient descent",
            "CNN architecture details",
          ],
          notes:
            "Remarkable progress for a first session. Learner grasped abstract concepts quickly and is ready for practical coding.",
        },
        overallRating: 9.3,
        recommendations: [
          "Start with scikit-learn before jumping to deep learning — strong ML foundations matter",
          "Schedule a follow-up session in 2 weeks focused on building a real PyTorch project",
          "Join fast.ai community for practical deep learning guidance and peer support",
          'Read "Attention Is All You Need" (Vaswani et al.) for a deeper understanding of transformers',
          "Track learning progress by building a portfolio of small AI projects on GitHub",
        ],
      },
      statistics: {
        totalDuration: 3600,
        teacherSpeakTime: 2200,
        learnerSpeakTime: 1100,
        silenceTime: 300,
        wordsSpoken: { teacher: 648, learner: 312 },
      },
      processingStatus: "completed",
      generatedAt: new Date(),
    };

    const sessionSummary = await SessionSummary.create(summaryData);
    console.log(`✅ Created AI summary: ${sessionSummary._id}`);

    console.log("\n🎉 AI test session ready!");
    console.log("─".repeat(50));
    console.log(`📋 Session ID:   ${session._id}`);
    console.log(`👩‍🏫 Teacher:      ${teacher.name}`);
    console.log(`🎓 Learner:      ${learner.name}`);
    console.log(`🤖 Skill:        Artificial Intelligence`);
    console.log(`⭐ Rating:       9.3 / 10`);
    console.log("─".repeat(50));
    console.log("\n🔗 View it at:");
    console.log(`   Sessions list:  http://localhost:5173/sessions`);
    console.log(
      `   Full summary:   http://localhost:5173/sessions/${session._id}/summary`,
    );
    console.log(
      "\n💡 Login as:",
      learnerEmail,
      '→ go to Sessions → filter "COMPLETED"',
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAISession();
