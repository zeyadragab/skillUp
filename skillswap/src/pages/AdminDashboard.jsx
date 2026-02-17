import React, { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  Shield,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";

// Mock API call - replace with actual adminAPI
const mockAdminAPI = {
  getStats: async () => ({
    users: { total: 1245, teachers: 423, learners: 822, newThisMonth: 156 },
    sessions: {
      total: 3421,
      completed: 2847,
      active: 12,
      completionRate: 83.2,
    },
    tokens: { inCirculation: 124500, totalEarned: 89300, totalSpent: 67200 },
    revenue: { total: 45600, transactions: 567 },
    topTeachers: [
      {
        name: "John Doe",
        email: "john@example.com",
        tokensEarned: 5600,
        totalSessionsTaught: 145,
        averageRating: 4.9,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        tokensEarned: 4800,
        totalSessionsTaught: 128,
        averageRating: 4.8,
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        tokensEarned: 4200,
        totalSessionsTaught: 112,
        averageRating: 4.7,
      },
    ],
    recentSessions: [],
  }),
  getAllUsers: async () => ({
    users: [
      {
        _id: "1",
        name: "Test User",
        email: "test@example.com",
        tokens: 50,
        isTeacher: true,
        isActive: true,
        createdAt: new Date(),
      },
    ],
    pagination: { page: 1, limit: 20, total: 1, pages: 1 },
  }),
};

const AdminDashboard = memo(() => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/home");
    }
  }, [user, navigate]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await mockAdminAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await mockAdminAPI.getAllUsers();
      setUsers(data.users);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your SkillUp platform
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>

          {/* Tabs */}
          <div className="flex -mb-px space-x-8">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "sessions", label: "Sessions", icon: Calendar },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Total Users */}
                  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Users
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {stats.users.total.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          +{stats.users.newThisMonth} this month
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  {/* Total Sessions */}
                  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Sessions
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {stats.sessions.total.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {stats.sessions.completionRate}% completion rate
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Tokens in Circulation */}
                  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tokens in Circulation
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {stats.tokens.inCirculation.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {stats.tokens.totalSpent.toLocaleString()} spent
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Revenue
                        </p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          ${(stats.revenue.total / 100).toFixed(2)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {stats.revenue.transactions} transactions
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Teachers */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Top Teachers
                  </h3>
                  <div className="space-y-4">
                    {stats.topTeachers.map((teacher, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-indigo-600 rounded-full">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {teacher.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {teacher.tokensEarned} tokens
                          </p>
                          <p className="text-sm text-gray-500">
                            {teacher.totalSessionsTaught} sessions • ⭐{" "}
                            {teacher.averageRating}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="teacher">Teachers</option>
                      <option value="learner">Learners</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Tokens
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((usr) => (
                        <tr key={usr._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {usr.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {usr.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                usr.isTeacher
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {usr.isTeacher ? "Teacher" : "Learner"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {usr.tokens}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {usr.isActive ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Session Management
                </h3>
                <p className="text-gray-500">
                  Session management coming soon...
                </p>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Platform Settings
                </h3>
                <p className="text-gray-500">
                  Platform settings coming soon...
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

AdminDashboard.displayName = "AdminDashboard";
export default AdminDashboard;
