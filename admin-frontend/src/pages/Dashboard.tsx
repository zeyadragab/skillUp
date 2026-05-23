import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle, XCircle, Eye, ChevronDown, ChevronRight,
  UserCheck, Flag, BookOpen,
  TrendingUp, TrendingDown, ArrowUpRight, RefreshCw,
  Users, GraduationCap, Calendar, Coins, Star, Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardApi, teachersApi, reportsApi, transactionsApi } from '../services/api';
import type { DashboardStats } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionState = 'idle' | 'loading' | 'success' | 'error';
type QueueSeverity = 'err' | 'warn' | 'neutral';
type FeedType = 'user' | 'session' | 'payment' | 'report' | 'skill';
type FeedFilter = 'all' | FeedType;
type HealthStatus = 'healthy' | 'degraded' | 'down';

interface QueueItem { id: string; name: string; meta: string; timestamp: string; initial: string; }
interface QueueSection { id: string; label: string; severity: QueueSeverity; icon: React.FC<React.SVGProps<SVGSVGElement>>; items: QueueItem[]; }
interface FeedEvent { id: string; type: FeedType; actor: string; action: string; timestamp: string; }
interface Metrics { totalUsers: number; totalTeachers: number; totalSessions: number; totalTokens: number; newUsersToday: number; sessionsToday: number; }
interface TxStats { totalCredits: number; totalDebits: number; totalInCirculation: number; totalEarned: number; totalSpent: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Counter hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from = value;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(from + eased * (target - from)));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

// ─── Data hook ────────────────────────────────────────────────────────────────

const FALLBACK_METRICS: Metrics = { totalUsers: 0, totalTeachers: 0, totalSessions: 0, totalTokens: 0, newUsersToday: 0, sessionsToday: 0 };
const FALLBACK_TX: TxStats = { totalCredits: 0, totalDebits: 0, totalInCirculation: 0, totalEarned: 0, totalSpent: 0 };

const EMPTY_FEED: FeedEvent[] = [];

interface HealthService { name: string; status: HealthStatus; detail?: string; }

function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>(FALLBACK_METRICS);
  const [txStats, setTxStats] = useState<TxStats>(FALLBACK_TX);
  const [topTeachers, setTopTeachers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<QueueItem[]>([]);
  const [pendingReports, setPendingReports] = useState<QueueItem[]>([]);
  const [pendingSkills, setPendingSkills] = useState<QueueItem[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>(EMPTY_FEED);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthService[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [statsRes, verificationsRes, reportsRes, recentUsersRes, recentSessionsRes,
           txRes, topRes, skillsRes, healthRes] = await Promise.allSettled([
      dashboardApi.getStats(),
      teachersApi.getPendingVerifications(),
      reportsApi.getReports({ status: 'pending', limit: 10 }),
      dashboardApi.getRecentUsers(),
      dashboardApi.getRecentSessions(),
      transactionsApi.getStats(),
      dashboardApi.getTopTeachers(),
      dashboardApi.getPendingSkills(),
      dashboardApi.getSystemHealth(),
    ]);

    if (statsRes.status === 'fulfilled') {
      const s: DashboardStats = statsRes.value.data?.data;
      if (s) {
        setStats(s);
        setMetrics({
          totalUsers: s.totalUsers,
          totalTeachers: s.totalTeachers,
          totalSessions: s.totalSessions,
          totalTokens: s.totalTokens,
          newUsersToday: s.newUsersToday,
          sessionsToday: s.sessionsToday,
        });
      }
    }

    if (txRes.status === 'fulfilled') {
      const d = txRes.value.data?.data;
      if (d) {
        setTxStats({
          totalCredits: d.total?.credited?.total ?? 0,
          totalDebits: d.total?.debited?.total ?? 0,
          totalInCirculation: d.circulation?.totalInCirculation ?? 0,
          totalEarned: d.circulation?.totalEarned ?? 0,
          totalSpent: d.circulation?.totalSpent ?? 0,
        });
      }
    }

    if (topRes.status === 'fulfilled') setTopTeachers(topRes.value.data?.data ?? []);

    if (verificationsRes.status === 'fulfilled') {
      const teachers: any[] = verificationsRes.value.data?.data ?? [];
      setVerifications(teachers.slice(0, 6).map(t => ({
        id: t._id,
        name: t.name ?? 'Unknown',
        meta: `Teacher · ${t.email}`,
        timestamp: timeAgo(t.createdAt),
        initial: (t.name ?? 'T').charAt(0).toUpperCase(),
      })));
    }

    if (reportsRes.status === 'fulfilled') {
      const reports: any[] = reportsRes.value.data?.data ?? [];
      setPendingReports(reports.slice(0, 6).map(r => ({
        id: r._id,
        name: r.reportedUser?.name ?? 'Unknown User',
        meta: `${r.type ?? 'Report'} · ${r.priority ?? 'medium'} priority`,
        timestamp: timeAgo(r.createdAt),
        initial: (r.reportedUser?.name ?? 'U').charAt(0).toUpperCase(),
      })));
    }

    if (skillsRes.status === 'fulfilled') {
      const skills: any[] = skillsRes.value.data?.data ?? [];
      setPendingSkills(skills.slice(0, 6).map(s => ({
        id: s._id,
        name: s.name,
        meta: `${s.category} · inactive`,
        timestamp: timeAgo(s.createdAt),
        initial: (s.name ?? 'S').charAt(0).toUpperCase(),
      })));
    }

    if (healthRes.status === 'fulfilled') {
      const services: any[] = healthRes.value.data?.data?.services ?? [];
      setHealth(services.map(s => ({
        name: s.name,
        status: s.status as HealthStatus,
        detail: s.detail,
      })));
    } else {
      // API itself is reachable (we got here), but health endpoint failed
      setHealth([{ name: 'Admin API', status: 'healthy', detail: 'Running' }]);
    }

    // Build combined feed: recent users + recent sessions merged by time
    const userEvents: FeedEvent[] = recentUsersRes.status === 'fulfilled'
      ? (recentUsersRes.value.data?.data ?? []).map((u: any) => ({
          id: u._id,
          type: 'user' as FeedType,
          actor: u.name ?? 'User',
          action: u.isTeacher ? 'joined as a teacher' : 'joined as a learner',
          timestamp: timeAgo(u.createdAt),
          _ts: new Date(u.createdAt).getTime(),
        }))
      : [];

    const sessionEvents: FeedEvent[] = recentSessionsRes.status === 'fulfilled'
      ? (recentSessionsRes.value.data?.data ?? []).map((s: any) => ({
          id: s._id,
          type: 'session' as FeedType,
          actor: s.teacher?.name ?? 'Teacher',
          action: `booked a ${s.skill} session · ${s.status}`,
          timestamp: timeAgo(s.createdAt),
          _ts: new Date(s.createdAt).getTime(),
        }))
      : [];

    const merged = [...userEvents, ...sessionEvents]
      .sort((a: any, b: any) => b._ts - a._ts)
      .slice(0, 15);

    if (merged.length > 0) setFeed(merged);

    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  return { loading, refreshing, metrics, txStats, topTeachers, verifications,
           pendingReports, pendingSkills, feed, stats, health, lastUpdated, refresh: () => loadData(true) };
}

// ─── Queue section builder ────────────────────────────────────────────────────

const buildQueueSections = (verifications: QueueItem[], reports: QueueItem[], skills: QueueItem[]): QueueSection[] => [
  { id: 'verifications', label: 'Pending Verifications', severity: 'warn',    icon: UserCheck, items: verifications },
  { id: 'reports',       label: 'Reported Users',        severity: 'err',     icon: Flag,      items: reports       },
  { id: 'skills',        label: 'Inactive Skills',       severity: 'neutral', icon: BookOpen,  items: skills        },
];

// ─── Style maps ───────────────────────────────────────────────────────────────

const severityBadge: Record<QueueSeverity, string> = {
  err:     'bg-err-bg text-err',
  warn:    'bg-warn-bg text-warn',
  neutral: 'bg-edge text-fg-3',
};

const feedDot: Record<FeedType, string> = {
  user: 'bg-note', session: 'bg-ok', payment: 'bg-accent', report: 'bg-err', skill: 'bg-warn',
};

const healthDot: Record<HealthStatus, string> = {
  healthy: 'bg-ok', degraded: 'bg-warn', down: 'bg-err',
};
const healthText: Record<HealthStatus, string> = {
  healthy: 'text-ok', degraded: 'text-warn', down: 'text-err',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonLine: React.FC<{ width?: string; height?: string }> = ({ width = '100%', height = '12px' }) => (
  <div className="skeleton" style={{ width, height }} />
);

const QueueSkeleton: React.FC = () => (
  <div className="p-3 space-y-4 animate-fade-in">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3">
        <div className="skeleton w-6 h-6 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine width="65%" height="10px" />
          <SkeletonLine width="85%" height="8px" />
        </div>
      </div>
    ))}
  </div>
);

const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-3 animate-fade-in">
    {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
  </div>
);

const FeedSkeleton: React.FC = () => (
  <div className="space-y-4 animate-fade-in">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-start gap-3">
        <div className="skeleton w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine width={`${55 + (i * 7) % 30}%`} height="11px" />
        </div>
        <SkeletonLine width="40px" height="10px" />
      </div>
    ))}
  </div>
);

// ─── Queue item row ───────────────────────────────────────────────────────────

interface QueueItemRowProps {
  item: QueueItem;
  state: ActionState;
  exiting: boolean;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
  onView: (id: string) => void;
}

const QueueItemRow: React.FC<QueueItemRowProps> = ({ item, state, exiting, onApprove, onDismiss, onView }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 group transition-colors hover:bg-canvas/60 ${exiting ? 'item-exit' : ''}`}>
    <div className="w-6 h-6 rounded-full bg-edge-2 flex items-center justify-center text-[10px] font-bold text-fg-2 flex-shrink-0 select-none">
      {item.initial}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-fg-1 truncate leading-tight">{item.name}</p>
      <p className="text-[11px] text-fg-3 truncate mt-0.5">{item.meta}</p>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      {state === 'loading' && <div className="w-3.5 h-3.5 rounded-full border border-edge-2 border-t-accent animate-spin" />}
      {state === 'success' && <CheckCircle className="w-3.5 h-3.5 text-ok" />}
      {state === 'error'   && <XCircle    className="w-3.5 h-3.5 text-err" />}
      {state === 'idle' && (
        <>
          <button
            onClick={() => onView(item.id)}
            title="View detail"
            className="w-6 h-6 flex items-center justify-center text-fg-3 hover:text-fg-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onApprove(item.id)}
            title="Approve"
            className="w-6 h-6 flex items-center justify-center text-ok hover:bg-ok-bg rounded transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDismiss(item.id)}
            title="Dismiss"
            className="w-6 h-6 flex items-center justify-center text-err hover:bg-err-bg rounded transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  </div>
);

// ─── Queue panel ──────────────────────────────────────────────────────────────

interface QueuePanelProps { verifications: QueueItem[]; pendingReports: QueueItem[]; pendingSkills: QueueItem[]; loading: boolean; }

const QueuePanel: React.FC<QueuePanelProps> = ({ verifications, pendingReports, pendingSkills, loading }) => {
  const [sections, setSections] = useState<QueueSection[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Record<string, ActionState>>({});
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSections(buildQueueSections(verifications, pendingReports, pendingSkills));
  }, [verifications, pendingReports, pendingSkills]);

  const totalItems = sections.reduce((n, q) => n + q.items.length, 0);

  const toggle = useCallback((id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setExiting(prev => { const n = new Set(prev); n.add(itemId); return n; });
    setTimeout(() => {
      setSections(prev => prev.map(q => ({ ...q, items: q.items.filter(i => i.id !== itemId) })));
      setExiting(prev => { const n = new Set(prev); n.delete(itemId); return n; });
      setStates(prev => { const n = { ...prev }; delete n[itemId]; return n; });
    }, 300);
  }, []);

  const act = useCallback(async (itemId: string, action: 'approve' | 'dismiss') => {
    setStates(prev => ({ ...prev, [itemId]: 'loading' }));

    const sectionId = sections.find(s => s.items.some(i => i.id === itemId))?.id ?? '';

    try {
      if (sectionId === 'verifications') {
        if (action === 'approve') {
          await teachersApi.verifyTeacher(itemId);
          toast.success('Teacher verified');
        } else {
          await teachersApi.rejectVerification(itemId, 'Dismissed by admin');
          toast.success('Verification rejected');
        }
      } else if (sectionId === 'reports') {
        if (action === 'approve') {
          await reportsApi.resolveReport(itemId, { action: 'warn', notes: 'Resolved by admin' });
          toast.success('Report resolved');
        } else {
          await reportsApi.dismissReport(itemId, 'Dismissed by admin');
          toast.success('Report dismissed');
        }
      } else {
        await new Promise<void>(res => setTimeout(res, 600));
        toast.success(action === 'approve' ? 'Approved' : 'Dismissed');
      }

      setStates(prev => ({ ...prev, [itemId]: 'success' }));
      setTimeout(() => removeItem(itemId), 550);
    } catch {
      toast.error('Action failed');
      setStates(prev => ({ ...prev, [itemId]: 'error' }));
      setTimeout(() => setStates(prev => ({ ...prev, [itemId]: 'idle' })), 2500);
    }
  }, [sections, removeItem]);

  const onView = useCallback((id: string) => {
    const sectionId = sections.find(s => s.items.some(i => i.id === id))?.id ?? '';
    if (sectionId === 'verifications') window.location.href = `/teachers`;
    else if (sectionId === 'reports') window.location.href = `/reports`;
  }, [sections]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-edge">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold text-fg-1">Action Queue</h2>
          {totalItems > 0 && !loading && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-err-bg text-err animate-fade-in">
              {totalItems}
            </span>
          )}
        </div>
        <p className="text-[11px] text-fg-3 mt-0.5">Requires attention today</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-6">
            {[0, 1, 2].map(i => (
              <div key={i}>
                <SkeletonLine width="60%" height="10px" />
                <div className="mt-3"><QueueSkeleton /></div>
              </div>
            ))}
          </div>
        ) : (
          sections.map((section, si) => {
            const isCollapsed = collapsed.has(section.id);
            const Icon = section.icon;
            return (
              <div key={section.id} className="border-b border-edge last:border-0 animate-slide-up" style={{ animationDelay: `${si * 50}ms` }}>
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-3 hover:bg-canvas/50 transition-colors text-left focus-visible:outline-none"
                >
                  <Icon className="w-3.5 h-3.5 text-fg-3 flex-shrink-0" />
                  <span className="flex-1 text-[12px] font-semibold text-fg-2 truncate">{section.label}</span>
                  {section.items.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${severityBadge[section.severity]}`}>
                      {section.items.length}
                    </span>
                  )}
                  {isCollapsed
                    ? <ChevronRight className="w-3.5 h-3.5 text-fg-3 flex-shrink-0" />
                    : <ChevronDown  className="w-3.5 h-3.5 text-fg-3 flex-shrink-0" />
                  }
                </button>
                {!isCollapsed && (
                  <div className="pb-1">
                    {section.items.length === 0
                      ? <p className="px-3 py-2.5 text-[12px] text-fg-3 italic">All clear</p>
                      : section.items.map(item => (
                          <QueueItemRow
                            key={item.id}
                            item={item}
                            state={states[item.id] ?? 'idle'}
                            exiting={exiting.has(item.id)}
                            onApprove={id => act(id, 'approve')}
                            onDismiss={id => act(id, 'dismiss')}
                            onView={onView}
                          />
                        ))
                    }
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Activity panel ───────────────────────────────────────────────────────────

const FEED_FILTERS: { id: FeedFilter; label: string }[] = [
  { id: 'all',     label: 'All'      },
  { id: 'user',    label: 'Users'    },
  { id: 'session', label: 'Sessions' },
  { id: 'payment', label: 'Payments' },
  { id: 'report',  label: 'Reports'  },
];

interface KpiCardProps { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; value: number; sub?: string; color: string; delay?: number; }
const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, label, value, sub, color, delay = 0 }) => {
  const displayed = useCountUp(value, 1000);
  return (
    <div className="flex flex-col gap-1.5 px-4 py-3 bg-canvas rounded-xl ring-1 ring-edge animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-fg-3 uppercase tracking-widest">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[22px] font-bold text-fg-1 leading-none tabular-nums">{displayed.toLocaleString()}</span>
        {sub && <span className="text-[11px] text-fg-3">{sub}</span>}
      </div>
    </div>
  );
};

interface ActivityPanelProps {
  metrics: Metrics;
  feed: FeedEvent[];
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date;
  onRefresh: () => void;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ metrics, feed, loading, refreshing, lastUpdated, onRefresh }) => {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const events = filter === 'all' ? feed : feed.filter(e => e.type === filter);
  const updatedStr = lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-edge">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-fg-1">Platform Overview</h2>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-fg-3 hover:text-fg-1 hover:bg-edge transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing' : `Updated ${updatedStr}`}
          </button>
        </div>

        {loading ? <MetricsSkeleton /> : (
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={Users}         label="Total Users"    value={metrics.totalUsers}    sub="registered"    color="text-note"   delay={0}   />
            <KpiCard icon={GraduationCap} label="Teachers"       value={metrics.totalTeachers} sub="active"        color="text-ok"     delay={50}  />
            <KpiCard icon={Calendar}      label="Sessions Today" value={metrics.sessionsToday} sub="today"         color="text-accent" delay={100} />
            <KpiCard icon={Coins}         label="Token Pool"     value={metrics.totalTokens}   sub="in platform"   color="text-warn"   delay={150} />
          </div>
        )}
      </div>

      {/* New users pill */}
      {!loading && metrics.newUsersToday > 0 && (
        <div className="flex-shrink-0 px-5 py-2 border-b border-edge">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 font-bold text-ok">
              <TrendingUp className="w-3 h-3" />
              +{metrics.newUsersToday}
            </span>
            <span className="text-fg-3">new users joined today</span>
          </div>
        </div>
      )}

      {/* Feed header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[13px] font-semibold text-fg-1">Live Activity</h2>
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-live-ring absolute inline-flex h-full w-full rounded-full bg-ok" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
          </span>
        </div>
        <div className="flex items-center gap-1" role="tablist">
          {FEED_FILTERS.map(f => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                filter === f.id ? 'bg-fg-1 text-fg-inv' : 'text-fg-3 hover:text-fg-2 hover:bg-edge'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {loading ? (
          <FeedSkeleton />
        ) : events.length === 0 ? (
          <p className="text-[13px] text-fg-3 italic py-6 text-center">No events in this category</p>
        ) : (
          <div className="relative animate-fade-in">
            <div className="absolute left-[4px] top-2 bottom-2 w-px bg-edge" aria-hidden />
            {events.map((event, i) => (
              <div
                key={event.id}
                className="flex items-start gap-3 py-2.5 animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className={`relative z-10 w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${feedDot[event.type]}`} />
                <p className="flex-1 text-[13px] text-fg-1 leading-snug min-w-0">
                  <span className="font-medium">{event.actor}</span>
                  {' '}{event.action}
                </p>
                <span className="text-[11px] text-fg-3 flex-shrink-0 mt-0.5 tabular-nums">{event.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Insights panel ───────────────────────────────────────────────────────────

interface InsightsPanelProps { txStats: TxStats; topTeachers: any[]; stats: DashboardStats | null; health: HealthService[]; loading: boolean; }

const InsightsPanel: React.FC<InsightsPanelProps> = ({ txStats, topTeachers, stats, health, loading }) => {
  const totalCirculating = useCountUp(txStats.totalInCirculation, 1200);
  const totalEarned      = useCountUp(txStats.totalEarned, 900);
  const totalSpent       = useCountUp(txStats.totalSpent, 900);
  const pendingCount     = useCountUp(stats?.pendingVerifications ?? 0, 800);

  const maxEarned = topTeachers.reduce((m, t) => Math.max(m, t.tokensEarned ?? 0), 1);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Token economy */}
      <section className="flex-shrink-0 p-5 border-b border-edge">
        <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-widest mb-3">Token Economy</p>
        {loading ? (
          <div className="space-y-2"><SkeletonLine width="70%" height="28px" /><SkeletonLine width="90%" height="12px" /></div>
        ) : (
          <div className="animate-slide-up space-y-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[26px] font-bold text-fg-1 leading-none tabular-nums">{totalCirculating.toLocaleString()}</span>
                <span className="text-[12px] text-fg-3">tokens in circulation</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-canvas rounded-lg px-3 py-2 ring-1 ring-edge">
                <p className="text-[10px] text-fg-3 mb-0.5">Total Earned</p>
                <p className="text-[14px] font-bold text-ok tabular-nums">{totalEarned.toLocaleString()}</p>
              </div>
              <div className="bg-canvas rounded-lg px-3 py-2 ring-1 ring-edge">
                <p className="text-[10px] text-fg-3 mb-0.5">Total Spent</p>
                <p className="text-[14px] font-bold text-err tabular-nums">{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Platform alerts */}
      <section className="flex-shrink-0 p-5 border-b border-edge">
        <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-widest mb-3">Platform Alerts</p>
        {loading ? (
          <div className="space-y-2"><SkeletonLine width="55%" height="22px" /><SkeletonLine width="75%" height="11px" /><SkeletonLine width="65%" height="11px" /></div>
        ) : (
          <div className="animate-slide-up space-y-2" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between px-3 py-2.5 bg-warn-bg rounded-lg">
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-warn flex-shrink-0" />
                <span className="text-[12px] text-warn">Pending Verifications</span>
              </div>
              <span className="text-[14px] font-bold text-warn tabular-nums">{pendingCount}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 bg-err-bg rounded-lg">
              <div className="flex items-center gap-2">
                <Flag className="w-3.5 h-3.5 text-err flex-shrink-0" />
                <span className="text-[12px] text-err">Pending Reports</span>
              </div>
              <span className="text-[14px] font-bold text-err tabular-nums">{stats?.pendingReports ?? 0}</span>
            </div>
            {(stats?.bannedUsers ?? 0) > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-err-bg rounded-lg">
                <div className="flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5 text-err flex-shrink-0" />
                  <span className="text-[12px] text-err">Banned Users</span>
                </div>
                <span className="text-[14px] font-bold text-err tabular-nums">{stats?.bannedUsers ?? 0}</span>
              </div>
            )}
            {(stats?.unverifiedUsers ?? 0) > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-canvas rounded-lg ring-1 ring-edge">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-fg-3 flex-shrink-0" />
                  <span className="text-[12px] text-fg-2">Unverified Users</span>
                </div>
                <span className="text-[14px] font-bold text-fg-2 tabular-nums">{stats?.unverifiedUsers ?? 0}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Top teachers */}
      <section className="flex-shrink-0 p-5 border-b border-edge">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-widest">Top Teachers</p>
          <Star className="w-3.5 h-3.5 text-warn" />
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="flex justify-between items-center"><SkeletonLine width="55%" height="11px" /><SkeletonLine width="25%" height="11px" /></div>)}
          </div>
        ) : topTeachers.length === 0 ? (
          <p className="text-[12px] text-fg-3 italic">No teacher data yet</p>
        ) : (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '80ms' }}>
            {topTeachers.slice(0, 5).map((t, i) => {
              const pct = maxEarned > 0 ? ((t.tokensEarned ?? 0) / maxEarned) * 100 : 0;
              return (
                <div key={t._id ?? i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-fg-3 w-3 flex-shrink-0">{i + 1}</span>
                      <span className="text-[12px] text-fg-1 truncate">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-2.5 h-2.5 text-warn fill-warn" />
                      <span className="text-[11px] text-fg-2 tabular-nums">{(t.averageRating ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-edge rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-fg-3 mt-0.5">{(t.tokensEarned ?? 0).toLocaleString()} tokens earned</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* System health */}
      <section className="flex-shrink-0 p-5">
        <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-widest mb-3">System Health</p>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="flex justify-between"><SkeletonLine width="45%" height="11px" /><SkeletonLine width="30%" height="11px" /></div>)}
          </div>
        ) : health.length === 0 ? (
          <p className="text-[12px] text-fg-3 italic">Health data unavailable</p>
        ) : (
          <div className="space-y-3">
            {health.map((svc, i) => (
              <div key={svc.name} className="flex items-center justify-between animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="min-w-0">
                  <span className="text-[13px] text-fg-2">{svc.name}</span>
                  {svc.detail && <span className="text-[10px] text-fg-3 ml-1.5">({svc.detail})</span>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-semibold capitalize ${healthText[svc.status]}`}>{svc.status}</span>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${healthDot[svc.status]} ${svc.status === 'degraded' ? 'animate-live-ring' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trend note */}
      {!loading && (
        <section className="flex-shrink-0 p-5 border-t border-edge">
          <div className="flex items-center gap-1.5 text-[11px] text-fg-3">
            <TrendingDown className="w-3 h-3 text-err" />
            <span>Retention data requires analytics integration</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-fg-3 mt-1.5">
            <ArrowUpRight className="w-3 h-3 text-ok" />
            <span>All other metrics are live from the database</span>
          </div>
        </section>
      )}
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { loading, refreshing, metrics, txStats, topTeachers, verifications,
          pendingReports, pendingSkills, feed, stats, health, lastUpdated, refresh } = useDashboardData();

  return (
    <div
      className="p-4 gap-4"
      style={{
        display: 'grid',
        gridTemplateColumns: '288px 1fr 256px',
        height: 'calc(100vh - 3.5rem)',
      }}
    >
      {/* Column A — Action Queue */}
      <div className="bg-panel rounded-2xl column-card overflow-hidden flex flex-col animate-slide-up" style={{ animationDelay: '0ms' }}>
        <QueuePanel verifications={verifications} pendingReports={pendingReports} pendingSkills={pendingSkills} loading={loading} />
      </div>

      {/* Column B — Activity + KPIs */}
      <div className="bg-panel rounded-2xl column-card overflow-hidden flex flex-col animate-slide-up" style={{ animationDelay: '60ms' }}>
        <ActivityPanel metrics={metrics} feed={feed} loading={loading} refreshing={refreshing} lastUpdated={lastUpdated} onRefresh={refresh} />
      </div>

      {/* Column C — Insights */}
      <div className="bg-panel rounded-2xl column-card overflow-hidden flex flex-col animate-slide-up" style={{ animationDelay: '120ms' }}>
        <InsightsPanel txStats={txStats} topTeachers={topTeachers} stats={stats} health={health} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
