# Test Session Setup Instructions

This guide will help you create a test session with 2 users and a fake AI summary.

## 🚀 Quick Start

### Step 1: Start the Backend Server

```bash
cd "c:\Users\Boyka\Zeyad Ragab\swaply final proj\swaply\backend"
npm run dev
```

Wait for the message: `✅ Server running on port 5000`

### Step 2: Create Test Session Data

Open a new terminal and run:

```bash
curl -X POST http://localhost:5000/api/test/create-session
```

Or use any REST client (Postman, Thunder Client, etc.) to make a POST request to:

```
POST http://localhost:5000/api/test/create-session
```

### Step 3: Start the Frontend

```bash
cd "c:\Users\Boyka\Zeyad Ragab\swaply final proj\swaply\skillup"
npm run dev
```

### Step 4: Login and View the Session

The test endpoint creates two users:

#### Teacher Account

- **Email:** teacher@test.com
- **Password:** password123
- **Name:** Sarah Johnson

#### Learner Account

- **Email:** learner@test.com
- **Password:** password123
- **Name:** Michael Chen

### Step 5: View the Session Summary

After logging in with either account:

1. Go to: `http://localhost:5173/sessions`
2. You'll see a completed session titled: **"Introduction to React Hooks and State Management"**
3. Click on the session to view details
4. Click **"View Summary"** or navigate to: `http://localhost:5173/sessions/{sessionId}/summary`

---

## 📊 What Gets Created

### Test Users

- **Teacher:** Sarah Johnson (expert in React Development)
- **Learner:** Michael Chen (beginner learning React)

### Test Session

- **Title:** Introduction to React Hooks and State Management
- **Skill:** React Development
- **Duration:** 60 minutes
- **Status:** Completed
- **Tokens Charged:** 15 tokens
- **Scheduled:** 2 hours ago (completed 1 hour ago)

### AI Summary Content

The fake AI summary includes:

#### 📝 Overview

Comprehensive summary of the session's productivity and learning outcomes

#### 📚 Main Topics (5 topics)

1. Fundamental Concepts
2. Real-World Applications
3. Common Mistakes and Best Practices
4. Hands-On Exercise
5. Advanced Tips and Resources

#### 🎯 Key Learning Points (6 points)

- Understanding fundamental principles
- Breaking down complex problems
- Component responsibility and interface design
- Learning from mistakes
- Consistent daily practice
- Creative problem-solving

#### ✅ Action Items (5 items)

- Practice exercises for learner
- Resource exploration
- Follow-up preparation for teacher

#### ⭐ Session Highlights (4 highlights)

- Breakthrough moments
- Strong engagement points
- Key comprehension achievements

#### 📊 Performance Scores

- **Overall Rating:** 9.0/10
- **Engagement Score:** 9.2/10
  - Teacher Participation: 8.5%
  - Learner Participation: 9.0%
  - Interaction Quality: 9.5
- **Teaching Quality:** 9.0/10
  - Clarity: 9.5/10
  - Pacing: 8.8/10
  - Responsiveness: 9.2/10
  - Feedback: 8.7/10
- **Learning Progress:** 8.8/10
  - Questions Asked: 8
  - Concepts Grasped: 4
  - Areas for Improvement: 2

#### 📈 Session Statistics

- **Total Duration:** 10 minutes
- **Teacher Speaking Time:** 6 minutes
- **Learner Speaking Time:** 3.3 minutes
- **Total Words:** 800 words

#### 💡 AI Recommendations (6 recommendations)

Personalized suggestions for continued learning and improvement

#### 📜 Full Transcript

Complete conversation transcript with 25 exchanges between teacher and learner, including:

- Speaker identification
- Timestamps
- Realistic dialogue about React Development

---

## 🔧 API Response Example

```json
{
  "success": true,
  "message": "Test session created successfully!",
  "data": {
    "teacher": {
      "id": "...",
      "name": "Sarah Johnson",
      "email": "teacher@test.com"
    },
    "learner": {
      "id": "...",
      "name": "Michael Chen",
      "email": "learner@test.com"
    },
    "session": {
      "id": "...",
      "title": "Introduction to React Hooks and State Management",
      "status": "completed",
      "scheduledAt": "..."
    },
    "summary": {
      "id": "...",
      "overallRating": 9.0,
      "engagementScore": 9.2
    },
    "urls": {
      "sessionDetails": "/sessions/{sessionId}",
      "sessionSummary": "/sessions/{sessionId}/summary",
      "sessionsList": "/sessions"
    }
  }
}
```

---

## 🎨 Features to Test

### Session Summary Page Features:

- ✅ AI-powered session overview
- ✅ Performance score cards (Engagement, Teaching Quality, Learning Progress)
- ✅ Color-coded ratings (green ≥8, yellow ≥6, red <6)
- ✅ Main topics with timestamps
- ✅ Key learning points checklist
- ✅ Session highlights with importance badges
- ✅ Action items with assignee labels
- ✅ Concepts grasped vs areas for improvement
- ✅ AI recommendations
- ✅ Session statistics dashboard
- ✅ Full transcript with speaker labels
- ✅ Export PDF functionality
- ✅ Email summary functionality
- ✅ Responsive design (mobile, tablet, desktop)

---

## 🧹 Cleanup (Optional)

If you want to remove test data and start fresh:

### Option 1: Delete via MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Delete documents where:
   - Users: `email` is `teacher@test.com` or `learner@test.com`
   - Sessions: `title` contains "Introduction to React Hooks"
   - SessionSummaries: Related to deleted session
   - Transactions: Related to deleted session

### Option 2: Run the API endpoint again

The endpoint checks if users exist and reuses them, but creates a new session each time.

---

## 🐛 Troubleshooting

### Backend won't start

- Check MongoDB connection in `.env` file
- Ensure MongoDB is running
- Check port 5000 is not in use

### Frontend won't start

- Run `npm install` first
- Check port 5173 is not in use

### Can't see the session

- Make sure you logged in with the correct credentials
- Check browser console for errors
- Verify backend created the data successfully

### Summary page is empty

- Make sure the session status is "completed"
- Check that the summary was created in the database
- Verify the sessionId in the URL is correct

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check backend terminal for error messages
3. Verify MongoDB connection
4. Ensure all dependencies are installed (`npm install`)

---

**Enjoy testing the session summary feature! 🎉**
