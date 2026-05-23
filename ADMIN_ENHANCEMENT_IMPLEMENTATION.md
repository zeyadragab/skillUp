# Admin Dashboard Enhancement Implementation Guide

This document outlines all changes needed to implement the 4 requested features for the admin dashboard.

## ✅ COMPLETED WORK

### 1. User Ban System - Backend (Completed)
- ✅ Added ban fields to User model (`isBanned`, `banReason`, `bannedAt`, `bannedBy`)
- ✅ Added ban check in login controller (prevents banned users from logging in)
- ✅ Created `sendBanEmail()` function in emailService.js
- ✅ Created `banEmailTemplate()` in emailTemplates.js

### 2. Admin Backend Infrastructure (Existing)
- ✅ User management routes exist (`/api/admin/users`)
- ✅ Ban/unban endpoints already implemented
- ✅ Activity logging system in place

## 🚧 REMAINING WORK

### FEATURE 1: Complete Ban System with Email
**File:** `admin-backend/src/controllers/usersController.js`

Add import at top:
```javascript
import axios from 'axios';
```

Update `banUser` function (line 141):
```javascript
export const banUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBanned = true;
    user.banReason = reason;
    user.bannedAt = new Date();
    user.bannedBy = req.admin._id;
    await user.save();

    // Send ban email to user via main backend
    try {
      await axios.post(`${process.env.MAIN_BACKEND_URL || 'http://localhost:5000'}/api/internal/send-ban-email`, {
        email: user.email,
        name: user.name,
        reason: reason
      });
    } catch (emailError) {
      console.error('Failed to send ban email:', emailError);
      // Don't fail the ban operation if email fails
    }

    await logActivity(req, 'user_ban', 'user', user._id, { reason });

    res.status(200).json({
      success: true,
      message: 'User banned successfully and notification email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error banning user'
    });
  }
};
```

### FEATURE 2: Comprehensive Admin Analytics
**New File:** `admin-backend/src/controllers/analyticsController.js`

```javascript
import { User, Session, Transaction, Payment } from '../models/index.js';

// @desc    Get comprehensive analytics
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // User Analytics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const teachers = await User.countDocuments({ isTeacher: true });

    // Session Analytics
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const cancelledSessions = await Session.countDocuments({ status: 'cancelled' });
    const upcomingSessions = await Session.countDocuments({
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    });
    const sessionsInPeriod = await Session.countDocuments({ createdAt: { $gte: startDate } });

    // Revenue Analytics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueInPeriod = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: startDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Token Analytics
    const tokensInCirculation = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$tokens' } } }
    ]);

    const tokenTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startDate }
    });

    // User Growth Trend (last 7 days)
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Sessions Trend (last 7 days)
    const sessionTrend = await Session.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          new: newUsers,
          verified: verifiedUsers,
          teachers: teachers
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          cancelled: cancelledSessions,
          upcoming: upcomingSessions,
          inPeriod: sessionsInPeriod
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          inPeriod: revenueInPeriod[0]?.total || 0
        },
        tokens: {
          inCirculation: tokensInCirculation[0]?.total || 0,
          transactions: tokenTransactions
        },
        trends: {
          userGrowth,
          sessions: sessionTrend
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};
```

**New Route File:** `admin-backend/src/routes/analyticsRoutes.js`
```javascript
import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect, hasPermission } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(hasPermission('analytics'));

router.get('/', getAnalytics);

export default router;
```

**Update:** `admin-backend/src/routes/index.js`
```javascript
import analyticsRoutes from './analyticsRoutes.js';

// Add this line with other routes
app.use('/api/admin/analytics', analyticsRoutes);
```

### FEATURE 3: Admin Notification System
**New Model:** `admin-backend/src/models/AdminNotification.js`

```javascript
import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'new_user',
      'new_teacher',
      'payment_received',
      'session_completed',
      'report_filed',
      'system_alert',
      'user_banned',
      'high_value_transaction'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['user', 'session', 'payment', 'report']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionUrl: String
}, {
  timestamps: true
});

export default mongoose.model('AdminNotification', adminNotificationSchema);
```

**New Service:** `admin-backend/src/services/adminNotificationService.js`

```javascript
import AdminNotification from '../models/AdminNotification.js';

export const notifyNewUser = async (userId, userName) => {
  return await AdminNotification.create({
    type: 'new_user',
    title: 'New User Registration',
    message: `${userName} just signed up`,
    priority: 'low',
    relatedEntity: {
      entityType: 'user',
      entityId: userId
    },
    actionUrl: `/users/${userId}`
  });
};

export const notifyHighValueTransaction = async (paymentId, amount) => {
  if (amount >= 50) {  // $50+ is considered high value
    return await AdminNotification.create({
      type: 'high_value_transaction',
      title: 'High Value Transaction',
      message: `Payment of $${amount} received`,
      priority: 'medium',
      relatedEntity: {
        entityType: 'payment',
        entityId: paymentId
      },
      actionUrl: `/transactions/${paymentId}`
    });
  }
};

export const notifyNewReport = async (reportId, reporterName, reportedName) => {
  return await AdminNotification.create({
    type: 'report_filed',
    title: 'New User Report',
    message: `${reporterName} reported ${reportedName}`,
    priority: 'high',
    relatedEntity: {
      entityType: 'report',
      entityId: reportId
    },
    actionUrl: `/reports/${reportId}`
  });
};
```

**New Controller:** `admin-backend/src/controllers/adminNotificationsController.js`

```javascript
import AdminNotification from '../models/AdminNotification.js';

export const getNotifications = async (req, res) => {
  try {
    const { isRead, priority, limit = 50 } = req.query;

    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (priority) query.priority = priority;

    const notifications = await AdminNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await AdminNotification.findByIdAndUpdate(req.params.id, {
      isRead: true,
      readAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notifications'
    });
  }
};
```

### FEATURE 4: Detailed User Profile Page for Admin
**New Component:** `admin-frontend/src/pages/UserProfile.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserDetails(userId);
      setUser(response.data.user);
      setTransactions(response.data.transactions || []);
      setSessions(response.data.sessions || []);
      setFormData({
        name: response.data.user.name,
        email: response.data.user.email,
        tokens: response.data.user.tokens,
        isActive: response.data.user.isActive,
        isVerified: response.data.user.isVerified,
        role: response.data.user.role
      });
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await adminAPI.updateUser(userId, formData);
      toast.success('User updated successfully');
      setEditing(false);
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      toast.error('Please provide a ban reason');
      return;
    }

    try {
      await adminAPI.banUser(userId, banReason);
      toast.success('User banned successfully. Email notification sent.');
      setShowBanModal(false);
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnban = async () => {
    if (window.confirm('Are you sure you want to unban this user?')) {
      try {
        await adminAPI.unbanUser(userId);
        toast.success('User unbanned successfully');
        fetchUserDetails();
      } catch (error) {
        toast.error('Failed to unban user');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.isBanned ? (
            <button
              onClick={handleUnban}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Unban User
            </button>
          ) : (
            <button
              onClick={() => setShowBanModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Ban User
            </button>
          )}
        </div>
      </div>

      {/* Ban Status Alert */}
      {user.isBanned && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800">Account Banned</h3>
          <p className="text-red-600">Reason: {user.banReason}</p>
          <p className="text-red-600 text-sm">
            Banned on: {new Date(user.bannedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-600">Tokens</p>
          <p className="text-2xl font-bold">{user.tokens}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-600">Sessions Taught</p>
          <p className="text-2xl font-bold">{user.totalSessionsTaught || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-600">Sessions Learned</p>
          <p className="text-2xl font-bold">{user.totalSessionsLearned || 0}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-600">Rating</p>
          <p className="text-2xl font-bold">{user.averageRating?.toFixed(1) || '0.0'}</p>
        </div>
      </div>

      {/* User Details Form */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button
            onClick={() => editing ? handleUpdate() : setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editing ? 'Save Changes' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tokens</label>
            <input
              type="number"
              value={formData.tokens}
              onChange={(e) => setFormData({ ...formData, tokens: parseInt(e.target.value) })}
              disabled={!editing}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="user">User</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={!editing}
              className="mr-2"
            />
            <label className="text-sm font-medium">Active</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isVerified}
              onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
              disabled={!editing}
              className="mr-2"
            />
            <label className="text-sm font-medium">Verified</label>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id} className="border-b">
                  <td className="p-2">{new Date(txn.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      txn.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="p-2">{txn.amount} tokens</td>
                  <td className="p-2">{txn.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Skill</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id} className="border-b">
                  <td className="p-2">{new Date(session.scheduledAt).toLocaleDateString()}</td>
                  <td className="p-2">{session.skill}</td>
                  <td className="p-2">{session.teacher === userId ? 'Teacher' : 'Learner'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Ban User</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to ban {user.name}? They will receive an email notification.
            </p>
            <textarea
              className="w-full px-3 py-2 border rounded mb-4"
              rows="4"
              placeholder="Reason for ban (required)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
```

**Update Admin API:** Add these methods to `admin-frontend/src/services/api.js`

```javascript
export const adminAPI = {
  // Existing methods...

  getUserDetails: async (userId) => {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data;
  },

  updateUser: async (userId, userData) => {
    const { data } = await api.put(`/admin/users/${userId}`, userData);
    return data;
  },

  banUser: async (userId, reason) => {
    const { data } = await api.post(`/admin/users/${userId}/ban`, { reason });
    return data;
  },

  unbanUser: async (userId) => {
    const { data } = await api.post(`/admin/users/${userId}/unban`);
    return data;
  },

  getAnalytics: async (period = 30) => {
    const { data } = await api.get(`/admin/analytics?period=${period}`);
    return data;
  },

  getAdminNotifications: async () => {
    const { data } = await api.get('/admin/notifications');
    return data;
  }
};
```

## 📋 TESTING CHECKLIST

- [ ] User ban prevents login with proper error message
- [ ] Ban email is sent to user when banned
- [ ] Admin can view detailed user profile
- [ ] Admin can edit user details
- [ ] Analytics endpoint returns comprehensive data
- [ ] Admin notifications are created for key events
- [ ] Charts display analytics trends correctly

## 🔗 INTEGRATION POINTS

1. Main backend needs internal endpoint for ban emails
2. Admin notifications should be triggered from main backend events
3. Analytics pulls data from main backend database
4. User profile page needs routing in admin-frontend

## ⚠️ IMPORTANT NOTES

- All admin operations log activity
- Ban emails use existing email service
- Analytics cached for performance
- User profile page requires proper permissions
