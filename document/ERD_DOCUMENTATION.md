# skillup - Enhanced Entity Relationship Diagram (ERD)

## Overview

This document provides a comprehensive ERD for the skillup platform, including all entities, relationships, and attributes.

---

## Entities

### 1. User

**Primary Key:** `_id`  
**Description:** Core user entity for learners and teachers

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `name` (String, Required, Max: 50)
- `email` (String, Required, Unique, Lowercase)
- `password` (String, Required, Hashed, Min: 6)
- `avatar` (String, Default: Generated URL)
- `bio` (String, Max: 500)
- `country` (String)
- `timeZone` (String)
- `languages` (Array[String])
- `tokens` (Number, Default: 50)
- `tokensEarned` (Number, Default: 0)
- `tokensSpent` (Number, Default: 0)
- `totalSessionsTaught` (Number, Default: 0)
- `totalSessionsLearned` (Number, Default: 0)
- `averageRating` (Number, Min: 0, Max: 5, Default: 0)
- `totalRatings` (Number, Default: 0)
- `level` (Number, Default: 1)
- `experience` (Number, Default: 0)
- `badges` (Array[Object])
  - `name` (String)
  - `icon` (String)
  - `earnedAt` (Date)
- `streak` (Object)
  - `current` (Number, Default: 0)
  - `longest` (Number, Default: 0)
  - `lastActivity` (Date)
- `isVerified` (Boolean, Default: false)
- `isTeacher` (Boolean, Default: false)
- `isActive` (Boolean, Default: false)
- `role` (Enum: ['user', 'teacher', 'admin'], Default: 'user')
- `verificationToken` (String)
- `verificationExpire` (Date)
- `resetPasswordToken` (String)
- `resetPasswordExpire` (Date)
- `preferences` (Object)
  - `emailNotifications` (Boolean, Default: true)
  - `sessionReminders` (Boolean, Default: true)
  - `marketingEmails` (Boolean, Default: false)
  - `darkMode` (Boolean, Default: false)
- `skillsToTeach` (Array[Object])
  - `name` (String, Required)
  - `level` (Enum: ['beginner', 'intermediate', 'advanced', 'expert'])
  - `category` (String, Required)
  - `tokensPerHour` (Number, Default: 50)
- `skillsToLearn` (Array[Object])
  - `name` (String, Required)
  - `level` (Enum: ['beginner', 'intermediate', 'advanced', 'expert'])
  - `category` (String, Required)
  - `tokensPerHour` (Number, Default: 50)
- `followers` (Array[ObjectId], Ref: 'User')
- `following` (Array[ObjectId], Ref: 'User')
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

---

### 2. Skill

**Primary Key:** `_id`  
**Description:** Skills/courses available on the platform

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `name` (String, Required, Unique)
- `category` (String, Required, Enum: ['Programming & Tech', 'Design & Creative', 'Languages', 'Business & Finance', 'Health & Wellness', 'Music & Arts', 'Cooking & Culinary', 'Sports & Fitness', 'Photography & Video', 'Writing & Content', 'Marketing & Sales', 'Science & Math', 'Other'])
- `description` (String, Max: 500)
- `icon` (String, Default: '🎯')
- `difficulty` (Enum: ['beginner', 'intermediate', 'advanced', 'expert'], Default: 'beginner')
- `tags` (Array[String])
- `totalTeachers` (Number, Default: 0)
- `totalLearners` (Number, Default: 0)
- `averageRating` (Number, Min: 0, Max: 5, Default: 0)
- `popularityScore` (Number, Default: 0)
- `isActive` (Boolean, Default: true)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

---

### 3. Session

**Primary Key:** `_id`  
**Description:** Learning/teaching sessions between users

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `teacher` (ObjectId, Required, Ref: 'User', FK)
- `learner` (ObjectId, Required, Ref: 'User', FK)
- `skill` (String, Required)
- `skillCategory` (String)
- `title` (String, Required)
- `description` (String)
- `scheduledAt` (Date, Required)
- `duration` (Number, Required, Default: 60, Minutes)
- `endTime` (Date, Auto-calculated)
- `sessionType` (Enum: ['one-on-one', 'group', 'workshop'], Default: 'one-on-one')
- `isSkillExchange` (Boolean, Default: false)
- `tokensCharged` (Number, Default: 0)
- `videoRoomId` (String)
- `videoToken` (String)
- `agoraChannel` (String)
- `status` (Enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'], Default: 'scheduled')
- `teacherRating` (Object)
  - `rating` (Number, Min: 1, Max: 5)
  - `review` (String)
  - `ratedAt` (Date)
- `learnerRating` (Object)
  - `rating` (Number, Min: 1, Max: 5)
  - `review` (String)
  - `ratedAt` (Date)
- `teacherNotes` (String)
- `learnerNotes` (String)
- `teacherJoinedAt` (Date)
- `learnerJoinedAt` (Date)
- `actualStartTime` (Date)
- `actualEndTime` (Date)
- `cancelledBy` (ObjectId, Ref: 'User', FK)
- `cancellationReason` (String)
- `cancelledAt` (Date)
- `remindersSent` (Boolean, Default: false)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with User (teacher)
- **Many-to-One** with User (learner)
- **One-to-One** with Recording
- **One-to-One** with SessionSummary
- **One-to-Many** with Transaction
- **One-to-Many** with Notification

---

### 4. Transaction

**Primary Key:** `_id`  
**Description:** Token transactions (credits/debits)

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `user` (ObjectId, Required, Ref: 'User', FK)
- `type` (Enum: ['credit', 'debit'], Required)
- `amount` (Number, Required, Min: 0)
- `reason` (Enum: ['purchase', 'session_teaching', 'session_learning', 'referral', 'challenge', 'streak', 'admin_adjustment', 'refund', 'welcome_bonus'], Required)
- `description` (String)
- `session` (ObjectId, Ref: 'Session', FK)
- `payment` (ObjectId, Ref: 'Payment', FK)
- `balanceBefore` (Number)
- `balanceAfter` (Number, Required)
- `metadata` (Mixed)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with User
- **Many-to-One** with Session (optional)
- **Many-to-One** with Payment (optional)

---

### 5. Payment

**Primary Key:** `_id`  
**Description:** Payment records for token purchases

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `user` (ObjectId, Required, Ref: 'User', FK)
- `amount` (Number, Required, Min: 0)
- `currency` (String, Default: 'USD')
- `tokensAmount` (Number, Required)
- `packageType` (Enum: ['basic', 'pro', 'premium', 'custom'], Required)
- `stripePaymentIntentId` (String)
- `stripePaymentMethodId` (String)
- `stripeCustomerId` (String)
- `status` (Enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'], Default: 'pending')
- `paymentMethod` (Enum: ['stripe', 'paypal', 'admin'], Default: 'stripe')
- `receiptUrl` (String)
- `receiptNumber` (String, Auto-generated)
- `refundReason` (String)
- `refundedAt` (Date)
- `refundAmount` (Number)
- `metadata` (Mixed)
- `failureReason` (String)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with User
- **One-to-Many** with Transaction

---

### 6. Conversation

**Primary Key:** `_id`  
**Description:** Chat conversations between users

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `participants` (Array[ObjectId], Required, Ref: 'User', FK)
- `lastMessage` (ObjectId, Ref: 'Message', FK)
- `lastMessageAt` (Date)
- `unreadCount` (Map: ObjectId -> Number, Default: {})
- `type` (Enum: ['direct', 'group'], Default: 'direct')
- `groupName` (String)
- `groupAvatar` (String)
- `admin` (ObjectId, Ref: 'User', FK)
- `isActive` (Boolean, Default: true)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-Many** with User (participants)
- **One-to-Many** with Message
- **Many-to-One** with User (admin - for groups)

---

### 7. Message

**Primary Key:** `_id`  
**Description:** Individual messages in conversations

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `conversation` (ObjectId, Required, Ref: 'Conversation', FK)
- `sender` (ObjectId, Required, Ref: 'User', FK)
- `content` (String, Required, Max: 2000)
- `messageType` (Enum: ['text', 'image', 'file', 'session-request', 'system'], Default: 'text')
- `fileUrl` (String)
- `fileName` (String)
- `readBy` (Array[Object])
  - `user` (ObjectId, Ref: 'User')
  - `readAt` (Date)
- `relatedSession` (ObjectId, Ref: 'Session', FK)
- `isDeleted` (Boolean, Default: false)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with Conversation
- **Many-to-One** with User (sender)
- **Many-to-One** with Session (optional)

---

### 8. Notification

**Primary Key:** `_id`  
**Description:** User notifications

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `recipient` (ObjectId, Required, Ref: 'User', FK)
- `sender` (ObjectId, Ref: 'User', FK)
- `type` (Enum: ['session_booked', 'session_cancelled', 'session_reminder_24h', 'session_reminder_1h', 'session_starting', 'session_started', 'session_ended', 'session_rated', 'recording_ready', 'recording_expiring', 'tokens_received', 'tokens_low', 'new_message', 'profile_viewed', 'new_follower', 'teacher_approved', 'system', 'admin'], Required)
- `title` (String, Required)
- `message` (String, Required)
- `icon` (String)
- `session` (ObjectId, Ref: 'Session', FK)
- `recording` (ObjectId, Ref: 'Recording', FK)
- `transaction` (ObjectId, Ref: 'Transaction', FK)
- `actionUrl` (String)
- `actionText` (String)
- `isRead` (Boolean, Default: false)
- `readAt` (Date)
- `emailSent` (Boolean, Default: false)
- `emailSentAt` (Date)
- `pushSent` (Boolean, Default: false)
- `pushSentAt` (Date)
- `inAppDelivered` (Boolean, Default: true)
- `priority` (Enum: ['low', 'normal', 'high', 'urgent'], Default: 'normal')
- `expiresAt` (Date)
- `metadata` (Mixed)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with User (recipient)
- **Many-to-One** with User (sender, optional)
- **Many-to-One** with Session (optional)
- **Many-to-One** with Recording (optional)
- **Many-to-One** with Transaction (optional)

---

### 9. Recording

**Primary Key:** `_id`  
**Description:** Video session recordings

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `session` (ObjectId, Required, Ref: 'Session', FK, Unique)
- `teacher` (ObjectId, Required, Ref: 'User', FK)
- `learner` (ObjectId, Required, Ref: 'User', FK)
- `skill` (String, Required)
- `title` (String, Required)
- `description` (String)
- `resourceId` (String)
- `sid` (String)
- `agoraChannel` (String, Required)
- `videoUrl` (String)
- `videoPublicId` (String)
- `thumbnailUrl` (String)
- `fileSize` (Number)
- `format` (String, Default: 'mp4')
- `duration` (Number, Default: 0, Seconds)
- `quality` (Enum: ['HD', 'SD', 'AUTO'], Default: 'AUTO')
- `resolution` (String)
- `status` (Enum: ['recording', 'processing', 'ready', 'failed', 'deleted'], Default: 'recording')
- `recordingStartedAt` (Date)
- `recordingEndedAt` (Date)
- `processingStartedAt` (Date)
- `processedAt` (Date)
- `isPublic` (Boolean, Default: false)
- `accessToken` (String)
- `tokenExpiresAt` (Date)
- `views` (Number, Default: 0)
- `viewHistory` (Array[Object])
  - `user` (ObjectId, Ref: 'User')
  - `viewedAt` (Date)
  - `duration` (Number)
- `scheduledAt` (Date)
- `expiresAt` (Date, Default: 30 days)
- `errorMessage` (String)
- `failureReason` (String)
- `hasScreenShare` (Boolean, Default: false)
- `hasWhiteboard` (Boolean, Default: false)
- `participants` (Array[Object])
  - `user` (ObjectId, Ref: 'User')
  - `joinedAt` (Date)
  - `leftAt` (Date)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **One-to-One** with Session
- **Many-to-One** with User (teacher)
- **Many-to-One** with User (learner)
- **One-to-Many** with Notification

---

### 10. Availability

**Primary Key:** `_id`  
**Description:** Teacher availability schedules

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `teacher` (ObjectId, Required, Ref: 'User', FK)
- `dayOfWeek` (Number, Required, Min: 0, Max: 6, 0=Sunday)
- `timeSlots` (Array[Object])
  - `startTime` (String, Required, Format: "HH:MM")
  - `endTime` (String, Required, Format: "HH:MM")
  - `isBooked` (Boolean, Default: false)
  - `bookedBy` (ObjectId, Ref: 'User', FK)
  - `session` (ObjectId, Ref: 'Session', FK)
- `specificDate` (Date)
- `isActive` (Boolean, Default: true)
- `timezone` (String, Default: 'UTC')
- `isRecurring` (Boolean, Default: true)
- `validFrom` (Date)
- `validUntil` (Date)
- `skills` (Array[String])
- `notes` (String)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with User (teacher)
- **Many-to-One** with Session (via timeSlots)

---

### 11. SessionSummary

**Primary Key:** `_id`  
**Description:** AI-generated session summaries and analysis

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `session` (ObjectId, Required, Ref: 'Session', FK, Unique)
- `transcript` (Array[Object])
  - `speaker` (Enum: ['teacher', 'learner'], Required)
  - `speakerName` (String)
  - `text` (String)
  - `timestamp` (Number)
  - `startTime` (Date)
  - `endTime` (Date)
- `summary` (Object)
  - `overview` (String)
  - `mainTopics` (Array[Object])
    - `topic` (String)
    - `description` (String)
    - `timestamp` (Number)
  - `keyLearningPoints` (Array[String])
  - `actionItems` (Array[Object])
    - `description` (String)
    - `assignedTo` (Enum: ['teacher', 'learner', 'both'])
  - `highlights` (Array[Object])
    - `description` (String)
    - `timestamp` (Number)
    - `importance` (Enum: ['low', 'medium', 'high'])
- `analysis` (Object)
  - `engagement` (Object)
    - `score` (Number, Min: 0, Max: 10)
    - `teacherParticipation` (Number)
    - `learnerParticipation` (Number)
    - `interactionQuality` (String)
  - `teachingQuality` (Object)
    - `score` (Number, Min: 0, Max: 10)
    - `clarity` (Number)
    - `pacing` (Number)
    - `responsiveness` (Number)
    - `feedback` (String)
  - `learningProgress` (Object)
    - `score` (Number, Min: 0, Max: 10)
    - `questionsAsked` (Number)
    - `conceptsGrasped` (Array[String])
    - `areasNeedingImprovement` (Array[String])
  - `overallRating` (Number, Min: 0, Max: 10)
  - `recommendations` (Array[String])
- `statistics` (Object)
  - `totalDuration` (Number)
  - `teacherSpeakTime` (Number)
  - `learnerSpeakTime` (Number)
  - `silenceTime` (Number)
  - `wordsSpoken` (Object)
    - `teacher` (Number)
    - `learner` (Number)
- `processingStatus` (Enum: ['pending', 'processing', 'completed', 'failed'], Default: 'pending')
- `processingError` (String)
- `transcriptFileUrl` (String)
- `recordingMetadata` (Object)
  - `recordingId` (String)
  - `recordingUrl` (String)
  - `duration` (Number)
- `generatedAt` (Date, Default: Date.now)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **One-to-One** with Session

---

### 12. OTP

**Primary Key:** `_id`  
**Description:** One-time passwords for authentication

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `identifier` (String, Required, Index)
- `otp` (String, Required, Hashed)
- `expiresAt` (Date, Required, Index)
- `attempts` (Number, Default: 0)
- `maxAttempts` (Number, Default: 5)
- `isUsed` (Boolean, Default: false)
- `createdAt` (Date, Auto)

---

### 13. ActivationToken

**Primary Key:** `_id`  
**Description:** Email activation tokens

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `user` (ObjectId, Required, Ref: 'User', FK, Index)
- `token` (String, Required, Unique, Index)
- `expiresAt` (Date, Required, Index)
- `isUsed` (Boolean, Default: false)
- `createdAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with User

---

## Admin Models

### 14. Admin

**Primary Key:** `_id`  
**Description:** Admin users for platform management

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `name` (String, Required)
- `email` (String, Required, Unique, Lowercase)
- `password` (String, Required, Hashed, Min: 6)
- `role` (Enum: ['super_admin', 'moderator', 'support'], Default: 'moderator')
- `permissions` (Object)
  - `users` (Boolean, Default: true)
  - `teachers` (Boolean, Default: true)
  - `skills` (Boolean, Default: true)
  - `sessions` (Boolean, Default: true)
  - `transactions` (Boolean, Default: false)
  - `reports` (Boolean, Default: true)
  - `reviews` (Boolean, Default: true)
  - `notifications` (Boolean, Default: false)
  - `settings` (Boolean, Default: false)
  - `analytics` (Boolean, Default: true)
- `avatar` (String, Default: Generated URL)
- `isActive` (Boolean, Default: true)
- `lastLogin` (Date)
- `loginHistory` (Array[Object])
  - `ip` (String)
  - `userAgent` (String)
  - `timestamp` (Date)
- `createdBy` (ObjectId, Ref: 'Admin', FK)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with Admin (createdBy)
- **One-to-Many** with ActivityLog
- **One-to-Many** with Report (assignedTo)
- **One-to-Many** with SystemNotification
- **One-to-Many** with SystemSettings

---

### 15. ActivityLog

**Primary Key:** `_id`  
**Description:** Admin activity audit log

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `admin` (ObjectId, Required, Ref: 'Admin', FK)
- `action` (Enum: ['login', 'logout', 'user_view', 'user_update', 'user_ban', 'user_unban', 'user_delete', 'teacher_verify', 'teacher_reject', 'skill_create', 'skill_update', 'skill_delete', 'category_create', 'category_update', 'category_delete', 'session_view', 'session_cancel', 'session_refund', 'transaction_view', 'transaction_adjust', 'report_view', 'report_resolve', 'report_dismiss', 'review_delete', 'review_hide', 'notification_send', 'settings_update', 'admin_create', 'admin_update', 'admin_delete'], Required)
- `targetType` (Enum: ['user', 'teacher', 'skill', 'category', 'session', 'transaction', 'report', 'review', 'notification', 'settings', 'admin'])
- `targetId` (ObjectId)
- `details` (Mixed)
- `ipAddress` (String)
- `userAgent` (String)
- `status` (Enum: ['success', 'failed'], Default: 'success')
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with Admin

---

### 16. Report

**Primary Key:** `_id`  
**Description:** User reports for moderation

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `reporter` (ObjectId, Required, Ref: 'User', FK)
- `reportedUser` (ObjectId, Ref: 'User', FK)
- `reportedSession` (ObjectId, Ref: 'Session', FK)
- `reportedReview` (ObjectId, Ref: 'Review', FK)
- `type` (Enum: ['user', 'session', 'review', 'spam', 'fraud', 'inappropriate', 'other'], Required)
- `reason` (String, Required)
- `description` (String, Required)
- `evidence` (Array[String])
- `status` (Enum: ['pending', 'under_review', 'resolved', 'dismissed'], Default: 'pending')
- `priority` (Enum: ['low', 'medium', 'high', 'critical'], Default: 'medium')
- `assignedTo` (ObjectId, Ref: 'Admin', FK)
- `resolution` (Object)
  - `action` (Enum: ['no_action', 'warning', 'suspension', 'ban', 'content_removed'])
  - `notes` (String)
  - `resolvedBy` (ObjectId, Ref: 'Admin')
  - `resolvedAt` (Date)
- `adminNotes` (Array[Object])
  - `admin` (ObjectId, Ref: 'Admin')
  - `note` (String)
  - `createdAt` (Date)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with User (reporter)
- **Many-to-One** with User (reportedUser, optional)
- **Many-to-One** with Session (optional)
- **Many-to-One** with Admin (assignedTo, optional)
- **Many-to-One** with Admin (resolution.resolvedBy, optional)

---

### 17. SystemNotification

**Primary Key:** `_id`  
**Description:** System-wide notifications

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `title` (String, Required)
- `message` (String, Required)
- `type` (Enum: ['announcement', 'maintenance', 'update', 'promotion', 'warning', 'info'], Default: 'info')
- `targetAudience` (Enum: ['all', 'users', 'teachers', 'verified_teachers', 'new_users'], Default: 'all')
- `priority` (Enum: ['low', 'medium', 'high'], Default: 'medium')
- `channels` (Object)
  - `inApp` (Boolean, Default: true)
  - `email` (Boolean, Default: false)
  - `push` (Boolean, Default: false)
- `scheduledFor` (Date)
- `expiresAt` (Date)
- `status` (Enum: ['draft', 'scheduled', 'sent', 'cancelled'], Default: 'draft')
- `sentAt` (Date)
- `sentTo` (Number, Default: 0)
- `readBy` (Array[Object])
  - `user` (ObjectId, Ref: 'User')
  - `readAt` (Date)
- `createdBy` (ObjectId, Required, Ref: 'Admin', FK)
- `metadata` (Object)
  - `link` (String)
  - `imageUrl` (String)
  - `actionButton` (Object)
    - `text` (String)
    - `url` (String)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with Admin (createdBy)
- **Many-to-Many** with User (readBy)

---

### 18. SystemSettings

**Primary Key:** `_id`  
**Description:** System configuration settings

#### Attributes:

- `_id` (ObjectId) - Primary Key
- `key` (String, Required, Unique)
- `value` (Mixed, Required)
- `category` (Enum: ['general', 'tokens', 'sessions', 'email', 'security', 'features'], Default: 'general')
- `description` (String)
- `lastUpdatedBy` (ObjectId, Ref: 'Admin', FK)
- `createdAt` (Date, Auto)
- `updatedAt` (Date, Auto)

#### Relationships:

- **Many-to-One** with Admin (lastUpdatedBy)

---

## Relationship Summary

### Core Relationships:

1. **User ↔ User**: Many-to-Many (followers/following)
2. **User → Session**: One-to-Many (as teacher)
3. **User → Session**: One-to-Many (as learner)
4. **Session → Recording**: One-to-One
5. **Session → SessionSummary**: One-to-One
6. **Session → Transaction**: One-to-Many
7. **Session → Notification**: One-to-Many
8. **User → Transaction**: One-to-Many
9. **User → Payment**: One-to-Many
10. **Payment → Transaction**: One-to-Many
11. **User → Conversation**: Many-to-Many (participants)
12. **Conversation → Message**: One-to-Many
13. **User → Message**: One-to-Many (sender)
14. **User → Notification**: One-to-Many (recipient)
15. **User → Availability**: One-to-Many (teacher)
16. **Availability → Session**: Many-to-One (via timeSlots)
17. **User → OTP**: One-to-Many (by identifier)
18. **User → ActivationToken**: One-to-Many
19. **Admin → ActivityLog**: One-to-Many
20. **Admin → Report**: One-to-Many (assignedTo)
21. **User → Report**: One-to-Many (reporter, reportedUser)
22. **Admin → SystemNotification**: One-to-Many
23. **Admin → SystemSettings**: One-to-Many (lastUpdatedBy)

---

## Indexes

### User

- `email` (Unique)
- `followers`, `following`
- Text search on `name`, `email`

### Skill

- `name` (Unique)
- Text search on `name`, `description`, `tags`
- `category`, `popularityScore`

### Session

- `teacher`, `scheduledAt` (Compound)
- `learner`, `scheduledAt` (Compound)
- `status`, `scheduledAt` (Compound)

### Transaction

- `user`, `createdAt` (Compound)
- `type`, `reason`

### Conversation

- `participants`
- `lastMessageAt`

### Message

- `conversation`, `createdAt` (Compound)
- `sender`

### Notification

- `recipient`, `isRead` (Compound)
- `recipient`, `createdAt` (Compound)
- `expiresAt` (TTL Index)

### Recording

- `session` (Unique)
- `teacher`, `createdAt` (Compound)
- `learner`, `createdAt` (Compound)
- `status`
- `expiresAt` (TTL Index)

### Availability

- `teacher`, `dayOfWeek` (Compound)
- `teacher`, `specificDate` (Compound)
- `teacher`, `isActive` (Compound)

### OTP

- `identifier`
- `expiresAt` (TTL Index)

### ActivationToken

- `user`
- `token` (Unique)
- `expiresAt` (TTL Index)

### ActivityLog

- `admin`, `createdAt` (Compound)
- `action`, `createdAt` (Compound)
- `targetType`, `targetId` (Compound)

### Report

- `status`, `priority` (Compound)
- `reporter`
- `reportedUser`

---

## Notes

- All entities have `createdAt` and `updatedAt` timestamps
- Foreign keys use Mongoose ObjectId references
- TTL indexes are used for automatic cleanup of expired documents
- Text search indexes are available on User and Skill
- Compound indexes optimize common query patterns
