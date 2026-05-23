import express from "express";
import {
  login,
  logout,
  getMe,
  createAdmin,
  updatePassword,
  getAllAdmins,
  updateAdminStatus,
  emergencySetup
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.get("/emergency", emergencySetup);

// Protected routes
router.use(protect);

router.get("/me", getMe);
router.post("/logout", logout);
router.put("/password", updatePassword);

// Super admin only routes
router.post("/admins", authorize("super_admin"), createAdmin);
router.get("/admins", authorize("super_admin"), getAllAdmins);

// Activate / deactivate admin
router.put("/admins/:id/status", authorize("super_admin"), updateAdminStatus);

// Delete admin

export default router;
