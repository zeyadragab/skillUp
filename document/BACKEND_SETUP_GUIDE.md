# skillup Backend Setup Guide

## 🎯 Overview

This guide will help you set up the complete backend for the skillup platform with all the missing features implemented.

## 📋 What Has Been Created

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User model with skills, tokens, ratings
│   │   ├── Session.js           # Learning sessions model
│   │   ├── Transaction.js       # Token transactions
│   │   ├── Message.js           # Chat messages
│   │   ├── Conversation.js      # Direct/group conversations
│   │   └── Payment.js           # Stripe payment records
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── controllers/             # (To be created - see below)
│   ├── routes/                  # (To be created - see below)
│   ├── services/                # (To be created - see below)
│   ├── utils/                   # (To be created - see below)
│   └── server.js                # Main server file with Socket.io
├── .env.example                 # Environment variables template
└── package.json                 # Dependencies
```

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in the environment variables:

#### Required Services:

**MongoDB:**

- Option 1: Local MongoDB
  ```
  MONGODB_URI=mongodb://localhost:27017/skillup
  ```
- Option 2: MongoDB Atlas (Cloud)
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a free cluster
  3. Get connection string
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillup
  ```

**JWT Secret:**

```
JWT_SECRET=your_super_secret_key_min_32_characters_long
JWT_EXPIRE=7d
```

**Stripe (for payments):**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Get your API keys from Developers > API keys

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Agora (for video calls):**

1. Go to [Agora.io](https://www.agora.io/)
2. Create an account and project
3. Get App ID and App Certificate

```
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_app_certificate
```

**Cloudinary (for image uploads):**

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Get credentials from Dashboard

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Email Service (Gmail example):**

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Account > Security > App Passwords

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Step 3: Run the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will start on `http://localhost:5000`

## 📊 Database Models Created

### User Model

**Features:**

- Authentication (email/password with bcrypt)
- Profile (name, avatar, bio, country, timezone, languages)
- Skills (to teach and to learn with levels)
- Token system (balance, earned, spent)
- Statistics (sessions taught/learned, ratings)
- Gamification (level, experience, badges, streaks)
- Preferences (notifications, dark mode)
- Roles (user, teacher, admin)

**Methods:**

- `comparePassword(password)` - Verify password
- `updateRating(newRating)` - Update average rating
- `addTokens(amount, reason)` - Add tokens
- `deductTokens(amount, reason)` - Deduct tokens
- `hasEnoughTokens(amount)` - Check balance

### Session Model

**Features:**

- Teacher & learner references
- Skill and category
- Scheduling (date, time, duration)
- Session types (one-on-one, group, workshop)
- Skill exchange vs paid sessions
- Video call integration (Agora channel)
- Status tracking (scheduled, in-progress, completed, cancelled)
- Ratings and reviews (both sides)
- Attendance tracking
- Cancellation policies

**Methods:**

- `findUpcoming(userId)` - Get upcoming sessions
- `canCancel()` - Check if cancellation is allowed (24h rule)

### Transaction Model

**Features:**

- Credit/debit tracking
- Reasons (purchase, teaching, learning, referral, challenge, etc.)
- Related session and payment
- Balance before/after
- Full audit trail

**Methods:**

- `getUserHistory(userId, limit)` - Get transaction history

### Message & Conversation Models

**Features:**

- Direct and group conversations
- Message types (text, image, file, session-request)
- Read receipts
- Unread counts
- Real-time with Socket.io

### Payment Model

**Features:**

- Stripe integration
- Token packages (basic, pro, premium)
- Payment status tracking
- Receipt generation
- Refund handling

## 🔐 Authentication Middleware

Created in `src/middleware/auth.js`:

**Functions:**

- `protect` - Verify JWT token
- `authorize(...roles)` - Check user role
- `requireVerified` - Check email verification
- `requireTeacher` - Check teacher status

**Usage in routes:**

```javascript
router.get("/profile", protect, getUserProfile);
router.post("/sessions", protect, requireTeacher, createSession);
router.get("/admin/users", protect, authorize("admin"), getAllUsers);
```

## 🔌 Socket.io Real-Time Features

Implemented in `server.js`:

**Events:**

- `join` - User joins their personal room
- `join-conversation` - Join chat conversation
- `send-message` - Send message in real-time
- `typing` - Typing indicators
- `call-user` - Initiate video call
- `accept-call` - Accept video call

## 🚀 Next Steps - Controllers & Routes to Create

### 1. Auth Controller (`src/controllers/authController.js`)

```javascript
// Functions to create:
-register() - // Sign up new user
  login() - // Sign in with email/password
  logout() - // Clear token
  forgotPassword() - // Send reset email
  resetPassword() - // Reset password with token
  verifyEmail() - // Verify email address
  getMe() - // Get current user
  updateProfile(); // Update user profile
```

### 2. Session Controller (`src/controllers/sessionController.js`)

```javascript
// Functions to create:
-createSession() - // Book a new session
  getUpcomingSessions() - // Get user's upcoming sessions
  getSessionDetails() - // Get single session
  cancelSession() - // Cancel session
  rateSession() - // Rate and review session
  joinSession() - // Join video call
  getTeacherAvailability();
```

### 3. Payment Controller (`src/controllers/paymentController.js`)

```javascript
// Functions to create:
-createPaymentIntent() - // Stripe payment intent
  confirmPayment() - // Confirm payment
  webhookHandler() - // Stripe webhook
  getPaymentHistory() - // User payment history
  refundPayment(); // Process refund
```

### 4. Message Controller (`src/controllers/messageController.js`)

```javascript
// Functions to create:
-sendMessage() - // Send new message
  getConversations() - // Get user conversations
  getMessages() - // Get conversation messages
  markAsRead() - // Mark messages as read
  deleteMessage(); // Delete message
```

### 5. User Controller (`src/controllers/userController.js`)

```javascript
// Functions to create:
-searchTeachers() - // Search teachers by skill
  getTeacherProfile() - // Get teacher details
  addSkill() - // Add teachable/learnable skill
  removeSkill() - // Remove skill
  getTokenBalance() - // Get token balance
  getTransactionHistory(); // Get transaction history
```

### 6. Admin Controller (`src/controllers/adminController.js`)

```javascript
// Functions to create:
-getAllUsers() - // List all users
  getUserDetails() - // Get user details
  updateUserStatus() - // Activate/deactivate user
  approveTeacher() - // Approve teacher application
  adjustTokens() - // Admin token adjustment
  getStatistics(); // Platform statistics
```

## 📱 API Routes to Create

### Auth Routes (`src/routes/authRoutes.js`)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
GET    /api/auth/verify-email/:token
```

### Session Routes (`src/routes/sessionRoutes.js`)

```
POST   /api/sessions              (protected, requireTeacher)
GET    /api/sessions              (protected)
GET    /api/sessions/:id          (protected)
PUT    /api/sessions/:id          (protected)
DELETE /api/sessions/:id          (protected)
POST   /api/sessions/:id/rate     (protected)
POST   /api/sessions/:id/join     (protected)
```

### Payment Routes (`src/routes/paymentRoutes.js`)

```
POST   /api/payments/intent       (protected)
POST   /api/payments/confirm      (protected)
POST   /api/payments/webhook      (public - Stripe webhook)
GET    /api/payments/history      (protected)
POST   /api/payments/refund/:id   (protected, admin)
```

### Message Routes (`src/routes/messageRoutes.js`)

```
GET    /api/conversations         (protected)
GET    /api/conversations/:id     (protected)
POST   /api/messages              (protected)
GET    /api/messages/:conversationId (protected)
PUT    /api/messages/:id/read     (protected)
DELETE /api/messages/:id          (protected)
```

### User Routes (`src/routes/userRoutes.js`)

```
GET    /api/users/search          (protected)
GET    /api/users/:id             (protected)
POST   /api/users/skills          (protected)
DELETE /api/users/skills/:skillId (protected)
GET    /api/users/tokens          (protected)
GET    /api/users/transactions    (protected)
```

### Admin Routes (`src/routes/adminRoutes.js`)

```
GET    /api/admin/users           (protected, admin)
GET    /api/admin/users/:id       (protected, admin)
PUT    /api/admin/users/:id/status (protected, admin)
POST   /api/admin/teachers/approve (protected, admin)
POST   /api/admin/tokens/adjust    (protected, admin)
GET    /api/admin/statistics       (protected, admin)
```

## 🛠️ Utility Files to Create

### 1. Token Utilities (`src/utils/token.js`)

```javascript
// Generate JWT token
export const generateToken = (userId) => { ... }

// Verify token
export const verifyToken = (token) => { ... }
```

### 2. Email Service (`src/utils/email.js`)

```javascript
// Send welcome email
export const sendWelcomeEmail = (user) => { ... }

// Send verification email
export const sendVerificationEmail = (user, token) => { ... }

// Send password reset email
export const sendPasswordResetEmail = (user, token) => { ... }

// Send session reminder
export const sendSessionReminder = (session) => { ... }
```

### 3. Agora Service (`src/services/agoraService.js`)

```javascript
// Generate Agora token for video call
export const generateAgoraToken = (channelName, userId) => { ... }

// Create video channel
export const createVideoChannel = (sessionId) => { ... }
```

### 4. Stripe Service (`src/services/stripeService.js`)

```javascript
// Create payment intent
export const createPaymentIntent = (amount, userId) => { ... }

// Create customer
export const createStripeCustomer = (user) => { ... }

// Process refund
export const processRefund = (paymentId, amount) => { ... }
```

### 5. Matching Algorithm (`src/services/matchingService.js`)

```javascript
// Find matching users for skill exchange
export const findSkillMatches = (userId) => { ... }

// Recommend teachers based on user preferences
export const recommendTeachers = (userId, skill) => { ... }
```

## 🔄 Frontend Integration

Update frontend API calls to use backend:

### Create API Service (`skillup/src/services/api.js`)

```javascript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Update Context Providers

**UserContext.jsx:**

```javascript
import api from "../services/api";

const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  setUser(data.user);
};

const register = async (formData) => {
  const { data } = await api.post("/auth/register", formData);
  localStorage.setItem("token", data.token);
  setUser(data.user);
};
```

## 🧪 Testing the Backend

### 1. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

### 3. Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

### 4. Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📦 Deployment

### Deploy Backend (Render/Railway/Heroku)

**Render.com (Recommended - Free tier):**

1. Push code to GitHub
2. Connect Render to GitHub
3. Create new Web Service
4. Add environment variables
5. Deploy!

**Environment Variables for Production:**

- NODE_ENV=production
- MONGODB_URI=(MongoDB Atlas connection string)
- JWT_SECRET=(strong secret key)
- All API keys (Stripe, Agora, Cloudinary, etc.)

### Deploy Frontend (Vercel/Netlify)

1. Update `VITE_API_URL` to production backend URL
2. Build and deploy

## 📚 Additional Features to Implement

1. **Email Verification Flow**
2. **Password Reset Flow**
3. **Video Call with Agora SDK**
4. **File Upload with Cloudinary**
5. **Real-time Notifications**
6. **Analytics Dashboard**
7. **Admin Panel**
8. **Mobile App (React Native)**

## 🐛 Troubleshooting

**MongoDB Connection Error:**

- Check if MongoDB is running
- Verify connection string in .env
- Check network access in MongoDB Atlas

**JWT Error:**

- Ensure JWT_SECRET is set in .env
- Check token expiration time

**CORS Error:**

- Verify CLIENT_URL matches frontend URL
- Check CORS configuration in server.js

## 📖 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Agora Documentation](https://docs.agora.io/)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Created by: Claude Code**
**Status: Backend Foundation Complete - Ready for Controller Implementation**
