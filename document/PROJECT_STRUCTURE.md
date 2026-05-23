# 📁 Complete Session Booking & Video System - Project Structure

## Backend Structure (Node.js + Express + MongoDB)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── agora.js             # Agora SDK configuration
│   │   ├── cloudinary.js        # Cloudinary setup for recordings
│   │   ├── email.js             # Email service (SendGrid/Nodemailer)
│   │   └── redis.js             # Redis for caching & real-time notifications
│   │
│   ├── models/
│   │   ├── User.js              # Base user model
│   │   ├── Teacher.js           # Teacher profile
│   │   ├── Student.js           # Student profile
│   │   ├── Skill.js             # Skills/Courses
│   │   ├── Booking.js           # Booking records
│   │   ├── Session.js           # Active sessions
│   │   ├── SessionRecording.js  # Recording metadata
│   │   ├── Notification.js      # Notification queue
│   │   ├── Wallet.js            # Token wallet
│   │   └── TokenTransaction.js  # Token history
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication
│   │   ├── searchController.js      # Course/teacher search
│   │   ├── teacherController.js     # Teacher profile management
│   │   ├── bookingController.js     # Booking creation & management
│   │   ├── sessionController.js     # Video session logic
│   │   ├── recordingController.js   # Recording management
│   │   ├── notificationController.js # Notification handling
│   │   ├── walletController.js      # Token management
│   │   └── adminController.js       # Admin operations
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── search.js
│   │   ├── teachers.js
│   │   ├── bookings.js
│   │   ├── sessions.js
│   │   ├── recordings.js
│   │   ├── notifications.js
│   │   ├── wallet.js
│   │   └── admin.js
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── roleCheck.js         # Role-based access control
│   │   ├── rateLimiter.js       # Rate limiting
│   │   ├── validateToken.js     # Session token validation
│   │   ├── csrf.js              # CSRF protection
│   │   └── errorHandler.js      # Global error handler
│   │
│   ├── services/
│   │   ├── agoraService.js      # Agora token generation & session management
│   │   ├── recordingService.js  # Recording capture & upload
│   │   ├── cloudService.js      # Cloud storage operations
│   │   ├── emailService.js      # Email notifications
│   │   ├── notificationService.js # Push & in-app notifications
│   │   ├── bookingEngine.js     # Booking logic & conflict detection
│   │   ├── escrowService.js     # Token locking system
│   │   └── timezoneService.js   # Timezone conversion
│   │
│   ├── utils/
│   │   ├── tokenGenerator.js    # Session token generator
│   │   ├── validators.js        # Input validation
│   │   ├── dateHelpers.js       # Date/time utilities
│   │   └── logger.js            # Winston logger
│   │
│   ├── websocket/
│   │   ├── socketServer.js      # Socket.io setup
│   │   └── notificationSocket.js # Real-time notifications
│   │
│   ├── jobs/
│   │   ├── recordingCleanup.js  # Auto-delete old recordings
│   │   ├── sessionReminder.js   # Session reminders
│   │   └── tokenExpiry.js       # Token expiration checker
│   │
│   └── app.js                   # Express app initialization
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── package.json
└── server.js                    # Entry point
```

## Frontend Structure (React + Tailwind + Vite)

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SkillFilter.jsx
│   │   │   └── TeacherCard.jsx
│   │   │
│   │   ├── teacher/
│   │   │   ├── TeacherProfile.jsx
│   │   │   ├── SkillList.jsx
│   │   │   ├── RatingDisplay.jsx
│   │   │   └── AvailabilityCalendar.jsx
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingModal.jsx
│   │   │   ├── CalendarPicker.jsx
│   │   │   ├── TimeSlotSelector.jsx
│   │   │   ├── DurationSelector.jsx
│   │   │   ├── TimezoneSelector.jsx
│   │   │   └── BookingConfirmation.jsx
│   │   │
│   │   ├── session/
│   │   │   ├── SessionList.jsx
│   │   │   ├── SessionCard.jsx
│   │   │   ├── UpcomingSession.jsx
│   │   │   └── CompletedSession.jsx
│   │   │
│   │   ├── video/
│   │   │   ├── VideoRoom.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   ├── ChatSidebar.jsx
│   │   │   ├── ScreenShare.jsx
│   │   │   ├── Whiteboard.jsx
│   │   │   └── SessionTimer.jsx
│   │   │
│   │   ├── recording/
│   │   │   ├── RecordingPlayer.jsx
│   │   │   ├── RecordingControls.jsx
│   │   │   └── RecordingMetadata.jsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── NotificationList.jsx
│   │   │   └── NotificationItem.jsx
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── SessionMonitor.jsx
│   │       ├── RecordingManager.jsx
│   │       └── DisputePanel.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── TeacherProfile.jsx
│   │   ├── Sessions.jsx
│   │   ├── VideoSession.jsx
│   │   ├── RecordingPlayback.jsx
│   │   ├── AdminPanel.jsx
│   │   └── NotFound.jsx
│   │
│   ├── hooks/
│   │   ├── useAgora.js          # Agora SDK integration
│   │   ├── useSession.js        # Session management
│   │   ├── useRecording.js      # Recording playback
│   │   ├── useNotifications.js  # Real-time notifications
│   │   ├── useBooking.js        # Booking logic
│   │   └── useWebSocket.js      # Socket.io client
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── SessionContext.jsx
│   │
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   ├── authService.js
│   │   ├── searchService.js
│   │   ├── bookingService.js
│   │   ├── sessionService.js
│   │   ├── recordingService.js
│   │   └── notificationService.js
│   │
│   ├── utils/
│   │   ├── dateFormatter.js
│   │   ├── tokenHelper.js
│   │   └── validators.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Database Collections

1. **users** - Base user authentication
2. **teachers** - Teacher profiles & availability
3. **students** - Student profiles
4. **skills** - Course/skill catalog
5. **bookings** - Booking records
6. **sessions** - Active video sessions
7. **session_recordings** - Recording metadata
8. **notifications** - Notification queue
9. **wallets** - Token balances
10. **token_transactions** - Token history
11. **admin_logs** - Admin activity logs

## Key Technologies

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Video SDK**: Agora.io
- **Storage**: Cloudinary / AWS S3
- **Cache**: Redis
- **Email**: SendGrid
- **Real-time**: Socket.io
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Scheduling**: node-cron

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Video**: Agora React SDK
- **State**: Context API + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Calendar**: react-big-calendar
- **Notifications**: react-toastify
- **WebSocket**: Socket.io-client

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/swaply
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
SESSION_TOKEN_EXPIRE=24h

# Agora
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@swaply.com

# Security
CSRF_SECRET=your_csrf_secret
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Recording
RECORDING_EXPIRY_DAYS=30
AUTO_DELETE_RECORDINGS=true
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
VITE_AGORA_APP_ID=your_agora_app_id
```

## Next Steps

1. Initialize backend with `npm init` and install dependencies
2. Initialize frontend with `npm create vite@latest`
3. Set up MongoDB connection
4. Create all database models
5. Build API routes and controllers
6. Integrate Agora SDK
7. Build frontend components
8. Test integration
9. Deploy to production