import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Teachers from './pages/Teachers';
import Skills from './pages/Skills';
import Sessions from './pages/Sessions';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Reviews from './pages/Reviews';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserProfile />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="skills" element={<Skills />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'oklch(23% 0.015 260)',
            border: '1px solid oklch(28% 0.015 260)',
            color: 'oklch(93% 0.006 65)',
            fontSize: '13px',
            borderRadius: '10px',
          },
          success: {
            iconTheme: { primary: 'oklch(60% 0.18 145)', secondary: 'oklch(20% 0.060 145)' },
          },
          error: {
            iconTheme: { primary: 'oklch(63% 0.20 25)', secondary: 'oklch(22% 0.065 25)' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
