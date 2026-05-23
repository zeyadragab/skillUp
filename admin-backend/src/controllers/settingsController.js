import SystemSettings from "../models/SystemSettings.js";
import { logActivity } from "../utils/activityLogger.js";

// @desc    Get all settings
// @route   GET /api/admin/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
    });
  }
};

// @desc    Update general settings
// @route   PUT /api/admin/settings/general
export const updateGeneralSettings = async (req, res) => {
  try {
    const {
      platformName,
      platformDescription,
      supportEmail,
      maintenanceMode,
      maintenanceMessage,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (platformName !== undefined)
      settings.general.platformName = platformName;
    if (platformDescription !== undefined)
      settings.general.platformDescription = platformDescription;
    if (supportEmail !== undefined)
      settings.general.supportEmail = supportEmail;
    if (maintenanceMode !== undefined)
      settings.general.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined)
      settings.general.maintenanceMessage = maintenanceMessage;

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "settings_update", "settings", settings._id, {
      category: "general",
    });

    res.status(200).json({
      success: true,
      message: "General settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating general settings",
    });
  }
};

// @desc    Update token economy settings
// @route   PUT /api/admin/settings/tokens
export const updateTokenSettings = async (req, res) => {
  try {
    const {
      welcomeBonus,
      referralBonus,
      minTokenRate,
      maxTokenRate,
      sessionCompletionBonus,
      dailyLoginBonus,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (welcomeBonus !== undefined) settings.tokens.welcomeBonus = welcomeBonus;
    if (referralBonus !== undefined)
      settings.tokens.referralBonus = referralBonus;
    if (minTokenRate !== undefined) settings.tokens.minTokenRate = minTokenRate;
    if (maxTokenRate !== undefined) settings.tokens.maxTokenRate = maxTokenRate;
    if (sessionCompletionBonus !== undefined)
      settings.tokens.sessionCompletionBonus = sessionCompletionBonus;
    if (dailyLoginBonus !== undefined)
      settings.tokens.dailyLoginBonus = dailyLoginBonus;

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "settings_update", "settings", settings._id, {
      category: "tokens",
    });

    res.status(200).json({
      success: true,
      message: "Token settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating token settings",
    });
  }
};

// @desc    Update session settings
// @route   PUT /api/admin/settings/sessions
export const updateSessionSettings = async (req, res) => {
  try {
    const {
      minSessionDuration,
      maxSessionDuration,
      cancellationPenalty,
      autoConfirmAfterHours,
      maxActiveBookings,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (minSessionDuration !== undefined)
      settings.sessions.minSessionDuration = minSessionDuration;
    if (maxSessionDuration !== undefined)
      settings.sessions.maxSessionDuration = maxSessionDuration;
    if (cancellationPenalty !== undefined)
      settings.sessions.cancellationPenalty = cancellationPenalty;
    if (autoConfirmAfterHours !== undefined)
      settings.sessions.autoConfirmAfterHours = autoConfirmAfterHours;
    if (maxActiveBookings !== undefined)
      settings.sessions.maxActiveBookings = maxActiveBookings;

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "settings_update", "settings", settings._id, {
      category: "sessions",
    });

    res.status(200).json({
      success: true,
      message: "Session settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating session settings",
    });
  }
};

// @desc    Update security settings
// @route   PUT /api/admin/settings/security
export const updateSecuritySettings = async (req, res) => {
  try {
    const {
      maxLoginAttempts,
      lockoutDuration,
      passwordMinLength,
      requireEmailVerification,
      otpExpiry,
      jwtExpiry,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (maxLoginAttempts !== undefined)
      settings.security.maxLoginAttempts = maxLoginAttempts;
    if (lockoutDuration !== undefined)
      settings.security.lockoutDuration = lockoutDuration;
    if (passwordMinLength !== undefined)
      settings.security.passwordMinLength = passwordMinLength;
    if (requireEmailVerification !== undefined)
      settings.security.requireEmailVerification = requireEmailVerification;
    if (otpExpiry !== undefined) settings.security.otpExpiry = otpExpiry;
    if (jwtExpiry !== undefined) settings.security.jwtExpiry = jwtExpiry;

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "settings_update", "settings", settings._id, {
      category: "security",
    });

    res.status(200).json({
      success: true,
      message: "Security settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating security settings",
    });
  }
};

// @desc    Update email settings
// @route   PUT /api/admin/settings/email
export const updateEmailSettings = async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPassword,
      fromEmail,
      fromName,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (smtpHost !== undefined) settings.email.smtpHost = smtpHost;
    if (smtpPort !== undefined) settings.email.smtpPort = smtpPort;
    if (smtpSecure !== undefined) settings.email.smtpSecure = smtpSecure;
    if (smtpUser !== undefined) settings.email.smtpUser = smtpUser;
    if (smtpPassword !== undefined) settings.email.smtpPassword = smtpPassword;
    if (fromEmail !== undefined) settings.email.fromEmail = fromEmail;
    if (fromName !== undefined) settings.email.fromName = fromName;

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "settings_update", "settings", settings._id, {
      category: "email",
    });

    res.status(200).json({
      success: true,
      message: "Email settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating email settings",
    });
  }
};

// @desc    Update gamification settings
// @route   PUT /api/admin/settings/gamification
export const updateGamificationSettings = async (req, res) => {
  try {
    const {
      enableStreaks,
      enableLevels,
      enableBadges,
      xpPerSession,
      xpPerReview,
      streakBonusMultiplier,
    } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (enableStreaks !== undefined)
      settings.gamification.enableStreaks = enableStreaks;
    if (enableLevels !== undefined)
      settings.gamification.enableLevels = enableLevels;
    if (enableBadges !== undefined)
      settings.gamification.enableBadges = enableBadges;
    if (xpPerSession !== undefined)
      settings.gamification.xpPerSession = xpPerSession;
    if (xpPerReview !== undefined)
      settings.gamification.xpPerReview = xpPerReview;
    if (streakBonusMultiplier !== undefined)
      settings.gamification.streakBonusMultiplier = streakBonusMultiplier;

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "settings_update", "settings", settings._id, {
      category: "gamification",
    });

    res.status(200).json({
      success: true,
      message: "Gamification settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating gamification settings",
    });
  }
};

// @desc    Reset settings to defaults
// @route   POST /api/admin/settings/reset
export const resetSettings = async (req, res) => {
  try {
    const { category } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
      await settings.save();
      return res.status(200).json({
        success: true,
        message: "Settings created with defaults",
        data: settings,
      });
    }

    // Reset specific category or all
    if (category === "general") {
      settings.general = {
        platformName: "skillup",
        platformDescription: "A peer-to-peer skill exchange platform",
        supportEmail: "support@skillup.com",
        maintenanceMode: false,
        maintenanceMessage:
          "We are currently under maintenance. Please check back later.",
      };
    } else if (category === "tokens") {
      settings.tokens = {
        welcomeBonus: 50,
        referralBonus: 20,
        minTokenRate: 5,
        maxTokenRate: 100,
        sessionCompletionBonus: 5,
        dailyLoginBonus: 1,
      };
    } else if (category === "sessions") {
      settings.sessions = {
        minSessionDuration: 30,
        maxSessionDuration: 180,
        cancellationPenalty: 10,
        autoConfirmAfterHours: 24,
        maxActiveBookings: 5,
      };
    } else if (category === "security") {
      settings.security = {
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        passwordMinLength: 8,
        requireEmailVerification: true,
        otpExpiry: 10,
        jwtExpiry: "7d",
      };
    } else if (category === "gamification") {
      settings.gamification = {
        enableStreaks: true,
        enableLevels: true,
        enableBadges: true,
        xpPerSession: 50,
        xpPerReview: 10,
        streakBonusMultiplier: 1.5,
      };
    } else {
      // Reset all settings
      await settings.deleteOne();
      settings = await SystemSettings.create({});
    }

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "settings_reset", "settings", settings._id, {
      category: category || "all",
    });

    res.status(200).json({
      success: true,
      message: `Settings ${category ? category : "all categories"} reset to defaults`,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting settings",
    });
  }
};

// @desc    Get settings history
// @route   GET /api/admin/settings/history
export const getSettingsHistory = async (req, res) => {
  try {
    const { ActivityLog } = await import("../models/ActivityLog.js");

    const history = await ActivityLog.find({
      action: { $in: ["settings_update", "settings_reset"] },
    })
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching settings history",
    });
  }
};

// @desc    Toggle maintenance mode
// @route   POST /api/admin/settings/maintenance
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    settings.general.maintenanceMode = enabled;
    if (message) {
      settings.general.maintenanceMessage = message;
    }

    settings.updatedBy = req.admin._id;
    await settings.save();

    await logActivity(req, "maintenance_toggle", "settings", settings._id, {
      enabled,
    });

    res.status(200).json({
      success: true,
      message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling maintenance mode",
    });
  }
};
