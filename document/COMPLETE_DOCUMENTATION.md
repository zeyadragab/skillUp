# skillup PLATFORM - COMPLETE DOCUMENTATION

## Table of Contents

1. [Project Overview](#project-overview)
2. [Main User Application](#main-user-application)
3. [Backend API](#backend-api)
4. [Admin Dashboard](#admin-dashboard)
5. [Features Breakdown](#features-breakdown)
6. [Technology Stack](#technology-stack)
7. [File Structure](#file-structure)

---

## PROJECT OVERVIEW

**Name:** skillup
**Type:** Peer-to-peer skill exchange platform with token-based economy
**Description:** A comprehensive platform where users can teach and learn skills using a token-based system

### Tech Stack

- **Frontend:** React 19.1.1, Vite, Tailwind CSS 4, Framer Motion, React Router 7
- **Backend:** Node.js, Express.js, MongoDB, Socket.io
- **Admin:** React with TypeScript
- **Payment:** Stripe Integration
- **Real-time:** Socket.io for messaging and notifications

---

## MAIN USER APPLICATION

### 1. PAGES & ROUTES

| Page                   | Route                | Access     | Description                                                                                   |
| ---------------------- | -------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| **Landing Page**       | `/`                  | Public     | Welcome page with platform features, testimonials, and call-to-action                         |
| **Sign In**            | `/signin`            | Public     | Email & password login form                                                                   |
| **Sign Up**            | `/signup`            | Public     | User registration with role selection (Learner/Teacher/Both)                                  |
| **OTP Login**          | `/otp-login`         | Public     | Passwordless login request form                                                               |
| **OTP Verify**         | `/otp-verify`        | Public     | 6-digit OTP code verification                                                                 |
| **Account Activation** | `/activate`          | Public     | Email activation confirmation page                                                            |
| **Home/Dashboard**     | `/home`              | Protected  | Main dashboard with featured teachers & token packages                                        |
| **Profile**            | `/profile`           | Protected  | User profile with 7 tabs (overview, skills, courses, tokens, connections, sessions, settings) |
| **Teacher Profile**    | `/profile/:userId`   | Protected  | Public view of any teacher's profile                                                          |
| **Skill Search**       | `/skills/:skillName` | Protected  | Search results showing teachers for specific skills                                           |
| **Chat**               | `/chat`              | Protected  | Real-time messaging interface with Socket.io                                                  |
| **Admin Dashboard**    | `/admin`             | Admin Only | Administrative control panel                                                                  |

---

### 2. NAVIGATION COMPONENTS

#### **Navbar** - Main Navigation Bar

**Location:** Top of every page
**Components:**

- Logo + Brand name "skillup"
- Search bar with skill/user search (Keyboard shortcut: Ctrl+K)
- **Learn Dropdown Menu:**
  - Programming
  - Design
  - Languages
  - Business
  - Health & Wellness
- **Teach Dropdown Menu:**
  - Become a Teacher
  - Earnings
  - Teaching Tools
  - Analytics
- **Community Dropdown Menu:**
  - Forums
  - Study Groups
  - Challenges
  - Events
- Token balance display (coin icon + number)
- Notifications bell icon
- User dropdown menu (Profile, Settings, Sign Out)
- Mobile menu toggle button

**Responsive Design:**

- Desktop: Full horizontal menu
- Mobile: Hamburger menu with slide-out drawer

---

### 3. PROFILE COMPONENTS & TABS

#### **Profile Page Structure**

**Header Section:**

- Cover image/banner
- User avatar
- Name and verification badge
- User statistics (Sessions, Reviews, Rating, Level)
- Edit Profile button (for own profile)
- Settings button
- Share button

#### **7 Profile Tabs:**

**Tab 1: Overview**

- User bio
- Country and timezone
- Languages spoken
- Skills summary
- Recent activity
- Follower/following count
- Achievement badges

**Tab 2: Skills**

- **Teaching Skills Section:**
  - List of skills user can teach
  - Proficiency level (Beginner, Intermediate, Advanced, Expert)
  - Hourly token rate
  - Add new skill button
  - Edit/Remove skill buttons
- **Learning Skills Section:**
  - Skills user wants to learn
  - Interest level
  - Add learning skill button

**Tab 3: Courses**

- Courses user is currently teaching
- Courses user is currently taking
- Course progress indicators
- Enrollment status

**Tab 4: Tokens**

- Current token balance (large display)
- Token earning history
- Token spending history
- Transaction list with:
  - Date and time
  - Amount (+ for earned, - for spent)
  - Reason/description
  - Balance after transaction

**Tab 5: Connections**

- **Followers Tab:**
  - List of users following you
  - User cards with avatar, name, rating
  - Follow back button
- **Following Tab:**
  - List of users you follow
  - Unfollow button
  - View profile button

**Tab 6: Sessions**

- **Upcoming Sessions:**
  - Scheduled sessions
  - Session details (skill, time, duration, tokens)
  - Join/Cancel buttons
- **Past Sessions:**
  - Completed sessions
  - Session ratings
  - Review comments
  - Rate session button (if not rated)

**Tab 7: Settings**

- Account settings
- Privacy settings
- Notification preferences
- Language preferences
- Timezone settings
- Account deletion option

---

### 4. ALL BUTTONS & INTERACTIVE ELEMENTS

#### **Authentication Buttons**

- **"Sign In"** - Navigate to login page (Navbar)
- **"Get Started"** - Navigate to signup page (Landing page CTA)
- **"Sign Up"** - Submit registration form
- **"Login"** - Submit login credentials
- **"Sign Out"** - Logout from user dropdown menu
- **"Request OTP"** - Send OTP code to email
- **"Verify OTP"** - Submit OTP code for verification
- **"Resend OTP"** - Request new OTP code
- **"Resend Activation"** - Resend account activation email
- **"Forgot Password"** - Navigate to password recovery
- **"Reset Password"** - Submit new password

#### **Profile Management Buttons**

- **"Edit Profile"** - Open profile edit modal
- **"Save Changes"** - Save profile edits
- **"Cancel"** - Close edit modal without saving
- **"Settings"** - Navigate to settings tab
- **"Share"** - Share profile (copy link or social media)
- **"Upload Avatar"** - Change profile picture
- **"Remove Avatar"** - Delete profile picture

#### **Skills Management Buttons**

- **"Add Skill"** - Add new teaching/learning skill
- **"Edit Skill"** - Modify skill details (proficiency, rate)
- **"Remove Skill"** - Delete skill from profile
- **"Save Skill"** - Confirm skill addition/edit
- **"Cancel"** - Close skill modal

#### **Navigation Buttons**

- **"Dashboard"** / **"Home"** - Go to main dashboard
- **"Profile"** - Go to user profile
- **"Messages"** - Navigate to chat
- **"Search"** - Open search bar or submit search
- **"Browse All Teachers"** - View complete teacher list
- **"View Profile"** - Open specific user profile

#### **Token & Payment Buttons**

- **"Buy Tokens"** - Navigate to token purchase page
- **"10 Tokens - $9.99"** - Purchase Basic package
- **"25 Tokens - $19.99"** - Purchase Pro package (marked "Popular")
- **"60 Tokens - $39.99"** - Purchase Premium package
- **"Confirm Purchase"** - Finalize token purchase
- **"Cancel Purchase"** - Close token purchase modal

#### **Session Management Buttons**

- **"Book Session"** - Request session with teacher
- **"Confirm Booking"** - Finalize session booking
- **"Cancel Session"** - Cancel upcoming session (with refund if 24hrs+ notice)
- **"Join Session"** - Enter active session
- **"Complete Session"** - Mark session as complete
- **"Rate Session"** - Open rating modal
- **"Submit Review"** - Save session rating and review

#### **Social Interaction Buttons**

- **"Follow"** - Follow a user
- **"Unfollow"** - Unfollow a user
- **"Message"** - Send direct message to user
- **"View Followers"** - See follower list
- **"View Following"** - See following list

#### **Chat Buttons**

- **"New Conversation"** - Start new chat
- **"Send Message"** - Send chat message
- **"Delete Message"** - Remove message
- **"Search Conversations"** - Filter chat list
- **"Block User"** - Block user from messaging (planned)

#### **Content Buttons**

- **"Start Learning"** - Primary CTA on landing page
- **"Watch Demo"** - Play demo video
- **"Learn More"** - Additional information sections
- **"Show More"** / **"Show Less"** - Expand/collapse content

#### **Filter & Search Buttons**

- **"Apply Filters"** - Apply search filters
- **"Clear Filters"** - Reset all filters
- **"Sort By"** - Sort results (Rating, Price, Popularity)
- **"Search"** - Submit search query

---

### 5. FORMS & INPUT FIELDS

#### **Sign Up Form**

- **Name** (Text input, required, min 2 characters)
- **Email** (Email input, required, must be valid format)
- **Password** (Password input, required, min 8 characters)
  - Password strength indicator (Weak/Medium/Strong)
  - Must contain: uppercase, number, special character
- **Confirm Password** (Password input, must match password)
- **Role Selection** (Radio buttons)
  - Learner
  - Teacher
  - Both

#### **Sign In Form**

- **Email** (Email input, required, valid format)
- **Password** (Password input, required, min 6 characters)
- **Remember Me** (Checkbox)

#### **OTP Forms**

- **OTP Request:**
  - Email (Email input)
- **OTP Verify:**
  - 6-digit code (Numeric input, auto-focus between digits)

#### **Profile Edit Form**

- **Name** (Text input)
- **Bio** (Textarea, max 500 characters)
- **Country** (Dropdown select)
- **Timezone** (Dropdown select)
- **Languages** (Multi-select dropdown)
- **Avatar** (File upload, JPG/PNG, max 5MB)

#### **Skill Management Form**

- **Skill Selection** (Dropdown with search)
- **Proficiency Level** (Select dropdown)
  - Beginner
  - Intermediate
  - Advanced
  - Expert
- **Hourly Rate** (Number input, tokens per hour)

#### **Session Booking Form**

- **Date** (Date picker)
- **Time** (Time picker)
- **Duration** (Select: 30min, 1hr, 2hr, 3hr)
- **Notes** (Textarea, optional message to teacher)

#### **Review Form**

- **Rating** (Star selector, 1-5 stars)
- **Review Text** (Textarea, optional, max 500 characters)

---

## BACKEND API

### API BASE URL

- Development: `http://localhost:5000/api`
- Production: (Your production URL)

---

### 1. AUTH ROUTES (`/api/auth`)

| Endpoint                 | Method | Access    | Description                                     |
| ------------------------ | ------ | --------- | ----------------------------------------------- |
| `/register`              | POST   | Public    | Register new user account                       |
| `/login`                 | POST   | Public    | Login with email/password                       |
| `/me`                    | GET    | Protected | Get current authenticated user                  |
| `/profile`               | PUT    | Protected | Update user profile                             |
| `/logout`                | POST   | Protected | Logout user                                     |
| `/forgot-password`       | POST   | Public    | Request password reset email                    |
| `/reset-password/:token` | POST   | Public    | Reset password with token                       |
| `/activate/:token`       | GET    | Public    | Activate account via email link                 |
| `/resend-activation`     | POST   | Public    | Resend activation email (Rate limited: 3/15min) |

**Register Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "both"
}
```

**Login Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (Login/Register):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "tokenBalance": 50,
    "role": "both",
    "isActive": true
  }
}
```

---

### 2. SKILLS ROUTES (`/api/skills`)

| Endpoint              | Method | Access    | Description                    |
| --------------------- | ------ | --------- | ------------------------------ |
| `/`                   | GET    | Public    | Get all skills with pagination |
| `/popular/top`        | GET    | Public    | Get top 10 popular skills      |
| `/categories/list`    | GET    | Public    | Get all skill categories       |
| `/category/:category` | GET    | Public    | Get skills by category         |
| `/:id`                | GET    | Public    | Get skill details by ID        |
| `/teach/:id`          | POST   | Protected | Add skill to teaching list     |
| `/learn/:id`          | POST   | Protected | Add skill to learning list     |
| `/user/:skillId`      | DELETE | Protected | Remove user skill              |
| `/`                   | POST   | Admin     | Create new skill               |
| `/:id`                | PUT    | Admin     | Update skill                   |
| `/:id`                | DELETE | Admin     | Delete skill                   |

**Add Teaching Skill Request:**

```json
{
  "proficiency": "intermediate",
  "hourlyRate": 15
}
```

**Add Learning Skill Request:**

```json
{
  "proficiency": "beginner"
}
```

---

### 3. SESSION ROUTES (`/api/sessions`)

| Endpoint      | Method | Access              | Description                       |
| ------------- | ------ | ------------------- | --------------------------------- |
| `/`           | POST   | Protected (Teacher) | Create new session                |
| `/`           | GET    | Protected           | Get all user sessions             |
| `/:id`        | GET    | Protected           | Get session details               |
| `/:id`        | PUT    | Protected           | Update session                    |
| `/:id/cancel` | DELETE | Protected           | Cancel session (refund if 24hrs+) |
| `/:id/rate`   | POST   | Protected           | Rate completed session            |
| `/:id/join`   | POST   | Protected           | Join session                      |

**Create Session Request:**

```json
{
  "skillId": "skill_id",
  "learnerId": "learner_id",
  "startTime": "2025-12-01T10:00:00Z",
  "endTime": "2025-12-01T11:00:00Z",
  "tokenCost": 15
}
```

**Rate Session Request:**

```json
{
  "rating": 5,
  "review": "Great session! Learned a lot."
}
```

---

### 4. USER ROUTES (`/api/users`)

| Endpoint            | Method | Access    | Description                |
| ------------------- | ------ | --------- | -------------------------- |
| `/search`           | GET    | Public    | Search users by keyword    |
| `/skill/:skillName` | GET    | Public    | Get teachers by skill name |
| `/:id`              | GET    | Public    | Get user profile by ID     |
| `/:id/followers`    | GET    | Public    | Get user's followers list  |
| `/:id/following`    | GET    | Public    | Get user's following list  |
| `/profile`          | PUT    | Protected | Update own profile         |
| `/:id/follow`       | POST   | Protected | Follow a user              |
| `/:id/unfollow`     | DELETE | Protected | Unfollow a user            |

**Search Query Parameters:**

```
GET /api/users/search?q=john&role=teacher&skill=javascript
```

---

### 5. MESSAGE ROUTES (`/api/messages`)

| Endpoint           | Method | Access    | Description                |
| ------------------ | ------ | --------- | -------------------------- |
| `/conversations`   | GET    | Protected | Get all user conversations |
| `/conversations`   | POST   | Protected | Create new conversation    |
| `/:conversationId` | GET    | Protected | Get conversation messages  |
| `/`                | POST   | Protected | Send new message           |
| `/:messageId`      | DELETE | Protected | Delete message             |

**Send Message Request:**

```json
{
  "conversationId": "conv_id",
  "content": "Hello! I'd like to learn JavaScript."
}
```

**Socket.io Real-time Events:**

- `join` - User joins their room
- `join-conversation` - Join specific conversation
- `send-message` - Send message
- `new-message` - Receive new message
- `typing` - User is typing
- `user-typing` - Receive typing notification

---

### 6. PAYMENT ROUTES (`/api/payments`)

| Endpoint    | Method | Access    | Description                    |
| ----------- | ------ | --------- | ------------------------------ |
| `/packages` | GET    | Public    | Get available token packages   |
| `/intent`   | POST   | Protected | Create Stripe payment intent   |
| `/confirm`  | POST   | Protected | Confirm payment and add tokens |
| `/history`  | GET    | Protected | Get payment history            |
| `/webhook`  | POST   | Public    | Stripe webhook handler         |

**Token Packages:**

```json
[
  { "id": "basic", "tokens": 10, "price": 9.99, "currency": "USD" },
  { "id": "pro", "tokens": 25, "price": 19.99, "currency": "USD" },
  { "id": "premium", "tokens": 60, "price": 39.99, "currency": "USD" }
]
```

**Create Payment Intent Request:**

```json
{
  "packageId": "pro"
}
```

---

### 7. TRANSACTION ROUTES (`/api/transactions`)

| Endpoint | Method | Access    | Description                  |
| -------- | ------ | --------- | ---------------------------- |
| `/`      | GET    | Protected | Get user transaction history |
| `/stats` | GET    | Protected | Get transaction statistics   |
| `/:id`   | GET    | Protected | Get transaction details      |
| `/`      | POST   | Admin     | Create manual transaction    |

**Transaction Types:**

- `credit` - Tokens added (purchases, earnings, bonuses)
- `debit` - Tokens spent (session bookings)

---

### 8. OTP ROUTES (`/api/otp`)

| Endpoint   | Method | Access | Description                              |
| ---------- | ------ | ------ | ---------------------------------------- |
| `/request` | POST   | Public | Request OTP code (Rate limited: 3/15min) |
| `/verify`  | POST   | Public | Verify OTP code (Max 5 attempts)         |

**Request OTP:**

```json
{
  "email": "john@example.com"
}
```

**Verify OTP:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**OTP Specifications:**

- 6-digit numeric code
- 10-minute expiry
- Maximum 5 verification attempts
- Rate limited: 3 requests per 15 minutes

---

### 9. ADMIN ROUTES (`/api/admin`)

| Endpoint            | Method | Access | Description                        |
| ------------------- | ------ | ------ | ---------------------------------- |
| `/stats`            | GET    | Admin  | Get platform statistics            |
| `/analytics`        | GET    | Admin  | Get detailed analytics             |
| `/users`            | GET    | Admin  | Get all users with filters         |
| `/users/:id`        | GET    | Admin  | Get user details                   |
| `/users/:id/status` | PUT    | Admin  | Update user status (active/banned) |
| `/users/:id/tokens` | POST   | Admin  | Manually adjust user tokens        |
| `/sessions`         | GET    | Admin  | Get all platform sessions          |
| `/sessions/:id`     | DELETE | Admin  | Cancel any session                 |

---

## ADMIN DASHBOARD APPLICATION

### 1. ADMIN PAGES

| Page              | Route            | Description                                  |
| ----------------- | ---------------- | -------------------------------------------- |
| **Login**         | `/login`         | Admin authentication page                    |
| **Dashboard**     | `/dashboard`     | Overview with stats, charts, recent activity |
| **Users**         | `/users`         | User management table with search/filter     |
| **Teachers**      | `/teachers`      | Teacher management and approval system       |
| **Skills**        | `/skills`        | Skill CRUD operations and categories         |
| **Sessions**      | `/sessions`      | Session monitoring and management            |
| **Transactions**  | `/transactions`  | Token transaction tracking                   |
| **Reports**       | `/reports`       | Analytics and detailed reports               |
| **Reviews**       | `/reviews`       | Review and rating management                 |
| **Notifications** | `/notifications` | System notification center                   |
| **Settings**      | `/settings`      | Admin configuration settings                 |

---

### 2. ADMIN DASHBOARD FEATURES

#### **Dashboard Overview**

- **Stats Cards (4 cards):**
  - Total Users (with growth percentage)
  - Total Teachers (with active count)
  - Total Sessions (today/this week)
  - Total Tokens in Circulation

- **Charts:**
  - User Growth Trend (Line chart)
  - Session Activity (Bar chart)
  - Token Transactions (Area chart)
  - Category Distribution (Pie chart)

- **Recent Activity Feed:**
  - New user registrations
  - Session bookings
  - Token purchases
  - User reviews

---

#### **User Management**

- **User Table with:**
  - ID, Name, Email, Role
  - Token Balance
  - Sessions Count
  - Rating
  - Status (Active/Inactive/Banned)
  - Join Date
  - Last Activity

- **Actions:**
  - View user details
  - Edit user profile
  - Adjust token balance
  - Ban/Unban user
  - Delete user account
  - Send notification

- **Filters:**
  - Role (All/Learner/Teacher/Both/Admin)
  - Status (Active/Inactive/Banned)
  - Date range
  - Search by name/email

---

#### **Session Management**

- **Session Table:**
  - Session ID
  - Teacher name
  - Learner name
  - Skill
  - Date and time
  - Duration
  - Status
  - Token cost
  - Rating

- **Actions:**
  - View session details
  - Cancel session (with refund)
  - View ratings/reviews
  - Export session data

- **Filters:**
  - Status (All/Pending/Confirmed/Completed/Cancelled)
  - Date range
  - Teacher/Learner
  - Skill category

---

#### **Skill Management**

- **Skill Table:**
  - Skill name
  - Category
  - Total teachers
  - Popularity score
  - Status (Active/Inactive)

- **Actions:**
  - Create new skill
  - Edit skill details
  - Delete skill
  - Manage categories
  - View teachers by skill

---

#### **Transaction Management**

- **Transaction Table:**
  - Transaction ID
  - User
  - Type (Credit/Debit)
  - Amount (tokens)
  - Reason
  - Date and time
  - Balance after

- **Filters:**
  - Type (All/Credit/Debit)
  - Date range
  - User
  - Amount range

---

## FEATURES BREAKDOWN

### 1. AUTHENTICATION & SECURITY

#### **Email/Password Authentication**

- Secure user registration
- Email verification required
- Password hashing with bcryptjs
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
  - At least one special character
- JWT tokens with 7-day expiry
- Secure password reset via email token

#### **OTP (One-Time Password) System**

- 6-digit numeric code generation
- 10-minute expiry time
- Maximum 5 verification attempts
- Rate limiting: 3 requests per 15 minutes
- Email delivery via Nodemailer
- Passwordless login option

#### **Security Measures**

- **Rate Limiting:**
  - Authentication: 5 attempts per 15 minutes
  - OTP requests: 3 per 15 minutes
  - General API: 100 requests per 15 minutes

- **Input Validation:**
  - Email format validation
  - XSS protection
  - SQL injection prevention
  - Data sanitization

- **Headers & CORS:**
  - Helmet for security headers
  - CORS configuration
  - HTTPS enforcement (production)

---

### 2. TOKEN ECONOMY SYSTEM

#### **Token Management**

- **Welcome Bonus:** 50 free tokens on registration
- **Real-time Balance:** Live token count in navbar
- **Earning Tokens:**
  - Teaching sessions (custom hourly rates)
  - Platform bonuses
  - Referral rewards (planned)

- **Spending Tokens:**
  - Booking learning sessions
  - Platform services (planned)

#### **Token Packages**

| Package | Tokens | Price  | Savings  |
| ------- | ------ | ------ | -------- |
| Basic   | 10     | $9.99  | -        |
| Pro     | 25     | $19.99 | Save 20% |
| Premium | 60     | $39.99 | Save 33% |

#### **Transaction System**

- Complete transaction history
- Before/after balance tracking
- Transaction types: Credit and Debit
- Detailed reason for each transaction
- Export transaction history
- Monthly statements

---

### 3. SKILL MANAGEMENT

#### **Skill Categories (8+)**

1. Technology & Programming
2. Design & Creative
3. Languages
4. Business
5. Health & Wellness
6. Arts & Crafts
7. Music
8. Sports

#### **Teaching Skills**

- Add unlimited skills
- Set proficiency level (Beginner/Intermediate/Advanced/Expert)
- Set hourly token rate
- Edit/remove skills
- View total sessions taught per skill

#### **Learning Skills**

- Add skills to learning wishlist
- Track learning progress
- Find teachers for specific skills
- Book sessions directly from skill page

#### **Skill Discovery**

- Browse skills by category
- Search skills by keyword
- View teacher count per skill
- See popularity metrics
- Filter by proficiency level

---

### 4. SESSION BOOKING SYSTEM

#### **Session Lifecycle**

1. **Pending** - Session requested, awaiting teacher confirmation
2. **Confirmed** - Teacher accepted, session scheduled
3. **In Progress** - Session currently active
4. **Completed** - Session finished, tokens transferred
5. **Cancelled** - Session cancelled (refund if 24hrs+ notice)

#### **Session Features**

- Book sessions with any teacher
- Schedule conflict detection
- Automatic token hold on booking
- Automatic token transfer on completion
- 24-hour cancellation policy with full refund
- Session reminders (email notifications)
- Join session button (video call integration planned)

#### **Session Rating & Reviews**

- 1-5 star rating system
- Written review (optional, max 500 characters)
- Review display on teacher profile
- Average rating calculation
- Top-rated teachers featured

---

### 5. REAL-TIME MESSAGING (Socket.io)

#### **Chat Features**

- Direct messaging with any user
- Real-time message delivery
- Conversation list with search
- Unread message count
- Message history access
- Read receipts
- Typing indicators
- Message deletion
- User online/offline status

#### **Socket.io Events**

| Event               | Description                     |
| ------------------- | ------------------------------- |
| `join`              | User joins their personal room  |
| `join-conversation` | Join specific conversation room |
| `send-message`      | Send new message                |
| `new-message`       | Receive message broadcast       |
| `typing`            | User started typing             |
| `user-typing`       | Receive typing notification     |
| `call-user`         | Initiate video call (planned)   |
| `accept-call`       | Accept incoming call (planned)  |
| `disconnect`        | User disconnected               |

---

### 6. SOCIAL FEATURES

#### **User Discovery**

- Search users by name/keyword
- Filter by role (Learner/Teacher)
- Filter by skill
- Browse featured teachers
- View teacher statistics

#### **Follow System**

- Follow/unfollow users
- View followers list
- View following list
- Follow back suggestions
- Follower count on profile

#### **User Profiles**

- Public profile pages
- User statistics display
- Achievement badges
- Level and XP
- Recent activity
- Verification status

---

### 7. GAMIFICATION

#### **Leveling System**

- User levels (1-10+)
- Experience points (XP)
- XP earned from:
  - Completing sessions
  - Receiving high ratings
  - Platform engagement
- Level progression tracking
- Level badges

#### **Achievement System**

- Special badges for milestones:
  - First session taught/learned
  - 10/50/100 sessions milestone
  - 5-star teacher rating
  - Popular teacher (100+ sessions)
  - Master teacher (500+ sessions)

#### **Streak System**

- Daily activity streak counter
- Longest streak record
- Last activity timestamp
- Streak rewards (bonus tokens)
- Streak recovery (24-hour grace period)

---

### 8. PAYMENT INTEGRATION

#### **Stripe Integration**

- Secure payment processing
- Credit/Debit card support
- Payment intent creation
- Payment confirmation
- Webhook handling for payment events
- Automatic token crediting on success
- Payment failure handling
- Refund processing

#### **Payment History**

- Transaction ID
- Date and time
- Package purchased
- Amount paid
- Payment method
- Status (Success/Failed/Refunded)

---

### 9. EMAIL SERVICES

#### **Email Notifications**

- **Account Emails:**
  - Welcome email on registration
  - Account activation link
  - Activation confirmation

- **Security Emails:**
  - Password reset link
  - OTP code delivery
  - Password change confirmation

- **Activity Emails (Planned):**
  - Session booking confirmation
  - Session reminder (24hrs before)
  - Session completion
  - New message notification
  - New follower notification
  - Token purchase receipt

#### **Email Service**

- Provider: Nodemailer with Gmail SMTP
- HTML email templates
- Responsive email design
- Fallback plain text version

---

### 10. ADMIN CAPABILITIES

#### **User Management**

- View all users with detailed info
- Search and filter users
- Edit user profiles
- Adjust user token balances
- Ban/unban users
- Delete user accounts
- View user activity logs
- Send notifications to users

#### **Session Management**

- View all platform sessions
- Monitor active sessions
- Cancel sessions
- Refund tokens manually
- View session ratings
- Export session data

#### **Analytics & Reports**

- User growth charts
- Session activity trends
- Token circulation metrics
- Revenue reports
- Popular skills analysis
- Teacher performance metrics
- User engagement statistics

#### **Platform Configuration**

- Manage skill categories
- Set platform commission rates
- Configure email templates
- Manage token package pricing
- Set rate limits
- Configure security settings

---

## TECHNOLOGY STACK DETAILS

### Frontend Libraries & Tools

| Library          | Version | Purpose                       |
| ---------------- | ------- | ----------------------------- |
| React            | 19.1.1  | UI framework                  |
| Vite (Rolldown)  | Latest  | Build tool & dev server       |
| Tailwind CSS     | 4.0     | Utility-first styling         |
| Framer Motion    | Latest  | Animations & transitions      |
| React Router     | 7.0     | Client-side routing           |
| Lucide React     | Latest  | Icon library (50+ icons used) |
| Headless UI      | Latest  | Accessible UI components      |
| Axios            | Latest  | HTTP client                   |
| Socket.io Client | Latest  | Real-time communication       |

### Backend Technologies

| Technology  | Version | Purpose                       |
| ----------- | ------- | ----------------------------- |
| Node.js     | 18+     | JavaScript runtime            |
| Express.js  | 4.x     | Web framework                 |
| MongoDB     | 6.x     | NoSQL database                |
| Mongoose    | 8.x     | MongoDB ODM                   |
| Socket.io   | 4.x     | WebSocket server              |
| JWT         | Latest  | Authentication tokens         |
| bcryptjs    | Latest  | Password hashing              |
| Nodemailer  | Latest  | Email service                 |
| Stripe      | Latest  | Payment processing            |
| Helmet      | Latest  | Security headers              |
| Morgan      | Latest  | HTTP request logging          |
| Compression | Latest  | Response compression          |
| CORS        | Latest  | Cross-origin resource sharing |

### Admin Dashboard

| Technology          | Purpose            |
| ------------------- | ------------------ |
| React               | UI framework       |
| TypeScript          | Type safety        |
| Tailwind CSS        | Styling            |
| Chart.js / Recharts | Data visualization |
| React Table         | Data tables        |

---

## DATA MODELS

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required, min: 2),
  email: String (required, unique, lowercase),
  password: String (hashed, required),
  avatar: String (URL),
  bio: String (max: 500),
  country: String,
  timezone: String,
  languages: [String],
  role: String (enum: ['learner', 'teacher', 'both'], default: 'learner'),
  isActive: Boolean (default: false),
  isVerified: Boolean (default: false),
  activationToken: String,
  activationTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  tokenBalance: Number (default: 50),
  level: Number (default: 1),
  experiencePoints: Number (default: 0),
  skillsToTeach: [{
    skill: ObjectId (ref: 'Skill'),
    proficiency: String (enum: ['beginner', 'intermediate', 'advanced', 'expert']),
    hourlyRate: Number,
    addedAt: Date
  }],
  skillsToLearn: [{
    skill: ObjectId (ref: 'Skill'),
    proficiency: String,
    addedAt: Date
  }],
  followers: [ObjectId (ref: 'User')],
  following: [ObjectId (ref: 'User')],
  sessionsTaught: Number (default: 0),
  sessionsLearned: Number (default: 0),
  averageRating: Number (default: 0),
  totalReviews: Number (default: 0),
  streak: {
    current: Number (default: 0),
    longest: Number (default: 0),
    lastActivity: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Skill Model

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  category: String (required),
  icon: String,
  description: String,
  totalTeachers: Number (default: 0),
  popularityScore: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Session Model

```javascript
{
  _id: ObjectId,
  teacher: ObjectId (ref: 'User', required),
  learner: ObjectId (ref: 'User', required),
  skill: ObjectId (ref: 'Skill', required),
  startTime: Date (required),
  endTime: Date (required),
  status: String (enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], default: 'pending'),
  tokenCost: Number (required),
  rating: Number (min: 1, max: 5),
  review: String (max: 500),
  cancelReason: String,
  cancelledBy: ObjectId (ref: 'User'),
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  amount: Number (required),
  type: String (enum: ['credit', 'debit'], required),
  reason: String (required),
  balanceBefore: Number (required),
  balanceAfter: Number (required),
  relatedSession: ObjectId (ref: 'Session'),
  relatedPayment: ObjectId (ref: 'Payment'),
  createdAt: Date
}
```

### Conversation Model

```javascript
{
  _id: ObjectId,
  participants: [ObjectId (ref: 'User')],
  lastMessage: {
    content: String,
    sender: ObjectId (ref: 'User'),
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  conversation: ObjectId (ref: 'Conversation', required),
  sender: ObjectId (ref: 'User', required),
  content: String (required, max: 1000),
  isRead: Boolean (default: false),
  isDeleted: Boolean (default: false),
  createdAt: Date
}
```

### Payment Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  packageId: String (required),
  tokens: Number (required),
  amount: Number (required),
  currency: String (default: 'USD'),
  stripePaymentIntentId: String,
  status: String (enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model

```javascript
{
  _id: ObjectId,
  email: String (required),
  otp: String (required, length: 6),
  attempts: Number (default: 0),
  expiresAt: Date (required),
  createdAt: Date
}
```

---

## FILE STRUCTURE

```
swaply/
├── skillup/                          # Main React Application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── pages/                      # Page Components (12 pages)
│   │   │   ├── LandingPage.jsx         # Homepage with features
│   │   │   ├── SignIn.jsx              # Login page
│   │   │   ├── SignUp.jsx              # Registration page
│   │   │   ├── OTPLogin.jsx            # OTP request page
│   │   │   ├── OTPVerify.jsx           # OTP verification page
│   │   │   ├── Activate.jsx            # Account activation
│   │   │   ├── Home.jsx                # User dashboard
│   │   │   ├── Profile.jsx             # User profile with tabs
│   │   │   ├── TeacherProfile.jsx      # Public teacher view
│   │   │   ├── SkillResults.jsx        # Search results
│   │   │   ├── Chat.jsx                # Messaging interface
│   │   │   └── AdminDashboard.jsx      # Admin panel
│   │   │
│   │   ├── components/
│   │   │   ├── common/                 # Reusable Components
│   │   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   │   ├── Footer.jsx          # Page footer
│   │   │   │   ├── AnimatedCard.jsx    # Animated card
│   │   │   │   ├── AnimatedSection.jsx # Animated section
│   │   │   │   ├── LoadingSpinner.jsx  # Loading state
│   │   │   │   ├── VirtualList.jsx     # Performance list
│   │   │   │   └── ProtectedRoute.jsx  # Auth wrapper
│   │   │   │
│   │   │   ├── profile/                # Profile Components
│   │   │   │   ├── ProfileHeader.jsx   # Profile banner
│   │   │   │   ├── ProfileTabs.jsx     # Tab navigation
│   │   │   │   ├── UserInfoSection.jsx # User info
│   │   │   │   ├── SkillsSection.jsx   # Skills management
│   │   │   │   ├── TokensSection.jsx   # Token history
│   │   │   │   ├── CoursesSection.jsx  # Course list
│   │   │   │   ├── ConnectionsSection.jsx # Followers/following
│   │   │   │   ├── SessionsSection.jsx # Session history
│   │   │   │   ├── SettingsSection.jsx # User settings
│   │   │   │   └── EditProfileModal.jsx # Edit modal
│   │   │   │
│   │   │   ├── teachers/               # Teacher Components
│   │   │   │   ├── TeacherCard.jsx     # Teacher preview
│   │   │   │   └── TeacherList.jsx     # Teacher grid
│   │   │   │
│   │   │   ├── skills/                 # Skill Components
│   │   │   │   ├── SkillCard.jsx       # Skill display
│   │   │   │   └── SkillList.jsx       # Skill grid
│   │   │   │
│   │   │   └── context/                # Context Providers
│   │   │       ├── AuthContext.jsx     # Auth state
│   │   │       └── SocketContext.jsx   # Socket connection
│   │   │
│   │   ├── services/                   # API Services
│   │   │   ├── api.js                  # Axios instance
│   │   │   ├── authService.js          # Auth API calls
│   │   │   ├── userService.js          # User API calls
│   │   │   ├── skillService.js         # Skill API calls
│   │   │   ├── sessionService.js       # Session API calls
│   │   │   ├── messageService.js       # Message API calls
│   │   │   └── paymentService.js       # Payment API calls
│   │   │
│   │   ├── utils/                      # Utility Functions
│   │   │   ├── validation.js           # Form validation
│   │   │   └── helpers.js              # Helper functions
│   │   │
│   │   ├── data/                       # Mock Data
│   │   │   ├── skills.js               # Skill list
│   │   │   └── categories.js           # Categories
│   │   │
│   │   ├── App.jsx                     # Main app with routing
│   │   ├── main.jsx                    # Entry point
│   │   └── index.css                   # Global styles
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                            # Node.js Backend
│   ├── src/
│   │   ├── controllers/                # Route Controllers
│   │   │   ├── authController.js       # Auth logic
│   │   │   ├── userController.js       # User logic
│   │   │   ├── skillController.js      # Skill logic
│   │   │   ├── sessionController.js    # Session logic
│   │   │   ├── messageController.js    # Message logic
│   │   │   ├── paymentController.js    # Payment logic
│   │   │   ├── transactionController.js # Transaction logic
│   │   │   ├── otpController.js        # OTP logic
│   │   │   └── adminController.js      # Admin logic
│   │   │
│   │   ├── routes/                     # API Routes
│   │   │   ├── auth.routes.js          # /api/auth
│   │   │   ├── user.routes.js          # /api/users
│   │   │   ├── skill.routes.js         # /api/skills
│   │   │   ├── session.routes.js       # /api/sessions
│   │   │   ├── message.routes.js       # /api/messages
│   │   │   ├── payment.routes.js       # /api/payments
│   │   │   ├── transaction.routes.js   # /api/transactions
│   │   │   ├── otp.routes.js           # /api/otp
│   │   │   └── admin.routes.js         # /api/admin
│   │   │
│   │   ├── models/                     # Mongoose Models
│   │   │   ├── User.js
│   │   │   ├── Skill.js
│   │   │   ├── Session.js
│   │   │   ├── Transaction.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   ├── Payment.js
│   │   │   └── OTP.js
│   │   │
│   │   ├── middleware/                 # Express Middleware
│   │   │   ├── auth.js                 # JWT verification
│   │   │   ├── roleCheck.js            # Role authorization
│   │   │   ├── validation.js           # Input validation
│   │   │   ├── rateLimiter.js          # Rate limiting
│   │   │   └── errorHandler.js         # Error handling
│   │   │
│   │   ├── services/                   # Business Logic
│   │   │   ├── emailService.js         # Email sending
│   │   │   └── stripeService.js        # Stripe integration
│   │   │
│   │   ├── utils/                      # Helper Functions
│   │   │   ├── emailTemplates.js       # Email HTML
│   │   │   └── helpers.js              # Utility functions
│   │   │
│   │   ├── config/                     # Configuration
│   │   │   ├── database.js             # MongoDB connection
│   │   │   ├── stripe.js               # Stripe config
│   │   │   └── email.js                # Email config
│   │   │
│   │   └── server.js                   # Express server setup
│   │
│   ├── package.json
│   └── .env
│
├── admin-frontend/                     # Admin Dashboard (TypeScript)
│   ├── src/
│   │   ├── pages/                      # Admin Pages
│   │   │   ├── Login.tsx               # Admin login
│   │   │   ├── Dashboard.tsx           # Overview
│   │   │   ├── Users.tsx               # User management
│   │   │   ├── Teachers.tsx            # Teacher management
│   │   │   ├── Skills.tsx              # Skill management
│   │   │   ├── Sessions.tsx            # Session monitoring
│   │   │   ├── Transactions.tsx        # Token transactions
│   │   │   ├── Reports.tsx             # Analytics
│   │   │   ├── Reviews.tsx             # Review management
│   │   │   ├── Notifications.tsx       # Notifications
│   │   │   └── Settings.tsx            # Admin settings
│   │   │
│   │   ├── components/
│   │   │   ├── layout/                 # Layout Components
│   │   │   │   ├── Layout.tsx          # Main layout
│   │   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   │   └── Header.tsx          # Top bar
│   │   │   │
│   │   │   └── common/                 # Reusable Components
│   │   │       ├── Badge.tsx           # Status badge
│   │   │       ├── Button.tsx          # Button component
│   │   │       ├── DataTable.tsx       # Data table
│   │   │       ├── Modal.tsx           # Modal dialog
│   │   │       └── StatsCard.tsx       # Stats display
│   │   │
│   │   ├── context/                    # Context Providers
│   │   │   └── AuthContext.tsx         # Admin auth
│   │   │
│   │   ├── services/                   # API Services
│   │   │   └── adminApi.ts             # Admin API calls
│   │   │
│   │   ├── types/                      # TypeScript Types
│   │   │   └── index.ts                # Type definitions
│   │   │
│   │   ├── App.tsx                     # Main app
│   │   └── main.tsx                    # Entry point
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

---

## RESPONSIVE DESIGN

### Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Optimizations

- Hamburger menu navigation
- Stack-based layout (vertical)
- Touch-friendly buttons (min 44px height)
- Mobile-optimized forms
- Simplified card layouts
- Bottom navigation (planned)

### Tablet Optimizations

- Grid layouts (2 columns)
- Sidebar navigation
- Responsive tables (horizontal scroll)
- Modal dialogs

### Desktop Optimizations

- Full navigation bar
- Multi-column layouts (3-4 columns)
- Sidebar + content layout
- Hover effects
- Keyboard shortcuts (Ctrl+K for search)

---

## ANIMATIONS & INTERACTIONS

### Framer Motion Animations

- Page transitions (fade in/out)
- Component fade-ins on scroll
- Hover effects (scale, color change)
- Icon rotations (dropdown arrows)
- Scale animations (buttons)
- Slide animations (modals, drawers)

### Loading States

- Skeleton screens for content loading
- Loading spinners for API calls
- Progress bars for uploads
- Shimmer effect for placeholders

### User Feedback

- Toast notifications (success, error, info)
- Modal confirmations
- Inline validation errors
- Success checkmarks
- Error shake animations

---

## PERFORMANCE OPTIMIZATIONS

- **Lazy Loading:** React.lazy() for page components
- **Code Splitting:** Separate bundles for routes
- **Memoization:** React.memo for expensive components
- **Virtual Lists:** For large data sets (teacher lists)
- **Image Optimization:** Lazy loading images
- **Compression:** Gzip compression on backend
- **Caching:** localStorage for user preferences
- **Debouncing:** Search input (300ms delay)
- **Request Batching:** Combine multiple API calls
- **Database Indexing:** MongoDB indexes on frequent queries

---

## ENVIRONMENT VARIABLES

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Backend (.env)

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skillup
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=skillup <noreply@skillup.com>

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## KEY STATISTICS

| Metric                     | Count                   |
| -------------------------- | ----------------------- |
| **Total Pages**            | 23 (12 user + 11 admin) |
| **Total Components**       | 50+                     |
| **Total API Endpoints**    | 60+                     |
| **API Route Files**        | 9                       |
| **Skill Categories**       | 8+                      |
| **Profile Tabs**           | 7                       |
| **Authentication Methods** | 2 (Email/Password, OTP) |
| **Data Models**            | 8                       |
| **Token Packages**         | 3                       |
| **Socket.io Events**       | 10+                     |
| **Admin Features**         | 11 pages                |
| **Form Validations**       | 20+                     |
| **Buttons/Actions**        | 50+                     |

---

## UPCOMING FEATURES (Planned)

1. **Video Calling:** Integrated video sessions using WebRTC
2. **Course Creation:** Teachers can create structured courses
3. **Certification:** Issue certificates for completed courses
4. **Referral System:** Earn tokens by referring users
5. **Mobile App:** React Native mobile application
6. **Advanced Analytics:** Detailed insights for teachers
7. **Group Sessions:** Multi-participant learning sessions
8. **Scheduling Calendar:** Visual calendar for session booking
9. **Payment Plans:** Subscription-based unlimited learning
10. **AI Recommendations:** Personalized skill recommendations

---

## TESTING CREDENTIALS

### User Accounts (Development)

```
Learner Account:
Email: learner@test.com
Password: Learner123!

Teacher Account:
Email: teacher@test.com
Password: Teacher123!

Admin Account:
Email: admin@skillup.com
Password: Admin123!
```

### Test Token Packages (Stripe Test Mode)

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

## SUPPORT & DOCUMENTATION

### Developer Documentation

- API Documentation: `/api/docs` (planned)
- Component Storybook: Coming soon
- Database Schema: See Data Models section above

### User Guides

- Getting Started Guide
- Teacher Handbook
- Learner Guide
- FAQ Section

### Contact

- Email: support@skillup.com
- Discord: Coming soon
- GitHub: Repository link

---

**Last Updated:** November 25, 2025
**Version:** 1.0.0
**Documentation Status:** Complete

---

This documentation covers all features, pages, components, buttons, forms, API endpoints, and functionality of the skillup platform. For technical implementation details, refer to the source code in the respective directories.
