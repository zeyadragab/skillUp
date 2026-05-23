# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**skillup** is a full-stack skill-sharing platform that enables users to exchange educational expertise. The platform features real-time video sessions, session recordings with AI summaries, a skill marketplace, messaging, and token-based payments integrated with Stripe.

The project is organized as a monorepo with:

- **Frontend** (`skillup/`): React 19 + Vite + Tailwind CSS
- **Backend** (`backend/`): Express.js + MongoDB + Socket.io
- **Admin** (`admin-frontend/`, `admin-backend/`): Analytics and platform management dashboards

## Development Setup

### Prerequisites

- Node.js 18+
- MongoDB connection (local or Atlas)
- Environment variables configured (see `backend/.env.example`)

### Install Dependencies

```bash
# Frontend
cd skillup && npm install

# Backend
cd backend && npm install
```

### Development Server

```bash
# Frontend (runs on http://localhost:5173)
cd skillup && npm run dev

# Backend (runs on http://localhost:5000)
cd backend && npm run dev
```

### Build and Production

```bash
# Frontend build
cd skillup && npm run build

# Preview production build
cd skillup && npm run preview
```

## Linting and Code Quality

```bash
# Run ESLint on frontend
cd skillup && npm run lint
```

Backend does not have tests configured (`npm test` shows placeholder).

## Architecture

### Frontend Architecture (`skillup/`)

**State Management**: Uses React Context API with three providers:

- **UserContext** (`src/components/context/UserContext.jsx`): User authentication state, profile, and session data
- **TokenContext** (`src/components/context/TokenContext.jsx`): User token balance for payments
- **LanguageContext** (`src/components/context/LanguageContext.jsx`): Internationalization

**Routing**: React Router v7 with lazy-loaded pages for code splitting. Main routes:

- Public: Landing, SignIn, SignUp
- Protected: Home/Dashboard, Profile, Chat, Video Sessions, Recordings
- Admin: AdminDashboard (role-based access)

**Component Structure**:

- `components/common/`: Reusable UI (Navbar, Footer, TokenCard, NotificationDropdown)
- `components/profile/`: User profile sections and modals
- `components/booking/`: Session booking modal
- `components/skills/`: Skill browser and search
- `components/teachers/`: Teacher browsing and cards
- `components/hero/`: 3D hero animation
- `components/home/`: Home page sections
- `pages/`: Full page components (one per route)

**Styling**: Tailwind CSS v4 with custom configurations. Build optimization includes CSS code splitting and manual chunk management for vendors (React, UI libraries, etc.).

**Real-time Features**:

- **Agora** (`agora-rtc-react`): Video conferencing and recording in VideoSession
- **Socket.io-client**: Real-time messaging in Chat, session notifications
- **React Player**: Session recording playback in RecordingPlayer

### Backend Architecture (`backend/`)

**Server Structure**: Express.js with modular routing:

- `routes/`: API route handlers (auth, sessions, payments, skills, users, etc.)
- `controllers/`: Business logic for each route
- `models/`: Mongoose schemas (User, Session, Skill, Message, Payment, Recording, etc.)
- `middleware/`: Authentication (JWT), validation, rate limiting
- `services/`: External integrations (Agora, OpenAI, email, notifications)
- `jobs/`: Scheduled tasks (session reminders)
- `config/`: Database connection and configuration

**Authentication & Security**:

- JWT tokens with expiration (default 7d)
- OTP-based login fallback
- Rate limiting middleware
- Helmet for security headers
- CORS configured to client URL
- Password hashing with bcryptjs

**Real-time Communication**:

- **Socket.io**: Real-time messaging, session notifications, notifications
- **Agora SDK**: Video session access tokens and recording management
- **OpenAI**: AI-generated session summaries via `aiSummaryService.js`

**External Integrations**:

- **Stripe**: Payment processing with webhook handling
- **Cloudinary**: Image and file uploads
- **Nodemailer**: Email notifications (Gmail SMTP)
- **Bull + Redis**: Job queue for async tasks (summaries, reminders) — not available on Vercel free tier
- **Agora Recording**: Recording storage and access

**Database Patterns**:

- Mongoose for schema validation and migrations
- Connection pooling with lazy initialization for serverless (Vercel)
- Models handle data validation and relationships

### Key Flows

**Video Session Flow**:

1. User books session with teacher → creates Session record
2. Backend generates Agora token via agoraService
3. Frontend connects to Agora channel in VideoSession
4. Recording stored in Agora (if enabled)
5. Session reminder job triggers notifications 24h before
6. Post-session: AI summary generated (Bull job), recording playback available

**Skill Marketplace**:

- Teachers create/manage skills
- Users browse and search skills
- Session booking creates transaction
- Token deduction happens at transaction creation

**Payment Flow**:

- User buys tokens via Stripe
- Webhook updates Payment and user token balance
- Transactions deduct tokens when session completed

## Environment Variables

See `backend/.env.example` for all required vars. Key groups:

- **Server**: NODE_ENV, PORT
- **Database**: MONGODB_URI (with connection pooling for serverless)
- **Auth**: JWT_SECRET, JWT_EXPIRE
- **Client URLs**: CLIENT_URL, FRONTEND_URL (for CORS and Socket.io)
- **Integrations**: Cloudinary, Agora, Stripe, OpenAI, Email (Nodemailer)
- **Redis**: REDIS_URL (for Bull queues, optional on Vercel)

## Common Workflows

### Adding a New API Endpoint

1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Import route in `backend/src/server.js`
4. Create Mongoose model in `backend/src/models/` if needed
5. Add middleware (auth, validation) to route
6. Test with API client (Postman, curl, etc.)

### Adding a Frontend Page

1. Create component in `skillup/src/pages/`
2. Lazy load in `skillup/src/App.jsx`
3. Add route in App's Routes
4. Protect route with ProtectedRoute if authenticated
5. Use contexts (UserContext, TokenContext) for state
6. Call API via `skillup/src/services/api.js` (axios instance)

### Video Session Handling

- **Recording**: Managed by Agora backend, stored in their cloud
- **Playback**: RecordingPlayer uses React Player to stream from Agora
- **Summaries**: Triggered after session end via Bull job, stored in SessionSummary model
- **Access**: User retrieves recordings and summaries from their Sessions/Recordings pages

### Real-time Messaging

- Messages stored in MongoDB (Message, Conversation models)
- Socket.io emits on message send/receive to all connected users in room
- Chat page subscribes to socket events and updates conversation list

## Debugging Tips

**Frontend**:

- Check browser console for errors
- Verify API_URL in `skillup/src/services/api.js` points to correct backend
- Check Network tab for failed API calls (CORS, 404, 500 errors)
- Use React DevTools to inspect context state

**Backend**:

- Check MongoDB connection in console logs (✅ MongoDB Connected or ❌ Error)
- Verify environment variables are set (.env file exists and is loaded)
- Test API endpoints with curl/Postman before frontend integration
- Check Socket.io CORS origin matches CLIENT_URL
- For Agora/Stripe/OpenAI issues, verify API credentials and rate limits

**Database**:

- Use MongoDB Atlas UI or mongo shell to inspect collections
- Check indexes on frequently queried fields (User.email, Session.teacherId, etc.)
- Verify JWT tokens are being stored in User model for refresh logic

## Performance Considerations

**Frontend**:

- Pages are lazy-loaded via React.lazy() for code splitting
- Tailwind CSS uses just-in-time compilation with @tailwindcss/vite
- Chunk size warning limit is 1MB (tuned for performance)
- VirtualList component for large lists (used where applicable)

**Backend**:

- MongoDB connection is pooled and cached
- Rate limiting on sensitive routes (auth, payments)
- Session reminder and summary jobs run asynchronously via Bull
- Cloudinary for image serving (offloads file hosting)

## Deployment

**Frontend** (Vercel):

- Automatically deployed from repo
- Environment: CLIENT_URL points to backend (Vercel or custom domain)
- Build: `npm run build` (runs vite build with chunk optimization)

**Backend** (Vercel or custom Node server):

- Serverless: Uses lazy DB connection and avoids process.exit()
- Environment: All vars in `.env` or Vercel project settings
- Bull/Redis: Not available on Vercel free tier; consider self-hosted for production
- Stripe webhooks: Public endpoint at `/api/webhooks/stripe`

## Notable Dependencies

**Frontend**:

- `react-router-dom@7`: Client-side routing
- `framer-motion`: Smooth animations
- `lucide-react`: Icon library
- `agora-rtc-react@2`: Video conferencing wrapper
- `socket.io-client`: Real-time messaging
- `axios`: HTTP client
- `react-toastify`: Toast notifications

**Backend**:

- `mongoose@8`: MongoDB ORM
- `express`: Web framework
- `socket.io`: Real-time server
- `stripe`: Payment processing
- `nodemailer`: Email sending
- `bull`: Job queue
- `agora-access-token`: Video session tokens
- `openai`: AI summaries
- `cloudinary`: Image storage

---

Last updated: 2026-04-20
