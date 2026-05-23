# skillup Platform - Complete Feature Documentation

## Project Overview

**Project Name:** skillup
**Description:** A peer-to-peer skill exchange platform where users can teach and learn skills using a token-based economy.
**Technology Stack:** React.js, Node.js, Express.js, MongoDB, Socket.io, TailwindCSS

---

## 1. Authentication & User Management

### 1.1 Email/Password Authentication

- **User Registration:** Sign up with name, email, password, and role selection (learner/teacher/both)
- **User Login:** Traditional email and password authentication
- **Email Activation:** Account activation via secure email link (required before first login)
- **Resend Activation Email:** Request new activation link if the original expired

### 1.2 OTP (One-Time Password) Login

- **Request OTP:** Send 6-digit verification code to registered email
- **Verify OTP:** Passwordless login using email verification code
- **Security Features:** 10-minute OTP expiry, maximum 5 verification attempts
- **Brute Force Protection:** Rate limiting on OTP requests

### 1.3 Password Management

- **Forgot Password:** Request password reset via email
- **Reset Password:** Set new password using secure reset link

### 1.4 Profile Management

- **View Profile:** Display user details, skills, and statistics
- **Update Profile:** Edit name, bio, country, timezone, languages, and avatar
- **User Preferences:** Customize notification settings and theme preferences

---

## 2. Skills System

### 2.1 Skill Management

- **Browse Skills:** View all available skills organized by categories
- **Search Skills:** Find specific skills using keyword search
- **Skill Categories:** Technology, Languages, Arts & Crafts, Business, Music, Sports, Academics, Lifestyle
- **Add Skills to Teach:** Teachers can list skills they want to offer
- **Add Skills to Learn:** Learners can list skills they want to acquire

### 2.2 Skill Discovery

- **Find Teachers by Skill:** Search for users who teach specific skills
- **Skill Proficiency Levels:** Beginner, Intermediate, Advanced, Expert
- **Hourly Token Rates:** Teachers set their rates per hour of instruction

---

## 3. Token Economy System

### 3.1 Token Management

- **Welcome Bonus:** 50 free tokens awarded upon registration
- **Token Balance:** Real-time tracking of current token balance
- **Tokens Earned:** Accumulated from teaching sessions
- **Tokens Spent:** Deducted for learning sessions

### 3.2 Transaction System

- **Transaction History:** Complete log of all token movements
- **Transaction Types:** Credit and Debit entries with detailed reasons
- **Balance Tracking:** Before and after balance recorded for each transaction

---

## 4. User Discovery & Social Features

### 4.1 Search & Browse

- **Search Users:** Find users by name or keyword
- **Browse Teachers:** View complete list of available teachers
- **Filter by Skill:** Find users teaching specific skills
- **User Profiles:** Detailed teacher and learner profile pages

### 4.2 Social Interaction

- **Follow Users:** Follow favorite teachers and learners
- **Followers/Following Lists:** View and manage social connections
- **User Ratings:** Average rating and total review count display
- **Teacher Statistics:** Sessions taught, experience level, and achievements

---

## 5. Real-Time Messaging System

### 5.1 Chat Features

- **Direct Messages:** Send private messages to any user
- **Conversations List:** View all active conversations
- **Real-Time Updates:** Instant message delivery using Socket.io
- **Message History:** Access and scroll through previous messages
- **Read Receipts:** Track message read status

### 5.2 Conversation Management

- **Start Conversation:** Initiate new chats with any platform user
- **Conversation Participants:** View all members in a conversation

---

## 6. Session Booking System

### 6.1 Booking Features

- **Book Sessions:** Schedule learning sessions with teachers
- **Session Status Tracking:** Pending, Confirmed, Completed, Cancelled states
- **Token Transfer:** Automatic token exchange upon session completion

---

## 7. Gamification Features

### 7.1 Streak System

- **Daily Streak:** Track consecutive days of platform activity
- **Current Streak Counter:** Display ongoing streak count
- **Longest Streak Record:** Personal best streak achievement
- **Last Activity Tracking:** Monitor user engagement

### 7.2 Leveling System

- **User Levels:** Progressive levels based on experience points
- **Experience Points:** Earned through various platform activities
- **Achievement Badges:** Special badges for milestones and accomplishments

---

## 8. Admin Features

### 8.1 Admin Dashboard

- **User Management:** View, edit, and manage all platform users
- **Role Management:** Assign and modify user roles (User, Teacher, Admin)
- **Platform Statistics:** Overview of platform metrics and activity

---

## 9. Security Features

### 9.1 Rate Limiting

- **Authentication Rate Limit:** 5 attempts per 15 minutes for login/register
- **OTP Rate Limit:** 3 OTP requests per 15 minutes
- **General API Rate Limit:** 100 requests per 15 minutes

### 9.2 Input Validation

- **Email Validation:** Proper email format verification
- **Password Strength:** Minimum security requirements enforced
- **Data Sanitization:** XSS and SQL injection protection

### 9.3 JWT Authentication

- **Secure Tokens:** JSON Web Tokens with 7-day expiry
- **Protected Routes:** Authentication required for sensitive endpoints
- **Token Refresh:** Automatic token management

---

## 10. Frontend Pages

| Page Name            | Description                         |
| -------------------- | ----------------------------------- |
| Landing Page         | Welcome page for new visitors       |
| Sign Up              | User registration form              |
| Sign In              | User login form                     |
| Dashboard            | User home page after authentication |
| Home                 | Main browsing and discovery page    |
| Profile              | User profile view and edit page     |
| Teacher Profile      | Detailed teacher information page   |
| Skill Search Results | Search results display page         |
| Activate Account     | Email activation confirmation page  |
| OTP Login            | OTP request page                    |
| OTP Verify           | OTP code entry page                 |
| Admin Dashboard      | Administrative control panel        |

---

## 11. Technical Architecture

### 11.1 Backend Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-Time:** Socket.io for WebSocket connections
- **Email Service:** Nodemailer with Gmail SMTP

### 11.2 Frontend Stack

- **Framework:** React.js
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State Management:** React Context API
- **HTTP Client:** Axios

### 11.3 Security Implementation

- **Password Hashing:** Bcrypt.js
- **Authentication:** JSON Web Tokens (JWT)
- **CORS:** Cross-Origin Resource Sharing configuration
- **Helmet:** HTTP security headers

---

## Document Information

**Created:** November 2024
**Version:** 1.0
**Platform Status:** Development
