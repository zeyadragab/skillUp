import React, { Suspense, lazy, memo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./components/context/UserContext";
import { TokenProvider } from "./components/context/TokenContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ==================== LAZY LOADED PAGES ====================
const LandingPage = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/Signin"));
const SignUp = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Home"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SkillSearchResults = lazy(() => import("./pages/SkillSearchResults"));
const TeacherProfile = lazy(() => import("./pages/TeacherProfile"));
const Chat = lazy(() => import("./pages/Chat"));
const ActivateAccount = lazy(() => import("./pages/ActivateAccount"));
const OTPLogin = lazy(() => import("./pages/OTPLogin"));
const OTPVerify = lazy(() => import("./pages/OTPVerify"));
const VideoSession = lazy(() => import("./pages/VideoSession"));
const Recordings = lazy(() => import("./pages/Recordings"));
const RecordingPlayer = lazy(() => import("./pages/RecordingPlayer"));
const Sessions = lazy(() => import("./pages/Sessions"));
const SessionDetails = lazy(() => import("./pages/SessionDetails"));
const SessionSummary = lazy(() => import("./pages/SessionSummary"));
const BuyTokens = lazy(() => import("./pages/BuyTokens"));
const BrowseTeachers = lazy(() => import("./pages/BrowseTeachers"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Receipt = lazy(() => import("./pages/Receipt"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));

// ==================== LOADING COMPONENT ====================
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-600 to-purple-600">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-white/30 border-t-white animate-spin"></div>
      <p className="font-semibold text-white">Loading...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = "LoadingSpinner";

// ==================== 404 PAGE ====================
const NotFound = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-600 to-purple-600">
    <div className="text-center text-white">
      <h1 className="mb-4 text-6xl font-bold">404</h1>
      <p className="mb-8 text-2xl">Page not found</p>
      <a
        href="/home"
        className="px-6 py-3 font-semibold text-indigo-600 transition-colors bg-white rounded-lg hover:bg-gray-100"
      >
        Go Home
      </a>
    </div>
  </div>
));

NotFound.displayName = "NotFound";

// ==================== MAIN APP ====================
function App() {
  return (
    <UserProvider>
      <TokenProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/activate" element={<ActivateAccount />} />
              <Route path="/otp-login" element={<OTPLogin />} />
              <Route path="/otp-verify" element={<OTPVerify />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Profile - Public View */}
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <TeacherProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Skill Search Results */}
              <Route
                path="/skills/:skillName"
                element={
                  <ProtectedRoute>
                    <SkillSearchResults />
                  </ProtectedRoute>
                }
              />

              {/* Browse All Teachers */}
              <Route
                path="/teachers"
                element={
                  <ProtectedRoute>
                    <BrowseTeachers />
                  </ProtectedRoute>
                }
              />

              {/* Courses Page */}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <CoursesPage />
                  </ProtectedRoute>
                }
              />

              {/* Community Page */}
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Chat Route */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* Sessions Route */}
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute>
                    <Sessions />
                  </ProtectedRoute>
                }
              />

              {/* Session Details Route */}
              <Route
                path="/sessions/:sessionId"
                element={
                  <ProtectedRoute>
                    <SessionDetails />
                  </ProtectedRoute>
                }
              />

              {/* Video Session Routes */}
              <Route
                path="/sessions/:sessionId/video"
                element={
                  <ProtectedRoute>
                    <VideoSession />
                  </ProtectedRoute>
                }
              />

              {/* Session Summary Route */}
              <Route
                path="/sessions/:sessionId/summary"
                element={
                  <ProtectedRoute>
                    <SessionSummary />
                  </ProtectedRoute>
                }
              />

              {/* Recordings Routes */}
              <Route
                path="/recordings"
                element={
                  <ProtectedRoute>
                    <Recordings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recordings/:id"
                element={
                  <ProtectedRoute>
                    <RecordingPlayer />
                  </ProtectedRoute>
                }
              />

              {/* Buy Tokens Route */}
              <Route
                path="/buy-tokens"
                element={
                  <ProtectedRoute>
                    <BuyTokens />
                  </ProtectedRoute>
                }
              />

              {/* Wallet Route */}
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />

              {/* Receipt Route */}
              <Route
                path="/receipts/:paymentId"
                element={
                  <ProtectedRoute>
                    <Receipt />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </TokenProvider>
    </UserProvider>
  );
}

export default memo(App);
