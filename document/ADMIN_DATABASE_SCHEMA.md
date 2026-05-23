# skillup Admin Panel - Complete Database Schema & AI Features

## Table of Contents

1. [Overview](#overview)
2. [Admin Collections](#admin-collections)
3. [AI-Powered Features](#ai-powered-features)
4. [Admin Schema Details](#admin-schema-details)
5. [AI Features Implementation](#ai-features-implementation)
6. [Integration with User Database](#integration-with-user-database)

---

## Overview

**Database Type:** MongoDB (NoSQL Document Database)
**Admin Collections:** 5
**AI Features:** 8
**Integration:** Shared database with user platform

The Admin Panel uses dedicated collections for administrative functions while accessing user database collections for management and analytics. AI features are integrated throughout for automation, insights, and moderation.

---

## Admin Collections Summary

| Collection             | Purpose                   | AI Integration          | Key Features                        |
| ---------------------- | ------------------------- | ----------------------- | ----------------------------------- |
| `admins`               | Admin user accounts       | Login pattern detection | Role-based permissions, audit trail |
| `reports`              | User reports & moderation | AI content moderation   | Priority scoring, auto-assignment   |
| `system_notifications` | Platform announcements    | AI content generation   | Scheduled delivery, targeting       |
| `system_settings`      | Platform configuration    | AI recommendations      | Dynamic pricing, token economy      |
| `activity_logs`        | Admin action audit trail  | Anomaly detection       | Complete action tracking            |

---

## AI-Powered Features

### 1. **AI Session Summary Generation** ⭐

**Collection:** `session_summaries` (in main database)
**AI Model:** OpenAI GPT-4 / Anthropic Claude

#### Purpose

Automatically generate comprehensive session summaries from video transcripts using AI.

#### Features

- **Transcript Analysis:** Parse session audio/video transcripts
- **Topic Extraction:** Identify main discussion topics
- **Key Points:** Extract learning highlights
- **Action Items:** Generate homework/follow-up tasks
- **Engagement Scoring:** Analyze participant engagement (0-10)
- **Teaching Quality:** Evaluate teaching effectiveness (0-10)
- **Learning Progress:** Assess learner comprehension (0-10)
- **Recommendations:** Provide improvement suggestions

#### Data Structure

```javascript
{
  session: ObjectId,              // Related session
  transcript: [                   // Full transcript
    {
      speaker: "teacher|learner",
      speakerName: String,
      text: String,
      timestamp: Number,
      startTime: Date,
      endTime: Date
    }
  ],
  summary: {
    overview: String,             // AI-generated overview
    mainTopics: [                 // AI-extracted topics
      {
        topic: String,
        description: String,
        timestamp: Number
      }
    ],
    keyLearningPoints: [String],  // AI-identified key points
    actionItems: [                // AI-generated tasks
      {
        description: String,
        assignedTo: "teacher|learner|both"
      }
    ],
    highlights: [                 // Important moments
      {
        description: String,
        timestamp: Number,
        importance: "low|medium|high"
      }
    ]
  },
  analysis: {
    engagement: {
      score: Number (0-10),       // AI engagement score
      teacherParticipation: Number,
      learnerParticipation: Number,
      interactionQuality: String
    },
    teachingQuality: {
      score: Number (0-10),       // AI teaching score
      clarity: Number,
      pacing: Number,
      responsiveness: Number,
      feedback: String
    },
    learningProgress: {
      score: Number (0-10),       // AI learning score
      questionsAsked: Number,
      conceptsGrasped: [String],
      areasNeedingImprovement: [String]
    },
    overallRating: Number (0-10), // AI overall rating
    recommendations: [String]     // AI suggestions
  },
  statistics: {
    totalDuration: Number,
    teacherSpeakTime: Number,
    learnerSpeakTime: Number,
    silenceTime: Number,
    wordsSpoken: {
      teacher: Number,
      learner: Number
    }
  },
  processingStatus: "pending|processing|completed|failed"
}
```

#### AI Prompt Example

```
Analyze this teaching session transcript and provide:
1. A comprehensive summary of the session
2. Main topics discussed with timestamps
3. Key learning points for the student
4. Action items and homework assignments
5. Engagement analysis (0-10 score)
6. Teaching quality assessment (0-10 score)
7. Learning progress evaluation (0-10 score)
8. Recommendations for improvement

Transcript:
[Session transcript here...]
```

#### Implementation

```javascript
// services/aiSummaryService.js
import OpenAI from "openai";

async function generateSessionSummary(transcript) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = buildSummaryPrompt(transcript);

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert educational analyst...",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

---

### 2. **AI Content Moderation** 🛡️

**Collection:** `reports` (admin database)
**AI Model:** OpenAI Moderation API + Custom ML

#### Purpose

Automatically detect and flag inappropriate content, spam, and policy violations.

#### Features

- **Text Analysis:** Scan user bios, reviews, messages
- **Image Analysis:** Detect inappropriate profile pictures
- **Hate Speech Detection:** Identify offensive language
- **Spam Detection:** Flag spam messages/reviews
- **Fraud Detection:** Identify suspicious patterns
- **Auto-Priority:** Set report priority based on severity
- **Auto-Assignment:** Assign reports to appropriate moderators

#### Data Structure

```javascript
{
  reporter: ObjectId,
  reportedUser: ObjectId,
  reportedSession: ObjectId,
  reportedReview: ObjectId,
  type: "user|session|review|spam|fraud|inappropriate|other",
  reason: String,
  description: String,
  evidence: [String],               // Screenshot URLs

  // AI-Enhanced Fields
  aiAnalysis: {
    contentFlags: {
      hate: Number (0-1),           // AI confidence scores
      harassment: Number (0-1),
      sexual: Number (0-1),
      violence: Number (0-1),
      spam: Number (0-1),
      fraud: Number (0-1)
    },
    severity: "low|medium|high|critical",
    confidence: Number (0-1),
    suggestedAction: "no_action|warning|suspension|ban|content_removed",
    reasoning: String
  },

  status: "pending|under_review|resolved|dismissed",
  priority: "low|medium|high|critical",
  assignedTo: ObjectId,
  resolution: {
    action: String,
    notes: String,
    resolvedBy: ObjectId,
    resolvedAt: Date
  }
}
```

#### AI Implementation

```javascript
// services/contentModerationService.js
import OpenAI from "openai";

async function moderateContent(content) {
  const openai = new OpenAI();

  // OpenAI Moderation API
  const moderation = await openai.moderations.create({
    input: content,
  });

  const result = moderation.results[0];

  // Calculate severity
  const maxScore = Math.max(
    result.category_scores.hate,
    result.category_scores.harassment,
    result.category_scores.sexual,
    result.category_scores.violence,
  );

  let severity, suggestedAction;
  if (maxScore > 0.9) {
    severity = "critical";
    suggestedAction = "ban";
  } else if (maxScore > 0.7) {
    severity = "high";
    suggestedAction = "suspension";
  } else if (maxScore > 0.5) {
    severity = "medium";
    suggestedAction = "warning";
  } else {
    severity = "low";
    suggestedAction = "no_action";
  }

  return {
    contentFlags: result.category_scores,
    severity,
    confidence: maxScore,
    suggestedAction,
    reasoning: `Detected ${result.categories} violations`,
  };
}
```

---

### 3. **AI Skill Recommendations** 💡

**Collection:** Uses `users` and `sessions` data
**AI Model:** Collaborative Filtering + GPT-4

#### Purpose

Recommend skills to learn based on user interests, session history, and market demand.

#### Features

- **Personalized Recommendations:** Based on learning history
- **Skill Gaps Analysis:** Identify complementary skills
- **Career Path Suggestions:** Recommend skill sequences
- **Demand Forecasting:** Predict popular skills
- **Teacher Matching:** Suggest best teachers for user

#### Algorithm

```javascript
async function generateSkillRecommendations(userId) {
  const user = await User.findById(userId)
    .populate("skillsToLearn")
    .populate("sessions");

  // AI Analysis
  const prompt = `
    User Profile:
    - Current Skills: ${user.skillsToTearn.join(", ")}
    - Learning Goals: ${user.skillsToLearn.join(", ")}
    - Session History: ${user.sessions.length} sessions
    - Interests: ${user.bio}

    Provide 5 personalized skill recommendations with:
    1. Skill name
    2. Reason why it's recommended
    3. Difficulty level
    4. Estimated learning time
    5. Career benefits
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  return parseRecommendations(response);
}
```

---

### 4. **AI Teacher Verification** ✅

**Collection:** `users` (teacher verification)
**AI Model:** Computer Vision + NLP

#### Purpose

Automatically verify teacher credentials and expertise.

#### Features

- **Credential Verification:** Scan uploaded certificates
- **Portfolio Analysis:** Analyze teaching samples
- **LinkedIn Integration:** Verify professional background
- **Skill Assessment:** AI-powered skill tests
- **Video Interview Analysis:** Assess teaching style
- **Fraud Detection:** Identify fake credentials

#### Verification Process

```javascript
{
  teacherVerification: {
    status: "pending|verified|rejected",
    submittedAt: Date,
    verifiedAt: Date,

    // AI Analysis
    aiVerification: {
      credentialsValid: Boolean,
      confidenceScore: Number (0-1),
      skillsVerified: [String],
      fraudIndicators: [String],
      portfolioQuality: Number (0-10),
      recommendApproval: Boolean,
      reasoning: String
    },

    // Manual Review
    manualReview: {
      reviewedBy: ObjectId,
      approved: Boolean,
      notes: String,
      reviewedAt: Date
    },

    documents: [
      {
        type: "certificate|id|portfolio|other",
        url: String,
        verificationStatus: "pending|verified|rejected",
        aiAnalysis: {
          authentic: Boolean,
          confidence: Number,
          issuer: String,
          skillsCovered: [String]
        }
      }
    ]
  }
}
```

---

### 5. **AI Pricing Optimization** 💰

**Collection:** `system_settings` + `sessions` analytics
**AI Model:** Machine Learning Regression

#### Purpose

Dynamically optimize token pricing and package recommendations.

#### Features

- **Demand-Based Pricing:** Adjust based on demand
- **Skill Premium Pricing:** Price by skill rarity
- **Personalized Packages:** Custom token bundles
- **Conversion Optimization:** Maximize purchases
- **Competitor Analysis:** Market price tracking

#### ML Model

```python
# AI Pricing Model (Python)
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# Features
features = [
    'skill_demand_score',
    'teacher_rating',
    'teacher_experience',
    'session_duration',
    'time_of_day',
    'day_of_week',
    'user_lifetime_value'
]

# Train model
model = RandomForestRegressor()
model.fit(X_train, y_train)

# Predict optimal price
def predict_optimal_price(session_features):
    return model.predict([session_features])[0]
```

---

### 6. **AI Fraud Detection** 🔍

**AI Model:** Anomaly Detection + Pattern Recognition

#### Purpose

Detect fraudulent activity, fake accounts, and abuse.

#### Features

- **Fake Account Detection:** Identify bot accounts
- **Review Manipulation:** Detect fake reviews
- **Token Fraud:** Identify suspicious transactions
- **Multiple Account Detection:** Find duplicate users
- **Session Abuse:** Detect fake sessions
- **Pattern Analysis:** Identify fraud rings

#### Detection System

```javascript
{
  fraudDetection: {
    riskScore: Number (0-100),    // AI risk score
    flags: [
      {
        type: "fake_review|bot_account|token_fraud|duplicate_account",
        severity: "low|medium|high|critical",
        confidence: Number (0-1),
        evidence: [String],
        detectedAt: Date
      }
    ],
    patterns: {
      unusualActivityTimes: Boolean,
      rapidAccountCreation: Boolean,
      suspiciousIPPatterns: Boolean,
      tokenAnomalies: Boolean,
      sessionPatternIrregular: Boolean
    },
    recommendation: "monitor|investigate|suspend|ban",
    lastAnalyzed: Date
  }
}
```

---

### 7. **AI Chatbot Support** 🤖

**Integration:** Admin support interface
**AI Model:** GPT-4 with RAG (Retrieval Augmented Generation)

#### Purpose

Provide AI-powered support for admins and users.

#### Features

- **User Query Resolution:** Answer common questions
- **Admin Assistance:** Help with platform operations
- **Policy Guidance:** Explain platform rules
- **Technical Support:** Troubleshooting help
- **Knowledge Base:** Search documentation
- **Ticket Routing:** Auto-assign support tickets

#### Implementation

```javascript
{
  supportTicket: {
    user: ObjectId,
    subject: String,
    message: String,
    category: "account|payment|technical|report|other",

    // AI Analysis
    aiProcessing: {
      sentiment: "positive|neutral|negative",
      urgency: "low|medium|high|critical",
      category: String,
      suggestedResponse: String,
      canAutoResolve: Boolean,
      confidence: Number (0-1),
      relatedArticles: [
        {
          title: String,
          url: String,
          relevance: Number
        }
      ]
    },

    assignedTo: ObjectId,
    status: "open|in_progress|resolved|closed",
    priority: "low|medium|high|critical"
  }
}
```

---

### 8. **AI Analytics & Insights** 📊

**Data Source:** All platform data
**AI Model:** Time Series Forecasting + NLP

#### Purpose

Generate automated insights and predictions for admins.

#### Features

- **User Growth Forecasting:** Predict user sign-ups
- **Revenue Predictions:** Forecast token sales
- **Churn Analysis:** Identify at-risk users
- **Trend Detection:** Spot emerging skill trends
- **Anomaly Alerts:** Notify of unusual patterns
- **Performance Dashboards:** Auto-generated reports
- **Natural Language Queries:** Ask questions in plain English

#### AI-Generated Insights

```javascript
{
  platformInsights: {
    generatedAt: Date,
    period: "daily|weekly|monthly",

    // AI-Generated Insights
    insights: [
      {
        type: "trend|anomaly|prediction|recommendation",
        title: String,
        description: String,
        impact: "low|medium|high",
        confidence: Number (0-1),
        actionable: Boolean,
        suggestedActions: [String],
        data: Mixed
      }
    ],

    // Forecasts
    forecasts: {
      userGrowth: {
        next7Days: Number,
        next30Days: Number,
        confidence: Number
      },
      revenue: {
        next7Days: Number,
        next30Days: Number,
        confidence: Number
      },
      popularSkills: [
        {
          skill: String,
          predictedDemand: Number,
          currentDemand: Number,
          trend: "rising|stable|declining"
        }
      ]
    },

    // Anomalies
    anomalies: [
      {
        metric: String,
        expected: Number,
        actual: Number,
        severity: "low|medium|high",
        possibleCauses: [String]
      }
    ]
  }
}
```

#### Natural Language Queries

```javascript
// Admin Dashboard NL Query
async function queryAnalytics(question) {
  const prompt = `
    Platform Data Summary:
    - Total Users: 10,542
    - Active Sessions: 1,234
    - Revenue (30 days): $45,231

    Question: ${question}

    Provide a concise answer with relevant metrics and insights.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

// Example queries:
// "What's our user growth rate this month?"
// "Which skills are trending upward?"
// "Are there any revenue anomalies?"
```

---

## Admin Schema Details

### 1. Admins Collection

**Collection Name:** `admins`
**Purpose:** Admin user accounts with role-based access control

#### Fields

| Field                       | Type     | Required | Default        | Description                             |
| --------------------------- | -------- | -------- | -------------- | --------------------------------------- |
| `_id`                       | ObjectId | Yes      | Auto           | Primary key                             |
| `name`                      | String   | Yes      | -              | Admin full name                         |
| `email`                     | String   | Yes      | -              | Unique email (lowercase)                |
| `password`                  | String   | Yes      | -              | Bcrypt hashed (select: false, salt: 12) |
| `role`                      | Enum     | No       | 'moderator'    | super_admin, moderator, support         |
| **Permissions (Object)**    |
| `permissions.users`         | Boolean  | No       | true           | User management access                  |
| `permissions.teachers`      | Boolean  | No       | true           | Teacher management access               |
| `permissions.skills`        | Boolean  | No       | true           | Skill management access                 |
| `permissions.sessions`      | Boolean  | No       | true           | Session management access               |
| `permissions.transactions`  | Boolean  | No       | false          | Transaction access                      |
| `permissions.reports`       | Boolean  | No       | true           | Report management access                |
| `permissions.reviews`       | Boolean  | No       | true           | Review management access                |
| `permissions.notifications` | Boolean  | No       | false          | Notification access                     |
| `permissions.settings`      | Boolean  | No       | false          | Settings access                         |
| `permissions.analytics`     | Boolean  | No       | true           | Analytics access                        |
| **Profile**                 |
| `avatar`                    | String   | No       | Auto-generated | Profile picture URL                     |
| `isActive`                  | Boolean  | No       | true           | Account active status                   |
| `lastLogin`                 | Date     | No       | -              | Last login timestamp                    |
| **Login History (Array)**   |
| `loginHistory.ip`           | String   | No       | -              | IP address                              |
| `loginHistory.userAgent`    | String   | No       | -              | Browser/device info                     |
| `loginHistory.timestamp`    | Date     | No       | now()          | Login time                              |
| **Audit**                   |
| `createdBy`                 | ObjectId | No       | -              | Ref: admins.\_id (creator)              |
| **Timestamps**              |
| `createdAt`                 | Date     | Auto     | now()          | Creation                                |
| `updatedAt`                 | Date     | Auto     | now()          | Last update                             |

#### Role Hierarchy

- **super_admin:** Full access to everything (permissions auto-set to all true)
- **moderator:** User/teacher/skill/session/report/review management
- **support:** Limited access for customer support

#### Pre-save Hook

```javascript
// Auto-grant full permissions to super_admin
if (role === "super_admin") {
  permissions = {
    /* all true */
  };
}
```

#### Methods

- `comparePassword(candidatePassword)` - Verify password

---

### 2. Reports Collection

**Collection Name:** `reports`
**Purpose:** User-submitted reports and content moderation

#### Fields

| Field                                                      | Type          | Required | Default   | Description                                              |
| ---------------------------------------------------------- | ------------- | -------- | --------- | -------------------------------------------------------- |
| `_id`                                                      | ObjectId      | Yes      | Auto      | Primary key                                              |
| `reporter`                                                 | ObjectId      | Yes      | -         | Ref: users.\_id (who reported)                           |
| **Reported Entity (one of these)**                         |
| `reportedUser`                                             | ObjectId      | No       | -         | Ref: users.\_id                                          |
| `reportedSession`                                          | ObjectId      | No       | -         | Ref: sessions.\_id                                       |
| `reportedReview`                                           | ObjectId      | No       | -         | Ref: reviews.\_id                                        |
| **Report Details**                                         |
| `type`                                                     | Enum          | Yes      | -         | user, session, review, spam, fraud, inappropriate, other |
| `reason`                                                   | String        | Yes      | -         | Short reason                                             |
| `description`                                              | String        | Yes      | -         | Detailed description                                     |
| `evidence`                                                 | Array[String] | No       | []        | URLs to screenshots/files                                |
| **Status**                                                 |
| `status`                                                   | Enum          | No       | 'pending' | pending, under_review, resolved, dismissed               |
| `priority`                                                 | Enum          | No       | 'medium'  | low, medium, high, critical                              |
| `assignedTo`                                               | ObjectId      | No       | -         | Ref: admins.\_id                                         |
| **Resolution (Object)**                                    |
| `resolution.action`                                        | Enum          | No       | -         | no_action, warning, suspension, ban, content_removed     |
| `resolution.notes`                                         | String        | No       | -         | Resolution notes                                         |
| `resolution.resolvedBy`                                    | ObjectId      | No       | -         | Ref: admins.\_id                                         |
| `resolution.resolvedAt`                                    | Date          | No       | -         | Resolution timestamp                                     |
| **Admin Notes (Array)**                                    |
| `adminNotes.admin`                                         | ObjectId      | Yes      | -         | Ref: admins.\_id                                         |
| `adminNotes.note`                                          | String        | Yes      | -         | Note content                                             |
| `adminNotes.createdAt`                                     | Date          | No       | now()     | Note timestamp                                           |
| **AI Analysis (Object)** - See AI Content Moderation above |
| **Timestamps**                                             |
| `createdAt`                                                | Date          | Auto     | now()     | Report submission                                        |
| `updatedAt`                                                | Date          | Auto     | now()     | Last update                                              |

#### Indexes

```javascript
(status, priority): compound, priority descending
reporter: single
reportedUser: single
```

---

### 3. System Notifications Collection

**Collection Name:** `system_notifications`
**Purpose:** Platform-wide announcements and notifications

#### Fields

| Field                        | Type     | Required | Default  | Description                                                 |
| ---------------------------- | -------- | -------- | -------- | ----------------------------------------------------------- |
| `_id`                        | ObjectId | Yes      | Auto     | Primary key                                                 |
| `title`                      | String   | Yes      | -        | Notification title                                          |
| `message`                    | String   | Yes      | -        | Notification message                                        |
| `type`                       | Enum     | No       | 'info'   | announcement, maintenance, update, promotion, warning, info |
| `targetAudience`             | Enum     | No       | 'all'    | all, users, teachers, verified_teachers, new_users          |
| `priority`                   | Enum     | No       | 'medium' | low, medium, high                                           |
| **Channels (Object)**        |
| `channels.inApp`             | Boolean  | No       | true     | Show in app                                                 |
| `channels.email`             | Boolean  | No       | false    | Send email                                                  |
| `channels.push`              | Boolean  | No       | false    | Push notification                                           |
| **Scheduling**               |
| `scheduledFor`               | Date     | No       | -        | Schedule for future                                         |
| `expiresAt`                  | Date     | No       | -        | Auto-hide after date                                        |
| **Status**                   |
| `status`                     | Enum     | No       | 'draft'  | draft, scheduled, sent, cancelled                           |
| `sentAt`                     | Date     | No       | -        | Actual send time                                            |
| `sentTo`                     | Number   | No       | 0        | Number of users notified                                    |
| **Read Tracking (Array)**    |
| `readBy.user`                | ObjectId | Yes      | -        | Ref: users.\_id                                             |
| `readBy.readAt`              | Date     | No       | now()    | Read timestamp                                              |
| **Metadata (Object)**        |
| `metadata.link`              | String   | No       | -        | Link URL                                                    |
| `metadata.imageUrl`          | String   | No       | -        | Image URL                                                   |
| `metadata.actionButton.text` | String   | No       | -        | Button text                                                 |
| `metadata.actionButton.url`  | String   | No       | -        | Button URL                                                  |
| **Audit**                    |
| `createdBy`                  | ObjectId | Yes      | -        | Ref: admins.\_id                                            |
| **Timestamps**               |
| `createdAt`                  | Date     | Auto     | now()    | Creation                                                    |
| `updatedAt`                  | Date     | Auto     | now()    | Last update                                                 |

#### Indexes

```javascript
(status, scheduledFor): compound
targetAudience: single
```

---

### 4. System Settings Collection

**Collection Name:** `system_settings`
**Purpose:** Platform configuration and feature flags

#### Fields

| Field           | Type     | Required | Default   | Description                                          |
| --------------- | -------- | -------- | --------- | ---------------------------------------------------- |
| `_id`           | ObjectId | Yes      | Auto      | Primary key                                          |
| `key`           | String   | Yes      | -         | Unique setting key                                   |
| `value`         | Mixed    | Yes      | -         | Setting value (any type)                             |
| `category`      | Enum     | No       | 'general' | general, tokens, sessions, email, security, features |
| `description`   | String   | No       | -         | Setting description                                  |
| `lastUpdatedBy` | ObjectId | No       | -         | Ref: admins.\_id                                     |
| **Timestamps**  |
| `createdAt`     | Date     | Auto     | now()     | Creation                                             |
| `updatedAt`     | Date     | Auto     | now()     | Last update                                          |

#### Default Settings

```javascript
// General
site_name: "skillup"
site_tagline: "Exchange Skills, Grow Together"
maintenance_mode: false

// Tokens
welcome_bonus: 50
referral_bonus: 20
min_session_tokens: 5
max_session_tokens: 100
token_price_usd: 0.10

// Sessions
min_session_duration: 30 minutes
max_session_duration: 180 minutes
cancellation_penalty_percent: 20%
auto_complete_hours: 24

// Security
max_login_attempts: 5
lockout_duration_minutes: 15
require_email_verification: true
require_teacher_verification: true

// Features
enable_messaging: true
enable_video_calls: true
enable_reviews: true
enable_reports: true
enable_ai_summaries: true
enable_ai_moderation: true
enable_ai_recommendations: true
```

#### Static Methods

- `getDefaults()` - Get all default settings

---

### 5. Activity Logs Collection

**Collection Name:** `activity_logs`
**Purpose:** Complete audit trail of admin actions

#### Fields

| Field          | Type     | Required | Default   | Description                  |
| -------------- | -------- | -------- | --------- | ---------------------------- |
| `_id`          | ObjectId | Yes      | Auto      | Primary key                  |
| `admin`        | ObjectId | Yes      | -         | Ref: admins.\_id             |
| `action`       | Enum     | Yes      | -         | Action performed (25+ types) |
| `targetType`   | Enum     | No       | -         | Type of target entity        |
| `targetId`     | ObjectId | No       | -         | ID of target entity          |
| `details`      | Mixed    | No       | -         | Action details (JSON)        |
| `ipAddress`    | String   | No       | -         | Request IP                   |
| `userAgent`    | String   | No       | -         | Browser/device info          |
| `status`       | Enum     | No       | 'success' | success, failed              |
| **Timestamps** |
| `createdAt`    | Date     | Auto     | now()     | Action timestamp             |
| `updatedAt`    | Date     | Auto     | now()     | Last update                  |

#### Action Types

```
Authentication:
- login, logout

User Management:
- user_view, user_update, user_ban, user_unban, user_delete

Teacher Management:
- teacher_verify, teacher_reject

Skill Management:
- skill_create, skill_update, skill_delete
- category_create, category_update, category_delete

Session Management:
- session_view, session_cancel, session_refund

Transaction Management:
- transaction_view, transaction_adjust

Report Management:
- report_view, report_resolve, report_dismiss

Review Management:
- review_delete, review_hide

Notification Management:
- notification_send

Settings Management:
- settings_update

Admin Management:
- admin_create, admin_update, admin_delete
```

#### Indexes

```javascript
(admin, createdAt): compound, createdAt descending
(action, createdAt): compound, createdAt descending
(targetType, targetId): compound
```

---

## Integration with User Database

### Shared Collections (Admin Access)

Admin panel has **READ/WRITE** access to all user database collections:

| User Collection     | Admin Access Level   | Admin Capabilities                                 |
| ------------------- | -------------------- | -------------------------------------------------- |
| `users`             | Full (CRUD)          | View, update, ban, delete users; verify teachers   |
| `skills`            | Full (CRUD)          | Create, edit, delete skills and categories         |
| `sessions`          | Read + Limited Write | View all sessions, cancel sessions, issue refunds  |
| `transactions`      | Read + Admin Adjust  | View all transactions, manual adjustments          |
| `payments`          | Read-only            | View payment history, refund processing            |
| `messages`          | Read + Moderate      | View messages for moderation, delete inappropriate |
| `conversations`     | Read-only            | View conversations for support                     |
| `notifications`     | Read + Create        | View all notifications, send system notifications  |
| `recordings`        | Read + Delete        | View recordings, delete violating content          |
| `session_summaries` | Full (CRUD)          | View AI summaries, regenerate, edit                |
| `otps`              | Read-only            | View for support                                   |
| `activation_tokens` | Read-only            | View for support                                   |

### Cross-Database Queries

Admin dashboard executes queries across both databases:

```javascript
// Example: User Management Dashboard
const adminDashboard = await Promise.all([
  // User DB
  User.countDocuments({ isActive: true }),
  Session.find({ status: "scheduled" }).limit(10),

  // Admin DB
  Report.countDocuments({ status: "pending" }),
  ActivityLog.find({ admin: adminId }).limit(20),
]);
```

---

## AI Features Implementation Details

### AI Service Architecture

```
┌─────────────────────────────────────────────────┐
│          skillup Platform                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  User App    │  │  Admin Panel │            │
│  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                     │
│         └──────────┬───────┘                     │
│                    │                             │
│         ┌──────────▼───────────┐                │
│         │   API Gateway        │                │
│         └──────────┬───────────┘                │
│                    │                             │
│         ┌──────────▼───────────┐                │
│         │  AI Services Layer   │                │
│         ├──────────────────────┤                │
│         │ • Session Summaries  │                │
│         │ • Content Moderation │                │
│         │ • Recommendations    │                │
│         │ • Fraud Detection    │                │
│         │ • Analytics Insights │                │
│         │ • Chatbot Support    │                │
│         └──────────┬───────────┘                │
│                    │                             │
│         ┌──────────▼───────────┐                │
│         │   AI Providers       │                │
│         ├──────────────────────┤                │
│         │ • OpenAI GPT-4       │                │
│         │ • OpenAI Moderation  │                │
│         │ • Custom ML Models   │                │
│         │ • Agora (Video)      │                │
│         └──────────────────────┘                │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# AI Service Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MODERATION_MODEL=text-moderation-latest

# Feature Flags
ENABLE_AI_SUMMARIES=true
ENABLE_AI_MODERATION=true
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_AI_FRAUD_DETECTION=true
ENABLE_AI_CHATBOT=true

# AI Processing
AI_SUMMARY_QUEUE_DELAY=60000  # Process summaries after 1 min
AI_MODERATION_THRESHOLD=0.7   # Flag content with 70%+ confidence
AI_FRAUD_THRESHOLD=0.8        # Flag fraud with 80%+ confidence
```

### AI Processing Queues

```javascript
// Use Bull Queue for async AI processing
import Queue from "bull";

// Session Summary Queue
const summaryQueue = new Queue("session-summaries", {
  redis: process.env.REDIS_URL,
});

summaryQueue.process(async (job) => {
  const { sessionId } = job.data;

  // Get transcript
  const transcript = await getSessionTranscript(sessionId);

  // Generate AI summary
  const summary = await generateSessionSummary(transcript);

  // Save to database
  await SessionSummary.create({
    session: sessionId,
    ...summary,
    processingStatus: "completed",
  });
});

// Content Moderation Queue
const moderationQueue = new Queue("content-moderation");

moderationQueue.process(async (job) => {
  const { reportId, content } = job.data;

  // AI analysis
  const aiAnalysis = await moderateContent(content);

  // Update report
  await Report.findByIdAndUpdate(reportId, {
    aiAnalysis,
    priority: aiAnalysis.severity === "critical" ? "critical" : "high",
  });
});
```

---

## Database Diagram for Admin System

### ERD Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN DATABASE                          │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │    admins    │
                    │──────────────│
                    │ _id (PK)     │
                    │ email        │
                    │ role         │
                    │ permissions  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
      ┌──────────┐  ┌──────────┐  ┌──────────────┐
      │ reports  │  │ activity │  │ system_      │
      │          │  │ _logs    │  │ notifications│
      └──────────┘  └──────────┘  └──────────────┘
              │                            │
              │                            │
              └────────────┬───────────────┘
                           │
                           │ References
                           │
                           ▼
              ┌────────────────────────┐
              │    USER DATABASE       │
              │ (users, sessions, etc) │
              └────────────────────────┘
```

---

## AI Features Configuration File

Create this file: `config/aiFeatures.js`

```javascript
export const AI_FEATURES = {
  sessionSummaries: {
    enabled: process.env.ENABLE_AI_SUMMARIES === "true",
    model: "gpt-4-turbo-preview",
    maxTokens: 4000,
    temperature: 0.7,
    processingDelay: 60000, // 1 minute after session ends
    retryAttempts: 3,
  },

  contentModeration: {
    enabled: process.env.ENABLE_AI_MODERATION === "true",
    model: "text-moderation-latest",
    threshold: 0.7,
    autoFlag: true,
    autoAssign: true,
  },

  recommendations: {
    enabled: process.env.ENABLE_AI_RECOMMENDATIONS === "true",
    model: "gpt-4",
    updateFrequency: 86400000, // Daily
    maxRecommendations: 5,
  },

  fraudDetection: {
    enabled: process.env.ENABLE_AI_FRAUD_DETECTION === "true",
    threshold: 0.8,
    checkFrequency: 3600000, // Hourly
    autoSuspend: false,
  },

  chatbot: {
    enabled: process.env.ENABLE_AI_CHATBOT === "true",
    model: "gpt-4",
    maxConversationHistory: 10,
    temperature: 0.5,
  },

  analytics: {
    enabled: true,
    model: "gpt-4",
    generateInsightsFrequency: 86400000, // Daily
    forecastPeriod: 30, // 30 days
  },
};
```

---

## Usage Instructions

### For Admin Database Visualization

1. **Add admin collections to dbdiagram.io:**
   - Append admin schema to existing diagram
   - Show relationships to user database

2. **Create separate admin ERD:**
   - Focus on admin-specific collections
   - Show integration points

### Admin Panel Setup

```bash
# 1. Install dependencies
npm install openai bull redis bcryptjs

# 2. Set environment variables
cp .env.example .env
# Edit .env with AI API keys

# 3. Initialize admin account
npm run seed:admin

# 4. Start Redis (for AI queues)
redis-server

# 5. Start admin server
npm run dev:admin
```

---

## Summary

### Collections: 5 Admin-specific

1. admins - Admin accounts
2. reports - Content moderation
3. system_notifications - Announcements
4. system_settings - Configuration
5. activity_logs - Audit trail

### AI Features: 8 Integrated

1. ✅ AI Session Summaries (GPT-4)
2. ✅ AI Content Moderation (OpenAI Moderation)
3. ✅ AI Skill Recommendations (GPT-4)
4. ✅ AI Teacher Verification (Computer Vision + NLP)
5. ✅ AI Pricing Optimization (ML Regression)
6. ✅ AI Fraud Detection (Anomaly Detection)
7. ✅ AI Chatbot Support (GPT-4 + RAG)
8. ✅ AI Analytics & Insights (Time Series + NLP)

### Total Platform Collections: 18

- User Database: 13 collections
- Admin Database: 5 collections
- All integrated with AI capabilities

---

**Document Version:** 2.0
**Last Updated:** December 2025
**AI Features Status:** Production Ready
