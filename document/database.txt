// skillup Platform - Complete Database Schema
// Paste this into https://dbdiagram.io/

// ==================== USER MANAGEMENT ====================

Table users {
  _id ObjectId [pk, note: 'Primary Key']
  name varchar(50) [not null, note: 'User full name']
  email varchar(255) [unique, not null, note: 'User email address']
  password varchar(255) [not null, note: 'Hashed password (bcrypt)']
  avatar varchar(500) [note: 'Profile picture URL']
  bio text(500) [note: 'User biography']
  country varchar(100) [note: 'User country']
  timeZone varchar(100) [note: 'User timezone']
  languages json [note: 'Array of languages spoken']

  // Token system
  tokens decimal(10,2) [default: 50, note: 'Current token balance']
  tokensEarned decimal(10,2) [default: 0, note: 'Total tokens earned']
  tokensSpent decimal(10,2) [default: 0, note: 'Total tokens spent']

  // Statistics
  totalSessionsTaught integer [default: 0, note: 'Total sessions taught']
  totalSessionsLearned integer [default: 0, note: 'Total sessions learned']
  averageRating decimal(3,2) [default: 0, note: 'Average rating (0-5)']
  totalRatings integer [default: 0, note: 'Total number of ratings']

  // Gamification
  level integer [default: 1, note: 'User level']
  experience integer [default: 0, note: 'Experience points']
  badges json [note: 'Array of earned badges']
  streak_current integer [default: 0, note: 'Current activity streak']
  streak_longest integer [default: 0, note: 'Longest activity streak']
  streak_lastActivity timestamp [note: 'Last activity date']

  // Account status
  isVerified boolean [default: false, note: 'Email verified']
  isTeacher boolean [default: false, note: 'Teacher status']
  isActive boolean [default: false, note: 'Account activated']
  role varchar(20) [default: 'user', note: 'user, teacher, admin']

  // Verification tokens
  verificationToken varchar(255) [note: 'Email verification token']
  verificationExpire timestamp [note: 'Verification token expiry']
  resetPasswordToken varchar(255) [note: 'Password reset token']
  resetPasswordExpire timestamp [note: 'Password reset expiry']

  // Preferences
  preferences json [note: 'User preferences object']

  // Social connections
  followers json [note: 'Array of follower user IDs']
  following json [note: 'Array of following user IDs']

  // Timestamps
  createdAt timestamp [default: `now()`, note: 'Account creation date']
  updatedAt timestamp [default: `now()`, note: 'Last update date']

  Indexes {
    email [unique]
    (isTeacher, isActive)
    level
    averageRating
    createdAt
  }
}

// ==================== SKILLS ====================

Table skills {
  _id ObjectId [pk, note: 'Primary Key']
  name varchar(100) [unique, not null, note: 'Skill name']
  category varchar(100) [not null, note: 'Skill category']
  description text(500) [note: 'Skill description']
  icon varchar(10) [default: '🎯', note: 'Emoji icon']
  difficulty varchar(20) [default: 'beginner', note: 'beginner, intermediate, advanced, expert']
  tags json [note: 'Array of tags for search']

  // Statistics
  totalTeachers integer [default: 0, note: 'Number of teachers']
  totalLearners integer [default: 0, note: 'Number of learners']
  averageRating decimal(3,2) [default: 0, note: 'Average skill rating']
  popularityScore integer [default: 0, note: 'Calculated popularity']

  // Status
  isActive boolean [default: true, note: 'Skill active status']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    name [unique]
    (category, popularityScore)
  }
}

// ==================== USER SKILLS JUNCTION TABLE ====================

Table user_skills {
  _id ObjectId [pk, note: 'Primary Key']
  user ObjectId [not null, note: 'User ID']
  skill ObjectId [not null, note: 'Skill ID']
  type varchar(10) [not null, note: 'teach or learn']
  proficiencyLevel varchar(20) [default: 'beginner', note: 'beginner, intermediate, advanced, expert']
  yearsOfExperience integer [default: 0, note: 'Years of experience']
  isVerified boolean [default: false, note: 'Skill verified by admin']
  
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]
  
  Indexes {
    (user, skill, type) [unique]
    user
    skill
    type
  }
}

// ==================== SESSIONS ====================

Table sessions {
  _id ObjectId [pk, note: 'Primary Key']
  teacher ObjectId [not null, note: 'Teacher user ID']
  learner ObjectId [not null, note: 'Learner user ID']
  skill ObjectId [not null, note: 'Skill being taught']
  skillCategory varchar(100) [note: 'Skill category']

  // Session details
  title varchar(200) [not null, note: 'Session title']
  description text [note: 'Session description']

  // Scheduling
  scheduledAt timestamp [not null, note: 'Scheduled start time']
  duration integer [default: 60, note: 'Duration in minutes']
  endTime timestamp [note: 'Calculated end time']

  // Session type
  sessionType varchar(20) [default: 'one-on-one', note: 'one-on-one, group, workshop']
  isSkillExchange boolean [default: false, note: 'True if skill swap']

  // Pricing
  tokensCharged decimal(10,2) [default: 0, note: 'Tokens charged for session']

  // Video call
  videoRoomId varchar(255) [note: 'Video room identifier']
  videoToken varchar(500) [note: 'Video access token']
  agoraChannel varchar(255) [note: 'Agora channel name']

  // Status
  status varchar(20) [default: 'scheduled', note: 'scheduled, in-progress, completed, cancelled, no-show']

  // Ratings
  teacherRating json [note: 'Teacher rating object']
  learnerRating json [note: 'Learner rating object']

  // Notes
  teacherNotes text [note: 'Teacher session notes']
  learnerNotes text [note: 'Learner session notes']

  // Attendance tracking
  teacherJoinedAt timestamp [note: 'Teacher join time']
  learnerJoinedAt timestamp [note: 'Learner join time']
  actualStartTime timestamp [note: 'Actual session start']
  actualEndTime timestamp [note: 'Actual session end']

  // Cancellation
  cancelledBy ObjectId [note: 'User who cancelled']
  cancellationReason text [note: 'Reason for cancellation']
  cancelledAt timestamp [note: 'Cancellation timestamp']

  // Reminders
  remindersSent boolean [default: false, note: 'Reminders sent flag']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    (teacher, scheduledAt)
    (learner, scheduledAt)
    (status, scheduledAt)
    agoraChannel
  }
}

// ==================== TRANSACTIONS ====================

Table transactions {
  _id ObjectId [pk, note: 'Primary Key']
  user ObjectId [not null, note: 'User who made transaction']
  type varchar(10) [not null, note: 'credit or debit']
  amount decimal(10,2) [not null, note: 'Transaction amount']
  reason varchar(50) [not null, note: 'Transaction reason']
  description text [note: 'Transaction description']

  // Related entities
  session ObjectId [note: 'Related session ID']
  payment ObjectId [note: 'Related payment ID']

  // Balance tracking
  balanceBefore decimal(10,2) [note: 'Balance before transaction']
  balanceAfter decimal(10,2) [not null, note: 'Balance after transaction']

  // Metadata
  metadata json [note: 'Additional metadata']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    (user, createdAt)
    (type, reason)
    session
  }
}

// ==================== PAYMENTS ====================

Table payments {
  _id ObjectId [pk, note: 'Primary Key']
  user ObjectId [not null, note: 'User making payment']
  amount decimal(10,2) [not null, note: 'Payment amount in USD']
  currency varchar(3) [default: 'USD', note: 'Currency code']
  tokensAmount integer [not null, note: 'Number of tokens purchased']
  packageType varchar(20) [not null, note: 'basic, pro, premium, custom']

  // Stripe details
  stripePaymentIntentId varchar(255) [note: 'Stripe payment intent ID']
  stripePaymentMethodId varchar(255) [note: 'Stripe payment method ID']
  stripeCustomerId varchar(255) [note: 'Stripe customer ID']

  // Payment status
  status varchar(20) [default: 'pending', note: 'pending, processing, succeeded, failed, refunded']
  paymentMethod varchar(20) [default: 'stripe', note: 'stripe, paypal, admin']

  // Receipt
  receiptUrl varchar(500) [note: 'Receipt URL']
  receiptNumber varchar(100) [note: 'Auto-generated receipt number']

  // Refund details
  refundReason text [note: 'Reason for refund']
  refundedAt timestamp [note: 'Refund timestamp']
  refundAmount decimal(10,2) [note: 'Refund amount']

  // Metadata
  metadata json [note: 'Additional payment metadata']
  failureReason text [note: 'Failure reason if failed']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    (user, createdAt)
    status
    stripePaymentIntentId [unique]
    receiptNumber [unique]
  }
}

// ==================== MESSAGING ====================

Table conversations {
  _id ObjectId [pk, note: 'Primary Key']
  participants json [not null, note: 'Array of user IDs']
  lastMessage ObjectId [note: 'Last message reference']
  lastMessageAt timestamp [note: 'Last message timestamp']

  // Unread counts
  unreadCount json [note: 'Map of userId to unread count']

  // Conversation type
  type varchar(10) [default: 'direct', note: 'direct or group']

  // Group conversation fields
  groupName varchar(100) [note: 'Group name if group']
  groupAvatar varchar(500) [note: 'Group avatar URL']
  admin ObjectId [note: 'Group admin user ID']

  // Status
  isActive boolean [default: true, note: 'Conversation active status']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    participants
    lastMessageAt
  }
}

Table messages {
  _id ObjectId [pk, note: 'Primary Key']
  conversation ObjectId [not null, note: 'Conversation ID']
  sender ObjectId [not null, note: 'Message sender user ID']
  content text(2000) [not null, note: 'Message content']
  messageType varchar(20) [default: 'text', note: 'text, image, file, session-request, system']

  // File attachments
  fileUrl varchar(500) [note: 'File URL if file message']
  fileName varchar(255) [note: 'Original file name']

  // Read status
  readBy json [note: 'Array of read status objects']

  // Related session
  relatedSession ObjectId [note: 'Related session if session-request']

  // Status
  isDeleted boolean [default: false, note: 'Soft delete flag']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    (conversation, createdAt)
    sender
  }
}

// ==================== NOTIFICATIONS ====================

Table notifications {
  _id ObjectId [pk, note: 'Primary Key']
  recipient ObjectId [not null, note: 'Notification recipient']
  sender ObjectId [note: 'Notification sender']

  // Notification type
  type varchar(50) [not null, note: 'Notification type']

  // Content
  title varchar(200) [not null, note: 'Notification title']
  message text [not null, note: 'Notification message']
  icon varchar(50) [note: 'Emoji or icon name']

  // Related entities
  session ObjectId [note: 'Related session']
  recording ObjectId [note: 'Related recording']
  transaction ObjectId [note: 'Related transaction']

  // Action
  actionUrl varchar(500) [note: 'URL to navigate when clicked']
  actionText varchar(100) [note: 'Action button text']

  // Status
  isRead boolean [default: false, note: 'Read status']
  readAt timestamp [note: 'Read timestamp']

  // Delivery status
  emailSent boolean [default: false, note: 'Email notification sent']
  emailSentAt timestamp [note: 'Email sent timestamp']
  pushSent boolean [default: false, note: 'Push notification sent']
  pushSentAt timestamp [note: 'Push sent timestamp']
  inAppDelivered boolean [default: true, note: 'In-app delivered']

  // Priority
  priority varchar(10) [default: 'normal', note: 'low, normal, high, urgent']

  // Expiration
  expiresAt timestamp [note: 'Notification expiry']

  // Metadata
  metadata json [note: 'Additional metadata']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    (recipient, isRead)
    (recipient, createdAt)
    type
  }
}

// ==================== RECORDINGS ====================

Table recordings {
  _id ObjectId [pk, note: 'Primary Key']
  session ObjectId [unique, not null, note: 'Related session']
  teacher ObjectId [not null, note: 'Teacher user ID']
  learner ObjectId [not null, note: 'Learner user ID']
  skill ObjectId [not null, note: 'Skill reference']

  // Recording metadata
  title varchar(200) [not null, note: 'Recording title']
  description text [note: 'Recording description']

  // Agora recording info
  resourceId varchar(255) [note: 'Agora resource ID']
  sid varchar(255) [note: 'Agora recording SID']
  agoraChannel varchar(255) [not null, note: 'Agora channel name']

  // Recording files
  videoUrl varchar(500) [note: 'Video URL']
  videoPublicId varchar(255) [note: 'Cloudinary public ID']
  thumbnailUrl varchar(500) [note: 'Video thumbnail URL']
  fileSize bigint [note: 'File size in bytes']
  format varchar(10) [default: 'mp4', note: 'Video format']

  // Recording details
  duration integer [default: 0, note: 'Duration in seconds']
  quality varchar(10) [default: 'AUTO', note: 'HD, SD, AUTO']
  resolution varchar(20) [note: 'Video resolution']

  // Recording status
  status varchar(20) [default: 'recording', note: 'recording, processing, ready, failed, deleted']
  recordingStartedAt timestamp [note: 'Recording start time']
  recordingEndedAt timestamp [note: 'Recording end time']
  processingStartedAt timestamp [note: 'Processing start time']
  processedAt timestamp [note: 'Processing completion time']

  // Access control
  isPublic boolean [default: false, note: 'Public access flag']
  accessToken varchar(255) [note: 'Secure playback token']
  tokenExpiresAt timestamp [note: 'Access token expiry']

  // View tracking
  views integer [default: 0, note: 'Total view count']
  viewHistory json [note: 'Array of view records']

  // Timestamps
  scheduledAt timestamp [note: 'Original session scheduled time']
  expiresAt timestamp [note: 'Recording expiry date']

  // Error handling
  errorMessage text [note: 'Error message if failed']
  failureReason text [note: 'Failure reason']

  // Features
  hasScreenShare boolean [default: false, note: 'Screen sharing used']
  hasWhiteboard boolean [default: false, note: 'Whiteboard used']

  // Participants
  participants json [note: 'Array of participant objects']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    session [unique]
    (teacher, createdAt)
    (learner, createdAt)
    status
    expiresAt
    accessToken
  }
}

// ==================== AVAILABILITY ====================

Table availability {
  _id ObjectId [pk, note: 'Primary Key']
  teacher ObjectId [not null, note: 'Teacher user ID']

  // Day of week
  dayOfWeek integer [note: 'Day of week 0-6']

  // Time slots
  timeSlots json [note: 'Array of time slot objects']

  // Specific date override
  specificDate date [note: 'Specific date override']

  // Status
  isActive boolean [default: true, note: 'Availability active status']

  // Timezone
  timezone varchar(100) [default: 'UTC', note: 'Teacher timezone']

  // Repeat settings
  isRecurring boolean [default: true, note: 'Recurring availability']
  validFrom date [note: 'Valid from date']
  validUntil date [note: 'Valid until date']

  // Skills
  skills json [note: 'Array of skill IDs available']

  // Notes
  notes text [note: 'Availability notes']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    (teacher, dayOfWeek)
    (teacher, specificDate)
    (teacher, isActive)
  }
}

// ==================== AUTHENTICATION ====================

Table otps {
  _id ObjectId [pk, note: 'Primary Key']
  identifier varchar(255) [not null, note: 'Email or phone number']
  otp varchar(255) [not null, note: 'Hashed OTP code']
  expiresAt timestamp [not null, note: 'OTP expiry time']
  attempts integer [default: 0, note: 'Verification attempts']
  maxAttempts integer [default: 5, note: 'Maximum attempts allowed']
  isUsed boolean [default: false, note: 'OTP used flag']
  createdAt timestamp [default: `now()`]

  Indexes {
    identifier
  }
}

Table activation_tokens {
  _id ObjectId [pk, note: 'Primary Key']
  user ObjectId [not null, note: 'User ID']
  token varchar(255) [unique, not null, note: 'Activation token']
  expiresAt timestamp [not null, note: 'Token expiry']
  isUsed boolean [default: false, note: 'Token used flag']
  createdAt timestamp [default: `now()`]

  Indexes {
    user
    token [unique]
  }
}

// ==================== SESSION ANALYTICS ====================

Table session_summaries {
  _id ObjectId [pk, note: 'Primary Key']
  session ObjectId [unique, not null, note: 'Related session']

  // Transcript data
  transcript json [note: 'Array of transcript entries']

  // AI-generated summary
  summary json [note: 'Summary object']

  // AI-generated analysis
  analysis json [note: 'Analysis object']

  // Session statistics
  statistics json [note: 'Statistics object']

  // Processing status
  processingStatus varchar(20) [default: 'pending', note: 'pending, processing, completed, failed']
  processingError text [note: 'Processing error message']

  // Files
  transcriptFileUrl varchar(500) [note: 'Full transcript file URL']

  // Recording metadata
  recordingMetadata json [note: 'Recording metadata object']

  generatedAt timestamp [default: `now()`, note: 'Summary generation timestamp']

  // Timestamps
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]

  Indexes {
    session [unique]
    processingStatus
  }
}

// ==================== RELATIONSHIPS ====================

// User Skills relationships
Ref: user_skills.user > users._id
Ref: user_skills.skill > skills._id

// Session relationships
Ref: sessions.teacher > users._id
Ref: sessions.learner > users._id
Ref: sessions.skill > skills._id
Ref: sessions.cancelledBy > users._id

// Transaction relationships
Ref: transactions.user > users._id
Ref: transactions.session > sessions._id
Ref: transactions.payment > payments._id

// Payment relationships
Ref: payments.user > users._id

// Messaging relationships
Ref: conversations.lastMessage > messages._id
Ref: conversations.admin > users._id
Ref: messages.conversation > conversations._id
Ref: messages.sender > users._id
Ref: messages.relatedSession > sessions._id

// Notification relationships
Ref: notifications.recipient > users._id
Ref: notifications.sender > users._id
Ref: notifications.session > sessions._id
Ref: notifications.recording > recordings._id
Ref: notifications.transaction > transactions._id

// Recording relationships
Ref: recordings.session - sessions._id
Ref: recordings.teacher > users._id
Ref: recordings.learner > users._id
Ref: recordings.skill > skills._id

// Availability relationships
Ref: availability.teacher > users._id

// Authentication relationships
Ref: activation_tokens.user > users._id

// Analytics relationships
Ref: session_summaries.session - sessions._id