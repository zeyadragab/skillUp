# AI Video Session Testing Guide

## Overview

Your skillup platform now has complete AI-powered video session capabilities with:

- AI-generated session summaries
- PDF export functionality
- Email summaries to participants
- Background job processing with Bull queue
- Auto-transcription with Whisper API
- Beautiful frontend UI with scores, charts, and recommendations

---

## Prerequisites

### 1. Required Services

#### Backend Server (Port 5000)

```bash
cd backend
npm run dev
```

#### Frontend Server (Port 5173)

```bash
cd skillup
npm run dev
```

#### Redis Server (Required for Background Jobs)

**Option A: Install Redis Locally (Recommended)**

- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
  - Extract and run `redis-server.exe`
  - Runs on default port 6379

- **Mac**:

  ```bash
  brew install redis
  brew services start redis
  ```

- **Linux**:
  ```bash
  sudo apt-get install redis-server
  sudo systemctl start redis
  ```

**Option B: Use Redis Cloud (FREE)**

1. Sign up at https://redis.com/try-free/
2. Create free database
3. Update `.env` with connection details:
   ```env
   REDIS_HOST=your-redis-host.cloud.redislabs.com
   REDIS_PORT=12345
   REDIS_PASSWORD=your_password
   ```

**Verify Redis is Running:**

```bash
redis-cli ping
# Should return: PONG
```

### 2. Installed Packages

All packages are already installed:

- ✅ `openai` (v6.9.1) - AI summaries
- ✅ `pdfkit` - PDF generation
- ✅ `bull` - Background job queue
- ✅ `redis` - Redis client
- ✅ `nodemailer` - Email service

---

## Testing Workflow

### Step 1: Login to Platform

1. Open browser: http://localhost:5173
2. Login with existing account or create new one
3. Ensure you have a completed session in your account

---

### Step 2: Generate AI Summary (Mock Data)

**Using Browser Console (Easiest Method):**

1. Navigate to "My Sessions" page
2. Find a completed session and copy its ID from the URL
3. Open browser console (F12)
4. Run the following script:

```javascript
// Get your auth token
const token = localStorage.getItem("token");

// Replace with your actual session ID
const sessionId = "YOUR_SESSION_ID_HERE";

// Generate mock AI summary
fetch(`http://localhost:5000/api/summaries/mock/${sessionId}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Summary Generated:", data);
    alert("AI Summary generated! Check console for details.");
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    alert("Failed to generate summary. Check console for details.");
  });
```

**Expected Response:**

```json
{
  "success": true,
  "message": "AI summary generated successfully",
  "summary": {
    "_id": "...",
    "session": "...",
    "summary": {
      "overview": "Comprehensive session covering...",
      "mainTopics": [...],
      "keyLearningPoints": [...],
      "actionItems": [...],
      "highlights": [...]
    },
    "analysis": {
      "engagement": { "score": 9.0, ... },
      "teachingQuality": { "score": 9.5, ... },
      "learningProgress": { "score": 8.5, ... },
      "overallRating": 9.0,
      "recommendations": [...]
    },
    "statistics": {
      "totalDuration": 610,
      "teacherSpeakTime": 396,
      "learnerSpeakTime": 180,
      ...
    }
  }
}
```

---

### Step 3: View AI Summary in Frontend

1. After generating summary, navigate to:

   ```
   http://localhost:5173/sessions/{sessionId}/summary
   ```

2. You should see:
   - **Header Card** with:
     - Session title and participant names
     - Overall rating (big score out of 10)
     - Export PDF button
     - Email Summary button

   - **Overview Section**: AI-generated 2-3 sentence summary

   - **Performance Scores** with visual bars:
     - Engagement score
     - Teaching quality score
     - Learning progress score

   - **Main Topics** with timestamps

   - **Key Learning Points** bulleted list

   - **Action Items** for teacher and learner

   - **Session Highlights** with importance badges

   - **Recommendations** from AI

---

### Step 4: Test PDF Export

1. On the summary page, click **"Export PDF"** button
2. PDF should download automatically: `session-summary-{sessionId}.pdf`
3. Open the PDF - it should contain:
   - Branded header "AI Session Summary"
   - Session details (skill, teacher, learner, date)
   - Overall rating (large score)
   - Overview text
   - All scores (Engagement, Teaching Quality, Learning Progress)
   - Key learning points list
   - Recommendations list
   - Footer with generation timestamp

**If PDF Export Fails:**

- Check browser console for errors
- Verify backend server is running
- Check backend logs for PDFKit errors

---

### Step 5: Test Email Summary

1. On the summary page, click **"Email Summary"** button
2. You should see success message: "Summary has been emailed to all participants!"
3. Check email inboxes for both teacher and learner

**Expected Email:**

- **Subject**: ✨ AI Summary: {Skill} Session
- **Content**: Beautiful HTML email with:
  - Gradient header
  - Large overall rating score box
  - Session details table
  - Performance scores
  - Key learning points
  - AI recommendations with yellow highlight boxes
  - Link to view full summary on platform

**If Email Fails:**

- Verify email credentials in `.env` are correct
- Check if Gmail is allowing "Less secure apps" (or use App Password)
- Check backend logs for Nodemailer errors
- Test email config:
  ```bash
  # In backend directory
  node -e "require('nodemailer').createTransport({host:'smtp.gmail.com',port:587,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASSWORD}}).verify((e,s)=>console.log(e||'✅ Email OK'))"
  ```

---

### Step 6: Test Background Job Queue (Optional)

Instead of immediate generation, you can queue summary generation for background processing.

**Using Browser Console:**

```javascript
const token = localStorage.getItem("token");
const sessionId = "YOUR_SESSION_ID_HERE";

// Queue summary generation (background job)
fetch(`http://localhost:5000/api/summaries/queue/${sessionId}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    transcript: null, // Will use mock transcript
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Job Queued:", data);

    // Check job status
    setTimeout(() => {
      fetch(`http://localhost:5000/api/summaries/job-status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((status) => console.log("Job Status:", status));
    }, 3000);
  })
  .catch((err) => console.error("❌ Error:", err));
```

**Expected Flow:**

1. Job is queued immediately (returns `jobId`)
2. Background worker processes the job
3. Status changes: `processing` → `completed`
4. Summary is saved to database

**Monitor Background Jobs:**
Check backend console logs for:

```
[Summary Queue] Queued summary generation for session ...
[Summary Queue] Processing summary for session ...
[Summary Queue] ✅ Successfully generated summary for session ...
```

**If Background Jobs Don't Work:**

- **Check Redis**: `redis-cli ping` should return `PONG`
- **Check Redis connection in .env**: Verify `REDIS_HOST` and `REDIS_PORT`
- **Restart backend server** after updating Redis config
- **Check for Bull errors** in backend console

---

### Step 7: Test Whisper Transcription (Advanced)

To test auto-transcription with real audio:

1. **Record a session** or **upload an audio file**
2. **Queue summary with recording URL**:

```javascript
const token = localStorage.getItem("token");
const sessionId = "YOUR_SESSION_ID_HERE";
const recordingUrl = "https://your-recording-url.com/session.mp4";

fetch(`http://localhost:5000/api/summaries/queue/${sessionId}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    recordingUrl: recordingUrl,
  }),
})
  .then((res) => res.json())
  .then((data) => console.log("✅ Transcription Queued:", data))
  .catch((err) => console.error("❌ Error:", err));
```

**Expected Flow:**

1. Backend downloads recording
2. Whisper API transcribes audio → text
3. AI generates summary from transcript
4. Summary is saved with real transcript data

**Note**: Whisper API costs:

- $0.006 per minute of audio
- 30-minute session = ~$0.18

---

## API Endpoints Reference

### Summary Endpoints

| Endpoint                               | Method | Description                   | Auth Required |
| -------------------------------------- | ------ | ----------------------------- | ------------- |
| `/api/summaries/generate/:sessionId`   | POST   | Generate summary immediately  | Yes           |
| `/api/summaries/mock/:sessionId`       | POST   | Generate with mock transcript | Yes           |
| `/api/summaries/:sessionId`            | GET    | Get existing summary          | Yes           |
| `/api/summaries/queue/:sessionId`      | POST   | Queue background job          | Yes           |
| `/api/summaries/job-status/:sessionId` | GET    | Check job status              | Yes           |
| `/api/summaries/:sessionId/pdf`        | GET    | Export as PDF                 | Yes           |
| `/api/summaries/:sessionId/email`      | POST   | Email to participants         | Yes           |

### Request Examples

**Generate Mock Summary:**

```bash
curl -X POST http://localhost:5000/api/summaries/mock/{sessionId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Summary:**

```bash
curl http://localhost:5000/api/summaries/{sessionId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Export PDF:**

```bash
curl http://localhost:5000/api/summaries/{sessionId}/pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output summary.pdf
```

**Email Summary:**

```bash
curl -X POST http://localhost:5000/api/summaries/{sessionId}/email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Problem: "Summary not found"

**Solution**: Generate the summary first using `/mock/:sessionId` endpoint

### Problem: "Session not found"

**Solution**: Use a valid session ID from your database. Check "My Sessions" page.

### Problem: "AI summary service is not configured"

**Solution**: Verify `OPENAI_API_KEY` in `.env` is valid. Check OpenAI dashboard: https://platform.openai.com/api-keys

### Problem: Redis connection error

**Solutions**:

1. Check Redis is running: `redis-cli ping`
2. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`
3. If using Redis Cloud, check password is set
4. Restart backend server after updating Redis config

### Problem: PDF export returns 404

**Solution**: Summary must be generated before exporting. Generate summary first.

### Problem: Email not sending

**Solutions**:

1. Check email credentials in `.env`
2. For Gmail: Enable "App Passwords" in Google Account settings
3. Test email config with nodemailer verify command (see Step 5)
4. Check backend logs for detailed Nodemailer errors

### Problem: Whisper API timeout

**Solutions**:

1. Large audio files may take longer to transcribe
2. Consider increasing API timeout in axios config
3. For files > 25MB, split into smaller chunks
4. Check OpenAI API status: https://status.openai.com/

### Problem: Background jobs stuck in "processing"

**Solutions**:

1. Check Redis is running
2. Restart backend server to restart queue worker
3. Check backend logs for Bull queue errors
4. Clear stuck jobs: Use Bull dashboard or Redis CLI

---

## Cost Monitoring

### OpenAI API Costs

**GPT-4o-mini (Current Model):**

- Input: $0.15 per 1M tokens (~$0.0001 per request)
- Output: $0.60 per 1M tokens (~$0.0004 per request)
- **Average cost per summary**: $0.02 - $0.05

**Whisper API:**

- $0.006 per minute of audio
- 30-minute session = ~$0.18
- 60-minute session = ~$0.36

**Monthly Estimates (100 sessions/month):**

- Summaries only: $2 - $5/month
- Summaries + Transcriptions (30min avg): $20 - $25/month

**Monitor Usage:**

- OpenAI Dashboard: https://platform.openai.com/usage
- Set spending limits in OpenAI account settings

**FREE Alternative:**
Switch to Hugging Face in `.env`:

```env
AI_PROVIDER=huggingface
```

- Cost: $0 (FREE!)
- Quality: Slightly lower than GPT-4
- No API key required (rate limited without key)

---

## Next Steps for Production

### 1. Enable Agora Cloud Recording

```env
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret
```

- Configure at: https://console.agora.io/

### 2. Set up Cloud Storage (AWS S3, Google Cloud, etc.)

```env
CLOUD_STORAGE_VENDOR=1
CLOUD_STORAGE_BUCKET=swaply-recordings
CLOUD_STORAGE_ACCESS_KEY=your_key
CLOUD_STORAGE_SECRET_KEY=your_secret
```

### 3. Auto-trigger Summary on Session End

Update your video session component to queue summary:

```javascript
// When session ends
await summaryAPI.queueSummary(sessionId, null, recordingUrl);
```

### 4. Deploy Redis

- **Heroku**: Use Heroku Redis add-on
- **AWS**: Use ElastiCache
- **DigitalOcean**: Use Managed Redis
- **Redis Cloud**: FREE tier available

### 5. Set up Error Monitoring

- Sentry for error tracking
- LogRocket for session replay
- Datadog for performance monitoring

---

## Testing Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Redis server running (port 6379)
- [ ] OpenAI API key configured
- [ ] Email service configured
- [ ] Complete session exists in database
- [ ] Mock summary generation works
- [ ] Summary displays correctly in frontend
- [ ] PDF export downloads successfully
- [ ] Email sends to participants
- [ ] Background job queue processes jobs
- [ ] (Optional) Whisper transcription works with real audio

---

## Support Resources

- **OpenAI Dashboard**: https://platform.openai.com/
- **Agora Console**: https://console.agora.io/
- **Redis Documentation**: https://redis.io/docs/
- **Bull Queue Docs**: https://github.com/OptimalBits/bull
- **PDFKit Docs**: https://pdfkit.org/
- **Nodemailer Docs**: https://nodemailer.com/

---

## Success Criteria

Your AI video session system is working correctly if:

✅ Mock summaries generate in 5-10 seconds
✅ Frontend displays all summary sections with proper styling
✅ PDF exports download with all content formatted correctly
✅ Emails arrive with beautiful HTML formatting
✅ Background jobs process successfully (check Redis and backend logs)
✅ All scores, charts, and recommendations display properly
✅ No errors in browser console or backend logs

**Congratulations! Your AI-powered video session system is fully operational!** 🎉

---

**Generated**: December 8, 2025
**Status**: ✅ READY FOR TESTING
