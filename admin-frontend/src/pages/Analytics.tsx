import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, GraduationCap, CalendarDays, Coins,
  TrendingUp, TrendingDown, CheckCircle2, XCircle,
  BarChart2, RefreshCw, AlertCircle, Download, Star, Minus,
} from 'lucide-react';
import { analyticsApi } from '../services/api';
import type { AnalyticsData } from '../types';

type Period = '7' | '30' | '90';

const PERIODS: { label: string; value: Period }[] = [
  { label: '7 days',  value: '7'  },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
];

// ── Tooltip theme ────────────────────────────────────────────────────────────
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

const PIE_COLORS = [
  'oklch(60% 0.18 145)',
  'oklch(63% 0.20 25)',
  'oklch(65% 0.15 230)',
  'oklch(65% 0.16 290)',
  'oklch(70% 0.17 60)',
];

// ── Delta badge ───────────────────────────────────────────────────────────────
const Delta: React.FC<{ current: number; previous: number; invert?: boolean }> = ({ current, previous, invert = false }) => {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return <span className="flex items-center gap-0.5 text-[11px] font-semibold text-fg-rail"><Minus className="w-3 h-3" /> 0%</span>;
  const up = pct > 0;
  const good = invert ? !up : up;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${good ? 'text-ok' : 'text-err'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct}%
    </span>
  );
};

// ── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  delta?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, accent = 'bg-accent/10', delta }) => (
  <div className="rounded-xl border border-white/5 bg-rail p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <p className="text-[12px] font-semibold text-fg-rail uppercase tracking-wider">{label}</p>
      <div className={`w-8 h-8 rounded-lg ${accent} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-[28px] font-bold text-fg-inv leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-[12px] text-fg-rail mt-1">{sub}</p>}
    </div>
    {delta && <div>{delta}</div>}
  </div>
);

// ── Chart card ───────────────────────────────────────────────────────────────
const ChartCard: React.FC<{ title: string; sub?: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, sub, children, action }) => (
  <div className="rounded-xl border border-white/5 bg-rail p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-[14px] font-semibold text-fg-inv">{title}</p>
        {sub && <p className="text-[12px] text-fg-rail mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ── CSV export helper ─────────────────────────────────────────────────────────
function exportCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Types for breakdown ───────────────────────────────────────────────────────
interface SkillRow { name: string; sessions: number; tokens: number; }
interface TeacherRow { _id: string; name: string; email: string; avatar?: string; tokensEarned: number; totalSessionsTaught: number; averageRating: number; isVerified: boolean; }
interface Breakdown { topSkills: SkillRow[]; topTeachers: TeacherRow[]; sessionStatusBreakdown: Record<string, number>; }

// ── Main page ────────────────────────────────────────────────────────────────
const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>('30');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [prevData, setPrevData] = useState<AnalyticsData | null>(null);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Period) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch current period, previous period (for deltas), and breakdown in parallel
      const prevDays = String(parseInt(p) * 2);
      const [curRes, prevRes, bdRes] = await Promise.allSettled([
        analyticsApi.getAnalytics(p),
        analyticsApi.getAnalytics(prevDays),
        analyticsApi.getBreakdown(p),
      ]);
      if (curRes.status === 'fulfilled') setData(curRes.value.data.data);
      else throw new Error('Failed to load analytics');
      if (prevRes.status === 'fulfilled') setPrevData(prevRes.value.data.data);
      if (bdRes.status === 'fulfilled') setBreakdown(bdRes.value.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-lg bg-rail animate-pulse" />
            <div className="h-4 w-64 rounded-lg bg-rail animate-pulse" />
          </div>
          <div className="h-9 w-56 rounded-lg bg-rail animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-rail border border-white/5 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-rail border border-white/5 animate-pulse" />)}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-fg-rail">
        <AlertCircle className="w-10 h-10 text-err" />
        <p className="text-[14px]">{error}</p>
        <button
          onClick={() => load(period)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-[oklch(15%_0.008_55)] text-[13px] font-semibold hover:bg-accent/90 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const completionRateColor = data.sessions.completionRate >= 70 ? 'text-ok' : data.sessions.completionRate >= 40 ? 'text-warn' : 'text-err';

  // ── CSV export handlers ───────────────────────────────────────────────────
  const exportUserGrowth = () => {
    exportCSV(`user-growth-${period}d.csv`,
      data.trends.userGrowth.map(r => [r.date, String(r.count)]),
      ['Date', 'New Users']
    );
  };
  const exportSessions = () => {
    exportCSV(`sessions-${period}d.csv`,
      data.trends.sessions.map(r => [r.date, String(r.completed), String(r.cancelled), String(r.scheduled)]),
      ['Date', 'Completed', 'Cancelled', 'Scheduled']
    );
  };
  const exportTokenFlow = () => {
    exportCSV(`token-flow-${period}d.csv`,
      data.trends.tokenFlow.map(r => [r.date, String(r.credits), String(r.debits)]),
      ['Date', 'Credits', 'Debits']
    );
  };
  const exportTopSkills = () => {
    if (!breakdown) return;
    exportCSV(`top-skills-${period}d.csv`,
      breakdown.topSkills.map(r => [r.name, String(r.sessions), String(r.tokens)]),
      ['Skill', 'Sessions', 'Tokens']
    );
  };

  // Pie data for session status breakdown
  const pieData = breakdown
    ? Object.entries(breakdown.sessionStatusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="p-5 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-fg-inv flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-accent" />
            Analytics
          </h1>
          <p className="text-[13px] text-fg-rail mt-0.5">Platform metrics and trends · vs previous period</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export all button */}
          <button
            onClick={() => {
              exportUserGrowth();
              exportSessions();
              exportTokenFlow();
            }}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-white/10 bg-white/5 text-[12px] font-medium text-fg-rail hover:text-fg-inv hover:bg-white/8 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-rail border border-white/5">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                  period === p.value
                    ? 'bg-accent text-[oklch(15%_0.008_55)]'
                    : 'text-fg-rail hover:text-fg-inv'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => load(period)}
              className="ml-1 p-1.5 rounded-md text-fg-rail hover:text-fg-inv transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Primary stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={data.users.total}
          sub={`+${data.users.new} in period`}
          icon={<Users className="w-4 h-4 text-accent" />}
          delta={prevData && <Delta current={data.users.new} previous={Math.max(prevData.users.new - data.users.new, 0)} />}
        />
        <StatCard
          label="Teachers"
          value={data.users.teachers}
          sub={`${Math.round((data.users.teachers / Math.max(data.users.total, 1)) * 100)}% of users`}
          icon={<GraduationCap className="w-4 h-4 text-purple-400" />}
          accent="bg-purple-400/10"
          delta={prevData && <Delta current={data.users.teachers} previous={prevData.users.teachers} />}
        />
        <StatCard
          label="Total Sessions"
          value={data.sessions.total}
          sub={`${data.sessions.inPeriod} in period`}
          icon={<CalendarDays className="w-4 h-4 text-blue-400" />}
          accent="bg-blue-400/10"
          delta={prevData && <Delta current={data.sessions.inPeriod} previous={Math.max(prevData.sessions.inPeriod - data.sessions.inPeriod, 0)} />}
        />
        <StatCard
          label="Tokens in Circulation"
          value={data.tokens.inCirculation}
          sub={`${data.tokens.transactions} txns in period`}
          icon={<Coins className="w-4 h-4 text-yellow-400" />}
          accent="bg-yellow-400/10"
          delta={prevData && <Delta current={data.tokens.inCirculation} previous={prevData.tokens.inCirculation} />}
        />
      </div>

      {/* ── Secondary stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Completed Sessions"
          value={data.sessions.completed}
          sub={`${data.sessions.completionRate}% rate`}
          icon={<CheckCircle2 className="w-4 h-4 text-ok" />}
          accent="bg-ok/10"
          delta={prevData && <Delta current={data.sessions.completed} previous={prevData.sessions.completed} />}
        />
        <StatCard
          label="Cancelled Sessions"
          value={data.sessions.cancelled}
          sub={`${data.sessions.upcoming} upcoming`}
          icon={<XCircle className="w-4 h-4 text-err" />}
          accent="bg-err/10"
          delta={prevData && <Delta current={data.sessions.cancelled} previous={prevData.sessions.cancelled} invert />}
        />
        <StatCard
          label="Tokens Purchased"
          value={data.revenue.inPeriod}
          sub={`${data.revenue.total.toLocaleString()} all-time`}
          icon={<TrendingUp className="w-4 h-4 text-ok" />}
          accent="bg-ok/10"
          delta={prevData && <Delta current={data.revenue.inPeriod} previous={Math.max(prevData.revenue.inPeriod - data.revenue.inPeriod, 0)} />}
        />
        <StatCard
          label="Verified Users"
          value={data.users.verified}
          sub={`${data.users.banned} banned`}
          icon={<Users className="w-4 h-4 text-fg-rail" />}
          accent="bg-white/5"
          delta={prevData && <Delta current={data.users.verified} previous={prevData.users.verified} />}
        />
      </div>

      {/* ── Charts row 1 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* User growth */}
        <ChartCard
          title="User Growth"
          sub={`New registrations over last ${period} days`}
          action={
            <button onClick={exportUserGrowth} title="Export CSV" className="p-1.5 rounded-md text-fg-rail hover:text-fg-inv hover:bg-white/5 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          }
        >
          {data.trends.userGrowth.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-fg-rail text-[13px]">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.trends.userGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(70% 0.18 145)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(70% 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(28% 0.015 260)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} allowDecimals={false} />
                <Tooltip {...TT} formatter={(v: number) => [v, 'New Users']} labelFormatter={l => `Date: ${l}`} />
                <Area type="monotone" dataKey="count" stroke="oklch(70% 0.18 145)" strokeWidth={2} fill="url(#ugGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Session trends */}
        <ChartCard
          title="Session Activity"
          sub={`Status breakdown over last ${period} days`}
          action={
            <button onClick={exportSessions} title="Export CSV" className="p-1.5 rounded-md text-fg-rail hover:text-fg-inv hover:bg-white/5 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          }
        >
          {data.trends.sessions.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-fg-rail text-[13px]">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.trends.sessions} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(28% 0.015 260)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} allowDecimals={false} />
                <Tooltip {...TT} labelFormatter={l => `Date: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'oklch(55% 0.008 260)' }} />
                <Bar dataKey="completed" name="Completed" fill="oklch(60% 0.18 145)" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="cancelled" name="Cancelled" fill="oklch(63% 0.20 25)" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="scheduled" name="Scheduled" fill="oklch(65% 0.15 230)" radius={[2, 2, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Token flow */}
        <ChartCard
          title="Token Flow"
          sub={`Credits vs debits over last ${period} days`}
          action={
            <button onClick={exportTokenFlow} title="Export CSV" className="p-1.5 rounded-md text-fg-rail hover:text-fg-inv hover:bg-white/5 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          }
        >
          {data.trends.tokenFlow.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-fg-rail text-[13px]">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.trends.tokenFlow} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="credGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(60% 0.18 145)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(60% 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(63% 0.20 25)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(63% 0.20 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(28% 0.015 260)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'oklch(55% 0.008 260)' }} allowDecimals={false} />
                <Tooltip {...TT} labelFormatter={l => `Date: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'oklch(55% 0.008 260)' }} />
                <Area type="monotone" dataKey="credits" name="Credits" stroke="oklch(60% 0.18 145)" strokeWidth={2} fill="url(#credGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="debits" name="Debits" stroke="oklch(63% 0.20 25)" strokeWidth={2} fill="url(#debGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Platform health ratios */}
        <ChartCard title="Platform Health" sub="Key ratios at a glance">
          <div className="space-y-4 mt-2">
            {[
              { label: 'Session Completion Rate', value: data.sessions.completionRate, color: 'bg-ok', textColor: completionRateColor },
              { label: 'Teacher-to-User Ratio', value: data.users.total > 0 ? Math.round((data.users.teachers / data.users.total) * 100) : 0, color: 'bg-purple-500', textColor: 'text-purple-400' },
              { label: 'Verified Users', value: data.users.total > 0 ? Math.round((data.users.verified / data.users.total) * 100) : 0, color: 'bg-blue-500', textColor: 'text-blue-400' },
              { label: 'Banned Users', value: data.users.total > 0 ? Math.round((data.users.banned / data.users.total) * 100) : 0, color: 'bg-err', textColor: 'text-err' },
            ].map(({ label, value, color, textColor }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-fg-rail">{label}</span>
                  <span className={`text-[13px] font-bold ${textColor}`}>{value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-rail-hi overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.max(value, value > 0 ? 2 : 0)}%` }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div className="text-center">
                <p className="text-[22px] font-bold text-ok">{data.sessions.upcoming}</p>
                <p className="text-[11px] text-fg-rail">Upcoming sessions</p>
              </div>
              <div className="text-center">
                <p className="text-[22px] font-bold text-yellow-400">{data.tokens.inCirculation.toLocaleString()}</p>
                <p className="text-[11px] text-fg-rail">Tokens circulating</p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Breakdown section ───────────────────────────────────────────────── */}
      {breakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Top Skills */}
          <div className="lg:col-span-1 rounded-xl border border-white/5 bg-rail p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[14px] font-semibold text-fg-inv">Top Skills</p>
                <p className="text-[12px] text-fg-rail mt-0.5">By sessions in period</p>
              </div>
              <button onClick={exportTopSkills} title="Export CSV" className="p-1.5 rounded-md text-fg-rail hover:text-fg-inv hover:bg-white/5 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            {breakdown.topSkills.length === 0 ? (
              <p className="text-[13px] text-fg-rail text-center py-8">No session data in period</p>
            ) : (
              <div className="space-y-2">
                {breakdown.topSkills.map((skill, i) => {
                  const max = breakdown.topSkills[0]?.sessions || 1;
                  return (
                    <div key={skill.name} className="flex items-center gap-3">
                      <span className="w-5 text-[11px] font-bold text-fg-rail text-right shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[12px] font-medium text-fg-inv truncate">{skill.name}</p>
                          <p className="text-[11px] text-fg-rail shrink-0 ml-2">{skill.sessions} sess</p>
                        </div>
                        <div className="h-1 rounded-full bg-rail-hi overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(skill.sessions / max) * 100}%`,
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session status pie */}
          <div className="lg:col-span-1 rounded-xl border border-white/5 bg-rail p-5">
            <p className="text-[14px] font-semibold text-fg-inv mb-1">Session Status</p>
            <p className="text-[12px] text-fg-rail mb-4">Distribution in period</p>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-fg-rail text-[13px]">No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TT.contentStyle}
                      formatter={(v: number, name: string) => [v, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-[12px] text-fg-rail capitalize">{entry.name}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-fg-inv">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Top Teachers */}
          <div className="lg:col-span-1 rounded-xl border border-white/5 bg-rail p-5">
            <p className="text-[14px] font-semibold text-fg-inv mb-1">Top Teachers</p>
            <p className="text-[12px] text-fg-rail mb-4">By tokens earned all-time</p>
            {breakdown.topTeachers.length === 0 ? (
              <p className="text-[13px] text-fg-rail text-center py-8">No teachers found</p>
            ) : (
              <div className="space-y-2.5">
                {breakdown.topTeachers.map((teacher, i) => (
                  <div key={teacher._id} className="flex items-center gap-3">
                    <span className="w-5 text-[11px] font-bold text-fg-rail text-right shrink-0">{i + 1}</span>
                    {teacher.avatar ? (
                      <img src={teacher.avatar} alt={teacher.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center text-[11px] font-bold text-accent shrink-0">
                        {teacher.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[12px] font-medium text-fg-inv truncate">{teacher.name}</p>
                        {teacher.isVerified && <span className="text-[9px] text-blue-400 shrink-0">✓</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-fg-rail">
                        <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-yellow-400" />{(teacher.averageRating || 0).toFixed(1)}</span>
                        <span>{teacher.totalSessionsTaught || 0} sessions</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-bold text-yellow-400">{(teacher.tokensEarned || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-fg-rail">tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
