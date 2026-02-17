import React, { memo, useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Bell,
  Database,
  Trash2,
  LogOut,
  ChevronRight,
} from "lucide-react";

const SettingsSection = memo(() => {
  const [settings, setSettings] = useState({
    accountVisibility: "public",
    twoFactorEnabled: false,
    emailNotifications: true,
    sessionNotifications: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Privacy Settings */}
      <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
            👁️
          </span>
          <span>Privacy Settings</span>
        </h2>

        <div className="space-y-6">
          {/* Account Visibility */}
          <div className="flex items-center justify-between p-4 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">
                Account Visibility
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Choose who can see your profile
              </p>
            </div>
            <select
              value={settings.accountVisibility}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  accountVisibility: e.target.value,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>

          {/* Show Profile in Search */}
          <div className="flex items-center justify-between p-4 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">
                Show in Search Results
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Allow users to find your profile
              </p>
            </div>
            <button className="relative w-12 h-6 transition-colors bg-indigo-600 rounded-full hover:bg-indigo-700">
              <div className="absolute w-4 h-4 bg-white rounded-full right-1 top-1"></div>
            </button>
          </div>

          {/* Show Skills Publicly */}
          <div className="flex items-center justify-between p-4 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">
                Show Skills Publicly
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Display your skills to potential students
              </p>
            </div>
            <button className="relative w-12 h-6 transition-colors bg-indigo-600 rounded-full hover:bg-indigo-700">
              <div className="absolute w-4 h-4 bg-white rounded-full right-1 top-1"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            🔒
          </span>
          <span>Security Settings</span>
        </h2>

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {settings.twoFactorEnabled
                  ? "✓ Enabled"
                  : "Add an extra layer of security"}
              </p>
            </div>
            <button
              onClick={() => handleToggle("twoFactorEnabled")}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.twoFactorEnabled
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  settings.twoFactorEnabled ? "right-1" : "left-1"
                }`}
              ></div>
            </button>
          </div>

          {/* Change Password */}
          <div className="p-4 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100">
            <h3 className="mb-4 font-semibold text-gray-900">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button className="w-full py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Update Password
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="mb-4 font-semibold text-gray-900">
              Active Sessions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Chrome on MacOS
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Active now</p>
                </div>
                <button className="text-gray-400 transition-colors hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Safari on iPhone
                  </p>
                  <p className="mt-1 text-xs text-gray-500">2 hours ago</p>
                </div>
                <button className="text-gray-400 transition-colors hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
            🔔
          </span>
          <span>Notifications</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900">
                Email Notifications
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Get updates via email
              </p>
            </div>
            <button
              onClick={() => handleToggle("emailNotifications")}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.emailNotifications ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  settings.emailNotifications ? "right-1" : "left-1"
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900">
                Session Notifications
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Get notified about upcoming sessions
              </p>
            </div>
            <button
              onClick={() => handleToggle("sessionNotifications")}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.sessionNotifications ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  settings.sessionNotifications ? "right-1" : "left-1"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
            📊
          </span>
          <span>Data Management</span>
        </h2>

        <div className="space-y-4">
          <button className="flex items-center justify-between w-full p-4 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100 group">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">
                Download Your Data
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Get a copy of your profile and data
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>

          <button className="flex items-center justify-between w-full p-4 transition-colors bg-red-50 rounded-xl hover:bg-red-100 group">
            <div className="text-left">
              <h3 className="font-semibold text-red-900">Delete Account</h3>
              <p className="mt-1 text-sm text-red-700">
                Permanently delete your account and data
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
});

SettingsSection.displayName = "SettingsSection";

export default SettingsSection;
