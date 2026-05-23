import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, CheckCircle, XCircle, Star, Clock, GraduationCap, ShieldCheck,
  ChevronRight, X, User as UserIcon, Mail, Calendar, BookOpen,
  TrendingUp, Award, AlertTriangle, ExternalLink, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import StatsCard from '../components/common/StatsCard';
import { teachersApi, notificationsApi } from '../services/api';
import { User, Pagination } from '../types';

// ── tiny helpers ──────────────────────────────────────────────────────────────

const inputCls =
  'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors';
const textareaCls =
  'w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none';
const labelCls = 'block text-[12px] font-medium text-fg-2 mb-1.5';
const sectionCls = 'space-y-1';

const tabCls = (active: boolean) =>
  `px-5 py-3.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
    active ? 'text-accent border-b-2 border-accent' : 'text-fg-3 hover:text-fg-1'
  }`;

type VerifStatus = 'approved' | 'pending' | 'rejected' | '';

function statusVariant(s: string | undefined): 'success' | 'error' | 'warning' {
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'error';
  return 'warning';
}

function statusLabel(s: string | undefined) {
  if (s === 'approved') return 'Verified';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-warn fill-warn' : 'text-edge-2'}`}
        />
      ))}
    </div>
  );
}

// ── types ─────────────────────────────────────────────────────────────────────

interface TeacherFull extends User {
  isTeacher?: boolean;
  isBanned?: boolean;
  averageRating?: number;
  totalRatings?: number;
  totalSessionsTaught?: number;
  tokensEarned?: number;
  skillsToTeach?: Array<{ name?: string; skill?: { name?: string } }>;
  teacherVerification?: {
    status: string;
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    bio?: string;
    documents?: string[];
  };
}

// ── Teacher detail drawer ─────────────────────────────────────────────────────

interface DrawerProps {
  teacher: TeacherFull | null;
  onClose: () => void;
  onVerify: (t: TeacherFull) => void;
  onReject: (t: TeacherFull) => void;
  onViewProfile: (id: string) => void;
}

const TeacherDrawer: React.FC<DrawerProps> = ({
  teacher, onClose, onVerify, onReject, onViewProfile,
}) => {
  const [detail, setDetail] = useState<TeacherFull | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    if (!teacher) { setDetail(null); return; }
    setDetail(teacher);
    setLoadingDetail(true);
    teachersApi.getTeacher(teacher._id)
      .then(r => setDetail(r.data.data || teacher))
      .catch(() => {/* use shallow data */})
      .finally(() => setLoadingDetail(false));
  }, [teacher?._id]);

  const handleSendNotif = async () => {
    if (!detail || !notifTitle.trim()) return;
    setSendingNotif(true);
    try {
      await notificationsApi.createNotification({
        title: notifTitle.trim(),
        message: notifMsg.trim(),
        type: notifType,
        targetAudience: 'specific',
        targetUsers: [detail._id],
        priority: 'normal',
      });
      toast.success('Notification sent');
      setNotifModal(false);
      setNotifTitle(''); setNotifMsg(''); setNotifType('info');
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSendingNotif(false);
    }
  };

  const t = detail || teacher;
  if (!t) return null;

  const vStatus = t.teacherVerification?.status;
  const skills: string[] = (t.skillsToTeach || []).map(
    (s: any) => s?.name || s?.skill?.name || 'Unknown',
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-[420px] max-w-full bg-panel border-l border-edge z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-edge flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-ok-bg flex items-center justify-center text-ok text-[14px] font-bold shrink-0">
              {t.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-fg-1 truncate">{t.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={statusVariant(vStatus)}>{statusLabel(vStatus)}</Badge>
                {(t as any).isBanned && <Badge variant="error">Banned</Badge>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-fg-3 hover:text-fg-1 hover:bg-canvas rounded-lg transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loadingDetail && (
            <div className="flex items-center gap-2 text-[12px] text-fg-3">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Loading details…
            </div>
          )}

          {/* Contact info */}
          <div className={sectionCls}>
            <p className="text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-2">Contact</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-[13px] text-fg-2">
                <Mail className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                <span className="truncate">{t.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-fg-2">
                <Calendar className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                <span>Joined {t.createdAt ? format(new Date(t.createdAt), 'MMM d, yyyy') : '—'}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={sectionCls}>
            <p className="text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-2">Stats</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Star, label: 'Rating', value: t.averageRating ? `${t.averageRating.toFixed(1)} (${t.totalRatings || 0})` : '—' },
                { icon: BookOpen, label: 'Sessions', value: (t.totalSessionsTaught ?? 0).toLocaleString() },
                { icon: TrendingUp, label: 'Earned', value: `+${(t.tokensEarned ?? 0).toLocaleString()} tkn` },
                { icon: Award, label: 'Skills', value: skills.length.toString() },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-canvas rounded-lg p-3 flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-fg-3">{label}</p>
                    <p className="text-[13px] font-semibold text-fg-1 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {(t.averageRating ?? 0) > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Stars rating={t.averageRating!} />
                <span className="text-[12px] text-fg-3">{t.averageRating?.toFixed(2)} avg</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className={sectionCls}>
              <p className="text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-2">Skills offered</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-canvas border border-edge rounded-full text-[11px] text-fg-2">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Verification info */}
          <div className={sectionCls}>
            <p className="text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-2">Verification</p>
            <div className="bg-canvas rounded-lg p-3 space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-fg-3">Status</span>
                <Badge variant={statusVariant(vStatus)}>{statusLabel(vStatus)}</Badge>
              </div>
              {t.teacherVerification?.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-fg-3">Submitted</span>
                  <span className="text-fg-2">{format(new Date(t.teacherVerification.submittedAt), 'MMM d, yyyy')}</span>
                </div>
              )}
              {t.teacherVerification?.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-fg-3">Reviewed</span>
                  <span className="text-fg-2">{format(new Date(t.teacherVerification.reviewedAt), 'MMM d, yyyy')}</span>
                </div>
              )}
              {t.teacherVerification?.rejectionReason && (
                <div className="pt-2 border-t border-edge">
                  <p className="text-fg-3 mb-1">Rejection reason</p>
                  <p className="text-fg-2 leading-relaxed">{t.teacherVerification.rejectionReason}</p>
                </div>
              )}
              {t.teacherVerification?.bio && (
                <div className="pt-2 border-t border-edge">
                  <p className="text-fg-3 mb-1">Bio / Application</p>
                  <p className="text-fg-2 leading-relaxed line-clamp-4">{t.teacherVerification.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 border-t border-edge space-y-2">
          {/* Verify / Reject — only when not yet approved */}
          {vStatus !== 'approved' && (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="success"
                icon={CheckCircle}
                onClick={() => { onVerify(t); onClose(); }}
              >
                Verify
              </Button>
              <Button
                className="flex-1"
                variant="danger"
                icon={XCircle}
                onClick={() => { onReject(t); }}
              >
                Reject
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setNotifModal(true)}
              className="flex-1 h-8 flex items-center justify-center gap-1.5 text-[12px] font-medium text-fg-2 hover:text-fg-1 bg-canvas border border-edge hover:border-edge-2 rounded-lg transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Notify
            </button>
            <button
              onClick={() => onViewProfile(t._id)}
              className="flex-1 h-8 flex items-center justify-center gap-1.5 text-[12px] font-medium text-fg-2 hover:text-fg-1 bg-canvas border border-edge hover:border-edge-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Full profile
            </button>
          </div>
        </div>
      </aside>

      {/* Notify modal */}
      {notifModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNotifModal(false)} />
          <div className="relative bg-panel border border-edge rounded-xl w-full max-w-sm p-5 space-y-4 z-10">
            <p className="text-[14px] font-semibold text-fg-1">Send notification to {t.name}</p>
            <div>
              <label className={labelCls}>Type</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['info', 'success', 'warning', 'error'] as const).map(tp => (
                  <button
                    key={tp}
                    onClick={() => setNotifType(tp)}
                    className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition-colors ${
                      notifType === tp
                        ? tp === 'info' ? 'border-accent bg-accent/10 text-accent'
                          : tp === 'success' ? 'border-ok bg-ok-bg text-ok'
                          : tp === 'warning' ? 'border-warn bg-warn-bg text-warn'
                          : 'border-err bg-err-bg text-err'
                        : 'border-edge text-fg-3 hover:text-fg-1'
                    }`}
                  >{tp}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title" />
            </div>
            <div>
              <label className={labelCls}>Message</label>
              <textarea className={textareaCls} rows={3} value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Message…" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setNotifModal(false)}>Cancel</Button>
              <Button onClick={handleSendNotif} disabled={!notifTitle.trim() || sendingNotif}>
                {sendingNotif ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Pending card (expanded view for pending queue) ────────────────────────────

interface PendingCardProps {
  teacher: TeacherFull;
  onVerify: (t: TeacherFull) => void;
  onReject: (t: TeacherFull) => void;
  onOpen: (t: TeacherFull) => void;
}

const PendingCard: React.FC<PendingCardProps> = ({ teacher, onVerify, onReject, onOpen }) => {
  const skills: string[] = (teacher.skillsToTeach || []).map(
    (s: any) => s?.name || s?.skill?.name || 'Unknown',
  );
  const submittedAt = teacher.teacherVerification?.submittedAt;

  return (
    <div
      className="p-4 hover:bg-canvas transition-colors cursor-pointer"
      onClick={() => onOpen(teacher)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-warn-bg flex items-center justify-center text-warn text-[14px] font-bold shrink-0">
            {teacher.name?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-fg-1">{teacher.name}</p>
              <ChevronRight className="w-3.5 h-3.5 text-fg-3" />
            </div>
            <p className="text-[11px] text-fg-3 truncate">{teacher.email}</p>
            {submittedAt && (
              <p className="text-[10px] text-fg-3 mt-0.5">
                Applied {format(new Date(submittedAt), 'MMM d, yyyy')}
              </p>
            )}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.slice(0, 4).map((s, i) => (
                  <span key={i} className="px-1.5 py-px bg-canvas border border-edge rounded text-[10px] text-fg-2">{s}</span>
                ))}
                {skills.length > 4 && (
                  <span className="px-1.5 py-px text-[10px] text-fg-3">+{skills.length - 4} more</span>
                )}
              </div>
            )}
            {teacher.teacherVerification?.bio && (
              <p className="text-[11px] text-fg-3 mt-2 line-clamp-2 leading-relaxed">
                {teacher.teacherVerification.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          <Button variant="success" size="sm" icon={CheckCircle} onClick={() => onVerify(teacher)}>Verify</Button>
          <Button variant="danger" size="sm" icon={XCircle} onClick={() => onReject(teacher)}>Reject</Button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const Teachers: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherFull[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<TeacherFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerifStatus>('');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherFull | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TeacherFull | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes] = await Promise.allSettled([teachersApi.getStats()]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);

      if (activeTab === 'pending') {
        const r = await teachersApi.getPendingVerifications();
        setPendingTeachers(r.data.data || []);
      } else {
        const params: any = { page: pagination.page, limit: pagination.limit };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        const r = await teachersApi.getTeachers(params);
        setTeachers(r.data.data || []);
        setPagination(r.data.pagination);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── actions ──────────────────────────────────────────────────────────────

  const handleVerify = async (teacher: TeacherFull) => {
    try {
      await teachersApi.verifyTeacher(teacher._id);
      toast.success(`${teacher.name} verified`);
      // Optimistic update
      const patch = (t: TeacherFull) =>
        t._id === teacher._id
          ? { ...t, teacherVerification: { ...t.teacherVerification, status: 'approved', reviewedAt: new Date().toISOString() } }
          : t;
      setTeachers(prev => prev.map(patch));
      setPendingTeachers(prev => prev.filter(t => t._id !== teacher._id));
      if (selectedTeacher?._id === teacher._id) setSelectedTeacher(prev => prev ? patch(prev) : null);
      if (stats) setStats((s: any) => ({
        ...s,
        verifiedTeachers: (s.verifiedTeachers || 0) + 1,
        pendingVerifications: Math.max(0, (s.pendingVerifications || 0) - 1),
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await teachersApi.rejectVerification(rejectTarget._id, rejectReason);
      toast.success(`${rejectTarget.name} rejected`);
      const patch = (t: TeacherFull) =>
        t._id === rejectTarget._id
          ? { ...t, teacherVerification: { ...t.teacherVerification, status: 'rejected', rejectionReason: rejectReason } }
          : t;
      setTeachers(prev => prev.map(patch));
      setPendingTeachers(prev => prev.filter(t => t._id !== rejectTarget._id));
      if (selectedTeacher?._id === rejectTarget._id) setSelectedTeacher(prev => prev ? patch(prev) : null);
      if (stats) setStats((s: any) => ({
        ...s,
        pendingVerifications: Math.max(0, (s.pendingVerifications || 0) - 1),
      }));
      setRejectTarget(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setRejecting(false);
    }
  };

  // ── columns ───────────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'name',
      header: 'Teacher',
      className: 'w-[30%]',
      render: (t: TeacherFull) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ok-bg flex items-center justify-center text-ok text-[12px] font-bold shrink-0">
            {t.name?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-fg-1 truncate">{t.name}</p>
            <p className="text-[11px] text-fg-3 truncate">{t.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[12%]',
      render: (t: TeacherFull) => (
        <Badge variant={statusVariant(t.teacherVerification?.status)}>
          {statusLabel(t.teacherVerification?.status)}
        </Badge>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      className: 'w-[15%]',
      render: (t: TeacherFull) => (
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-warn fill-warn" />
          <span className="text-[13px] text-fg-1">{t.averageRating?.toFixed(1) || '0.0'}</span>
          <span className="text-[11px] text-fg-3">({t.totalRatings || 0})</span>
        </div>
      ),
    },
    {
      key: 'sessions',
      header: 'Sessions',
      className: 'w-[11%]',
      render: (t: TeacherFull) => (
        <span className="text-[13px] text-fg-2">{(t.totalSessionsTaught || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'tokens',
      header: 'Earned',
      className: 'w-[12%]',
      render: (t: TeacherFull) => (
        <span className="text-[13px] font-medium text-ok">+{(t.tokensEarned || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      className: 'w-[13%]',
      render: (t: TeacherFull) => (
        <span className="text-[12px] text-fg-3">
          {t.createdAt ? format(new Date(t.createdAt), 'MMM d, yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'arrow',
      header: '',
      className: 'w-[7%]',
      render: () => <ChevronRight className="w-4 h-4 text-fg-3" />,
    },
  ];

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon={GraduationCap} title="Total Teachers" value={stats?.totalTeachers || 0} color="green" />
        <StatsCard icon={ShieldCheck} title="Verified" value={stats?.verifiedTeachers || 0} color="blue" />
        <StatsCard icon={Clock} title="Pending" value={stats?.pendingVerifications || 0} color="yellow" />
        <StatsCard icon={Star} title="Avg Rating" value={stats?.averageRating?.toFixed(1) || '0.0'} color="purple" />
      </div>

      {/* Main panel */}
      <div className="bg-panel border border-edge rounded-xl overflow-hidden">
        {/* Tabs + filter */}
        <div className="border-b border-edge flex items-center justify-between">
          <div className="flex">
            <button onClick={() => { setActiveTab('all'); setPagination(p => ({ ...p, page: 1 })); }} className={tabCls(activeTab === 'all')}>
              All Teachers
            </button>
            <button onClick={() => setActiveTab('pending')} className={`${tabCls(activeTab === 'pending')} flex items-center gap-2`}>
              Pending
              {(stats?.pendingVerifications > 0) && (
                <span className="px-1.5 py-px bg-warn-bg text-warn rounded-full text-[10px] font-bold">
                  {stats.pendingVerifications}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-edge flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search teachers…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className={`${inputCls} pl-9`}
            />
          </div>

          {activeTab === 'all' && (
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as VerifStatus); setPagination(p => ({ ...p, page: 1 })); }}
              className="h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 focus:outline-none focus:border-edge-2 transition-colors"
            >
              <option value="">All statuses</option>
              <option value="approved">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>

        {/* Pending queue — card layout */}
        {activeTab === 'pending' && (
          <>
            {loading ? (
              <div className="py-12 text-center text-[13px] text-fg-3">Loading…</div>
            ) : pendingTeachers.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-ok mx-auto" />
                <p className="text-[13px] text-fg-3">No pending verifications</p>
              </div>
            ) : (
              <div className="divide-y divide-edge">
                {pendingTeachers.map(t => (
                  <PendingCard
                    key={t._id}
                    teacher={t}
                    onVerify={handleVerify}
                    onReject={setRejectTarget}
                    onOpen={setSelectedTeacher}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* All teachers — table */}
        {activeTab === 'all' && (
          <DataTable
            columns={columns}
            data={teachers}
            loading={loading}
            onRowClick={t => setSelectedTeacher(t)}
            pagination={{
              ...pagination,
              onPageChange: page => setPagination(prev => ({ ...prev, page })),
            }}
          />
        )}
      </div>

      {/* Teacher detail drawer */}
      {selectedTeacher && (
        <TeacherDrawer
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onVerify={handleVerify}
          onReject={t => { setRejectTarget(t); }}
          onViewProfile={id => { navigate(`/users/${id}`); setSelectedTeacher(null); }}
        />
      )}

      {/* Reject modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectReason(''); }}
        title={`Reject: ${rejectTarget?.name}`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-3 bg-err-bg border border-err/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-err shrink-0 mt-0.5" />
            <p className="text-[12px] text-err leading-relaxed">
              This will set the teacher's verification status to <strong>Rejected</strong>. They can reapply.
            </p>
          </div>
          <div>
            <label className={labelCls}>Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className={textareaCls}
              placeholder="Explain why the application was rejected…"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setRejectTarget(null); setRejectReason(''); }}>Cancel</Button>
            <Button variant="danger" icon={XCircle} onClick={handleReject} disabled={rejecting}>
              {rejecting ? 'Rejecting…' : 'Reject Verification'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Teachers;
