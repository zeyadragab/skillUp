# MongoDB Setup Guide for skillup

## Error You're Seeing

```
MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
❌ Error connecting to MongoDB: connect ECONNREFUSED ::1:27017
```

This means MongoDB is not running on your local machine.

---

## Option 1: MongoDB Atlas (Cloud - RECOMMENDED ⭐)

**Best for**: Quick setup, no installation needed, free tier available

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Verify your email

### Step 2: Create a Free Cluster

1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to you
5. Cluster Name: `skillup` (or keep default)
6. Click **"Create"** (wait 1-3 minutes for cluster to deploy)

### Step 3: Create Database User

1. On the Security Quickstart screen (or go to "Database Access" in left menu)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `skillup`
5. Password: Click "Autogenerate Secure Password" and **SAVE IT!**
   - Example: `aB3$xYz9mK2pQ`
6. Database User Privileges: **Atlas admin**
7. Click **"Add User"**

### Step 4: Allow Network Access

1. Go to "Network Access" in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (for development only)
   - For production, add specific IPs
4. Click **"Confirm"**
5. Wait for status to become "Active" (green)

### Step 5: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string:
   ```
   mongodb+srv://skillup:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env File

1. Open `backend/.env`
2. Replace the MONGODB_URI line with your connection string
3. **IMPORTANT**: Replace `<password>` with the actual password you saved in Step 3

Example:

```env
# If your password is: aB3$xYz9mK2pQ
# And your cluster is: cluster0.abc123.mongodb.net

MONGODB_URI=mongodb+srv://skillup:aB3$xYz9mK2pQ@cluster0.abc123.mongodb.net/skillup?retryWrites=true&w=majority
```

**Special Characters in Password:**
If your password contains special characters (`@`, `#`, `$`, etc.), you need to URL encode them:

- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`

Example with special chars:

```env
# Original password: myP@ss$123
# URL encoded: myP%40ss%24123

MONGODB_URI=mongodb+srv://skillup:myP%40ss%24123@cluster0.abc123.mongodb.net/skillup?retryWrites=true&w=majority
```

### Step 7: Test the Connection

1. Restart your backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. You should see:
   ```
   ✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   🚀 skillup Server is running!
   ```

### ✅ Done! Your MongoDB Atlas is Ready!

**Benefits:**

- ✅ Free forever (512MB storage)
- ✅ No installation needed
- ✅ Automatic backups
- ✅ Works from anywhere
- ✅ Managed and maintained by MongoDB

---

## Option 2: Local MongoDB (Installation Required)

**Best for**: Offline development, learning MongoDB

### For Windows:

1. **Download MongoDB Community Server**:
   - Go to https://www.mongodb.com/try/download/community
   - Version: 7.0 or later
   - Package: MSI
   - Click Download

2. **Install MongoDB**:
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Service: ✅ (check this)
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
   - Click "Next" and "Install"

3. **Verify Installation**:

   ```bash
   # Open Command Prompt or PowerShell
   mongod --version
   ```

4. **Start MongoDB**:
   - If installed as service, it starts automatically
   - Otherwise, run:

   ```bash
   mongod
   ```

5. **Update .env**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skillup
   ```

### For macOS:

1. **Install using Homebrew**:

   ```bash
   # Install Homebrew if not installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

2. **Start MongoDB**:

   ```bash
   brew services start mongodb-community@7.0
   ```

3. **Update .env**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skillup
   ```

### For Linux (Ubuntu/Debian):

1. **Import MongoDB GPG Key**:

   ```bash
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository**:

   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**:

   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**:

   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod  # Auto-start on boot
   ```

5. **Update .env**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skillup
   ```

---

## Verify Connection

After setting up MongoDB (either Atlas or local), test the connection:

### Method 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Success Output:**

```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net (or localhost)
🚀 skillup Server is running!
📡 Port: 5000
```

**Error Output:**

```
❌ Error connecting to MongoDB: [error details]
```

### Method 2: Test MongoDB Connection Separately

Create a test file `backend/test-db.js`:

```javascript
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    console.log("Testing MongoDB connection...");
    console.log(
      "URI:",
      process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"),
    );

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully!");
    console.log("Database:", mongoose.connection.db.databaseName);

    await mongoose.connection.close();
    console.log("Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

testConnection();
```

Run it:

```bash
node backend/test-db.js
```

---

## Common Issues & Solutions

### Issue 1: "ECONNREFUSED ::1:27017"

**Cause**: Local MongoDB is not running

**Solutions**:

- Use MongoDB Atlas (Option 1)
- OR install and start local MongoDB (Option 2)

### Issue 2: "Authentication failed"

**Cause**: Wrong username or password in connection string

**Solutions**:

- Double-check username and password
- Make sure password is URL-encoded if it has special characters
- Recreate database user in MongoDB Atlas

### Issue 3: "ETIMEDOUT" or "getaddrinfo ENOTFOUND"

**Cause**: Network issue or wrong cluster address

**Solutions**:

- Check your internet connection
- Verify the connection string is correct
- Check if VPN is blocking MongoDB Atlas
- Whitelist your IP in Atlas Network Access

### Issue 4: "MongoServerError: bad auth"

**Cause**: Database user doesn't have proper permissions

**Solutions**:

- Go to Database Access in Atlas
- Edit user and set role to "Atlas admin"
- Or recreate the user

### Issue 5: "buffering timed out after 10000ms"

**Cause**: Cannot connect to MongoDB (either not running or network issue)

**Solutions**:

- If using Atlas: Check internet connection and IP whitelist
- If using local: Make sure MongoDB service is running
- Check firewall settings

---

## MongoDB Compass (GUI Tool - Optional)

MongoDB Compass is a visual tool to browse your database.

### Install Compass:

1. Download: https://www.mongodb.com/try/download/compass
2. Install the application
3. Open Compass

### Connect to Your Database:

**For Atlas:**

1. Get connection string from Atlas (same as Step 5 above)
2. Paste in Compass
3. Replace `<password>` with actual password
4. Click "Connect"

**For Local:**

1. Connection string: `mongodb://localhost:27017`
2. Click "Connect"

### View Your Data:

- Databases → `skillup`
- Collections: `users`, `sessions`, `transactions`, `payments`, etc.
- You can view, edit, and delete documents visually

---

## Recommended Setup for Development

**Use MongoDB Atlas** because:

1. ✅ **No Installation**: Works immediately after signup
2. ✅ **Free Tier**: 512MB storage is enough for development
3. ✅ **Always Available**: No need to start/stop services
4. ✅ **Cloud Backups**: Automatic backups included
5. ✅ **Team Collaboration**: Multiple developers can use same database
6. ✅ **Production-Ready**: Easy to upgrade when deploying

---

## Next Steps After MongoDB Setup

Once MongoDB is connected successfully:

1. **Start Backend**:

   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:

   ```bash
   cd skillup
   npm run dev
   ```

3. **Test Registration**:
   - Go to http://localhost:5173
   - Click "Get Started" or "Sign Up"
   - Create an account
   - You should get 50 welcome tokens!

4. **Check Database**:
   - Open MongoDB Compass
   - Connect to your database
   - View the `users` collection
   - See your new user with 50 tokens

---

## Need Help?

### MongoDB Atlas Support:

- Documentation: https://docs.atlas.mongodb.com/
- Community: https://www.mongodb.com/community/forums/

### skillup Project Support:

- Check `README.md` for general setup
- Check `API_INTEGRATION_GUIDE.md` for API usage
- Check `BACKEND_SETUP_GUIDE.md` for backend details

---

**After following this guide, your MongoDB should be connected and the skillup backend will work perfectly! 🚀**

**Recommended**: Use **MongoDB Atlas (Option 1)** for the fastest and easiest setup.
