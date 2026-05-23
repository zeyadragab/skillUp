// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'learner' | 'teacher' | 'both';
  isActive: boolean;
  isBanned: boolean;
  isVerified: boolean;
  tokens: number;
  tokensEarned: number;
  tokensSpent: number;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'moderator' | 'support';
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin?: string;
}

export interface AdminPermissions {
  users: boolean;
  teachers: boolean;
  skills: boolean;
  sessions: boolean;
  transactions: boolean;
  reports: boolean;
  reviews: boolean;
  notifications: boolean;
  settings: boolean;
  analytics: boolean;
}

// Skill Types
export interface Skill {
  _id: string;
  name: string;
  category: Category | string;
  description?: string;
  isActive: boolean;
  teacherCount: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  skillCount: number;
  isActive: boolean;
}

// Session Types
export interface Session {
  _id: string;
  teacher: User;
  learner: User;
  skill: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  tokensCharged: number;
  cancellationReason?: string;
  createdAt: string;
}

// Analytics Types
export interface AnalyticsData {
  users: {
    total: number;
    banned: number;
    new: number;
    verified: number;
    teachers: number;
  };
  sessions: {
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    inPeriod: number;
    completionRate: number;
  };
  revenue: {
    total: number;
    inPeriod: number;
  };
  tokens: {
    inCirculation: number;
    transactions: number;
  };
  trends: {
    userGrowth: Array<{ date: string; count: number }>;
    sessions: Array<{ date: string; completed: number; cancelled: number; scheduled: number }>;
    tokenFlow: Array<{ date: string; credits: number; debits: number; creditCount: number; debitCount: number }>;
  };
}

// Transaction Types
export interface Transaction {
  _id: string;
  user: User;
  type: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  reference?: string;
  createdAt: string;
}

// Report Types
export interface Report {
  _id: string;
  reporter: User;
  reportedUser: User;
  type: string;
  reason: string;
  description?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: Admin;
  resolution?: {
    action: string;
    notes: string;
    resolvedBy: Admin;
    resolvedAt: string;
  };
  adminNotes: Array<{
    admin: Admin;
    note: string;
    createdAt: string;
  }>;
  createdAt: string;
}

// Review Types
export interface Review {
  _id: string;
  reviewer: User;
  reviewee: User;
  session: Session;
  rating: number;
  comment?: string;
  status: 'active' | 'hidden' | 'flagged' | 'pending';
  createdAt: string;
}

// Notification Types
export interface SystemNotification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: 'all' | 'teachers' | 'learners' | 'specific';
  priority: 'low' | 'normal' | 'high';
  status: 'draft' | 'scheduled' | 'active' | 'sent' | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  stats: {
    totalTargeted: number;
    delivered: number;
    read: number;
  };
  createdBy: Admin;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalSessions: number;
  totalTokens: number;
  newUsersToday: number;
  sessionsToday: number;
  pendingReports: number;
  pendingVerifications: number;
  bannedUsers: number;
  unverifiedUsers: number;
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
