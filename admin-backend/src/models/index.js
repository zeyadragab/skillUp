/**
 * Model registry for the admin backend.
 *
 * App models (User, Skill, Session, Transaction, Payment) are bound to mainConn
 * so they read/write the same database as the main backend.
 *
 * Admin-only models (Admin, ActivityLog, Report, SystemSettings, etc.) stay on
 * the default mongoose connection which points to the admin DB.
 */
import mongoose from "mongoose";
import { mainConn } from "../config/database.js";

// ---------------------------------------------------------------------------
// Admin-only models  (default mongoose connection → adminConn in server.js)
// ---------------------------------------------------------------------------
export { default as Admin } from "./Admin.js";
export { default as Report } from "./Report.js";
export { default as SystemNotification } from "./SystemNotification.js";
export { default as SystemSettings } from "./SystemSettings.js";
export { default as ActivityLog } from "./ActivityLog.js";
export { default as AdminNotification } from "./AdminNotification.js";

// ---------------------------------------------------------------------------
// App models — schemas match backend/src/models/* exactly.
// Registered on mainConn so they hit the live skillup database.
// ---------------------------------------------------------------------------

// Embedded skill schema used inside User.skillsToTeach / skillsToLearn
const embeddedSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "intermediate",
    },
    category: { type: String, required: true },
    tokensPerHour: { type: Number, default: 50, min: 0 },
  },
  { _id: false },
);

// --- User -------------------------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    avatar: String,
    bio: { type: String, maxlength: 500 },
    country: String,
    timeZone: String,
    languages: [String],
    skillsToTeach: [embeddedSkillSchema],
    skillsToLearn: [embeddedSkillSchema],
    tokens: { type: Number, default: 50 },
    tokensEarned: { type: Number, default: 0 },
    tokensSpent: { type: Number, default: 0 },
    totalSessionsTaught: { type: Number, default: 0 },
    totalSessionsLearned: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    badges: [{ name: String, icon: String, earnedAt: Date }],
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActivity: Date,
    },
    isVerified: { type: Boolean, default: false },
    isTeacher: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "teacher", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    bannedAt: Date,
    bannedBy: { type: mongoose.Schema.Types.ObjectId },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      sessionReminders: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      darkMode: { type: Boolean, default: false },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId }],
    following: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true },
);

export const User = mainConn.models.User || mainConn.model("User", userSchema);

// --- Skill ------------------------------------------------------------------
export const SKILL_CATEGORY_LIST = [
  "Programming & Tech",
  "Design & Creative",
  "Languages",
  "Business & Finance",
  "Health & Wellness",
  "Music & Arts",
  "Cooking & Culinary",
  "Sports & Fitness",
  "Photography & Video",
  "Writing & Content",
  "Marketing & Sales",
  "Science & Math",
  "Other",
];

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    // category is a string enum — NOT an ObjectId ref (no separate Category collection)
    category: { type: String, required: true, enum: SKILL_CATEGORY_LIST },
    description: { type: String, maxlength: 500 },
    icon: { type: String, default: "🎯" },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    tags: [{ type: String, trim: true }],
    totalTeachers: { type: Number, default: 0 },
    totalLearners: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    popularityScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Skill =
  mainConn.models.Skill || mainConn.model("Skill", skillSchema);

// --- Session ----------------------------------------------------------------
const sessionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // skill is a plain String (the skill name), not an ObjectId ref
    skill: { type: String, required: true, trim: true },
    skillCategory: String,
    title: { type: String, required: true, trim: true },
    description: String,
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    endTime: Date,
    sessionType: {
      type: String,
      enum: ["one-on-one", "group", "workshop"],
      default: "one-on-one",
    },
    isSkillExchange: { type: Boolean, default: false },
    // correct field name is tokensCharged (NOT tokenAmount)
    tokensCharged: { type: Number, default: 0 },
    videoRoomId: String,
    videoToken: String,
    agoraChannel: String,
    // status enum exactly matches main backend
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    // Reviews are embedded here — there is no separate Review collection
    teacherRating: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date,
    },
    learnerRating: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date,
    },
    teacherNotes: String,
    learnerNotes: String,
    teacherJoinedAt: Date,
    learnerJoinedAt: Date,
    actualStartTime: Date,
    actualEndTime: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // correct field name is cancellationReason (NOT cancelReason)
    cancellationReason: String,
    cancelledAt: Date,
    remindersSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Session =
  mainConn.models.Session || mainConn.model("Session", sessionSchema);

// --- Transaction ------------------------------------------------------------
const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: [
        "purchase",
        "session_teaching",
        "session_learning",
        "referral",
        "challenge",
        "streak",
        "admin_adjustment",
        "refund",
        "welcome_bonus",
      ],
      required: true,
    },
    description: String,
    // correct field names: session and payment (NOT relatedSession / relatedUser)
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    balanceBefore: Number,
    balanceAfter: { type: Number, required: true },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export const Transaction =
  mainConn.models.Transaction ||
  mainConn.model("Transaction", transactionSchema);

// --- Payment ----------------------------------------------------------------
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true },
    tokensAmount: { type: Number, required: true },
    packageType: {
      type: String,
      enum: [
        "starter",
        "popular",
        "professional",
        "premium",
        "basic",
        "pro",
        "custom",
      ],
      required: true,
    },
    stripePaymentIntentId: String,
    stripePaymentMethodId: String,
    stripeCustomerId: String,
    status: {
      type: String,
      enum: ["pending", "processing", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: [
        "stripe",
        "paypal",
        "visa",
        "instapay",
        "fawry",
        "wallet",
        "admin",
      ],
      default: "stripe",
    },
    receiptUrl: String,
    receiptNumber: String,
    refundReason: String,
    refundedAt: Date,
    refundAmount: Number,
    metadata: mongoose.Schema.Types.Mixed,
    failureReason: String,
  },
  { timestamps: true },
);

export const Payment =
  mainConn.models.Payment || mainConn.model("Payment", paymentSchema);
