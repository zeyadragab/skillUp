# skillup Platform - Complete Pages & Screens Documentation

> Comprehensive documentation of all pages/screens for Web Application and Mobile Application

---

## 📱 Platform Overview

skillup consists of:

- **Web Application** (React + Vite) - Full-featured responsive web platform
- **Mobile Application** (React Native + Expo) - Native mobile experience

---

## 🌐 WEB APPLICATION PAGES

### 🔓 Public Pages (No Authentication Required)

#### 1. **Landing Page** `/`

**File**: `src/pages/Landing.jsx`

**Purpose**: Marketing homepage showcasing platform features

**Sections**:

- Hero section with CTA buttons
- Features showcase (6 feature cards)
- How it works (4-step process)
- Pricing plans (Starter, Popular, Pro)
- Testimonials (User reviews)
- Final CTA section
- Footer

**Target Audience**: New visitors, potential users

**Key Actions**:

- Sign up navigation
- Sign in navigation
- View demo video (placeholder)

---

#### 2. **Sign In** `/signin`

**File**: `src/pages/Signin.jsx`

**Purpose**: User authentication (login)

**Features**:

- Email/password login
- Remember me option
- Forgot password link
- Social login buttons (if implemented)
- Link to sign up page
- Redirect to OTP login option

**Form Fields**:

- Email
- Password

**Success Action**: Redirect to `/home`

---

#### 3. **Sign Up** `/signup`

**File**: `src/pages/Signup.jsx`

**Purpose**: New user registration

**Features**:

- User registration form
- Email verification trigger
- Terms & conditions acceptance
- Link to sign in page

**Form Fields**:

- Full name
- Email
- Password
- Confirm password
- Phone number
- Role selection (Teacher/Learner)

**Success Action**: Redirect to `/activate` (email verification)

---

#### 4. **Account Activation** `/activate`

**File**: `src/pages/ActivateAccount.jsx`

**Purpose**: Email verification

**Features**:

- Email verification link handler
- Activation token validation
- Success/error messages
- Resend activation email option

**Success Action**: Redirect to `/signin`

---

#### 5. **OTP Login** `/otp-login`

**File**: `src/pages/OTPLogin.jsx`

**Purpose**: Alternative login method using OTP

**Features**:

- Phone number input
- OTP request
- SMS/Email OTP sending

**Form Fields**:

- Phone number or Email

**Success Action**: Redirect to `/otp-verify`

---

#### 6. **OTP Verification** `/otp-verify`

**File**: `src/pages/OTPVerify.jsx`

**Purpose**: Verify OTP code

**Features**:

- OTP code input (6 digits)
- Resend OTP option
- Countdown timer
- Auto-submit on complete

**Success Action**: Redirect to `/home`

---

### 🔒 Protected User Pages (Authentication Required)

#### 7. **Dashboard/Home** `/home`

**File**: `src/pages/Home.jsx`

**Purpose**: Main user dashboard after login

**Features**:

- Welcome message
- Skill browser/search
- Featured teachers
- Recent sessions
- Recommended skills
- Quick actions (Book session, Browse skills)
- Upcoming sessions widget
- Token balance display

**Target Audience**: All authenticated users

---

#### 8. **User Profile** `/profile`

**File**: `src/pages/Profile.jsx`

**Purpose**: User's own profile management

**Sections/Tabs**:

1. **User Info Section**
   - Profile picture
   - Name, bio, location
   - Edit profile button
   - Contact information

2. **Skills Section**
   - Skills I teach
   - Skills I want to learn
   - Add/remove skills
   - Skill proficiency levels

3. **Sessions Section**
   - Upcoming sessions
   - Past sessions
   - Session history
   - Session statistics

4. **Tokens Section**
   - Current balance
   - Purchase tokens button
   - Transaction history
   - Tokens earned
   - Tokens spent

5. **Connections Section**
   - Connected teachers
   - Connected learners
   - Connection requests
   - Favorite teachers

6. **Courses Section** (if applicable)
   - Enrolled courses
   - Teaching courses
   - Course progress

7. **Settings Section**
   - Account settings
   - Notification preferences
   - Privacy settings
   - Language preferences
   - Delete account

**Features**:

- Edit profile modal
- Upload profile picture
- Update bio and information
- Manage skills
- View analytics

---

#### 9. **Teacher Profile (Public View)** `/profile/:userId`

**File**: `src/pages/TeacherProfile.jsx`

**Purpose**: View other users' profiles (especially teachers)

**Features**:

- Teacher information
- Skills they teach
- Hourly rate (tokens)
- Average rating & reviews
- Availability calendar
- Book session button
- Send message button
- Reviews & testimonials section
- Session history count
- Teaching experience

**Target Audience**: Students looking for teachers

---

#### 10. **Skill Search Results** `/skills/:skillName`

**File**: `src/pages/SkillSearchResults.jsx`

**Purpose**: Display teachers offering a specific skill

**Features**:

- List of teachers for searched skill
- Filter options:
  - Price range (tokens)
  - Rating
  - Availability
  - Experience level
- Sort options:
  - Most popular
  - Highest rated
  - Lowest price
  - Most experienced
- Teacher cards with:
  - Profile picture
  - Name
  - Rating
  - Price per hour
  - Quick book button
  - View profile button

---

#### 11. **Sessions List** `/sessions`

**File**: `src/pages/Sessions.jsx`

**Purpose**: Manage all user sessions

**Tabs/Filters**:

- Upcoming sessions
- Past sessions
- Cancelled sessions
- All sessions

**Features**:

- Session cards showing:
  - Teacher/Student info
  - Date & time
  - Duration
  - Status (Pending, Confirmed, Completed, Cancelled)
  - Topic/skill
  - Join video button (for upcoming)
  - View recording button (for completed)
  - View summary button
- Cancel session option
- Reschedule option
- Rate & review (after completion)

---

#### 12. **Video Session** `/sessions/:sessionId/video`

**File**: `src/pages/VideoSession.jsx`

**Purpose**: Live video session room (WebRTC)

**Features**:

- Video call interface (Agora RTC)
- Camera controls (on/off)
- Microphone controls (mute/unmute)
- Screen sharing
- Chat sidebar
- Recording indicator
- Session timer
- Participant list
- End session button
- Report issue button

**Technologies**: Agora RTC SDK

---

#### 13. **Session Summary** `/sessions/:sessionId/summary`

**File**: `src/pages/SessionSummary.jsx`

**Purpose**: Post-session summary and feedback

**Features**:

- Session details (date, duration, topic)
- Participant information
- Session notes
- Rate the session
- Write review
- View recording link
- Download session materials
- Book next session button

---

#### 14. **Recordings** `/recordings`

**File**: `src/pages/Recordings.jsx`

**Purpose**: View all session recordings

**Features**:

- List of all recorded sessions
- Thumbnail previews
- Session details (date, teacher, topic)
- Duration
- Play button
- Download option (if allowed)
- Delete option (own sessions)
- Search/filter recordings
- Sort by date

---

#### 15. **Recording Player** `/recordings/:id`

**File**: `src/pages/RecordingPlayer.jsx`

**Purpose**: Play session recording

**Features**:

- Video player with controls
- Playback speed control
- Quality selection
- Fullscreen mode
- Session information sidebar
- Related sessions
- Take notes while watching
- Timestamp bookmarks

---

#### 16. **Chat/Messages** `/chat`

**File**: `src/pages/Chat.jsx`

**Purpose**: Real-time messaging with other users

**Features**:

- Conversation list
- Search conversations
- Real-time messaging (Socket.io)
- Message notifications
- Typing indicators
- Read receipts
- File/image sharing
- Emoji support
- Message history
- Create new conversation
- User status (online/offline)

---

#### 17. **Buy Tokens** `/buy-tokens`

**File**: `src/pages/BuyTokens.jsx`

**Purpose**: Purchase token packages for booking learning sessions

**Token Packages**:

1. **Starter Pack** - 10 tokens ($9.99)
   - Perfect for beginners
   - 1-2 sessions
   - No expiry

2. **Popular Pack** - 25 + 5 bonus tokens ($19.99) ⭐ Most Popular
   - 5-6 sessions
   - Save 20%
   - +5 bonus tokens FREE

3. **Professional** - 50 + 10 bonus tokens ($34.99)
   - Best value
   - 10-12 sessions
   - Save 30%
   - +10 bonus tokens FREE

4. **Premium Pack** - 100 + 25 bonus tokens ($59.99)
   - Maximum value
   - 20+ sessions
   - Save 40%
   - +25 bonus tokens FREE
   - Priority support

**Payment Methods Available**:

- 💳 **PayPal** - Secure PayPal checkout
- 💳 **Visa/Mastercard** - Credit or Debit card payment
- 📱 **InstaPay** - Fast payment (Egypt region)
- 🏪 **Fawry** - Pay at Fawry locations or app (Egypt region)
- 📲 **Mobile Wallet** - Vodafone Cash, Orange Money, etc.

**Payment Modal Features**:

- Package summary with pricing
- Multiple payment method selection
- Card details form (number, holder, expiry, CVV)
- Wallet/phone number input
- Fawry payment code generation
- SSL security badge (256-bit encryption)
- Real-time form validation
- Processing indicators
- Success/Error handling

**Page Sections**:

- Hero section with token balance
- Package cards with pricing
- Payment method grid
- Security benefits
- FAQ section
- Popular badge indicators
- Savings calculators

**Access Points**:

- Navbar: Clickable token balance button
- Landing page: "Get Started" CTA
- Profile page: "Buy Tokens" button
- Low balance notifications
- Session booking (insufficient tokens)

---

### 👨‍💼 Admin Pages (Admin Role Required)

#### 18. **Admin Dashboard** `/admin`

**File**: `src/pages/AdminDashboard.jsx`

**Purpose**: Platform administration and analytics

**Tabs**:

##### **Overview Tab**

**Statistics Cards**:

- Total Users
  - Number of users
  - New users this month
  - Teachers vs Learners breakdown

- Total Sessions
  - Total sessions conducted
  - Active sessions
  - Completion rate percentage

- Tokens in Circulation
  - Total tokens in system
  - Tokens earned by teachers
  - Tokens spent by learners

- Total Revenue
  - Revenue from token sales
  - Number of transactions
  - Average transaction value

**Top Teachers Section**:

- Ranking of top-performing teachers
- Tokens earned
- Total sessions taught
- Average rating
- Email/contact info

**Charts & Graphs** (recommended additions):

- User growth chart
- Session completion trends
- Revenue trends
- Popular skills chart

---

##### **Users Tab**

**Features**:

- User management table with columns:
  - User name
  - Email
  - Role (Teacher/Learner/Admin)
  - Token balance
  - Status (Active/Inactive/Suspended)
  - Join date
  - Last active

**Actions**:

- Search users
- Filter by role (All, Teachers, Learners, Admins)
- Filter by status (Active, Inactive, Suspended)
- Sort users
- View user details
- Edit user information
- Suspend/Activate user
- Ban user
- Grant/Revoke admin rights
- Reset user password
- Delete user account

**Bulk Actions**:

- Export user data (CSV)
- Send bulk notifications
- Bulk status update

---

##### **Sessions Tab** (Coming Soon)

**Planned Features**:

- All sessions across platform
- Session statistics
- Filter by status/date
- Monitor active sessions
- Session dispute resolution
- Cancel problematic sessions
- View session recordings
- Generate session reports

---

##### **Settings Tab** (Coming Soon)

**Planned Features**:

- Platform settings
- Token pricing configuration
- Commission rates
- Email templates
- SMS/notification settings
- Platform maintenance mode
- Feature toggles
- Security settings
- Backup management

**Additional Admin Features** (Recommended):

- **Analytics Dashboard**
  - Revenue analytics
  - User engagement metrics
  - Platform health monitoring

- **Content Moderation**
  - Review reported users
  - Review reported sessions
  - Moderate user profiles

- **Financial Management**
  - Transaction history
  - Refund management
  - Payout management

- **Support/Help Desk**
  - Support tickets
  - FAQ management
  - Help center content

---

### 🔍 Additional/Utility Pages

#### 19. **404 Not Found** `*` (catch-all)

**File**: Inline component in `App.jsx`

**Purpose**: Handle invalid routes

**Features**:

- 404 error message
- "Page not found" text
- "Go Home" button redirecting to `/home`

---

## 📱 MOBILE APPLICATION SCREENS

**Note**: Mobile app is currently in early development stage

**Platform**: React Native with Expo
**Location**: `skillup-mobile-new/`

### Current Screens

#### 1. **Login Screen**

**File**: `src/screens/LoginScreen.js`

**Purpose**: Mobile authentication

**Features**:

- Email/phone login
- Password input
- Remember me toggle
- Biometric login (fingerprint/face ID)
- "Forgot password" link
- Sign up navigation

---

### 📋 Planned Mobile Screens (Recommended Implementation)

Based on the web application, here are the recommended mobile screens:

#### **Authentication Flow**

1. ✅ **Login Screen** (Implemented)
2. **Register Screen** (Planned)
3. **OTP Verification Screen** (Planned)
4. **Forgot Password Screen** (Planned)
5. **Onboarding Screens** (3-4 slides)

---

#### **Main App Flow**

6. **Home/Dashboard Screen**
   - Bottom tab navigation
   - Featured teachers
   - Quick search
   - Recent sessions
   - Token balance widget

7. **Explore/Search Screen**
   - Skill search
   - Teacher discovery
   - Categories
   - Filters

8. **Sessions Screen**
   - List of sessions
   - Upcoming/Past tabs
   - Session details

9. **Messages/Chat Screen**
   - Conversation list
   - Individual chat screen
   - Real-time messaging

10. **Profile Screen**
    - User information
    - Edit profile
    - Settings
    - Logout

---

#### **Teacher/Booking Flow**

11. **Teacher Profile Screen**
    - Teacher details
    - Reviews
    - Availability
    - Book session button

12. **Booking Screen**
    - Select date/time
    - Choose duration
    - Confirm booking
    - Payment (tokens)

13. **Session Details Screen**
    - Session information
    - Join button
    - Cancel/Reschedule options

---

#### **Video Session**

14. **Video Call Screen**
    - WebRTC video
    - Controls overlay
    - Chat drawer
    - End call button

15. **Session Summary Screen**
    - Post-session rating
    - Review submission
    - Recording link

---

#### **Recordings**

16. **Recordings List Screen**
    - All recordings
    - Search/filter
    - Play button

17. **Video Player Screen**
    - Full-screen playback
    - Controls
    - Session info

---

#### **Wallet/Tokens**

18. **Wallet Screen**
    - Token balance
    - Transaction history
    - Purchase tokens button

19. **Purchase Tokens Screen**
    - Token packages
    - Payment methods
    - Checkout

---

#### **Settings & More**

20. **Settings Screen**
    - Account settings
    - Notifications
    - Privacy
    - Help & Support

21. **Notifications Screen**
    - Push notifications
    - In-app alerts
    - Notification history

---

#### **Admin Mobile** (Optional)

22. **Admin Dashboard Screen**
    - Key metrics
    - Quick actions

23. **User Management Screen**
    - User list
    - Search/filter
    - User actions

---

## 🎨 Page Access Matrix

### Web Application Access Levels

| Page                   | Public | User | Teacher | Admin | Protected |
| ---------------------- | ------ | ---- | ------- | ----- | --------- |
| Landing                | ✅     | ✅   | ✅      | ✅    | ❌        |
| Sign In                | ✅     | ✅   | ✅      | ✅    | ❌        |
| Sign Up                | ✅     | ✅   | ✅      | ✅    | ❌        |
| Activate Account       | ✅     | ✅   | ✅      | ✅    | ❌        |
| OTP Login              | ✅     | ✅   | ✅      | ✅    | ❌        |
| OTP Verify             | ✅     | ✅   | ✅      | ✅    | ❌        |
| Dashboard/Home         | ❌     | ✅   | ✅      | ✅    | ✅        |
| Profile (Own)          | ❌     | ✅   | ✅      | ✅    | ✅        |
| Teacher Profile (View) | ❌     | ✅   | ✅      | ✅    | ✅        |
| Skill Search           | ❌     | ✅   | ✅      | ✅    | ✅        |
| Sessions               | ❌     | ✅   | ✅      | ✅    | ✅        |
| Video Session          | ❌     | ✅   | ✅      | ✅    | ✅        |
| Session Summary        | ❌     | ✅   | ✅      | ✅    | ✅        |
| Recordings             | ❌     | ✅   | ✅      | ✅    | ✅        |
| Recording Player       | ❌     | ✅   | ✅      | ✅    | ✅        |
| Chat                   | ❌     | ✅   | ✅      | ✅    | ✅        |
| **Buy Tokens**         | ❌     | ✅   | ✅      | ✅    | ✅        |
| **Admin Dashboard**    | ❌     | ❌   | ❌      | ✅    | ✅        |

---

## 📊 Page Statistics

### Web Application

- **Total Pages**: 19
- **Public Pages**: 6
- **Protected User Pages**: 12 (including Buy Tokens)
- **Admin Pages**: 1 (with 4 tabs)
- **Utility Pages**: 1 (404)

### Mobile Application

- **Implemented Screens**: 1
- **Planned Screens**: 22+
- **Development Status**: Early stage

---

## 🔄 Navigation Flow

### Web User Journey

```
Landing Page (/)
    ├─→ Sign Up (/signup)
    │       └─→ Activate Account (/activate)
    │               └─→ Sign In (/signin)
    │                       └─→ Dashboard (/home)
    └─→ Sign In (/signin)
            ├─→ Dashboard (/home)
            │       ├─→ Profile (/profile)
            │       ├─→ Search Skills (/skills/:skillName)
            │       ├─→ Teacher Profile (/profile/:userId)
            │       │       └─→ Book Session
            │       ├─→ Sessions (/sessions)
            │       │       └─→ Video Session (/sessions/:id/video)
            │       │               └─→ Session Summary (/sessions/:id/summary)
            │       ├─→ Recordings (/recordings)
            │       │       └─→ Recording Player (/recordings/:id)
            │       ├─→ Chat (/chat)
            │       └─→ Buy Tokens (/buy-tokens)
            └─→ Admin Dashboard (/admin) [Admin Only]
```

---

## 🛣️ Route Definitions

### Web Routes (from App.jsx)

```javascript
// Public Routes
/                           → Landing Page
/signin                     → Sign In
/signup                     → Sign Up
/activate                   → Activate Account
/otp-login                  → OTP Login
/otp-verify                 → OTP Verify

// Protected User Routes
/home                       → Dashboard
/profile                    → User Profile (Own)
/profile/:userId            → Teacher Profile (View)
/skills/:skillName          → Skill Search Results
/sessions                   → Sessions List
/sessions/:sessionId/video  → Video Session
/sessions/:sessionId/summary → Session Summary
/recordings                 → Recordings List
/recordings/:id             → Recording Player
/chat                       → Chat/Messages
/buy-tokens                 → Buy Tokens (Payment Page)

// Admin Routes
/admin                      → Admin Dashboard

// Utility
*                          → 404 Not Found
```

---

## 💡 Recommended Additions

### Web Application

1. ✅ **Payment/Checkout Page** `/buy-tokens` (IMPLEMENTED)
   - Token purchase flow with 4 packages
   - Multiple payment methods (PayPal, Visa, InstaPay, Fawry, Wallet)
   - Order confirmation and instant delivery

2. **Help Center** `/help`
   - FAQ
   - Tutorials
   - Contact support

3. **Terms & Privacy**
   - `/terms` - Terms of Service
   - `/privacy` - Privacy Policy

4. **About Us** `/about`
   - Company information
   - Team members
   - Mission/vision

5. **Blog/Resources** `/blog`
   - Educational content
   - Platform updates
   - Success stories

---

### Mobile Application Priority

**Phase 1** (MVP):

1. Complete authentication flow
2. Home/Dashboard
3. Teacher search & booking
4. Session management
5. Basic chat

**Phase 2** (Enhanced):

1. Video sessions
2. Recordings
3. Wallet/tokens
4. Full profile management

**Phase 3** (Advanced):

1. Admin features
2. Advanced analytics
3. Offline mode
4. Push notifications

---

## 📞 Support & Documentation

For detailed implementation of each page, refer to:

- **Web Files**: `skillup/src/pages/`
- **Mobile Files**: `skillup-mobile-new/src/screens/`
- **Component Documentation**: See individual page files
- **API Documentation**: Backend documentation

---

**Last Updated**: December 2025
**Version**: 1.0
**Maintained by**: Development Team
