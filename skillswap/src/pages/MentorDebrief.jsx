import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Star,
  Upload,
  FileText,
  Image,
  Film,
  X,
  Plus,
  Check,
  ChevronRight,
  Clock,
  User,
  Zap,
  BookOpen,
  Target,
  MessageSquare,
  Award,
  Heart,
  Sparkles,
  Send,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  PaperclipIcon,
  Calendar,
  TrendingUp,
  Layers,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { sessionAPI } from "../services/api";
import { useUser } from "../components/context/UserContext";

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange, label, hint }) => (
  <div>
    <p className="text-xs font-semibold text-white/60 mb-1">{label}</p>
    {hint && <p className="text-[10px] text-white/25 mb-3">{hint}</p>}
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= value
                ? "text-amber-400 fill-amber-400"
                : "text-white/10 hover:text-amber-400/40"
            }`}
          />
        </button>
      ))}
    </div>
  </div>
);

// ─── File icon helper ─────────────────────────────────────────────────────────
const FileIcon = ({ type }) => {
  if (type.startsWith("image/")) return <Image className="w-4 h-4 text-indigo-400" />;
  if (type.startsWith("video/")) return <Film className="w-4 h-4 text-purple-400" />;
  return <FileText className="w-4 h-4 text-white/40" />;
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, badge, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 lg:p-8"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
      {badge && (
        <span className="ml-auto text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
    {children}
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const MentorDebrief = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Ratings
  const [sessionRating, setSessionRating] = useState(0);
  const [learnerEngagement, setLearnerEngagement] = useState(0);
  const [learnerProgress, setLearnerProgress] = useState(0);
  const [learnerCommunication, setLearnerCommunication] = useState(0);

  // Content
  const [personalFeedback, setPersonalFeedback] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [tasks, setTasks] = useState([{ text: "", due: "" }]);
  const [resources, setResources] = useState([{ title: "", url: "" }]);
  const [highlights, setHighlights] = useState([""]);
  const [encouragement, setEncouragement] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await sessionAPI.getById(sessionId);
        const s = res.session;
        setSession(s);

        // If the teacher has already submitted a rating, pre-populate and
        // treat the page as already submitted so we show the success screen.
        if (s?.teacherRating?.rating) {
          setSessionRating(s.teacherRating.rating);
          setPersonalFeedback(s.teacherRating.review || "");
          setSubmitted(true);
        }
      } catch (err) {
        const msg = err?.message || "Could not load session";
        toast.error(msg);
        setLoadError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  // ─── File handling ──────────────────────────────────────────────────────────
  const addFiles = useCallback((incoming) => {
    const arr = Array.from(incoming).map((f) => ({ file: f, id: Math.random().toString(36).slice(2) }));
    setFiles((prev) => [...prev, ...arr]);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  // ─── Dynamic list helpers ───────────────────────────────────────────────────
  const addTask = () => setTasks((p) => [...p, { text: "", due: "" }]);
  const updateTask = (i, field, val) => setTasks((p) => p.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  const removeTask = (i) => setTasks((p) => p.filter((_, idx) => idx !== i));

  const addResource = () => setResources((p) => [...p, { title: "", url: "" }]);
  const updateResource = (i, field, val) => setResources((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const removeResource = (i) => setResources((p) => p.filter((_, idx) => idx !== i));

  const addHighlight = () => setHighlights((p) => [...p, ""]);
  const updateHighlight = (i, val) => setHighlights((p) => p.map((h, idx) => idx === i ? val : h));
  const removeHighlight = (i) => setHighlights((p) => p.filter((_, idx) => idx !== i));

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (sessionRating === 0) {
      toast.error("Please rate the session before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await sessionAPI.rate(sessionId, sessionRating, personalFeedback);
      setSubmitted(true);
      toast.success("Debrief submitted! Your learner will be notified.");
    } catch (err) {
      const msg = err?.message || "Failed to submit debrief";
      // If already rated, treat as success (idempotent)
      if (msg.toLowerCase().includes("already rated")) {
        setSubmitted(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-xs text-white/30 font-medium tracking-widest uppercase">Loading session...</p>
      </div>
    );
  }

  // ─── Error screen ───────────────────────────────────────────────────────────
  if (loadError || (!loading && !session)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <X className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Session Not Found</h2>
        <p className="text-white/40 text-sm mb-8 max-w-xs">{loadError || "This session could not be loaded."}</p>
        <button
          onClick={() => navigate("/sessions")}
          className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-2xl hover:bg-white/10 transition-colors"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  // ─── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c] p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-8 border border-indigo-500/20"
        >
          <CheckCircle2 className="w-12 h-12 text-indigo-400" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-3 tracking-tight"
        >
          Debrief Complete
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-white/40 text-sm mb-2 max-w-sm leading-relaxed"
        >
          Your feedback, resources, and tasks have been sent to{" "}
          <span className="text-indigo-400 font-semibold">
            {session?.learner?.name || "the learner"}
          </span>
          .
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-white/20 text-xs mb-10"
        >
          Great mentors make great learners. Thank you for the effort.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <button
            onClick={() => navigate("/sessions")}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-2xl hover:bg-white/10 transition-colors"
          >
            My Sessions
          </button>
          <button
            onClick={() => navigate(`/sessions/${sessionId}/summary`)}
            className="px-6 py-3 bg-white/5 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-2xl hover:bg-indigo-500/10 transition-colors flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" /> View Full Summary
          </button>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-indigo-500 text-white text-xs font-bold rounded-2xl hover:bg-indigo-400 transition-colors"
          >
            Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const learner = session?.learner || session?.student;
  const skill = session?.skill || "Session";
  const duration = session?.duration || 60;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 py-10 pb-32">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button
            onClick={() => navigate("/sessions")}
            className="flex items-center gap-2 text-white/30 hover:text-white/70 text-xs font-semibold mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Sessions
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">Post-Session Debrief</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Session<br />
                <span className="text-white/30">Complete.</span>
              </h1>
            </div>

            {/* Session info card */}
            <div className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl min-w-[260px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate">{skill}</p>
                <p className="text-[11px] text-white/30 mt-0.5">
                  with{" "}
                  <span className="text-white/50 font-semibold">
                    {learner?.name || "Learner"}
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-white/25">
                    <Clock className="w-3 h-3" /> {duration} min
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white/25">
                    <Calendar className="w-3 h-3" />{" "}
                    {session?.scheduledAt
                      ? new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Today"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-5">

          {/* ── 1. Rate the Session ── */}
          <Section icon={BarChart3} title="Rate the Session" badge="Required">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <StarRating
                value={sessionRating}
                onChange={setSessionRating}
                label="Overall Session Quality"
                hint="How well did the session go overall?"
              />
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-3">Quick Summary</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Duration", value: `${duration}m` },
                    { label: "Skill", value: skill.length > 10 ? skill.slice(0, 10) + "…" : skill },
                    { label: "Status", value: "Done" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-sm font-bold text-white">{s.value}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ── 2. Rate the Learner ── */}
          <Section icon={TrendingUp} title="Rate the Learner" badge="Private">
            <p className="text-[11px] text-white/30 mb-6 -mt-2">Only visible to you — helps track learner growth over time.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <StarRating
                value={learnerEngagement}
                onChange={setLearnerEngagement}
                label="Engagement"
                hint="Attention & participation"
              />
              <StarRating
                value={learnerProgress}
                onChange={setLearnerProgress}
                label="Progress"
                hint="Concepts understood"
              />
              <StarRating
                value={learnerCommunication}
                onChange={setLearnerCommunication}
                label="Communication"
                hint="Questions & responses"
              />
            </div>
          </Section>

          {/* ── 3. Personalized Feedback ── */}
          <Section icon={MessageSquare} title="Personalized Feedback for Learner">
            <p className="text-[11px] text-white/30 mb-4 -mt-2">
              This will be sent directly to {learner?.name || "the learner"}. Make it specific and encouraging.
            </p>
            <textarea
              value={personalFeedback}
              onChange={(e) => setPersonalFeedback(e.target.value)}
              placeholder={`e.g. "You showed great understanding of the core concepts today, especially when you asked about... I'd suggest focusing on... Keep up the excellent work!"`}
              rows={5}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none focus:border-indigo-500/40 resize-none transition-colors leading-relaxed"
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {["Great work today!", "Keep practicing!", "You're improving fast!", "Almost there!", "Excellent questions!"].map((q) => (
                <button
                  key={q}
                  onClick={() => setPersonalFeedback((p) => p ? p + " " + q : q)}
                  className="text-[10px] px-3 py-1.5 bg-white/[0.03] border border-white/[0.07] rounded-full text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </Section>

          {/* ── 4. Encouragement Message ── */}
          <Section icon={Heart} title="Personal Message">
            <p className="text-[11px] text-white/30 mb-4 -mt-2">A short motivational note shown at the top of their summary.</p>
            <input
              type="text"
              value={encouragement}
              onChange={(e) => setEncouragement(e.target.value)}
              placeholder='e.g. "You have a real talent for this — keep going!"'
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none focus:border-indigo-500/40 transition-colors"
            />
          </Section>

          {/* ── 5. Session Highlights ── */}
          <Section icon={Sparkles} title="Session Highlights">
            <p className="text-[11px] text-white/30 mb-4 -mt-2">Key moments & wins from today's session — visible to the learner.</p>
            <div className="space-y-2.5">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHighlight(i, e.target.value)}
                    placeholder={`Highlight ${i + 1}...`}
                    className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-indigo-500/40 transition-colors"
                  />
                  {highlights.length > 1 && (
                    <button onClick={() => removeHighlight(i)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addHighlight}
              className="mt-3 flex items-center gap-2 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add highlight
            </button>
          </Section>

          {/* ── 6. Homework & Tasks ── */}
          <Section icon={Target} title="Homework & Action Items">
            <p className="text-[11px] text-white/30 mb-4 -mt-2">Assignments for the learner to complete before the next session.</p>
            <div className="space-y-3">
              {tasks.map((t, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-6 h-6 mt-2 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-indigo-400">{i + 1}</span>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
                    <input
                      type="text"
                      value={t.text}
                      onChange={(e) => updateTask(i, "text", e.target.value)}
                      placeholder={`Task ${i + 1} description...`}
                      className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-indigo-500/40 transition-colors"
                    />
                    <input
                      type="date"
                      value={t.due}
                      onChange={(e) => updateTask(i, "due", e.target.value)}
                      className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white/60 outline-none focus:border-indigo-500/40 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  {tasks.length > 1 && (
                    <button onClick={() => removeTask(i)} className="w-7 h-7 mt-2 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addTask}
              className="mt-3 flex items-center gap-2 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add task
            </button>
          </Section>

          {/* ── 7. Upload Course Materials ── */}
          <Section icon={Upload} title="Course Materials & Resources">
            <p className="text-[11px] text-white/30 mb-4 -mt-2">Upload files (PDFs, slides, videos) or add resource links for the learner.</p>

            {/* Drop zone */}
            <div
              ref={dropZoneRef}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragOver ? "border-indigo-500/60 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.jpg,.jpeg,.png,.zip"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${dragOver ? "bg-indigo-500/20" : "bg-white/[0.03]"}`}>
                <Upload className={`w-5 h-5 transition-colors ${dragOver ? "text-indigo-400" : "text-white/20"}`} />
              </div>
              <p className="text-sm font-semibold text-white/40">
                {dragOver ? "Drop files here" : "Drop files or click to upload"}
              </p>
              <p className="text-[10px] text-white/20 mt-1">PDF, DOCX, PPTX, MP4, JPG, PNG, ZIP</p>
            </div>

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2"
                >
                  {files.map(({ file, id }) => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl"
                    >
                      <FileIcon type={file.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/80 truncate">{file.name}</p>
                        <p className="text-[10px] text-white/25">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeFile(id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resource links */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-white/40 mb-3">External Links</p>
              <div className="space-y-2.5">
                {resources.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={r.title}
                      onChange={(e) => updateResource(i, "title", e.target.value)}
                      placeholder="Title"
                      className="w-32 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-indigo-500/40 transition-colors"
                    />
                    <input
                      type="url"
                      value={r.url}
                      onChange={(e) => updateResource(i, "url", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-indigo-500/40 transition-colors"
                    />
                    {resources.length > 1 && (
                      <button onClick={() => removeResource(i)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addResource}
                className="mt-3 flex items-center gap-2 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add link
              </button>
            </div>
          </Section>

          {/* ── 8. Private Notes ── */}
          <Section icon={BookOpen} title="My Private Notes">
            <p className="text-[11px] text-white/30 mb-4 -mt-2">Personal notes only visible to you — for tracking learner progress over time.</p>
            <textarea
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              placeholder="e.g. Struggles with recursion, gets confused with async/await — revisit next session..."
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/15 outline-none focus:border-indigo-500/40 resize-none transition-colors leading-relaxed"
            />
          </Section>

        </div>

        {/* ── Sticky submit bar ── */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/80 backdrop-blur-xl border-t border-white/[0.05] z-50"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white/50">
                {sessionRating > 0
                  ? `Session rated ${sessionRating}/5 · Ready to send`
                  : "Rate the session to continue"}
              </p>
              <p className="text-[10px] text-white/25 mt-0.5">
                {files.length > 0 && `${files.length} file${files.length > 1 ? "s" : ""} · `}
                {tasks.filter((t) => t.text).length > 0 && `${tasks.filter((t) => t.text).length} task${tasks.filter((t) => t.text).length > 1 ? "s" : ""} · `}
                {personalFeedback ? "Feedback written" : "No feedback yet"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/sessions/${sessionId}/summary`)}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-indigo-400/70 hover:text-indigo-300 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Summary
              </button>
              <button
                onClick={() => navigate("/sessions")}
                className="px-5 py-2.5 text-xs font-bold text-white/40 hover:text-white/70 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || sessionRating === 0}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                {submitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Sending..." : "Submit Debrief"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(MentorDebrief);
