# skillup API Integration Guide

## What Has Been Completed

### Backend Integration (100%)

- Session booking API with full CRUD operations
- Stripe payment integration for token purchases
- Frontend API service layer with axios
- Backend routes connected to Express server
- UserContext and TokenContext updated to use real API

### Frontend Integration (100%)

- API service with interceptors for authentication
- UserContext uses real authentication endpoints
- TokenContext syncs with backend token balance
- Environment configuration for API URL

---

## Quick Start

### 1. Start the Backend Server

```bash
cd backend

# Make sure you have .env file configured
# Required environment variables:
# - MONGODB_URI
# - JWT_SECRET
# - PORT (optional, defaults to 5000)
# - CLIENT_URL (optional, defaults to http://localhost:5173)

npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Start the Frontend

```bash
cd skillup

# Make sure .env file exists with:
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

The frontend will start on `http://localhost:5173`

---

## API Endpoints Available

### Authentication Endpoints

#### Register New User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "tokens": 50,  // Welcome bonus
    ...
  }
}
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User

```bash
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Update Profile

```bash
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Software developer passionate about teaching",
  "country": "USA",
  "languages": ["English", "Spanish"]
}

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Logout

```bash
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Session Endpoints

#### Create Session

```bash
POST /api/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "teacher": "teacher_user_id",
  "skill": "Python Programming",
  "scheduledAt": "2025-01-20T14:00:00Z",
  "duration": 60,
  "isSkillExchange": false
}

Response:
{
  "success": true,
  "session": {
    "_id": "session_id",
    "teacher": { ... },
    "learner": { ... },
    "skill": "Python Programming",
    "scheduledAt": "2025-01-20T14:00:00Z",
    "tokensCharged": 10,
    "status": "scheduled",
    ...
  }
}
```

#### Get All Sessions

```bash
GET /api/sessions
Authorization: Bearer <token>

# Optional query parameters:
# ?status=scheduled
# ?upcoming=true
# ?past=true

Response:
{
  "success": true,
  "sessions": [ ... ]
}
```

#### Get Single Session

```bash
GET /api/sessions/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "session": { ... }
}
```

#### Update Session

```bash
PUT /api/sessions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledAt": "2025-01-20T15:00:00Z",
  "duration": 90
}

Response:
{
  "success": true,
  "session": { ... }
}
```

#### Cancel Session

```bash
DELETE /api/sessions/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Schedule conflict"
}

Response:
{
  "success": true,
  "message": "Session cancelled and tokens refunded",
  "refundAmount": 10
}
```

#### Rate Session

```bash
POST /api/sessions/:id/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent teacher! Very patient and knowledgeable."
}

Response:
{
  "success": true,
  "session": { ... }
}
```

#### Join Video Session

```bash
POST /api/sessions/:id/join
Authorization: Bearer <token>

Response:
{
  "success": true,
  "agoraToken": "agora_token_here",
  "channelName": "session_channel_123",
  "sessionId": "session_id"
}
```

### Payment Endpoints

#### Get Token Packages

```bash
GET /api/payments/packages

Response:
{
  "success": true,
  "packages": {
    "basic": { "tokens": 10, "price": 9.99 },
    "pro": { "tokens": 25, "price": 19.99 },
    "premium": { "tokens": 60, "price": 39.99 }
  }
}
```

#### Create Payment Intent

```bash
POST /api/payments/intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageType": "pro"
}

Response:
{
  "success": true,
  "clientSecret": "stripe_client_secret",
  "amount": 1999,  // In cents
  "tokensAmount": 25
}
```

#### Confirm Payment

```bash
POST /api/payments/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_xxxxx"
}

Response:
{
  "success": true,
  "payment": {
    "status": "succeeded",
    "tokensAdded": 25
  },
  "newBalance": 35
}
```

#### Get Payment History

```bash
GET /api/payments/history
Authorization: Bearer <token>

Response:
{
  "success": true,
  "payments": [
    {
      "amount": 1999,
      "tokensAmount": 25,
      "status": "succeeded",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### Stripe Webhook (for backend only)

```bash
POST /api/payments/webhook
Stripe-Signature: <signature>
Content-Type: application/json

# Handled automatically by Stripe
```

---

## Frontend Usage Examples

### Using Auth API

```javascript
import { authAPI } from "./services/api";

// Register
const handleRegister = async (formData) => {
  try {
    const response = await authAPI.register(formData);
    localStorage.setItem("token", response.token);
    // User is now logged in
  } catch (error) {
    console.error("Registration failed:", error.message);
  }
};

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    localStorage.setItem("token", response.token);
    // User is now logged in
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const response = await authAPI.getMe();
    return response.user;
  } catch (error) {
    console.error("Failed to get user:", error.message);
  }
};
```

### Using Session API

```javascript
import { sessionAPI } from "./services/api";

// Book a session
const bookSession = async (teacherId, skill, scheduledAt) => {
  try {
    const response = await sessionAPI.create({
      teacher: teacherId,
      skill,
      scheduledAt,
      duration: 60,
      isSkillExchange: false,
    });
    console.log("Session booked:", response.session);
  } catch (error) {
    console.error("Booking failed:", error.message);
  }
};

// Get upcoming sessions
const getUpcomingSessions = async () => {
  try {
    const response = await sessionAPI.getUpcoming();
    return response.sessions;
  } catch (error) {
    console.error("Failed to fetch sessions:", error.message);
  }
};

// Rate a session
const rateSession = async (sessionId, rating, review) => {
  try {
    const response = await sessionAPI.rate(sessionId, rating, review);
    console.log("Session rated:", response.session);
  } catch (error) {
    console.error("Rating failed:", error.message);
  }
};
```

### Using Payment API

```javascript
import { paymentAPI } from "./services/api";
import { loadStripe } from "@stripe/stripe-js";

const stripe = await loadStripe("your_stripe_publishable_key");

// Purchase tokens
const purchaseTokens = async (packageType) => {
  try {
    // Create payment intent
    const { clientSecret } = await paymentAPI.createIntent({ packageType });

    // Confirm payment with Stripe
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: "John Doe" },
      },
    });

    if (error) {
      console.error("Payment failed:", error.message);
      return;
    }

    // Payment successful - tokens will be added automatically
    console.log("Payment successful!");
  } catch (error) {
    console.error("Purchase failed:", error.message);
  }
};
```

### Using Context Providers

The UserContext and TokenContext are already integrated with the API:

```javascript
import { useUser } from "./components/context/UserContext";
import { useTokens } from "./components/context/TokenContext";

function MyComponent() {
  const { user, login, logout, updateUser } = useUser();
  const { tokens, transactions, refreshTokens } = useTokens();

  // Login automatically fetches user data and tokens
  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      console.log("Logged in! Tokens:", tokens);
    }
  };

  // Tokens are automatically synced with backend
  useEffect(() => {
    if (user) {
      console.log("Current token balance:", tokens);
    }
  }, [user, tokens]);

  return (
    <div>
      <p>Welcome {user?.name}</p>
      <p>Token Balance: {tokens}</p>
    </div>
  );
}
```

---

## Error Handling

The API service automatically handles common errors:

### 401 Unauthorized

- Automatically removes token from localStorage
- Redirects to `/signin` page
- User needs to log in again

### Network Errors

- Shows "No response from server" message
- Check if backend is running
- Check VITE_API_URL in .env

### Validation Errors

- Backend returns specific error messages
- Display to user via error state

```javascript
try {
  await sessionAPI.create({ ... });
} catch (error) {
  // Error message from backend
  console.error(error.message);
  // Show to user: "Insufficient tokens" or "Schedule conflict"
}
```

---

## Testing the Integration

### 1. Test Authentication Flow

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Save the token from response
TOKEN="jwt_token_here"

# Get current user
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Test Session Booking

```bash
# Create a session (replace teacher_id with actual ID)
curl -X POST http://localhost:5000/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher":"teacher_user_id",
    "skill":"Python",
    "scheduledAt":"2025-01-25T14:00:00Z",
    "duration":60
  }'

# Get all sessions
curl http://localhost:5000/api/sessions \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Payment Flow

```bash
# Get token packages
curl http://localhost:5000/api/payments/packages

# Create payment intent
curl -X POST http://localhost:5000/api/payments/intent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"packageType":"basic"}'
```

---

## Environment Variables

### Backend (.env)

```env
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillup
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillup

JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Optional (for specific features)
CLIENT_URL=http://localhost:5173

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Agora (required for video calls)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=skillup <noreply@skillup.com>

# Cloudinary (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api

# For production:
# VITE_API_URL=https://your-backend-url.com/api
```

---

## Next Steps

### High Priority Features to Implement

1. **User Search & Discovery** - Find teachers by skill
2. **Messaging System** - Real-time chat between users
3. **Video Call Integration** - Agora SDK implementation
4. **Admin Panel** - User management and analytics

### Medium Priority

5. **Email Notifications** - Session reminders and updates
6. **File Uploads** - Profile pictures with Cloudinary
7. **Reviews & Ratings Display** - Show teacher ratings
8. **Skill Matching Algorithm** - Suggest compatible users

### Low Priority

9. **Mobile App** - React Native implementation
10. **Analytics Dashboard** - Platform statistics
11. **Certificates** - Generate completion certificates
12. **Social Features** - Activity feed and recommendations

---

## Troubleshooting

### Backend won't start

- Check MongoDB is running (`mongod` or MongoDB Atlas connection)
- Verify `.env` file has all required variables
- Check port 5000 is not in use

### Frontend can't connect to backend

- Verify backend is running on port 5000
- Check `.env` has correct VITE_API_URL
- Check browser console for CORS errors

### Authentication not working

- Clear browser localStorage
- Check JWT_SECRET is set in backend .env
- Verify token is being sent in Authorization header

### Sessions not booking

- User must have enough tokens
- No scheduling conflicts
- Teacher must have isTeacher flag set to true

### Payments failing

- Verify Stripe keys are correct
- Use Stripe test cards: 4242 4242 4242 4242
- Check Stripe webhook is configured (for production)

---

## API Response Format

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Security Notes

1. **JWT Tokens**: Stored in localStorage, automatically included in requests
2. **Password Hashing**: bcrypt with 10 salt rounds
3. **CORS**: Configured to allow frontend origin only
4. **Rate Limiting**: Should be added for production
5. **Input Validation**: Implemented on backend for all endpoints
6. **SQL Injection**: Not applicable (using MongoDB)
7. **XSS Protection**: React sanitizes output by default

---

**Happy Coding! 🚀**

For questions or issues, check the main [README.md](README.md) or [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
