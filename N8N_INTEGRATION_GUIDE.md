# n8n Integration Guide for skillup

## 🎯 What is n8n?

n8n is a powerful workflow automation tool that will handle all background tasks for skillup, including:

- ✅ Email reminders for sessions
- ✅ Session summary emails
- ✅ Payment confirmation emails
- ✅ Multi-channel notifications
- ✅ AI processing pipelines
- ✅ Admin reports and analytics

---

## 📦 Installation

### Step 1: Install n8n Globally

n8n has been installed globally on your system. To verify:

```bash
n8n --version
```

### Step 2: Directory Structure

```
swaply/
├── n8n-workflows/
│   ├── .env                                  # n8n configuration
│   ├── start-n8n.bat                         # Startup script
│   ├── session-reminder-workflow.json        # Session reminder workflow
│   ├── session-summary-workflow.json         # (Coming soon)
│   └── payment-confirmation-workflow.json    # (Coming soon)
```

---

## 🚀 Quick Start

### 1. Configure Email Settings

Edit `n8n-workflows/.env` and add your Gmail credentials:

```env
N8N_SMTP_USER=your-email@gmail.com
N8N_SMTP_PASS=your-gmail-app-password
```

**How to get Gmail App Password:**

1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### 2. Start n8n

**Option A: Using the batch file**

```bash
cd n8n-workflows
start-n8n.bat
```

**Option B: Manual start**

```bash
cd n8n-workflows
n8n start
```

### 3. Access n8n Dashboard

1. Open browser: http://localhost:5678
2. Login credentials:
   - Username: `admin`
   - Password: `skillup2024`

---

## 📊 Import Workflows

### Step 1: Access n8n Dashboard

Go to http://localhost:5678

### Step 2: Import the Session Reminder Workflow

1. Click **"Add Workflow"** → **"Import from File"**
2. Select: `n8n-workflows/session-reminder-workflow.json`
3. Click **"Import"**

### Step 3: Configure MongoDB Connection

1. Click on any MongoDB node (yellow database icon)
2. Click **"Create New Credential"**
3. Add your MongoDB details:
   ```
   Connection Type: MongoDB
   Connection String: mongodb://localhost:27017/skillup
   ```
4. Click **"Save"**

### Step 4: Configure Email (SMTP) Connection

1. Click on any Email node (envelope icon)
2. Click **"Create New Credential"**
3. Add Gmail SMTP details:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: your-app-password
   ```
4. Click **"Save"**

### Step 5: Activate the Workflow

1. Click the **"Inactive"** toggle at the top right
2. It should turn to **"Active"** (green)
3. The workflow is now running!

---

## 🔄 How the Session Reminder Workflow Works

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Every Hour Check                                                  │
│  (Schedule Trigger)                                                │
│         │                                                          │
│         ▼                                                          │
│  Find Sessions in Next 24 Hours                                    │
│  (MongoDB Query)                                                   │
│  - status: 'scheduled'                                             │
│  - startTime: between now and 24hrs                                │
│  - reminderSent: false                                             │
│         │                                                          │
│         ▼                                                          │
│  Split Into Items                                                  │
│  (Process each session separately)                                 │
│         │                                                          │
│         ├──────────────┬──────────────┐                           │
│         ▼              ▼              ▼                           │
│  Get Teacher      Get Learner                                      │
│    Details          Details                                        │
│         │              │                                            │
│         ▼              ▼                                            │
│  Send Email      Send Email                                        │
│   to Teacher     to Learner                                        │
│         │              │                                            │
│         └──────┬───────┘                                           │
│                ▼                                                    │
│  Mark Reminder as Sent                                             │
│  (Update MongoDB: reminderSent = true)                             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### What Happens:

1. **Every hour**, n8n checks for sessions starting in the next 24 hours
2. **Finds sessions** where reminder hasn't been sent yet
3. **Gets teacher and learner** details from database
4. **Sends beautiful HTML emails** to both participants
5. **Marks the session** as reminder sent to avoid duplicates

---

## 📧 Email Templates

### Teacher Email Preview

```
Subject: Session Reminder: Tomorrow at 2:00 PM

┌────────────────────────────────────────┐
│         📚 skillup                   │
├────────────────────────────────────────┤
│                                        │
│  Session Reminder                      │
│                                        │
│  Hi Ahmed,                             │
│                                        │
│  You have a teaching session tomorrow: │
│                                        │
│  📅 Date: Dec 14, 2025                │
│  ⏰ Time: 2:00 PM                      │
│  👤 Student: Mohamed Ali               │
│  📚 Skill: JavaScript Basics           │
│  ⏱️ Duration: 60 minutes               │
│                                        │
│  Preparation Tips:                     │
│  • Review student's goals              │
│  • Prepare materials                   │
│  • Test camera/mic                     │
│  • Stable internet                     │
│                                        │
│  [View Session Details]                │
│                                        │
└────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Issue: n8n command not found

**Solution:** Restart your terminal or run:

```bash
npm install -g n8n
```

### Issue: Cannot connect to MongoDB

**Solution:** Check if MongoDB is running:

```bash
mongosh
```

### Issue: Emails not sending

**Solutions:**

1. Check Gmail app password is correct
2. Verify 2-step verification is enabled on Google Account
3. Check spam folder for test emails
4. View n8n execution logs in the dashboard

### Issue: Workflow not triggering

**Solution:**

1. Check workflow is **Active** (green toggle)
2. View executions tab to see errors
3. Manually trigger workflow using "Test Workflow" button

---

## 🎨 Customizing Email Templates

### Edit Email Content

1. Open the workflow in n8n dashboard
2. Click on "Send Email to Teacher" or "Send Email to Learner" node
3. Modify the **HTML message** field
4. Click **"Save"**
5. Workflow will use new template immediately

### Available Variables

In email templates, you can use these variables:

```javascript
// Session data
{
  {
    $node["Find Sessions in 24hrs"].json.startTime;
  }
}
{
  {
    $node["Find Sessions in 24hrs"].json.skill;
  }
}
{
  {
    $node["Find Sessions in 24hrs"].json.duration;
  }
}
{
  {
    $node["Find Sessions in 24hrs"].json._id;
  }
}

// Teacher data
{
  {
    $node["Get Teacher Details"].json.name;
  }
}
{
  {
    $node["Get Teacher Details"].json.email;
  }
}

// Learner data
{
  {
    $node["Get Learner Details"].json.name;
  }
}
{
  {
    $node["Get Learner Details"].json.email;
  }
}

// Formatting
{
  {
    new Date(
      $node["Find Sessions in 24hrs"].json.startTime,
    ).toLocaleDateString();
  }
}
{
  {
    new Date(
      $node["Find Sessions in 24hrs"].json.startTime,
    ).toLocaleTimeString();
  }
}
```

---

## 📊 Testing the Workflow

### Manual Test

1. Go to n8n dashboard
2. Open the "Session Reminder" workflow
3. Click **"Execute Workflow"** button (top right)
4. Check the execution results

### Create Test Data

Add a test session in MongoDB that starts 23 hours from now:

```javascript
// In MongoDB Compass or mongosh
db.sessions.insertOne({
  skill: "JavaScript Basics",
  teacher: ObjectId("your-teacher-id"),
  learner: ObjectId("your-learner-id"),
  startTime: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours from now
  duration: 60,
  status: "scheduled",
  reminderSent: false,
  createdAt: new Date(),
});
```

Wait 1 hour (or manually execute workflow) and check if emails are sent!

---

## 🔐 Security Best Practices

1. **Change default password** in `.env`:

   ```env
   N8N_BASIC_AUTH_PASSWORD=your-secure-password
   ```

2. **Use environment variables** for sensitive data (already configured)

3. **Don't commit `.env` file** to git (add to `.gitignore`)

4. **Use Gmail App Passwords** instead of your main password

5. **Limit n8n access** to localhost in production (use reverse proxy)

---

## 📈 Next Steps

### Additional Workflows to Create:

1. **Session Summary Emails** (When AI summary is generated)
2. **Payment Confirmation** (When tokens are purchased)
3. **Welcome Email Sequence** (New user onboarding)
4. **Low Token Balance Alert** (Notify users to top up)
5. **Session Completion Follow-up** (Request rating/feedback)
6. **Weekly Analytics Report** (Send to admins)

---

## 🆘 Support

### n8n Documentation

- Official Docs: https://docs.n8n.io
- Community Forum: https://community.n8n.io
- Examples: https://n8n.io/workflows

### MongoDB Integration

- MongoDB Node Docs: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mongodb/

### Email (SMTP) Integration

- Email Node Docs: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.emailsend/

---

## 📝 Monitoring

### View Workflow Executions

1. Go to **"Executions"** tab in n8n
2. See all workflow runs (success/failed)
3. Click on any execution to see detailed logs
4. Debug errors by checking node outputs

### Enable Logging

In `.env`, add:

```env
N8N_LOG_LEVEL=debug
N8N_LOG_OUTPUT=console,file
```

---

## 🎯 Performance Tips

1. **Reduce check frequency** if you have few sessions:
   - Change "Every Hour" to "Every 2 Hours" or "Every 6 Hours"

2. **Add filters** to reduce database queries:
   - Only check sessions for active users
   - Skip sessions that are too far in the future

3. **Batch emails** if you have many sessions:
   - Group emails and send in batches
   - Use n8n's built-in batching features

---

## ✅ Success Checklist

- [ ] n8n installed and running on port 5678
- [ ] MongoDB connection configured
- [ ] Gmail SMTP credentials added
- [ ] Session Reminder workflow imported
- [ ] Workflow activated (green toggle)
- [ ] Test session created in database
- [ ] Emails received successfully
- [ ] Reminder marked as sent in MongoDB

---

**Last Updated:** December 13, 2025
**Version:** 1.0
**Status:** Ready for Production Testing
