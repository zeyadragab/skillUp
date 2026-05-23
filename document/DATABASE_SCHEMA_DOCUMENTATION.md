# skillup Platform - Complete Database Schema Documentation

## Table of Contents

1. [Overview](#overview)
2. [Collections Summary](#collections-summary)
3. [Detailed Schema](#detailed-schema)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Embedded vs Referenced Data](#embedded-vs-referenced-data)

---

## Overview

**Database Type:** MongoDB (NoSQL Document Database)
**Total Collections:** 13
**ODM:** Mongoose

The skillup platform uses MongoDB with Mongoose ODM for flexible, scalable data management. The schema is designed to support a peer-to-peer skill exchange platform with token-based economy, real-time messaging, video sessions, and comprehensive user tracking.

---

## Collections Summary

| Collection          | Documents          | Purpose                                    | Key Relationships                      |
| ------------------- | ------------------ | ------------------------------------------ | -------------------------------------- |
| `users`             | User accounts      | Store user profiles, skills, tokens, stats | Self-referencing (followers/following) |
| `skills`            | Skill definitions  | Master list of available skills            | Referenced by users                    |
| `sessions`          | Learning sessions  | Session bookings and tracking              | References users                       |
| `transactions`      | Token transactions | Track all token movements                  | References users, sessions, payments   |
| `payments`          | Stripe payments    | Payment processing records                 | References users                       |
| `conversations`     | Chat conversations | Message thread containers                  | References users, messages             |
| `messages`          | Chat messages      | Individual messages                        | References conversations, users        |
| `notifications`     | User notifications | System and user notifications              | References users, sessions, recordings |
| `recordings`        | Session recordings | Video recording metadata                   | 1:1 with sessions, references users    |
| `availability`      | Teacher schedules  | Teacher availability slots                 | References users (teachers)            |
| `otps`              | OTP codes          | One-time password authentication           | Standalone                             |
| `activation_tokens` | Activation tokens  | Email verification tokens                  | References users                       |
| `session_summaries` | AI summaries       | AI-generated session analysis              | 1:1 with sessions                      |

---

## Detailed Schema

### 1. Users Collection

**Collection Name:** `users`
**Purpose:** Core user accounts with skills, gamification, and preferences

#### Fields

| Field                            | Type              | Required | Default        | Description                              |
| -------------------------------- | ----------------- | -------- | -------------- | ---------------------------------------- |
| `_id`                            | ObjectId          | Yes      | Auto           | Primary key                              |
| `name`                           | String(50)        | Yes      | -              | User full name                           |
| `email`                          | String            | Yes      | -              | Unique email address                     |
| `password`                       | String            | Yes      | -              | Bcrypt hashed password (select: false)   |
| `avatar`                         | String            | No       | Generated      | Profile picture URL                      |
| `bio`                            | String(500)       | No       | -              | User biography                           |
| `country`                        | String            | No       | -              | User country                             |
| `timeZone`                       | String            | No       | -              | User timezone                            |
| `languages`                      | Array[String]     | No       | []             | Languages spoken                         |
| **Skills (Embedded)**            |
| `skillsToTeach`                  | Array[Object]     | No       | []             | Skills user can teach                    |
| `skillsToTeach.name`             | String            | Yes      | -              | Skill name                               |
| `skillsToTeach.level`            | Enum              | No       | 'intermediate' | beginner, intermediate, advanced, expert |
| `skillsToTeach.category`         | String            | Yes      | -              | Skill category                           |
| `skillsToTeach.tokensPerHour`    | Number            | No       | 50             | Tokens charged per hour                  |
| `skillsToLearn`                  | Array[Object]     | No       | []             | Skills user wants to learn               |
| **Token System**                 |
| `tokens`                         | Number            | No       | 50             | Current token balance                    |
| `tokensEarned`                   | Number            | No       | 0              | Total tokens earned                      |
| `tokensSpent`                    | Number            | No       | 0              | Total tokens spent                       |
| **Statistics**                   |
| `totalSessionsTaught`            | Number            | No       | 0              | Total sessions as teacher                |
| `totalSessionsLearned`           | Number            | No       | 0              | Total sessions as learner                |
| `averageRating`                  | Number(1 decimal) | No       | 0              | Average rating (0-5)                     |
| `totalRatings`                   | Number            | No       | 0              | Total number of ratings                  |
| **Gamification**                 |
| `level`                          | Number            | No       | 1              | User level                               |
| `experience`                     | Number            | No       | 0              | Experience points                        |
| `badges`                         | Array[Object]     | No       | []             | Earned badges                            |
| `badges.name`                    | String            | Yes      | -              | Badge name                               |
| `badges.icon`                    | String            | Yes      | -              | Badge icon                               |
| `badges.earnedAt`                | Date              | Yes      | -              | When earned                              |
| `streak.current`                 | Number            | No       | 0              | Current daily streak                     |
| `streak.longest`                 | Number            | No       | 0              | Longest streak achieved                  |
| `streak.lastActivity`            | Date              | No       | -              | Last activity date                       |
| **Account Status**               |
| `isVerified`                     | Boolean           | No       | false          | Email verified                           |
| `isTeacher`                      | Boolean           | No       | false          | Teacher status approved                  |
| `isActive`                       | Boolean           | No       | false          | Account activated                        |
| `role`                           | Enum              | No       | 'user'         | user, teacher, admin                     |
| **Verification**                 |
| `verificationToken`              | String            | No       | -              | Email verification token                 |
| `verificationExpire`             | Date              | No       | -              | Verification expiry                      |
| `resetPasswordToken`             | String            | No       | -              | Password reset token                     |
| `resetPasswordExpire`            | Date              | No       | -              | Reset expiry                             |
| **Preferences (Embedded)**       |
| `preferences.emailNotifications` | Boolean           | No       | true           | Email notifications enabled              |
| `preferences.sessionReminders`   | Boolean           | No       | true           | Session reminders enabled                |
| `preferences.marketingEmails`    | Boolean           | No       | false          | Marketing emails enabled                 |
| `preferences.darkMode`           | Boolean           | No       | false          | Dark mode preference                     |
| **Social (References)**          |
| `followers`                      | Array[ObjectId]   | No       | []             | User IDs following this user             |
| `following`                      | Array[ObjectId]   | No       | []             | User IDs this user follows               |
| **Timestamps**                   |
| `createdAt`                      | Date              | Auto     | now()          | Account creation                         |
| `updatedAt`                      | Date              | Auto     | now()          | Last update                              |

#### Indexes

```javascript
email: unique
(isTeacher, isActive): compound
level: single
averageRating: single
createdAt: single
```

#### Methods

- `comparePassword(candidatePassword)` - Compare password
- `updateRating(newRating)` - Update average rating
- `addTokens(amount, reason)` - Add tokens
- `deductTokens(amount, reason)` - Deduct tokens
- `hasEnoughTokens(amount)` - Check token balance

---

### 2. Skills Collection

**Collection Name:** `skills`
**Purpose:** Master list of all available skills on the platform

#### Fields

| Field             | Type          | Required | Default    | Description                              |
| ----------------- | ------------- | -------- | ---------- | ---------------------------------------- |
| `_id`             | ObjectId      | Yes      | Auto       | Primary key                              |
| `name`            | String(100)   | Yes      | -          | Unique skill name                        |
| `category`        | Enum          | Yes      | -          | Skill category (13 options)              |
| `description`     | String(500)   | No       | -          | Skill description                        |
| `icon`            | String        | No       | '🎯'       | Emoji icon                               |
| `difficulty`      | Enum          | No       | 'beginner' | beginner, intermediate, advanced, expert |
| `tags`            | Array[String] | No       | []         | Search tags                              |
| `totalTeachers`   | Number        | No       | 0          | Number of teachers                       |
| `totalLearners`   | Number        | No       | 0          | Number of learners                       |
| `averageRating`   | Number        | No       | 0          | Average skill rating (0-5)               |
| `popularityScore` | Number        | No       | 0          | Calculated popularity                    |
| `isActive`        | Boolean       | No       | true       | Skill active status                      |
| `createdAt`       | Date          | Auto     | now()      | Creation date                            |
| `updatedAt`       | Date          | Auto     | now()      | Last update                              |

#### Categories

- Programming & Tech
- Design & Creative
- Languages
- Business & Finance
- Health & Wellness
- Music & Arts
- Cooking & Culinary
- Sports & Fitness
- Photography & Video
- Writing & Content
- Marketing & Sales
- Science & Math
- Other

#### Indexes

```javascript
name: unique
(category, popularityScore): compound, descending on popularityScore
(name, description, tags): text search
```

#### Methods

- `updatePopularity()` - Recalculate popularity score

---

### 3. Sessions Collection

**Collection Name:** `sessions`
**Purpose:** Learning session bookings and tracking

#### Fields

| Field                   | Type        | Required | Default      | Description                                           |
| ----------------------- | ----------- | -------- | ------------ | ----------------------------------------------------- |
| `_id`                   | ObjectId    | Yes      | Auto         | Primary key                                           |
| `teacher`               | ObjectId    | Yes      | -            | Ref: users.\_id (teacher)                             |
| `learner`               | ObjectId    | Yes      | -            | Ref: users.\_id (learner)                             |
| `skill`                 | String      | Yes      | -            | Skill being taught                                    |
| `skillCategory`         | String      | No       | -            | Skill category                                        |
| **Session Details**     |
| `title`                 | String(200) | Yes      | -            | Session title                                         |
| `description`           | Text        | No       | -            | Session description                                   |
| **Scheduling**          |
| `scheduledAt`           | Date        | Yes      | -            | Scheduled start time                                  |
| `duration`              | Number      | No       | 60           | Duration in minutes                                   |
| `endTime`               | Date        | No       | Calculated   | Calculated end time                                   |
| **Session Type**        |
| `sessionType`           | Enum        | No       | 'one-on-one' | one-on-one, group, workshop                           |
| `isSkillExchange`       | Boolean     | No       | false        | Skill swap vs token payment                           |
| **Pricing**             |
| `tokensCharged`         | Number      | No       | 0            | Tokens charged                                        |
| **Video Call**          |
| `videoRoomId`           | String      | No       | -            | Video room ID                                         |
| `videoToken`            | String      | No       | -            | Video access token                                    |
| `agoraChannel`          | String      | No       | -            | Agora channel name                                    |
| **Status**              |
| `status`                | Enum        | No       | 'scheduled'  | scheduled, in-progress, completed, cancelled, no-show |
| **Ratings (Embedded)**  |
| `teacherRating.rating`  | Number      | No       | -            | 1-5 rating                                            |
| `teacherRating.review`  | String      | No       | -            | Review text                                           |
| `teacherRating.ratedAt` | Date        | No       | -            | Rating timestamp                                      |
| `learnerRating`         | Object      | No       | -            | Same structure as teacherRating                       |
| **Notes**               |
| `teacherNotes`          | Text        | No       | -            | Teacher's notes                                       |
| `learnerNotes`          | Text        | No       | -            | Learner's notes                                       |
| **Attendance**          |
| `teacherJoinedAt`       | Date        | No       | -            | Teacher join time                                     |
| `learnerJoinedAt`       | Date        | No       | -            | Learner join time                                     |
| `actualStartTime`       | Date        | No       | -            | Actual start                                          |
| `actualEndTime`         | Date        | No       | -            | Actual end                                            |
| **Cancellation**        |
| `cancelledBy`           | ObjectId    | No       | -            | Ref: users.\_id                                       |
| `cancellationReason`    | Text        | No       | -            | Cancellation reason                                   |
| `cancelledAt`           | Date        | No       | -            | Cancellation time                                     |
| **Reminders**           |
| `remindersSent`         | Boolean     | No       | false        | Reminders sent flag                                   |
| **Timestamps**          |
| `createdAt`             | Date        | Auto     | now()        | Creation                                              |
| `updatedAt`             | Date        | Auto     | now()        | Last update                                           |

#### Indexes

```javascript
(teacher, scheduledAt): compound, descending on scheduledAt
(learner, scheduledAt): compound, descending on scheduledAt
(status, scheduledAt): compound
agoraChannel: single
```

#### Pre-save Hook

- Automatically calculates `endTime` from `scheduledAt` + `duration`

#### Static Methods

- `findUpcoming(userId)` - Find upcoming sessions for user

#### Instance Methods

- `canCancel()` - Check if session can be cancelled (24hrs+ notice)

---

### 4. Transactions Collection

**Collection Name:** `transactions`
**Purpose:** Track all token movements for audit trail

#### Fields

| Field           | Type     | Required | Default | Description                             |
| --------------- | -------- | -------- | ------- | --------------------------------------- |
| `_id`           | ObjectId | Yes      | Auto    | Primary key                             |
| `user`          | ObjectId | Yes      | -       | Ref: users.\_id                         |
| `type`          | Enum     | Yes      | -       | credit, debit                           |
| `amount`        | Number   | Yes      | -       | Transaction amount (positive)           |
| `reason`        | Enum     | Yes      | -       | Transaction reason (9 options)          |
| `description`   | Text     | No       | -       | Additional description                  |
| `session`       | ObjectId | No       | -       | Ref: sessions.\_id (if session-related) |
| `payment`       | ObjectId | No       | -       | Ref: payments.\_id (if payment-related) |
| `balanceBefore` | Number   | No       | -       | Balance before transaction              |
| `balanceAfter`  | Number   | Yes      | -       | Balance after transaction               |
| `metadata`      | Mixed    | No       | -       | Additional metadata                     |
| `createdAt`     | Date     | Auto     | now()   | Transaction time                        |
| `updatedAt`     | Date     | Auto     | now()   | Last update                             |

#### Transaction Reasons

- `purchase` - Bought tokens
- `session_teaching` - Earned from teaching
- `session_learning` - Spent on learning
- `referral` - Referral bonus
- `challenge` - Challenge reward
- `streak` - Streak bonus
- `admin_adjustment` - Admin added/removed
- `refund` - Refund from cancelled session
- `welcome_bonus` - New user bonus

#### Indexes

```javascript
(user, createdAt): compound, descending on createdAt
(type, reason): compound
session: single
```

#### Static Methods

- `getUserHistory(userId, limit)` - Get user transaction history

---

### 5. Payments Collection

**Collection Name:** `payments`
**Purpose:** Stripe payment processing records

#### Fields

| Field                   | Type     | Required | Default        | Description                                      |
| ----------------------- | -------- | -------- | -------------- | ------------------------------------------------ |
| `_id`                   | ObjectId | Yes      | Auto           | Primary key                                      |
| `user`                  | ObjectId | Yes      | -              | Ref: users.\_id                                  |
| `amount`                | Number   | Yes      | -              | Payment amount in USD                            |
| `currency`              | String   | No       | 'USD'          | Currency code (uppercase)                        |
| `tokensAmount`          | Number   | Yes      | -              | Number of tokens purchased                       |
| `packageType`           | Enum     | Yes      | -              | basic, pro, premium, custom                      |
| **Stripe Details**      |
| `stripePaymentIntentId` | String   | No       | -              | Stripe payment intent ID                         |
| `stripePaymentMethodId` | String   | No       | -              | Stripe payment method ID                         |
| `stripeCustomerId`      | String   | No       | -              | Stripe customer ID                               |
| **Payment Status**      |
| `status`                | Enum     | No       | 'pending'      | pending, processing, succeeded, failed, refunded |
| `paymentMethod`         | Enum     | No       | 'stripe'       | stripe, paypal, admin                            |
| **Receipt**             |
| `receiptUrl`            | String   | No       | -              | Receipt URL                                      |
| `receiptNumber`         | String   | No       | Auto-generated | Format: SS-{timestamp}-{random}                  |
| **Refund**              |
| `refundReason`          | Text     | No       | -              | Refund reason                                    |
| `refundedAt`            | Date     | No       | -              | Refund timestamp                                 |
| `refundAmount`          | Number   | No       | -              | Refund amount                                    |
| **Metadata**            |
| `metadata`              | Mixed    | No       | -              | Additional metadata                              |
| `failureReason`         | Text     | No       | -              | Failure reason if failed                         |
| **Timestamps**          |
| `createdAt`             | Date     | Auto     | now()          | Payment time                                     |
| `updatedAt`             | Date     | Auto     | now()          | Last update                                      |

#### Token Packages

- Basic: 10 tokens for $9.99
- Pro: 25 tokens for $19.99
- Premium: 60 tokens for $39.99
- Custom: Variable amounts

#### Indexes

```javascript
(user, createdAt): compound, descending on createdAt
status: single
stripePaymentIntentId: unique
receiptNumber: unique
```

#### Pre-save Hook

- Auto-generates `receiptNumber` on creation

---

### 6. Conversations Collection

**Collection Name:** `conversations`
**Purpose:** Chat conversation containers

#### Fields

| Field                              | Type                | Required | Default  | Description                                  |
| ---------------------------------- | ------------------- | -------- | -------- | -------------------------------------------- |
| `_id`                              | ObjectId            | Yes      | Auto     | Primary key                                  |
| `participants`                     | Array[ObjectId]     | Yes      | -        | Ref: users.\_id (2 for direct, 2+ for group) |
| `lastMessage`                      | ObjectId            | No       | -        | Ref: messages.\_id                           |
| `lastMessageAt`                    | Date                | No       | -        | Last message timestamp                       |
| `unreadCount`                      | Map<String, Number> | No       | {}       | userId => unread count                       |
| `type`                             | Enum                | No       | 'direct' | direct, group                                |
| **Group Fields (if type = group)** |
| `groupName`                        | String(100)         | No       | -        | Group name                                   |
| `groupAvatar`                      | String              | No       | -        | Group avatar URL                             |
| `admin`                            | ObjectId            | No       | -        | Ref: users.\_id (group admin)                |
| **Status**                         |
| `isActive`                         | Boolean             | No       | true     | Conversation active                          |
| **Timestamps**                     |
| `createdAt`                        | Date                | Auto     | now()    | Creation                                     |
| `updatedAt`                        | Date                | Auto     | now()    | Last update                                  |

#### Indexes

```javascript
participants: single;
lastMessageAt: descending;
```

#### Pre-save Validation

- Direct conversations must have exactly 2 participants

#### Static Methods

- `findOrCreate(user1Id, user2Id)` - Find or create direct conversation

---

### 7. Messages Collection

**Collection Name:** `messages`
**Purpose:** Individual chat messages

#### Fields

| Field                      | Type          | Required | Default | Description                                |
| -------------------------- | ------------- | -------- | ------- | ------------------------------------------ |
| `_id`                      | ObjectId      | Yes      | Auto    | Primary key                                |
| `conversation`             | ObjectId      | Yes      | -       | Ref: conversations.\_id                    |
| `sender`                   | ObjectId      | Yes      | -       | Ref: users.\_id                            |
| `content`                  | String(2000)  | Yes      | -       | Message content                            |
| `messageType`              | Enum          | No       | 'text'  | text, image, file, session-request, system |
| **File Attachments**       |
| `fileUrl`                  | String        | No       | -       | File URL if file message                   |
| `fileName`                 | String        | No       | -       | Original filename                          |
| **Read Status (Embedded)** |
| `readBy`                   | Array[Object] | No       | []      | Read receipts                              |
| `readBy.user`              | ObjectId      | Yes      | -       | Ref: users.\_id                            |
| `readBy.readAt`            | Date          | No       | now()   | When read                                  |
| **Related Session**        |
| `relatedSession`           | ObjectId      | No       | -       | Ref: sessions.\_id (if session-request)    |
| **Status**                 |
| `isDeleted`                | Boolean       | No       | false   | Soft delete flag                           |
| **Timestamps**             |
| `createdAt`                | Date          | Auto     | now()   | Message sent time                          |
| `updatedAt`                | Date          | Auto     | now()   | Last update                                |

#### Indexes

```javascript
(conversation, createdAt): compound, descending on createdAt
sender: single
```

---

### 8. Notifications Collection

**Collection Name:** `notifications`
**Purpose:** System and user notifications

#### Fields

| Field                 | Type        | Required | Default  | Description                     |
| --------------------- | ----------- | -------- | -------- | ------------------------------- |
| `_id`                 | ObjectId    | Yes      | Auto     | Primary key                     |
| `recipient`           | ObjectId    | Yes      | -        | Ref: users.\_id (indexed)       |
| `sender`              | ObjectId    | No       | -        | Ref: users.\_id (if applicable) |
| **Notification Type** |
| `type`                | Enum        | Yes      | -        | Notification type (17 types)    |
| **Content**           |
| `title`               | String(200) | Yes      | -        | Notification title              |
| `message`             | Text        | Yes      | -        | Notification message            |
| `icon`                | String      | No       | -        | Emoji or icon name              |
| **Related Entities**  |
| `session`             | ObjectId    | No       | -        | Ref: sessions.\_id              |
| `recording`           | ObjectId    | No       | -        | Ref: recordings.\_id            |
| `transaction`         | ObjectId    | No       | -        | Ref: transactions.\_id          |
| **Action**            |
| `actionUrl`           | String      | No       | -        | URL to navigate when clicked    |
| `actionText`          | String(100) | No       | -        | Action button text              |
| **Status**            |
| `isRead`              | Boolean     | No       | false    | Read status                     |
| `readAt`              | Date        | No       | -        | Read timestamp                  |
| **Delivery Status**   |
| `emailSent`           | Boolean     | No       | false    | Email sent flag                 |
| `emailSentAt`         | Date        | No       | -        | Email sent time                 |
| `pushSent`            | Boolean     | No       | false    | Push notification sent          |
| `pushSentAt`          | Date        | No       | -        | Push sent time                  |
| `inAppDelivered`      | Boolean     | No       | true     | In-app always delivered         |
| **Priority**          |
| `priority`            | Enum        | No       | 'normal' | low, normal, high, urgent       |
| **Expiration**        |
| `expiresAt`           | Date        | No       | -        | Notification expiry (TTL)       |
| **Metadata**          |
| `metadata`            | Mixed       | No       | -        | Additional data                 |
| **Timestamps**        |
| `createdAt`           | Date        | Auto     | now()    | Creation                        |
| `updatedAt`           | Date        | Auto     | now()    | Last update                     |

#### Notification Types

- session_booked, session_cancelled, session_reminder_24h, session_reminder_1h
- session_starting, session_started, session_ended, session_rated
- recording_ready, recording_expiring
- tokens_received, tokens_low
- new_message, profile_viewed, new_follower
- teacher_approved, system, admin

#### Indexes

```javascript
(recipient, isRead): compound
(recipient, createdAt): compound, descending on createdAt
type: single
expiresAt: TTL index (auto-delete when expired)
```

#### Instance Methods

- `markAsRead()` - Mark notification as read
- `isExpired()` - Check if notification expired

#### Static Methods

- `createSessionBookingNotification(session, teacher, learner)`
- `createSessionReminderNotifications(session, hoursBeforeSession)`
- `createRecordingReadyNotification(recording, recipients)`
- `getUnreadNotifications(userId, limit)`
- `getUserNotifications(userId, options)`
- `markAllAsRead(userId)`
- `getUnreadCount(userId)`

---

### 9. Recordings Collection

**Collection Name:** `recordings`
**Purpose:** Video recording metadata and access control

#### Fields

| Field                       | Type          | Required | Default     | Description                                   |
| --------------------------- | ------------- | -------- | ----------- | --------------------------------------------- |
| `_id`                       | ObjectId      | Yes      | Auto        | Primary key                                   |
| `session`                   | ObjectId      | Yes      | -           | Ref: sessions.\_id (unique, 1:1)              |
| `teacher`                   | ObjectId      | Yes      | -           | Ref: users.\_id                               |
| `learner`                   | ObjectId      | Yes      | -           | Ref: users.\_id                               |
| `skill`                     | String        | Yes      | -           | Skill name                                    |
| **Recording Metadata**      |
| `title`                     | String(200)   | Yes      | -           | Recording title                               |
| `description`               | Text          | No       | -           | Recording description                         |
| **Agora Recording Info**    |
| `resourceId`                | String        | No       | -           | Agora cloud recording resource ID             |
| `sid`                       | String        | No       | -           | Agora recording SID                           |
| `agoraChannel`              | String        | Yes      | -           | Agora channel name                            |
| **Recording Files**         |
| `videoUrl`                  | String        | No       | -           | Primary video URL (Cloudinary/S3)             |
| `videoPublicId`             | String        | No       | -           | Cloudinary public ID                          |
| `thumbnailUrl`              | String        | No       | -           | Video thumbnail URL                           |
| `fileSize`                  | Number        | No       | -           | File size in bytes                            |
| `format`                    | String        | No       | 'mp4'       | Video format                                  |
| **Recording Details**       |
| `duration`                  | Number        | No       | 0           | Duration in seconds                           |
| `quality`                   | Enum          | No       | 'AUTO'      | HD, SD, AUTO                                  |
| `resolution`                | String        | No       | -           | e.g., "1920x1080"                             |
| **Recording Status**        |
| `status`                    | Enum          | No       | 'recording' | recording, processing, ready, failed, deleted |
| `recordingStartedAt`        | Date          | No       | -           | Recording start                               |
| `recordingEndedAt`          | Date          | No       | -           | Recording end                                 |
| `processingStartedAt`       | Date          | No       | -           | Processing start                              |
| `processedAt`               | Date          | No       | -           | Processing done                               |
| **Access Control**          |
| `isPublic`                  | Boolean       | No       | false       | Public access                                 |
| `accessToken`               | String        | No       | -           | Secure playback token                         |
| `tokenExpiresAt`            | Date          | No       | -           | Token expiry (24hrs)                          |
| **View Tracking**           |
| `views`                     | Number        | No       | 0           | Total view count                              |
| `viewHistory`               | Array[Object] | No       | []          | View records                                  |
| `viewHistory.user`          | ObjectId      | Yes      | -           | Ref: users.\_id                               |
| `viewHistory.viewedAt`      | Date          | Yes      | -           | View timestamp                                |
| `viewHistory.duration`      | Number        | No       | -           | Watch duration in seconds                     |
| **Timestamps**              |
| `scheduledAt`               | Date          | No       | -           | Original session time                         |
| `expiresAt`                 | Date          | No       | 30 days     | Recording expiry                              |
| **Error Handling**          |
| `errorMessage`              | Text          | No       | -           | Error message                                 |
| `failureReason`             | Text          | No       | -           | Failure reason                                |
| **Features**                |
| `hasScreenShare`            | Boolean       | No       | false       | Screen sharing used                           |
| `hasWhiteboard`             | Boolean       | No       | false       | Whiteboard used                               |
| **Participants (Embedded)** |
| `participants`              | Array[Object] | No       | []          | Participant records                           |
| `participants.user`         | ObjectId      | Yes      | -           | Ref: users.\_id                               |
| `participants.joinedAt`     | Date          | No       | -           | Join time                                     |
| `participants.leftAt`       | Date          | No       | -           | Leave time                                    |
| **Timestamps**              |
| `createdAt`                 | Date          | Auto     | now()       | Creation                                      |
| `updatedAt`                 | Date          | Auto     | now()       | Last update                                   |

#### Indexes

```javascript
session: unique
(teacher, createdAt): compound, descending on createdAt
(learner, createdAt): compound, descending on createdAt
status: single
expiresAt: single
accessToken: single
```

#### Virtual Fields

- `durationFormatted` - Human-readable duration (HH:MM:SS)
- `fileSizeMB` - File size in megabytes

#### Instance Methods

- `canAccess(userId)` - Check if user can access recording
- `isExpired()` - Check if recording expired
- `addView(userId, duration)` - Track view
- `generatePlaybackToken()` - Generate secure token

#### Static Methods

- `findUserRecordings(userId, options)` - Find user's recordings
- `findExpiredRecordings()` - Find recordings for cleanup

---

### 10. Availability Collection

**Collection Name:** `availability`
**Purpose:** Teacher availability scheduling

#### Fields

| Field                           | Type          | Required | Default | Description                          |
| ------------------------------- | ------------- | -------- | ------- | ------------------------------------ |
| `_id`                           | ObjectId      | Yes      | Auto    | Primary key                          |
| `teacher`                       | ObjectId      | Yes      | -       | Ref: users.\_id (indexed)            |
| **Day of Week**                 |
| `dayOfWeek`                     | Number        | No       | -       | 0=Sunday, 6=Saturday                 |
| **Time Slots (Embedded Array)** |
| `timeSlots`                     | Array[Object] | Yes      | []      | Available time slots                 |
| `timeSlots.startTime`           | String        | Yes      | -       | Format: "HH:MM" (24-hour)            |
| `timeSlots.endTime`             | String        | Yes      | -       | Format: "HH:MM" (24-hour)            |
| `timeSlots.isBooked`            | Boolean       | No       | false   | Booking status                       |
| `timeSlots.bookedBy`            | ObjectId      | No       | -       | Ref: users.\_id                      |
| `timeSlots.session`             | ObjectId      | No       | -       | Ref: sessions.\_id                   |
| **Specific Date**               |
| `specificDate`                  | Date          | No       | -       | Override dayOfWeek for specific date |
| **Status**                      |
| `isActive`                      | Boolean       | No       | true    | Availability active                  |
| **Timezone**                    |
| `timezone`                      | String        | No       | 'UTC'   | Teacher timezone                     |
| **Repeat Settings**             |
| `isRecurring`                   | Boolean       | No       | true    | Recurring availability               |
| `validFrom`                     | Date          | No       | -       | Valid from date                      |
| `validUntil`                    | Date          | No       | -       | Valid until date                     |
| **Skills**                      |
| `skills`                        | Array[String] | No       | []      | Skills available during this time    |
| **Notes**                       |
| `notes`                         | Text          | No       | -       | Availability notes                   |
| **Timestamps**                  |
| `createdAt`                     | Date          | Auto     | now()   | Creation                             |
| `updatedAt`                     | Date          | Auto     | now()   | Last update                          |

#### Indexes

```javascript
(teacher, dayOfWeek): compound
(teacher, specificDate): compound
(teacher, isActive): compound
```

#### Virtual Fields

- `dayName` - Day name (Sunday-Saturday)

#### Instance Methods

- `isSlotAvailable(startTime, endTime)` - Check slot availability
- `bookSlot(startTime, endTime, userId, sessionId)` - Book a slot
- `releaseSlot(sessionId)` - Release booked slot on cancellation

#### Static Methods

- `getAvailabilityForDate(teacherId, date)` - Get availability for specific date
- `getWeeklyAvailability(teacherId)` - Get weekly recurring availability
- `createDefaultAvailability(teacherId, timezone)` - Generate default 9-5 weekday schedule

---

### 11. OTPs Collection

**Collection Name:** `otps`
**Purpose:** One-time password authentication

#### Fields

| Field         | Type     | Required | Default | Description              |
| ------------- | -------- | -------- | ------- | ------------------------ |
| `_id`         | ObjectId | Yes      | Auto    | Primary key              |
| `identifier`  | String   | Yes      | -       | Email or phone (indexed) |
| `otp`         | String   | Yes      | -       | Hashed OTP code (bcrypt) |
| `expiresAt`   | Date     | Yes      | -       | OTP expiry (10 minutes)  |
| `attempts`    | Number   | No       | 0       | Verification attempts    |
| `maxAttempts` | Number   | No       | 5       | Maximum attempts         |
| `isUsed`      | Boolean  | No       | false   | OTP used flag            |
| `createdAt`   | Date     | Auto     | now()   | Creation                 |

#### Indexes

```javascript
identifier: single
expiresAt: TTL index (auto-delete after 1 hour)
```

#### Pre-save Hook

- Hashes OTP before saving (bcrypt)

#### Instance Methods

- `compareOTP(candidateOTP)` - Compare OTP

#### Static Methods

- `generateOTP()` - Generate 6-digit OTP
- `createOTP(identifier)` - Create OTP record
- `verifyOTP(identifier, otpCode)` - Verify OTP with attempts tracking

---

### 12. Activation Tokens Collection

**Collection Name:** `activation_tokens`
**Purpose:** Email verification tokens

#### Fields

| Field       | Type     | Required | Default | Description                        |
| ----------- | -------- | -------- | ------- | ---------------------------------- |
| `_id`       | ObjectId | Yes      | Auto    | Primary key                        |
| `user`      | ObjectId | Yes      | -       | Ref: users.\_id (indexed)          |
| `token`     | String   | Yes      | -       | Activation token (unique, indexed) |
| `expiresAt` | Date     | Yes      | -       | Token expiry (1 hour)              |
| `isUsed`    | Boolean  | No       | false   | Token used flag                    |
| `createdAt` | Date     | Auto     | now()   | Creation                           |

#### Indexes

```javascript
user: single
token: unique
expiresAt: TTL index (auto-delete after 24 hours)
```

#### Static Methods

- `createToken(userId)` - Generate random 32-byte hex token
- `verifyToken(token)` - Verify and mark token as used

---

### 13. Session Summaries Collection

**Collection Name:** `session_summaries`
**Purpose:** AI-generated session analysis and transcripts

#### Fields

| Field                             | Type          | Required | Default   | Description                            |
| --------------------------------- | ------------- | -------- | --------- | -------------------------------------- |
| `_id`                             | ObjectId      | Yes      | Auto      | Primary key                            |
| `session`                         | ObjectId      | Yes      | -         | Ref: sessions.\_id (unique, 1:1)       |
| **Transcript (Embedded Array)**   |
| `transcript`                      | Array[Object] | No       | []        | Session transcript                     |
| `transcript.speaker`              | Enum          | Yes      | -         | teacher, learner                       |
| `transcript.speakerName`          | String        | No       | -         | Speaker name                           |
| `transcript.text`                 | String        | No       | -         | Transcript text                        |
| `transcript.timestamp`            | Number        | No       | -         | Seconds from session start             |
| `transcript.startTime`            | Date          | No       | -         | Start time                             |
| `transcript.endTime`              | Date          | No       | -         | End time                               |
| **AI Summary (Embedded Object)**  |
| `summary.overview`                | String        | No       | -         | Session overview                       |
| `summary.mainTopics`              | Array[Object] | No       | []        | Main topics                            |
| `summary.keyLearningPoints`       | Array[String] | No       | []        | Key points                             |
| `summary.actionItems`             | Array[Object] | No       | []        | Homework/action items                  |
| `summary.highlights`              | Array[Object] | No       | []        | Session highlights                     |
| **AI Analysis (Embedded Object)** |
| `analysis.engagement.score`       | Number (0-10) | No       | -         | Engagement score                       |
| `analysis.teachingQuality.score`  | Number (0-10) | No       | -         | Teaching quality                       |
| `analysis.learningProgress.score` | Number (0-10) | No       | -         | Learning progress                      |
| `analysis.overallRating`          | Number (0-10) | No       | -         | Overall rating                         |
| `analysis.recommendations`        | Array[String] | No       | []        | Recommendations                        |
| **Statistics (Embedded Object)**  |
| `statistics.totalDuration`        | Number        | No       | -         | Duration in seconds                    |
| `statistics.teacherSpeakTime`     | Number        | No       | -         | Teacher speak time                     |
| `statistics.learnerSpeakTime`     | Number        | No       | -         | Learner speak time                     |
| `statistics.wordsSpoken.teacher`  | Number        | No       | -         | Teacher word count                     |
| `statistics.wordsSpoken.learner`  | Number        | No       | -         | Learner word count                     |
| **Processing**                    |
| `processingStatus`                | Enum          | No       | 'pending' | pending, processing, completed, failed |
| `processingError`                 | Text          | No       | -         | Processing error                       |
| **Files**                         |
| `transcriptFileUrl`               | String        | No       | -         | Full transcript file URL               |
| `recordingMetadata`               | Object        | No       | -         | Recording metadata                     |
| `generatedAt`                     | Date          | Auto     | now()     | Generation time                        |
| **Timestamps**                    |
| `createdAt`                       | Date          | Auto     | now()     | Creation                               |
| `updatedAt`                       | Date          | Auto     | now()     | Last update                            |

#### Indexes

```javascript
session: unique
processingStatus: single
'analysis.overallRating': descending
```

#### Instance Methods

- `isProcessed()` - Check if processing completed
- `getEngagementLevel()` - Get engagement level (excellent, good, moderate, needs improvement)

---

## Relationships

### One-to-Many Relationships

| Parent        | Child             | Foreign Key  | Description                         |
| ------------- | ----------------- | ------------ | ----------------------------------- |
| users         | sessions          | teacher      | User teaches many sessions          |
| users         | sessions          | learner      | User learns from many sessions      |
| users         | transactions      | user         | User has many transactions          |
| users         | payments          | user         | User makes many payments            |
| users         | notifications     | recipient    | User receives many notifications    |
| users         | notifications     | sender       | User sends many notifications       |
| users         | recordings        | teacher      | Teacher has many recordings         |
| users         | recordings        | learner      | Learner has many recordings         |
| users         | availability      | teacher      | Teacher has many availability slots |
| users         | activation_tokens | user         | User has many activation attempts   |
| sessions      | transactions      | session      | Session generates many transactions |
| payments      | transactions      | payment      | Payment creates many transactions   |
| conversations | messages          | conversation | Conversation contains many messages |
| users         | messages          | sender       | User sends many messages            |

### One-to-One Relationships

| Entity A | Entity B          | Description                            |
| -------- | ----------------- | -------------------------------------- |
| sessions | recordings        | Each session has at most one recording |
| sessions | session_summaries | Each session has at most one summary   |

### Many-to-Many Relationships

| Entity A | Entity B      | Implementation                       | Description                        |
| -------- | ------------- | ------------------------------------ | ---------------------------------- |
| users    | users         | followers/following arrays           | Users follow each other            |
| users    | conversations | participants array                   | Users participate in conversations |
| users    | skills        | skillsToTeach/skillsToLearn embedded | Users teach/learn skills           |

### Embedded Relationships

| Parent            | Embedded Child | Description                                 |
| ----------------- | -------------- | ------------------------------------------- |
| users             | skillsToTeach  | Skills user can teach (embedded array)      |
| users             | skillsToLearn  | Skills user wants to learn (embedded array) |
| users             | badges         | Earned badges (embedded array)              |
| users             | streak         | Streak information (embedded object)        |
| users             | preferences    | User preferences (embedded object)          |
| sessions          | teacherRating  | Teacher rating (embedded object)            |
| sessions          | learnerRating  | Learner rating (embedded object)            |
| messages          | readBy         | Read receipts (embedded array)              |
| recordings        | viewHistory    | View tracking (embedded array)              |
| recordings        | participants   | Session participants (embedded array)       |
| availability      | timeSlots      | Available time slots (embedded array)       |
| session_summaries | transcript     | Session transcript (embedded array)         |
| session_summaries | summary        | AI summary (embedded object)                |
| session_summaries | analysis       | AI analysis (embedded object)               |
| session_summaries | statistics     | Session stats (embedded object)             |

---

## Indexes

### Index Strategy

**Purpose:** Optimize query performance for common access patterns

#### Critical Indexes (Performance)

```javascript
// User queries
users.email (unique)
users.(isTeacher, isActive) - Find active teachers
users.averageRating - Sort by rating
users.level - Leaderboards

// Session queries
sessions.(teacher, scheduledAt) - Teacher's schedule
sessions.(learner, scheduledAt) - Learner's schedule
sessions.(status, scheduledAt) - Upcoming sessions
sessions.agoraChannel - Video join

// Transaction queries
transactions.(user, createdAt) - User transaction history
transactions.(type, reason) - Analytics

// Payment queries
payments.(user, createdAt) - Payment history
payments.stripePaymentIntentId (unique) - Stripe webhooks

// Messaging queries
conversations.participants - Find conversations
conversations.lastMessageAt - Sort conversations
messages.(conversation, createdAt) - Message history

// Notification queries
notifications.(recipient, isRead) - Unread notifications
notifications.(recipient, createdAt) - Notification feed
notifications.expiresAt (TTL) - Auto-delete expired

// Recording queries
recordings.session (unique) - 1:1 relationship
recordings.(teacher, createdAt) - Teacher's recordings
recordings.(learner, createdAt) - Learner's recordings
recordings.expiresAt - Cleanup job

// Availability queries
availability.(teacher, dayOfWeek) - Weekly schedule
availability.(teacher, specificDate) - Specific date
availability.(teacher, isActive) - Active slots

// Auth indexes
otps.identifier - OTP lookup
otps.expiresAt (TTL) - Auto-cleanup
activation_tokens.token (unique) - Token verification
activation_tokens.expiresAt (TTL) - Auto-cleanup

// Analytics
session_summaries.session (unique) - 1:1 relationship
session_summaries.'analysis.overallRating' - Top sessions
```

#### Text Search Indexes

```javascript
skills.(name, description, tags) - Full-text search
```

#### TTL (Time-To-Live) Indexes

```javascript
otps.expiresAt - Auto-delete after 1 hour
activation_tokens.expiresAt - Auto-delete after 24 hours
notifications.expiresAt - Auto-delete when expired
```

---

## Embedded vs Referenced Data

### When to Embed

**Embedded subdocuments** are used when:

1. **One-to-Few** - Small number of subdocuments (< 100)
2. **Always accessed together** - Parent and children queried together
3. **Doesn't grow unbounded** - Known maximum size
4. **Strong ownership** - Children don't exist without parent

#### Examples in Schema

```javascript
// User skills (limited, always displayed with user)
users.skillsToTeach;
users.skillsToLearn;

// User badges (limited, part of profile)
users.badges;

// User preferences (fixed size, always with user)
users.preferences;

// User streak (single object, always with user)
users.streak;

// Session ratings (single object each, part of session)
sessions.teacherRating;
sessions.learnerRating;

// Message read receipts (participants only, small)
messages.readBy;

// Recording view history (grows but bounded, analytics)
recordings.viewHistory;

// Availability time slots (daily slots, limited)
availability.timeSlots;

// Session summary data (large but single, rarely updated)
session_summaries.transcript;
session_summaries.summary;
session_summaries.analysis;
```

### When to Reference

**Referenced documents** are used when:

1. **One-to-Many** or **Many-to-Many**
2. **Grows unbounded** - Could have thousands of children
3. **Queried independently** - Children accessed separately
4. **Shared across entities** - Same child referenced by multiple parents

#### Examples in Schema

```javascript
// Session relationships (unbounded, queried separately)
sessions.teacher -> users._id
sessions.learner -> users._id

// Transactions (unbounded, independent queries)
transactions.user -> users._id
transactions.session -> sessions._id
transactions.payment -> payments._id

// Payments (unbounded, independent processing)
payments.user -> users._id

// Messaging (unbounded, independent access)
conversations.participants -> [users._id]
messages.conversation -> conversations._id
messages.sender -> users._id

// Notifications (unbounded, queried separately)
notifications.recipient -> users._id
notifications.session -> sessions._id

// Recordings (1:1 but large, independent access)
recordings.session -> sessions._id
recordings.teacher -> users._id

// Availability (many per teacher, queried separately)
availability.teacher -> users._id

// Social connections (potentially thousands)
users.followers -> [users._id]
users.following -> [users._id]
```

---

## Data Integrity & Validation

### Field-Level Validation

- **Email:** Regex validation on format
- **Ratings:** Min 0, Max 5 (sessions) or 0-10 (summaries)
- **Tokens:** Min 0 (no negative balances)
- **Enums:** Strict enum validation on status fields
- **Dates:** Expiry validation (token expiry > now)
- **Strings:** Max length enforcement

### Document-Level Validation

- **Users:** Password min length 6 chars
- **Conversations:** Direct type = exactly 2 participants
- **Sessions:** End time calculated from start + duration
- **Payments:** Receipt number auto-generated
- **OTPs:** Max 5 verification attempts

### Referential Integrity

**MongoDB doesn't enforce foreign keys** - Application-level enforcement:

- Delete user → Archive/soft-delete sessions, messages
- Cancel session → Release availability slot, refund tokens
- Delete conversation → Option to delete messages (cascade)
- Expire recording → Option to delete video file

### Data Consistency

- **Atomic updates:** Use MongoDB transactions where needed
- **Token transfers:** Session completion atomically updates both users
- **Double-entry accounting:** Every transaction records before/after balance
- **Optimistic locking:** Use `updatedAt` for version control

---

## Usage Instructions

### For dbdiagram.io

1. Go to https://dbdiagram.io/
2. Click "New Diagram"
3. Copy the entire contents of `database-schema-dbdiagram.txt`
4. Paste into the editor
5. The diagram will auto-generate with all relationships

### For ERDPlus

1. Go to https://erdplus.com/
2. Click "Open" or "Import"
3. Upload the `database-erd-erdplus.erdplus` file
4. The ERD will load with entities and relationships

### For MongoDB Compass

Use this schema as reference for:

- Index creation
- Validation rules
- Query optimization
- Data modeling decisions

---

## Schema Statistics

| Metric                         | Count |
| ------------------------------ | ----- |
| Total Collections              | 13    |
| Total Indexes                  | 45+   |
| Total Relationships            | 30+   |
| Total Fields (all collections) | 250+  |
| Embedded Subdocuments          | 15+   |
| Referenced Relationships       | 25+   |
| Enum Types                     | 20+   |
| TTL Indexes                    | 3     |
| Text Search Indexes            | 1     |
| Unique Constraints             | 8     |

---

## Future Considerations

### Potential Additions

1. **Review/Rating System** - Separate collection for detailed reviews
2. **Course Structure** - Multi-session structured courses
3. **Certificates** - Certificate issuance for completed courses
4. **Referrals** - Referral tracking system
5. **Reports** - User reporting and moderation
6. **Analytics Events** - Detailed event tracking
7. **Push Notification Tokens** - FCM/APNS device tokens
8. **Session Resources** - File attachments for sessions

### Scaling Considerations

1. **Sharding** - Consider sharding on userId for large scale
2. **Read Replicas** - Read-heavy queries on replicas
3. **Caching** - Redis for frequently accessed data
4. **Archiving** - Move old data to cold storage
5. **Aggregation Pipeline** - Pre-compute analytics

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Maintained By:** skillup Development Team
