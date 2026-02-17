import React, { memo, useState, useCallback } from "react";
import {
  Search,
  Bell,
  Menu,
  X,
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useTokens } from "../context/TokenContext";

// ==================== HEADER COMPONENT ====================
const Header = memo(({ onMenuOpen }) => {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-purple-600">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-transparent bg-lieanr-to-r from-indigo-600 to-purple-600 bg-clip-text">
              SkillUp
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 hidden max-w-md mx-8 md:block">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search skills, teachers..."
                className="w-full py-2 pl-10 pr-4 transition-all border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
            </button>

            {/* User Menu */}
            {user && (
              <div className="items-center hidden pl-4 space-x-3 border-l border-gray-200 sm:flex">
                <img
                  src={
                    user.avatar ||
                    "https://ui-avatars.com/api/?name=" + user.name
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500">Learner</p>
                </div>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              onClick={onMenuOpen}
              className="p-2 text-gray-600 transition-colors rounded-lg md:hidden hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

// ==================== STAT CARD ====================
const StatCard = memo(({ icon: Icon, label, value, change, gradient }) => (
  <div className="p-6 transition-all duration-300 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" /> {change}% this month
          </p>
        )}
      </div>
      <div className={`bg-linear-to-br ${gradient} p-4 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
));

// ==================== COURSE CARD ====================
const CourseCard = memo(({ image, title, teacher, level, price, progress }) => (
  <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:-translate-y-1">
    <div className="h-40 bg-linear-to-br from-indigo-400 to-purple-500"></div>

    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            {level}
          </p>
          <h3 className="mt-1 font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-lg font-bold text-yellow-500">{price}</span>
      </div>

      <p className="mb-4 text-sm text-gray-600">by {teacher}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className="text-xs font-semibold text-gray-900">
            {progress}%
          </span>
        </div>
        <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
          <div
            className="h-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button className="w-full py-2 text-sm font-medium text-indigo-600 transition-colors rounded-lg bg-indigo-50 hover:bg-indigo-100">
        Continue Learning
      </button>
    </div>
  </div>
));

// ==================== TEACHER CARD ====================
const TeacherCard = memo(
  ({ name, specialty, rating, students, availability, image }) => (
    <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-100 rounded-xl hover:shadow-lg">
      <div className="h-32 bg-linear-to-r from-green-400 to-emerald-500"></div>

      <div className="relative p-5 -mt-8">
        <div className="w-16 h-16 mb-3 border-4 border-white rounded-full bg-linear-to-br from-yellow-400 to-orange-500"></div>

        <h3 className="font-bold text-gray-900">{name}</h3>
        <p className="mb-3 text-sm text-gray-600">{specialty}</p>

        <div className="flex items-center mb-4 space-x-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {rating}.0
          </span>
        </div>

        <div className="mb-4 space-y-1 text-xs text-gray-600">
          <p>👥 {students} students</p>
          <p className="flex items-center">
            <Clock className="w-3 h-3 mr-1" /> {availability}
          </p>
        </div>

        <button className="w-full py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
          Book Session
        </button>
      </div>
    </div>
  )
);

// ==================== SIDEBAR NAVIGATION ====================
const Sidebar = memo(({ isOpen, onClose }) => {
  const { logout } = useUser();

  const navItems = [
    { icon: BookOpen, label: "Dashboard", href: "#" },
    { icon: Users, label: "Find Teachers", href: "#" },
    { icon: TrendingUp, label: "My Progress", href: "#" },
    { icon: Calendar, label: "Sessions", href: "#" },
    { icon: MessageSquare, label: "Messages", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-16 md:top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-2">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="flex items-center px-4 py-3 space-x-3 text-gray-700 transition-all duration-300 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 group"
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto transition-opacity opacity-0 group-hover:opacity-100" />
            </a>
          ))}

          <hr className="my-6" />

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center w-full px-4 py-3 space-x-3 text-red-600 transition-all duration-300 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
});

// ==================== MAIN DASHBOARD ====================
const Dashboard = memo(() => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tokens } = useTokens();

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuOpen={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your learning journey
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={BookOpen}
                label="Courses"
                value="5"
                change="20"
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Progress"
                value="68%"
                change="15"
                gradient="from-green-500 to-emerald-500"
              />
              <StatCard
                icon={Users}
                label="Teachers"
                value="8"
                change="25"
                gradient="from-purple-500 to-pink-500"
              />
              <StatCard
                icon={MessageSquare}
                label="Tokens"
                value={`${tokens.toFixed(1)}`}
                change="40"
                gradient="from-yellow-500 to-orange-500"
              />
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-8 lg:col-span-2">
                {/* Ongoing Courses */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Continue Learning
                    </h2>
                    <a
                      href="#"
                      className="flex items-center font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <CourseCard
                      title="Advanced React"
                      teacher="John Smith"
                      level="Intermediate"
                      price="15 tokens"
                      progress={75}
                    />
                    <CourseCard
                      title="UI/UX Design"
                      teacher="Sarah Chen"
                      level="Beginner"
                      price="10 tokens"
                      progress={45}
                    />
                  </div>
                </div>

                {/* Recommended Teachers */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recommended Teachers
                    </h2>
                    <a
                      href="#"
                      className="flex items-center font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Browse All <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <TeacherCard
                      name="Alex Johnson"
                      specialty="Web Development"
                      rating="5"
                      students="120"
                      availability="Mon-Fri, 5-8 PM"
                    />
                    <TeacherCard
                      name="Maria Garcia"
                      specialty="Spanish Language"
                      rating="4"
                      students="89"
                      availability="Daily, 2-9 PM"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar - Quick Actions */}
              <div className="space-y-6">
                {/* Upcoming Sessions */}
                <div className="p-6 bg-white border border-gray-100 rounded-xl">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Upcoming Sessions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                      <div className="w-2 h-2 mt-1 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          React with John
                        </p>
                        <p className="text-xs text-gray-600">
                          Tomorrow at 3 PM
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
                      <div className="w-2 h-2 mt-1 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Spanish Chat
                        </p>
                        <p className="text-xs text-gray-600">Wed at 6 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="p-6 text-white bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <h3 className="mb-4 text-lg font-bold">This Month's Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-indigo-100">Hours Learned</span>
                      <span className="font-bold">12.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-100">Skills Gained</span>
                      <span className="font-bold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-100">Teachers Met</span>
                      <span className="font-bold">5</span>
                    </div>
                  </div>
                </div>

                {/* Achievement */}
                <div className="p-6 text-center bg-white border border-gray-100 rounded-xl">
                  <div className="mb-3 text-4xl">🏆</div>
                  <h3 className="mb-2 font-bold text-gray-900">
                    New Achievement!
                  </h3>
                  <p className="text-sm text-gray-600">
                    You earned the "Quick Learner" badge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
});

export default Dashboard;
