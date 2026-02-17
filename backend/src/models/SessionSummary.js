import mongoose from 'mongoose';

const sessionSummarySchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true
  },

  // Transcript data
  transcript: [{
    speaker: {
      type: String,
      enum: ['teacher', 'learner'],
      required: true
    },
    speakerName: String,
    text: String,
    timestamp: Number, // seconds from session start
    startTime: Date,
    endTime: Date
  }],

  // AI-generated summary
  summary: {
    // Overview
    overview: String,

    // Main topics discussed
    mainTopics: [{
      topic: String,
      description: String,
      timestamp: Number
    }],

    // Key learning points
    keyLearningPoints: [String],

    // Action items / homework
    actionItems: [{
      description: String,
      assignedTo: {
        type: String,
        enum: ['teacher', 'learner', 'both']
      }
    }],

    // Session highlights
    highlights: [{
      description: String,
      timestamp: Number,
      importance: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }]
  },

  // AI-generated analysis
  analysis: {
    // Engagement metrics
    engagement: {
      score: {
        type: Number,
        min: 0,
        max: 10
      },
      teacherParticipation: Number, // percentage
      learnerParticipation: Number, // percentage
      interactionQuality: String
    },

    // Teaching quality
    teachingQuality: {
      score: {
        type: Number,
        min: 0,
        max: 10
      },
      clarity: Number,
      pacing: Number,
      responsiveness: Number,
      feedback: String
    },

    // Learning progress
    learningProgress: {
      score: {
        type: Number,
        min: 0,
        max: 10
      },
      questionsAsked: Number,
      conceptsGrasped: [String],
      areasNeedingImprovement: [String]
    },

    // Overall rating
    overallRating: {
      type: Number,
      min: 0,
      max: 10
    },

    // Recommendations
    recommendations: [String]
  },

  // Session statistics
  statistics: {
    totalDuration: Number, // actual duration in seconds
    teacherSpeakTime: Number, // seconds
    learnerSpeakTime: Number, // seconds
    silenceTime: Number, // seconds
    wordsSpoken: {
      teacher: Number,
      learner: Number
    }
  },

  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },

  processingError: String,

  // Full transcript file URL (if stored separately)
  transcriptFileUrl: String,

  // Recording metadata
  recordingMetadata: {
    recordingId: String,
    recordingUrl: String,
    duration: Number
  },

  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
sessionSummarySchema.index({ session: 1 });
sessionSummarySchema.index({ processingStatus: 1 });
sessionSummarySchema.index({ 'analysis.overallRating': -1 });

// Methods
sessionSummarySchema.methods.isProcessed = function() {
  return this.processingStatus === 'completed';
};

sessionSummarySchema.methods.getEngagementLevel = function() {
  const score = this.analysis?.engagement?.score;
  if (!score) return 'unknown';
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'moderate';
  return 'needs improvement';
};

const SessionSummary = mongoose.model('SessionSummary', sessionSummarySchema);

export default SessionSummary;
