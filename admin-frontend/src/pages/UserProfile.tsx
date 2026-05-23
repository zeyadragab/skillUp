import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowLeft, Shield, Coins, Star,
  CalendarDays, Users, GraduationCap, BookOpen, Ban, CheckCircle2,
  Trash2, Edit3, Save, X, TrendingUp, TrendingDown, RefreshCw,
  AlertCircle, Clock, CheckCircle, XCircle, Activity, Bell, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { usersApi, notificationsApi } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

// ── Types ────────────────────────────────────────────────────────────────────
interface UserDetail {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isTeacher: boolean;
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  tokens: number;
  tokensEarned: number;
  tokensSpent: number;
  totalSessionsTaught: number;
  totalSessionsLearned: number;
  averageRating: number;
  totalRatings: number;
  level: number;
  experience: number;
  streak: { current: number; longest: number } | number;
  followers: string[];
  following: string[];
  skillsToTeach: Array<{ name: string; category: string; level: string }>;
  skillsToLearn: string[];
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

interface TxRecord {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface SessionRecord {
  _id: string;
  skill: string;
  title?: string;
  status: string;
  scheduledAt: string;
  tokensCharged: number;
  teacher?: { name: string; avatar?: string };
  learner?: { name: string; avatar?: string };
}

interface ActivityPoint {
  date: string;
  spent: number;
  earned: number;
  txCount: number;
}

interface ProfileData {
  user: UserDetail;
  transactions: TxRecord[];
  sessionsAsTeacher: SessionRecord[];
  sessionsAsLearner: SessionRecord[];
  activityChart: ActivityPoint[];
  stats: {
    totalSessions: number;
    completedSessions: number;
    totalReviews: number;
    followers: number;
    following: number;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const TT = {
  contentStyle: {
    background: 'oklch(20% 0.012 260)',
    border: '1px solid oklch(28% 0.015 260)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'oklch(85% 0.006 65)',
  },
  labelStyle: { color: 'oklch(93% 0.006 65)', fontWeight: 600 },
  cursor: { fill: 'oklch(100% 0 0 / 0.03)' },
};

const inputCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors';
const labelCls = 'block text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-1.5';

const statusIcon = (s: string) => {
  if (s === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-ok" />;
  if (s === 'cancelled' || s === 'no-show') return <XCircle className="w-3.5 h-3.5 text-err" />;
  return <Clock className="w-3.5 h-3.5 text-warn" />;
};

// ── Stat mini-card ───────────────────────────────────────────────────────────
const Mini: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color?: string }> = ({
  label, value, icon, color = 'text-accent',
}) => (
  <div className="rounded-xl border border-white/5 bg-rail p-4 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-fg-rail uppercase tracking-wider">{label}</p>
      <p className="text-[18px] font-bold text-fg-inv leading-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'transactions'>('overview');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserDetail>>({});
  const [saving, setSaving] = useState(false);

  // Modals
  const [banModal, setBanModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [tokenModal, setTokenModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [tokenType, setTokenType] = useState<'credit' | 'debit'>('credit');
  const [tokenReason, setTokenReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getUser(id);
      const payload = res.data.data;
      setData(payload);
      setEditForm({
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
        isActive: payload.user.isActive,
        isVerified: payload.user.isVerified,
        isTeacher: payload.user.isTeacher,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await usersApi.updateUser(id, editForm);
      toast.success('User updated');
      setEditing(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async () => {
    if (!id || !banReason.trim()) { toast.error('Enter a reason'); return; }
    setSubmitting(true);
    try {
      await usersApi.banUser(id, banReason);
      toast.success('User banned');
      setBanModal(false);
      setBanReason('');
      setData(prev => prev ? { ...prev, user: { ...prev.user, isBanned: true, banReason } } : prev);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnban = async () => {
    if (!id) return;
    try {
      await usersApi.unbanUser(id);
      toast.success('User unbanned');
      setData(prev => prev ? { ...prev, user: { ...prev.user, isBanned: false, banReason: undefined } } : prev);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await usersApi.deleteUser(id);
      toast.success('User deleted');
      navigate('/users');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
      setSubmitting(false);
    }
  };

  const handleTokenAdjust = async () => {
    if (!id || tokenAmount <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await usersApi.adjustTokens(id, tokenAmount, tokenType, tokenReason);
      toast.success(`${tokenType === 'credit' ? 'Added' : 'Removed'} ${tokenAmount} tokens`);
      setTokenModal(false);
      setTokenAmount(0);
      setTokenReason('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const [togglingVerify, setTogglingVerify] = useState(false);

  // Session pagination
  const [sessionPage, setSessionPage] = useState(1);
  const SESSION_PAGE_SIZE = 10;

  // Notification modal
  const [notifModal, setNotifModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [sendingNotif, setSendingNotif] = useState(false);

  const toggleVerified = async () => {
    if (!id || !data || togglingVerify) return;
    const next = !data.user.isVerified;
    setTogglingVerify(true);
    try {
      const res = await usersApi.updateUser(id, { isVerified: next });
      if (res.data.success) {
        toast.success(next ? 'User verified ✓' : 'Verification removed');
        // Update local state immediately without full reload
        setData(prev => prev ? { ...prev, user: { ...prev.user, isVerified: next } } : prev);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update verification');
    } finally {
      setTogglingVerify(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSendingNotif(true);
    try {
      await notificationsApi.createNotification({
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        targetAudience: 'specific',
        targetUsers: [id],
        priority: 'normal',
      });
      toast.success('Notification sent');
      setNotifModal(false);
      setNotifTitle('');
      setNotifMessage('');
      setNotifType('info');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send notification');
    } finally {
      setSendingNotif(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-rail animate-pulse" />
        <div className="h-40 rounded-xl bg-rail border border-white/5 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-rail animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 rounded-xl bg-rail animate-pulse" />
          <div className="h-64 rounded-xl bg-rail animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-fg-rail">
        <AlertCircle className="w-10 h-10 text-err" />
        <p className="text-[14px]">{error || 'User not found'}</p>
        <Button variant="secondary" icon={RefreshCw} onClick={load}>Retry</Button>
      </div>
    );
  }

  const { user, transactions, sessionsAsTeacher, sessionsAsLearner, activityChart, stats } = data;
  const allSessions = [...sessionsAsTeacher, ...sessionsAsLearner].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  return (
    <div className="space-y-5">
      {/* ── Back + title ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/users')}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-rail border border-white/5 text-fg-rail hover:text-fg-inv transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-fg-inv">User Profile</h1>
          <p className="text-[12px] text-fg-rail">Full profile and activity</p>
        </div>
      </div>

      {/* ── Profile header card ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 bg-rail p-5">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-[28px] font-bold text-accent">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-rail ${user.isActive && !user.isBanned ? 'bg-ok' : 'bg-err'}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[20px] font-bold text-fg-inv">{user.name}</h2>
                  {user.isVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {user.isBanned && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-err bg-err/10 px-2 py-0.5 rounded-full">
                      <Ban className="w-3 h-3" /> Banned
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-fg-rail mt-0.5">{user.email}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge variant={user.isTeacher ? 'success' : 'info'}>{user.isTeacher ? 'Teacher' : user.role}</Badge>
                  <span className="text-[12px] text-fg-rail">Level {user.level}</span>
                  <span className="text-[12px] text-fg-rail">🔥 {typeof user.streak === 'object' ? user.streak.current : user.streak} day streak</span>
                  <span className="text-[12px] text-fg-rail">Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-[12px] font-medium text-fg-rail hover:text-fg-inv transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-accent text-[oklch(15%_0.008_55)] text-[12px] font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-[12px] font-medium text-fg-rail hover:text-fg-inv transition-colors">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={toggleVerified}
                  disabled={togglingVerify}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium transition-colors border disabled:opacity-50 ${user.isVerified ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' : 'bg-white/5 border-white/10 text-fg-rail hover:text-fg-inv'}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {togglingVerify ? 'Saving…' : user.isVerified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  onClick={() => { setTokenType('credit'); setTokenModal(true); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[12px] font-medium hover:bg-yellow-500/20 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5" /> Tokens
                </button>
                {user.isBanned ? (
                  <button
                    onClick={handleUnban}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-ok/10 border border-ok/20 text-ok text-[12px] font-medium hover:bg-ok/20 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unban
                  </button>
                ) : (
                  <button
                    onClick={() => setBanModal(true)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-err/10 border border-err/20 text-err text-[12px] font-medium hover:bg-err/20 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" /> Ban
                  </button>
                )}
                <button
                  onClick={() => setNotifModal(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[12px] font-medium hover:bg-blue-500/20 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" /> Notify
                </button>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-err/10 border border-err/20 text-err text-[12px] font-medium hover:bg-err/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

            {/* Ban reason */}
            {user.isBanned && user.banReason && (
              <div className="mt-3 p-2.5 rounded-lg bg-err/10 border border-err/20">
                <p className="text-[12px] text-err"><span className="font-semibold">Ban reason:</span> {user.banReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Display Name</label>
              <input className={inputCls} value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select className={`${inputCls} cursor-pointer`} value={editForm.role || ''} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="teacher">Teacher</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editForm.isActive} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-[13px] text-fg-rail">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editForm.isTeacher} onChange={e => setEditForm(f => ({ ...f, isTeacher: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-[13px] text-fg-rail">Is Teacher</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Stat mini-cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Mini label="Token Balance" value={user.tokens} icon={<Coins className="w-4 h-4" />} color="text-yellow-400" />
        <Mini label="Tokens Earned" value={user.tokensEarned} icon={<TrendingUp className="w-4 h-4" />} color="text-ok" />
        <Mini label="Tokens Spent" value={user.tokensSpent} icon={<TrendingDown className="w-4 h-4" />} color="text-err" />
        <Mini label="Total Sessions" value={stats.totalSessions} icon={<CalendarDays className="w-4 h-4" />} color="text-blue-400" />
        <Mini label="Followers" value={stats.followers} icon={<Users className="w-4 h-4" />} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Mini label="Sessions Taught" value={user.totalSessionsTaught} icon={<GraduationCap className="w-4 h-4" />} color="text-accent" />
        <Mini label="Sessions Learned" value={user.totalSessionsLearned} icon={<BookOpen className="w-4 h-4" />} color="text-blue-400" />
        <Mini label="Avg Rating" value={user.averageRating?.toFixed(1) || '—'} icon={<Star className="w-4 h-4" />} color="text-yellow-400" />
        <Mini label="Completed" value={stats.completedSessions} icon={<CheckCircle2 className="w-4 h-4" />} color="text-ok" />
        <Mini label="Following" value={stats.following} icon={<Users className="w-4 h-4" />} color="text-fg-rail" />
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Token activity */}
        <div className="rounded-xl border border-white/5 bg-rail p-5">
          <p className="text-[14px] font-semibold text-fg-inv mb-1">Token Activity</p>
          <p className="text-[12px] text-fg-rail mb-4">Earned vs spent — last 30 days</p>
          {activityChart.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-fg-rail text-[13px]">No activity in last 30 days</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(60% 0.18 145)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(60% 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(63% 0.20 25)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(63% 0.20 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(28% 0.015 260)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} allowDecimals={false} />
                <Tooltip {...TT} labelFormatter={l => `Date: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'oklch(55% 0.008 260)' }} />
                <Area type="monotone" dataKey="earned" name="Earned" stroke="oklch(60% 0.18 145)" strokeWidth={2} fill="url(#earnGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="spent" name="Spent" stroke="oklch(63% 0.20 25)" strokeWidth={2} fill="url(#spendGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Session breakdown */}
        <div className="rounded-xl border border-white/5 bg-rail p-5">
          <p className="text-[14px] font-semibold text-fg-inv mb-1">Session Breakdown</p>
          <p className="text-[12px] text-fg-rail mb-4">Taught vs learned by status</p>
          {allSessions.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-fg-rail text-[13px]">No sessions yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { label: 'Taught', completed: sessionsAsTeacher.filter(s => s.status === 'completed').length, other: sessionsAsTeacher.filter(s => s.status !== 'completed').length },
                  { label: 'Learned', completed: sessionsAsLearner.filter(s => s.status === 'completed').length, other: sessionsAsLearner.filter(s => s.status !== 'completed').length },
                ]}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(28% 0.015 260)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'oklch(55% 0.008 260)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} allowDecimals={false} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'oklch(55% 0.008 260)' }} />
                <Bar dataKey="completed" name="Completed" fill="oklch(60% 0.18 145)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="other" name="Other" fill="oklch(55% 0.008 260)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 bg-rail overflow-hidden">
        <div className="flex border-b border-white/5">
          {(['overview', 'sessions', 'transactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[13px] font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-accent text-fg-inv'
                  : 'border-transparent text-fg-rail hover:text-fg-inv'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Overview tab ──────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills to teach */}
              <div>
                <p className="text-[12px] font-semibold text-fg-rail uppercase tracking-wider mb-3">Skills to Teach</p>
                {user.skillsToTeach?.length > 0 ? (
                  <div className="space-y-2">
                    {user.skillsToTeach.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-canvas border border-edge">
                        <div>
                          <p className="text-[13px] font-medium text-fg-1">{s.name}</p>
                          <p className="text-[11px] text-fg-3">{s.category}</p>
                        </div>
                        <Badge variant="info">{s.level}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-fg-rail">No skills listed</p>
                )}
              </div>

              {/* Skills to learn */}
              <div>
                <p className="text-[12px] font-semibold text-fg-rail uppercase tracking-wider mb-3">Skills to Learn</p>
                {user.skillsToLearn?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsToLearn.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-canvas border border-edge text-[12px] text-fg-2">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-fg-rail">None listed</p>
                )}
              </div>

              {/* Languages */}
              <div>
                <p className="text-[12px] font-semibold text-fg-rail uppercase tracking-wider mb-3">Languages</p>
                {user.languages?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((l, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-canvas border border-edge text-[12px] text-fg-2">{l}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-fg-rail">Not specified</p>
                )}
              </div>

              {/* Account details */}
              <div>
                <p className="text-[12px] font-semibold text-fg-rail uppercase tracking-wider mb-3">Account Details</p>
                <div className="space-y-2">
                  {[
                    { label: 'User ID', value: user._id },
                    { label: 'Experience', value: `${(user.experience || 0).toLocaleString()} XP` },
                    { label: 'Streak', value: `${typeof user.streak === 'object' ? user.streak.current : (user.streak || 0)} / ${typeof user.streak === 'object' ? user.streak.longest : 0} days (best)` },
                    { label: 'Total Ratings', value: user.totalRatings },
                    { label: 'Last Updated', value: format(new Date(user.updatedAt), 'MMM d, yyyy HH:mm') },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-[12px] text-fg-rail">{label}</span>
                      <span className="text-[12px] text-fg-inv font-medium font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Sessions tab ──────────────────────────────────────────────── */}
          {activeTab === 'sessions' && (() => {
            const paged = allSessions.slice(0, sessionPage * SESSION_PAGE_SIZE);
            const hasMore = paged.length < allSessions.length;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] text-fg-rail">
                    Showing {paged.length} of {allSessions.length} sessions
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{sessionsAsTeacher.length} taught</Badge>
                    <Badge variant="info">{sessionsAsLearner.length} learned</Badge>
                  </div>
                </div>
                {allSessions.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-fg-rail text-[13px]">
                    <Activity className="w-4 h-4 mr-2" /> No sessions found
                  </div>
                ) : (
                  <>
                    {paged.map(s => {
                      const isTaught = sessionsAsTeacher.some(t => t._id === s._id);
                      const other = isTaught ? s.learner : s.teacher;
                      return (
                        <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-edge hover:border-edge-2 transition-colors">
                          <div className="shrink-0">{statusIcon(s.status)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[13px] font-medium text-fg-1 truncate">{s.skill}</p>
                              <Badge variant={isTaught ? 'success' : 'info'}>{isTaught ? 'Taught' : 'Learned'}</Badge>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${
                                s.status === 'completed' ? 'bg-ok/10 text-ok' :
                                s.status === 'cancelled' || s.status === 'no-show' ? 'bg-err/10 text-err' :
                                'bg-warn/10 text-warn'
                              }`}>{s.status}</span>
                            </div>
                            <p className="text-[11px] text-fg-3 mt-0.5">
                              {other?.name && `with ${other.name} · `}
                              {s.scheduledAt ? format(new Date(s.scheduledAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-semibold text-yellow-400">{s.tokensCharged} tkn</p>
                          </div>
                        </div>
                      );
                    })}
                    {hasMore && (
                      <button
                        onClick={() => setSessionPage(p => p + 1)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-edge text-[13px] text-fg-rail hover:text-fg-inv hover:border-edge-2 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" /> Load more ({allSessions.length - paged.length} remaining)
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* ── Transactions tab ──────────────────────────────────────────── */}
          {activeTab === 'transactions' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-fg-rail text-[13px]">No transactions found</div>
              ) : (
                transactions.map(tx => (
                  <div key={tx._id} className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-edge">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-ok/10' : 'bg-err/10'}`}>
                      {tx.type === 'credit'
                        ? <TrendingUp className="w-4 h-4 text-ok" />
                        : <TrendingDown className="w-4 h-4 text-err" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-fg-1 capitalize">{tx.reason.replace(/_/g, ' ')}</p>
                      {tx.description && <p className="text-[11px] text-fg-3 truncate">{tx.description}</p>}
                      <p className="text-[11px] text-fg-3">{format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[14px] font-bold ${tx.type === 'credit' ? 'text-ok' : 'text-err'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </p>
                      <p className="text-[11px] text-fg-rail">bal: {tx.balanceAfter}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <Modal isOpen={banModal} onClose={() => { setBanModal(false); setBanReason(''); }} title={`Ban: ${user.name}`}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Reason <span className="text-err normal-case">*</span></label>
            <textarea
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none"
              placeholder="Enter ban reason..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBanModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleBan} loading={submitting}>Ban User</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete User">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-err/10 border border-err/20">
            <p className="text-[13px] text-err font-medium">This action is permanent and cannot be undone.</p>
            <p className="text-[12px] text-fg-rail mt-1">Deleting <strong className="text-fg-inv">{user.name}</strong> will remove their account and all associated data.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={submitting} icon={Trash2}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={notifModal} onClose={() => { setNotifModal(false); setNotifTitle(''); setNotifMessage(''); setNotifType('info'); }} title={`Send Notification to ${user.name}`}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(['info', 'success', 'warning', 'error'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setNotifType(t)}
                  className={`h-8 rounded-lg text-[12px] font-medium capitalize border transition-colors ${
                    notifType === t
                      ? t === 'info' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                        : t === 'success' ? 'bg-ok/20 border-ok/30 text-ok'
                        : t === 'warning' ? 'bg-warn/20 border-warn/30 text-warn'
                        : 'bg-err/20 border-err/30 text-err'
                      : 'bg-canvas border-edge text-fg-3 hover:text-fg-1'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Title <span className="text-err normal-case">*</span></label>
            <input className={inputCls} value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title..." />
          </div>
          <div>
            <label className={labelCls}>Message <span className="text-err normal-case">*</span></label>
            <textarea
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none"
              placeholder="Notification message..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setNotifModal(false)}>Cancel</Button>
            <Button variant="primary" icon={Bell} onClick={handleSendNotification} loading={sendingNotif}>Send</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={tokenModal} onClose={() => { setTokenModal(false); setTokenAmount(0); setTokenReason(''); setTokenType('credit'); }} title={`Adjust Tokens: ${user.name}`}>
        <div className="space-y-4">
          <div className="p-3 bg-canvas rounded-lg border border-edge">
            <p className="text-[11px] text-fg-3 uppercase tracking-widest mb-0.5">Current Balance</p>
            <p className="text-[22px] font-bold text-fg-1">{user.tokens.toLocaleString()} <span className="text-[13px] font-normal text-fg-3">tokens</span></p>
          </div>
          <div>
            <label className={labelCls}>Operation</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setTokenType('credit')} className={`h-9 rounded-lg text-[13px] font-medium border transition-colors ${tokenType === 'credit' ? 'bg-ok/10 text-ok border-ok/30' : 'bg-canvas text-fg-3 border-edge hover:text-fg-1'}`}>+ Add</button>
              <button onClick={() => setTokenType('debit')} className={`h-9 rounded-lg text-[13px] font-medium border transition-colors ${tokenType === 'debit' ? 'bg-err/10 text-err border-err/30' : 'bg-canvas text-fg-3 border-edge hover:text-fg-1'}`}>- Remove</button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Amount</label>
            <input type="number" min="1" value={tokenAmount || ''} onChange={e => setTokenAmount(parseInt(e.target.value) || 0)} className={inputCls} placeholder="Enter amount..." />
          </div>
          <div>
            <label className={labelCls}>Reason</label>
            <input type="text" value={tokenReason} onChange={e => setTokenReason(e.target.value)} className={inputCls} placeholder="Admin note..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTokenModal(false)}>Cancel</Button>
            <Button variant={tokenType === 'credit' ? 'success' : 'danger'} onClick={handleTokenAdjust} loading={submitting}>
              {tokenType === 'credit' ? 'Add' : 'Remove'} {tokenAmount > 0 ? tokenAmount : ''} Tokens
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
