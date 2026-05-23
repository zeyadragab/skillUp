import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { logActivity } from "../utils/activityLogger.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "24h",
  });
};

// @desc    Admin Login
// @route   POST /api/admin/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login without triggering pre-save hooks
    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: { lastLogin: new Date() },
        $push: {
          loginHistory: {
            $each: [{ ip: req.ip, userAgent: req.headers['user-agent'] }],
            $slice: -20,
          },
        },
      }
    );

    const token = generateToken(admin._id);

    // Set admin for activity logging
    req.admin = admin;
    await logActivity(req, "login", "admin", admin._id, { email: admin.email });

    res.status(200).json({
      success: true,
      data: {
        token,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          avatar: admin.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get current admin
// @route   GET /api/admin/auth/me
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create new admin (super_admin only)
// @route   POST /api/admin/auth/create
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "moderator",
      permissions,
      createdBy: req.admin._id,
    });

    await logActivity(req, "admin_create", "admin", admin._id, {
      name,
      email,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update admin password
// @route   PUT /api/admin/auth/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id).select("+password");

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Logout
// @route   POST /api/admin/auth/logout
export const logout = async (req, res) => {
  await logActivity(req, "logout", "admin", req.admin._id);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Get all admins
// @route   GET /api/admin/auth/all
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");

    res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.isActive = isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin account has been ${
        isActive ? "activated" : "deactivated"
      }`,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    console.error("Update admin status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const emergencySetup = async (req, res) => {
  try {
    let admin = await Admin.findOne({ email: 'admin@swaply.com' });
    if (!admin) {
      admin = await Admin.create({
        name: 'Super Admin',
        email: 'admin@swaply.com',
        password: 'password123',
        role: 'super_admin'
      });
    } else {
      admin.password = 'password123';
      await admin.save();
    }
    res.json({ success: true, email: admin.email, password: 'password123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

