# 🚀 skillup - Quick Start Guide

Get your skillup platform running in **5 minutes**!

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Git installed (optional)
- [ ] A code editor (VS Code recommended)

---

## Step 1: Set Up MongoDB (2 minutes)

### Option A: MongoDB Atlas (Recommended - Fastest)

1. **Create account**: https://www.mongodb.com/cloud/atlas/register
2. **Create FREE cluster** (M0 Sandbox)
3. **Create database user**:
   - Username: `skillup`
   - Password: (save it!)
4. **Add IP to whitelist**: Click "Allow Access from Anywhere"
5. **Get connection string**: Click "Connect" → "Connect your application"
6. **Copy the connection string** (looks like: `mongodb+srv://skillup:...`)

### Option B: Local MongoDB (Requires Installation)

See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed installation instructions.

---

## Step 2: Configure Backend (1 minute)

1. **Open** `backend/.env` file

2. **Update MongoDB connection**:

   ```env
   MONGODB_URI=mongodb+srv://skillup:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skillup?retryWrites=true&w=majority
   ```

   Replace:
   - `YOUR_PASSWORD` with your actual password
   - `cluster0.xxxxx` with your cluster address

3. **That's it!** Other settings have defaults and are optional.

---

## Step 3: Install & Run Backend (1 minute)

```bash
# Navigate to backend folder
cd backend

# Install dependencies (only first time)
npm install

# Start the server
npm run dev
```

**Success! You should see:**

```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 skillup Server is running!
📡 Port: 5000
```

**If you see errors**, check [MONGODB_SETUP.md](MONGODB_SETUP.md)

---

## Step 4: Install & Run Frontend (1 minute)

Open a **new terminal** window:

```bash
# Navigate to frontend folder
cd skillup

# Install dependencies (only first time)
npm install

# Start the development server
npm run dev
```

**Success! You should see:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 5: Open Your Browser

1. Open: **http://localhost:5173**
2. You should see the skillup landing page! 🎉

---

## Test the Platform

### Create Your First Account

1. Click **"Get Started"** or **"Sign Up"**
2. Fill in your details:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
3. Click **"Sign Up"**

**You should:**

- ✅ Be logged in automatically
- ✅ See your dashboard
- ✅ Have **50 tokens** as welcome bonus!

### Test Authentication

1. **Logout**: Click profile icon → Logout
2. **Login**: Use the same credentials
3. **Check**: Token balance should still be 50

---

## What's Working?

| Feature             | Status       | What You Can Do                                 |
| ------------------- | ------------ | ----------------------------------------------- |
| **Authentication**  | ✅           | Sign up, login, logout, update profile          |
| **Token System**    | ✅           | View balance, see transaction history           |
| **Session Booking** | ✅ API Ready | Book sessions (UI pending)                      |
| **Payments**        | ✅ API Ready | Purchase tokens with Stripe (needs Stripe keys) |
| **Messaging**       | ⏳           | Socket.io configured, needs UI                  |
| **Video Calls**     | ⏳           | Needs Agora integration                         |

---

## API Testing (Optional)

Test the backend API directly:

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## Project Structure

```
swaply/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   └── server.js     # Main server file
│   └── .env             # Configuration (MongoDB, JWT, etc.)
│
├── skillup/           # React Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client (axios)
│   │   └── App.jsx      # Main app
│   └── .env            # Frontend config (API URL)
│
└── Documentation Files (README, guides, etc.)
```

---

## Available API Endpoints

### Authentication

```
POST   /api/auth/register     - Create account
POST   /api/auth/login        - Login
GET    /api/auth/me           - Get current user
PUT    /api/auth/profile      - Update profile
POST   /api/auth/logout       - Logout
```

### Sessions

```
POST   /api/sessions          - Book session
GET    /api/sessions          - Get all sessions
GET    /api/sessions/:id      - Get single session
PUT    /api/sessions/:id      - Update session
DELETE /api/sessions/:id/cancel - Cancel session
POST   /api/sessions/:id/rate - Rate session
```

### Payments

```
GET    /api/payments/packages - Get token packages
POST   /api/payments/intent   - Create payment intent
POST   /api/payments/confirm  - Confirm payment
GET    /api/payments/history  - Payment history
```

---

## Common Issues & Fixes

### Backend won't start

**Error**: `Error connecting to MongoDB`

**Fix**:

1. Check MongoDB is running (if local) OR
2. Verify connection string in `backend/.env`
3. See [MONGODB_SETUP.md](MONGODB_SETUP.md)

---

### Frontend can't connect to backend

**Error**: Network errors in browser console

**Fix**:

1. Make sure backend is running on port 5000
2. Check `skillup/.env` has: `VITE_API_URL=http://localhost:5000/api`
3. Restart frontend: `npm run dev`

---

### "Authentication failed" when logging in

**Fix**:

1. Make sure you registered an account first
2. Use the exact same email and password
3. Check backend console for error messages

---

### Port already in use

**Error**: `EADDRINUSE: address already in use :::5000`

**Fix**:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## Optional Features Setup

### Enable Stripe Payments (Optional)

1. Create account: https://dashboard.stripe.com/register
2. Get test keys: Dashboard → Developers → API keys
3. Update `backend/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

### Enable Video Calls (Optional)

1. Create account: https://www.agora.io/en/
2. Create project and get App ID
3. Update `backend/.env`:
   ```env
   AGORA_APP_ID=your_app_id_here
   AGORA_APP_CERTIFICATE=your_certificate_here
   ```

---

## Stopping the Servers

### Stop Backend

- Press `Ctrl + C` in backend terminal

### Stop Frontend

- Press `Ctrl + C` in frontend terminal

---

## Starting Again Later

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd skillup
npm run dev
```

That's it! No need to reinstall dependencies.

---

## Next Steps

Now that your platform is running:

1. **Explore the UI**: Navigate through pages
2. **Test features**: Create sessions, check tokens
3. **Read docs**:
   - [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) - API usage
   - [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md) - Features overview
   - [BACKEND_SETUP_GUIDE.md](BACKEND_SETUP_GUIDE.md) - Backend details

4. **Add features**:
   - User search and discovery
   - Real-time messaging
   - Video calls with Agora
   - Email notifications

---

## Development Commands

### Backend Commands

```bash
npm run dev          # Start with nodemon (auto-restart)
npm start           # Start without auto-restart
npm test            # Run tests (if configured)
```

### Frontend Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## Getting Help

- **MongoDB Issues**: [MONGODB_SETUP.md](MONGODB_SETUP.md)
- **API Documentation**: [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)
- **Full README**: [README.md](README.md)
- **Implementation Status**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## Summary

✅ **MongoDB** - Cloud or local database
✅ **Backend** - Running on port 5000
✅ **Frontend** - Running on port 5173
✅ **Authentication** - Working with JWT
✅ **Token System** - 50 welcome tokens
✅ **API Integration** - Frontend connected to backend

**Current Status**: 55% Complete - Core features working!

---

**Congratulations! 🎉 Your skillup platform is now running!**

**Time to start**: ~5 minutes ⚡
**What's working**: Authentication, Tokens, Sessions API, Payments API
**What's next**: User discovery, Messaging, Video calls

Happy coding! 🚀
