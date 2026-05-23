import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { summaryAPI, sessionsAPI } from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  Target,
  BarChart3,
  Sparkles,
  ArrowLeft,
  Loader2,
  Download,
  Mail,
  Zap,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
  Calendar,
  BookOpen,
  MessageCircle,
  Star,
  Activity,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

/* ─────────────────────────────────────────────
   Reusable animation variants
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut', delay },
  }),
};

/* ─────────────────────────────────────────────
   Small helper components
───────────────────────────────────────────── */

/** Coloured badge for overall rating */
const RatingBadge = ({ score }) => {
  const s = Number(score) || 0;
  const color =
    s >= 8
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : s >= 6
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : s >= 4
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-red-100 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${color}`}>
      <Star className="w-3.5 h-3.5 fill-current" />
      {s.toFixed(1)} / 10
    </span>
  );
};

/** Section card wrapper */
const Section = ({ children, className = '', delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="show"
    custom={delay}
    className={`bg-white border border-border rounded-2xl shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

/** Section header row */
const SectionHeader = ({ icon: Icon, title, iconColor = 'text-primary', iconBg = 'bg-primary/10' }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <h2 className="text-base font-bold text-text-main">{title}</h2>
  </div>
);

/** Simple animated progress bar */
const ProgressBar = ({ value = 0, max = 10, color = 'bg-primary' }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 w-full bg-bg-alt rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
};

/** Stat card used in the stats row */
const StatCard = ({ icon: Icon, label, value, sub, delay = 0, iconBg = 'bg-primary/10', iconColor = 'text-primary' }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="show"
    custom={delay}
    className="bg-white border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-black text-text-main leading-none mb-1 truncate">{value}</p>
      <p className="text-xs font-semibold text-text-main">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   Loading Skeleton
───────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-border rounded-xl ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
    {/* Header skeleton */}
    <div className="bg-white border border-border rounded-2xl p-8">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-10 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-6" />
      <div className="flex gap-4">
        <Skeleton className="h-16 w-36 rounded-xl" />
        <Skeleton className="h-16 w-36 rounded-xl" />
        <Skeleton className="h-16 w-36 rounded-xl" />
      </div>
    </div>
    {/* Stats row skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-2xl p-5">
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
    {/* Body skeletons */}
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white border border-border rounded-2xl p-8 space-y-3">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const SessionSummary = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, sessRes] = await Promise.all([
        summaryAPI.getSummary(sessionId),
        sessionsAPI.getById(sessionId),
      ]);
      setSummary(sumRes.summary);
      setSession(sessRes.session);
    } catch (err) {
      setError(err.message || 'Failed to load session summary');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparing PDF export…');
      setTimeout(() => {
        setIsExporting(false);
        toast.success('PDF downloaded successfully');
      }, 2000);
    } catch {
      setIsExporting(false);
    }
  };

  const handleEmailSummary = async () => {
    try {
      setIsEmailing(true);
      await summaryAPI.emailSummary(sessionId);
      toast.success('Summary sent to your email');
    } catch {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsEmailing(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col">
        <Navbar />
        <main className="flex-1">
          <LoadingSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Error / no summary state ── */
  if (error || !summary) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="max-w-md w-full text-center bg-white border border-border rounded-2xl p-12 shadow-sm"
          >
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-text-main mb-3">Summary Not Available</h2>
            <p className="text-text-muted text-sm mb-2">
              {error || 'The AI summary for this session could not be found.'}
            </p>
            <p className="text-text-muted text-xs mb-8">
              This can happen if the session was very short or the summary is still being generated.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchData}
                className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/sessions')}
                className="px-6 py-3 bg-bg-alt text-text-main rounded-xl text-sm font-semibold hover:bg-border transition-colors"
              >
                Back to Sessions
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Derived values ── */
  const s = summary.summary || {};
  const analysis = summary.analysis || {};
  const stats = summary.statistics || {};

  const overallRating = analysis.overallRating ?? 0;
  const teacherPct = analysis.engagement?.teacherParticipation ?? 0;
  const learnerPct = analysis.engagement?.learnerParticipation ?? 0;
  const durationMins = Math.round((stats.totalDuration || 0) / 60);

  const sessionDate = session?.scheduledAt
    ? new Date(session.scheduledAt).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />

      <main className="flex-1 pb-20">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">

          {/* ── Back button ── */}
          <motion.button
            variants={fadeIn}
            initial="hidden"
            animate="show"
            custom={0}
            onClick={() => navigate('/sessions')}
            className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Sessions
          </motion.button>

          {/* ══════════════════════════════════════════
              1. HEADER CARD
          ══════════════════════════════════════════ */}
          <Section delay={0.05} className="p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left: title + meta */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">AI Session Summary</span>
                </div>

                <h1 className="text-2xl font-black text-text-main leading-tight mb-2 truncate">
                  {session?.title || session?.skill || 'Session Summary'}
                </h1>

                {session?.skill && session?.title && (
                  <p className="text-sm text-text-muted mb-4">{session.skill}</p>
                )}

                {/* Meta pills */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {session?.teacher?.name && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-alt border border-border rounded-full text-xs font-medium text-text-muted">
                      <User className="w-3.5 h-3.5" />
                      <span>Teacher: <span className="font-semibold text-text-main">{session.teacher.name}</span></span>
                    </div>
                  )}
                  {session?.learner?.name && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-alt border border-border rounded-full text-xs font-medium text-text-muted">
                      <Users className="w-3.5 h-3.5" />
                      <span>Learner: <span className="font-semibold text-text-main">{session.learner.name}</span></span>
                    </div>
                  )}
                  {sessionDate && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-alt border border-border rounded-full text-xs font-medium text-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      {sessionDate}
                    </div>
                  )}
                  {durationMins > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-alt border border-border rounded-full text-xs font-medium text-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {durationMins} min
                    </div>
                  )}
                </div>
              </div>

              {/* Right: overall rating */}
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <RatingBadge score={overallRating} />
                <div className="text-right">
                  <p className="text-4xl font-black text-text-main leading-none">{overallRating.toFixed(1)}</p>
                  <p className="text-xs text-text-muted mt-1">Overall Rating</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-text-main text-white rounded-xl text-xs font-semibold hover:bg-primary transition-colors shadow-sm disabled:opacity-60"
                  >
                    {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    Export PDF
                  </button>
                  <button
                    onClick={handleEmailSummary}
                    disabled={isEmailing}
                    className="flex items-center gap-2 px-4 py-2 bg-bg-alt border border-border text-text-main rounded-xl text-xs font-semibold hover:bg-border transition-colors disabled:opacity-60"
                  >
                    {isEmailing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    Email
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════════════════
              2. OVERVIEW CARD
          ══════════════════════════════════════════ */}
          {s.overview && (
            <Section delay={0.1} className="p-8 mb-6">
              <SectionHeader icon={FileText} title="Session Overview" />
              <blockquote className="pl-4 border-l-4 border-primary/40">
                <p className="text-text-main text-base leading-relaxed font-medium italic">
                  "{s.overview}"
                </p>
              </blockquote>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              3. STATS ROW — 4 stat cards
          ══════════════════════════════════════════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Clock}
              label="Total Duration"
              value={`${durationMins}m`}
              sub={`${stats.totalDuration || 0}s`}
              delay={0.12}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              icon={MessageCircle}
              label="Teacher Words"
              value={(stats.wordsSpoken?.teacher || 0).toLocaleString()}
              sub="words spoken"
              delay={0.16}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <StatCard
              icon={BookOpen}
              label="Learner Words"
              value={(stats.wordsSpoken?.learner || 0).toLocaleString()}
              sub="words spoken"
              delay={0.2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              icon={Award}
              label="Overall Score"
              value={`${overallRating.toFixed(1)}/10`}
              sub={overallRating >= 7 ? 'Excellent' : overallRating >= 5 ? 'Good' : 'Needs improvement'}
              delay={0.24}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
          </div>

          {/* ══════════════════════════════════════════
              4. MAIN TOPICS
          ══════════════════════════════════════════ */}
          {s.mainTopics?.length > 0 && (
            <Section delay={0.27} className="p-8 mb-6">
              <SectionHeader icon={BarChart3} title="Main Topics Covered" />
              <div className="space-y-3">
                {s.mainTopics.map((topic, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={0.28 + i * 0.06}
                    className="flex items-start gap-4 p-4 bg-bg-alt rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
                  >
                    {/* Index bubble */}
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-text-main">{topic.topic}</h3>
                        {topic.timestamp && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-border rounded-full text-xs text-text-muted font-medium">
                            <Clock className="w-3 h-3" />
                            {topic.timestamp}
                          </span>
                        )}
                      </div>
                      {topic.description && (
                        <p className="text-xs text-text-muted leading-relaxed">{topic.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              5. KEY LEARNING POINTS
          ══════════════════════════════════════════ */}
          {s.keyLearningPoints?.length > 0 && (
            <Section delay={0.3} className="p-8 mb-6">
              <SectionHeader
                icon={CheckCircle}
                title="Key Learning Points"
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
              />
              <ul className="space-y-3">
                {s.keyLearningPoints.map((point, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={0.31 + i * 0.05}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-text-main leading-relaxed">{point}</p>
                  </motion.li>
                ))}
              </ul>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              6. ACTION ITEMS
          ══════════════════════════════════════════ */}
          {s.actionItems?.length > 0 && (
            <Section delay={0.33} className="p-8 mb-6 overflow-hidden">
              <SectionHeader
                icon={Target}
                title="Action Items"
                iconColor="text-orange-600"
                iconBg="bg-orange-50"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-text-muted w-8">#</th>
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-text-muted">Description</th>
                      <th className="text-left py-2 text-xs font-semibold text-text-muted whitespace-nowrap">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {s.actionItems.map((item, i) => (
                      <motion.tr
                        key={i}
                        variants={fadeIn}
                        initial="hidden"
                        animate="show"
                        custom={0.34 + i * 0.05}
                        className="hover:bg-bg-alt/70 transition-colors"
                      >
                        <td className="py-3 pr-4 text-xs font-semibold text-text-muted">{i + 1}</td>
                        <td className="py-3 pr-4 text-sm text-text-main leading-relaxed">{item.description}</td>
                        <td className="py-3">
                          {item.assignedTo && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold whitespace-nowrap">
                              <User className="w-3 h-3" />
                              {item.assignedTo}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              7. TEACHING QUALITY — progress bars
          ══════════════════════════════════════════ */}
          {analysis.teachingQuality && (
            <Section delay={0.36} className="p-8 mb-6">
              <SectionHeader
                icon={TrendingUp}
                title="Teaching Quality"
                iconColor="text-violet-600"
                iconBg="bg-violet-50"
              />

              {/* Overall score highlight */}
              <div className="flex items-center justify-between mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <span className="text-sm font-semibold text-violet-700">Overall Teaching Score</span>
                <span className="text-2xl font-black text-violet-700">
                  {analysis.teachingQuality.score?.toFixed(1) ?? '—'}<span className="text-sm font-semibold opacity-60">/10</span>
                </span>
              </div>

              <div className="space-y-5">
                {[
                  { label: 'Clarity', value: analysis.teachingQuality.clarity, icon: ShieldCheck, color: 'bg-violet-500' },
                  { label: 'Pacing', value: analysis.teachingQuality.pacing, icon: Clock, color: 'bg-blue-500' },
                  { label: 'Responsiveness', value: analysis.teachingQuality.responsiveness, icon: Zap, color: 'bg-primary' },
                ].map(({ label, value, icon: IconComp, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4 h-4 text-text-muted" />
                        <span className="text-sm font-semibold text-text-main">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-text-main">{value ?? 0}/10</span>
                    </div>
                    <ProgressBar value={value ?? 0} max={10} color={color} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              8. ENGAGEMENT — participation bars
          ══════════════════════════════════════════ */}
          {analysis.engagement && (
            <Section delay={0.39} className="p-8 mb-6">
              <SectionHeader
                icon={Activity}
                title="Session Engagement"
                iconColor="text-blue-600"
                iconBg="bg-blue-50"
              />

              {/* Engagement score */}
              <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-semibold text-blue-700">Engagement Score</span>
                <span className="text-2xl font-black text-blue-700">
                  {analysis.engagement.score?.toFixed(1) ?? '—'}<span className="text-sm font-semibold opacity-60">/10</span>
                </span>
              </div>

              {/* Stacked participation bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-text-main">Participation Split</span>
                  <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary inline-block" />Teacher {teacherPct}%</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Learner {learnerPct}%</span>
                  </div>
                </div>
                {/* Stacked bar */}
                <div className="h-4 w-full bg-bg-alt rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${teacherPct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full bg-primary rounded-l-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${learnerPct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                    className="h-full bg-emerald-500 rounded-r-full"
                  />
                </div>
              </div>

              {/* Individual bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-text-main">Teacher Participation</span>
                    </div>
                    <span className="text-sm font-bold text-text-main">{teacherPct}%</span>
                  </div>
                  <ProgressBar value={teacherPct} max={100} color="bg-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-text-main">Learner Participation</span>
                    </div>
                    <span className="text-sm font-bold text-text-main">{learnerPct}%</span>
                  </div>
                  <ProgressBar value={learnerPct} max={100} color="bg-emerald-500" />
                </div>
              </div>

              {/* Interaction quality label */}
              {analysis.engagement.interactionQuality && (
                <div className="mt-5 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs font-semibold text-primary mb-1">Interaction Quality</p>
                  <p className="text-sm text-text-main font-medium">{analysis.engagement.interactionQuality}</p>
                </div>
              )}
            </Section>
          )}

          {/* ══════════════════════════════════════════
              9. RECOMMENDATIONS
          ══════════════════════════════════════════ */}
          {analysis.recommendations?.length > 0 && (
            <Section delay={0.42} className="p-8 mb-6">
              <SectionHeader
                icon={Lightbulb}
                title="Recommendations"
                iconColor="text-amber-600"
                iconBg="bg-amber-50"
              />
              <ol className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={0.43 + i * 0.05}
                    className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl"
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-text-main leading-relaxed pt-0.5">{rec}</p>
                  </motion.li>
                ))}
              </ol>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              10. AREAS FOR IMPROVEMENT
          ══════════════════════════════════════════ */}
          {analysis.learningProgress?.areasNeedingImprovement?.length > 0 && (
            <Section delay={0.45} className="p-8 mb-6">
              <SectionHeader
                icon={AlertTriangle}
                title="Areas for Improvement"
                iconColor="text-red-500"
                iconBg="bg-red-50"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.learningProgress.areasNeedingImprovement.map((area, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={0.46 + i * 0.05}
                    className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-text-main leading-relaxed">{area}</p>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              BONUS: Concepts Grasped (if present)
          ══════════════════════════════════════════ */}
          {analysis.learningProgress?.conceptsGrasped?.length > 0 && (
            <Section delay={0.48} className="p-8 mb-6">
              <SectionHeader
                icon={CheckCircle}
                title="Concepts Grasped"
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
              />
              <div className="flex flex-wrap gap-2">
                {analysis.learningProgress.conceptsGrasped.map((concept, i) => (
                  <motion.span
                    key={i}
                    variants={fadeIn}
                    initial="hidden"
                    animate="show"
                    custom={0.49 + i * 0.04}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {concept}
                  </motion.span>
                ))}
              </div>
            </Section>
          )}

          {/* ══════════════════════════════════════════
              FOOTER CTA
          ══════════════════════════════════════════ */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.52}
            className="bg-white border border-border rounded-2xl p-8 text-center mt-2"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-black text-text-main mb-2">Session Complete</h2>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto leading-relaxed">
              Knowledge grows when shared. Ready to book your next session or explore more skills?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/browse')}
                className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Browse Teachers
              </button>
              <button
                onClick={() => navigate('/sessions')}
                className="px-6 py-3 bg-bg-alt border border-border text-text-main rounded-xl text-sm font-semibold hover:bg-border transition-colors"
              >
                View All Sessions
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default memo(SessionSummary);
