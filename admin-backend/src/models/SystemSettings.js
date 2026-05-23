import mongoose from "mongoose";
import { adminConn } from "../config/database.js";

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "tokens", "sessions", "email", "security", "features"],
      default: "general",
    },
    description: String,
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  },
);

// Default settings
systemSettingsSchema.statics.getDefaults = function () {
  return {
    // General
    site_name: { value: "skillup", category: "general" },
    site_tagline: {
      value: "Exchange Skills, Grow Together",
      category: "general",
    },
    maintenance_mode: { value: false, category: "general" },

    // Tokens
    welcome_bonus: { value: 50, category: "tokens" },
    referral_bonus: { value: 20, category: "tokens" },
    min_session_tokens: { value: 5, category: "tokens" },
    max_session_tokens: { value: 100, category: "tokens" },
    token_price_usd: { value: 0.1, category: "tokens" },

    // Sessions
    min_session_duration: { value: 30, category: "sessions" },
    max_session_duration: { value: 180, category: "sessions" },
    cancellation_penalty_percent: { value: 20, category: "sessions" },
    auto_complete_hours: { value: 24, category: "sessions" },

    // Security
    max_login_attempts: { value: 5, category: "security" },
    lockout_duration_minutes: { value: 15, category: "security" },
    require_email_verification: { value: true, category: "security" },
    require_teacher_verification: { value: true, category: "security" },

    // Features
    enable_messaging: { value: true, category: "features" },
    enable_video_calls: { value: true, category: "features" },
    enable_reviews: { value: true, category: "features" },
    enable_reports: { value: true, category: "features" },
  };
};

const SystemSettings =
  adminConn.models.SystemSettings ||
  adminConn.model("SystemSettings", systemSettingsSchema);

export default SystemSettings;
