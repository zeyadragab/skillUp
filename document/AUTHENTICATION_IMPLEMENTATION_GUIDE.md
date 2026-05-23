# Complete Authentication System Implementation Guide

## ✅ Files Already Created

1. `/backend/src/models/ActivationToken.js` - Activation token model
2. `/backend/src/models/OTP.js` - OTP model with hashing
3. `/backend/src/services/emailService.js` - Email sending service
4. `/backend/src/utils/emailTemplates.js` - Beautiful HTML email templates
5. `/backend/src/middleware/rateLimiter.js` - Rate limiting for security
6. `/backend/src/middleware/validation.js` - Input validation and sanitization

## 📋 Step-by-Step Implementation

### STEP 1: Update Environment Variables

Add to `/backend/.env`:

```env
# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=skillup <noreply@skillup.com>
```

**How to get Gmail App Password:**

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Search for "App Passwords"
4. Select "Mail" and your device
5. Copy the 16-character password
6. Paste into `.env` as `EMAIL_PASSWORD`

---

### STEP 2: Update Auth Controller

Add these functions to `/backend/src/controllers/authController.js`:

```javascript
import ActivationToken from "../models/ActivationToken.js";
import {
  sendActivationEmail,
  sendWelcomeEmail,
} from "../services/emailService.js";

// Modify existing register function - ADD activation email sending
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ... existing validation code ...

    // Create user (but don't activate yet)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      tokens: 50,
      isTeacher,
      role: userRole,
      isVerified: false, // ADD THIS
      isActive: false, // ADD THIS
    });

    // CREATE ACTIVATION TOKEN
    const activationToken = await ActivationToken.createToken(user._id);

    // SEND ACTIVATION EMAIL
    try {
      await sendActivationEmail(user.email, user.name, activationToken.token);
    } catch (emailError) {
      console.error("Failed to send activation email:", emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token (for future use)
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to activate your account.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        tokens: user.tokens,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        isTeacher: user.isTeacher,
      },
      requiresActivation: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// NEW: Activate account
export const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify activation token
    const activationToken = await ActivationToken.verifyToken(token);

    if (!activationToken) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired activation link. Please request a new one.",
      });
    }

    // Find and activate user
    const user = await User.findById(activationToken.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Account is already activated",
      });
    }

    // Activate user
    user.isActive = true;
    user.isVerified = true;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Account activated successfully! You can now log in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Activation error:", error);
    res.status(500).json({
      success: false,
      message: "Error activating account",
      error: error.message,
    });
  }
};

// NEW: Resend activation email
export const resendActivation = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Account is already activated",
      });
    }

    // Delete old tokens
    await ActivationToken.deleteMany({ user: user._id });

    // Create new activation token
    const activationToken = await ActivationToken.createToken(user._id);

    // Send email
    await sendActivationEmail(user.email, user.name, activationToken.token);

    res.status(200).json({
      success: true,
      message: "Activation email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend activation error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending activation email",
      error: error.message,
    });
  }
};
```

---

### STEP 3: Create OTP Controller

Create `/backend/src/controllers/otpController.js`:

```javascript
import OTP from "../models/OTP.js";
import User from "../models/User.js";
import { sendOTPEmail } from "../services/emailService.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Request OTP
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Please activate your account first. Check your email for activation link.",
      });
    }

    // Generate OTP
    const otpCode = await OTP.createOTP(email.toLowerCase());

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. It will expire in 10 minutes.",
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating OTP",
      error: error.message,
    });
  }
};

// Verify OTP and login
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const isValid = await OTP.verifyOTP(email.toLowerCase(), otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        tokens: user.tokens,
        role: user.role,
        isVerified: user.isVerified,
        isTeacher: user.isTeacher,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
```

---

### STEP 4: Create OTP Routes

Create `/backend/src/routes/otpRoutes.js`:

```javascript
import express from "express";
import { requestOTP, verifyOTP } from "../controllers/otpController.js";
import { otpLimiter } from "../middleware/rateLimiter.js";
import {
  validateEmail,
  validateOTP,
  sanitizeInput,
} from "../middleware/validation.js";

const router = express.Router();

// Request OTP
router.post("/request", sanitizeInput, otpLimiter, validateEmail, requestOTP);

// Verify OTP
router.post("/verify", sanitizeInput, validateOTP, verifyOTP);

export default router;
```

---

### STEP 5: Update Auth Routes

Add to `/backend/src/routes/authRoutes.js`:

```javascript
import { activationLimiter } from "../middleware/rateLimiter.js";
import {
  validateResendActivation,
  sanitizeInput,
} from "../middleware/validation.js";
import {
  activateAccount,
  resendActivation,
} from "../controllers/authController.js";

// ADD these routes
router.get("/activate/:token", activateAccount);
router.post(
  "/resend-activation",
  sanitizeInput,
  activationLimiter,
  validateResendActivation,
  resendActivation,
);
```

---

### STEP 6: Update Server.js

Add to `/backend/src/server.js`:

```javascript
import otpRoutes from "./routes/otpRoutes.js";

// ADD this route
app.use("/api/otp", otpRoutes);
```

---

## 🎨 Frontend Implementation

See next section for React components...
