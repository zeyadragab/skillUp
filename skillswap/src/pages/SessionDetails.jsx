import { useState, useEffect, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { sessionAPI } from "../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import {
  Calendar,
  Clock,
  User,
  Video,
  BookOpen,
  Coins,
  ShieldCheck,
  XCircle,
  ArrowLeft,
  MessageSquare,
  Star,
  Award,
  Zap,
  Info,
  ChevronRight,
  UserCheck,
  FileText,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getById(sessionId);
      setSession(response.session);
    } catch (error) {
      toast.error("Node Retrieval Failure: Access window closed");
      navigate("/sessions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Queued' },
      in_progress: { color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Active' },
      completed: { color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Terminated/Synced' },
      cancelled: { color: 'text-red-500', bg: 'bg-red-50', label: 'Aborted' },
      no_show: { color: 'text-amber-500', bg: 'bg-amber-50', label: 'Null Node' }
    };
    return configs[status] || configs.scheduled;
  };

  const canJoinSession = () => {
    if (!session) return false;
    if (session.status !== "scheduled" && session.status !== "in_progress") return false;
    const sessionTime = new Date(session.scheduledAt);
    const now = new Date();
    const timeDiff = sessionTime - now;
    const sessionDuration = session.duration || 60;
    return timeDiff <= 15 * 60 * 1000 && timeDiff >= -(sessionDuration * 60 * 1000);
  };

  const handleJoin = async () => {
    try {
      await sessionAPI.join(sessionId);
      navigate(`/sessions/${sessionId}/video`);
    } catch {
      toast.error("Auth Protocol Interrupted");
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Abort this transmission? Protocal requires 24h notice for credit reclamation.")) return;
    try {
      setCancelling(true);
      await sessionAPI.cancel(sessionId);
      toast.success("Transmission Aborted");
      fetchSessionDetails();
    } catch {
      toast.error("Abort Protocol Error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-6">
           <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-t-primary rounded-full" />
        </div>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Node Discovery...</p>
      </div>
    );
  }

  const status = getStatusConfig(session?.status);

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />

      <main className="flex-1 pb-40">
        {/* PREMIUM HERO */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[600px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
           
           <div className="max-w-4xl mx-auto relative z-10">
              <button 
                onClick={() => navigate('/sessions')} 
                className="group flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest mb-12 transition-all"
              >
                 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Collective
              </button>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                 <div className="flex items-center gap-4 mb-10">
                    <div className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.bg} ${status.color} border-current`}>
                       {status.label}
                    </div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Protocol Version 2.0.4</span>
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter leading-[0.8] mb-12">
                    Transmission<br />
                    <span className="text-primary italic font-serif">Node</span> Analysis.
                 </h1>
              </motion.div>
           </div>
        </section>

        {/* NODE CORE INFORMATION */}
        <section className="px-6 max-w-4xl mx-auto">
           <div className="grid grid-cols-1 gap-10">
              
              {/* CORE CARD */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-12 lg:p-16 rounded-[64px] border border-border shadow-2xl shadow-primary/5"
              >
                 <div className="flex items-center gap-4 mb-14">
                    <div className="w-14 h-14 bg-bg-alt rounded-2xl flex items-center justify-center text-primary group">
                       <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase">Signal Core</h2>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Immutable Data Block</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-10">
                       <div className="flex items-start gap-4">
                          <BookOpen className="w-5 h-5 text-primary mt-1" />
                          <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Exchange Skill</p>
                             <p className="text-xl font-black text-text-main uppercase tracking-tight">{session.skill}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <Clock className="w-5 h-5 text-primary mt-1" />
                          <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Temporal Duration</p>
                             <p className="text-xl font-black text-text-main uppercase tracking-tight">{session.duration} Minutes Flow</p>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-10">
                       <div className="flex items-start gap-4">
                          <Calendar className="w-5 h-5 text-primary mt-1" />
                          <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Activation Window</p>
                             <p className="text-xl font-black text-text-main uppercase tracking-tight">{format(new Date(session.scheduledAt), "PPP")}</p>
                             <p className="text-sm font-bold text-primary mt-1 uppercase tracking-widest">{format(new Date(session.scheduledAt), "p")}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <Coins className="w-5 h-5 text-primary mt-1" />
                          <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Asset Allocation</p>
                             <p className="text-xl font-black text-text-main uppercase tracking-tight">
                                {session.isSkillExchange ? "Neural Barter" : `${session.tokensCharged} TK Blocks`}
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {session.description && (
                   <div className="mt-16 pt-12 border-t border-border">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Transmission Context</p>
                      <p className="text-xl font-medium text-text-main leading-relaxed italic">"{session.description}"</p>
                   </div>
                 )}
              </motion.div>

              {/* PARTICIPANT NODES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* MENTOR NODE */}
                 <div className="bg-text-main p-12 rounded-[56px] text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-10">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Mentor Node</span>
                          <UserCheck className="w-6 h-6 text-primary" />
                       </div>
                       <div className="flex items-center gap-6 mb-10">
                          {session.teacher?.avatar ? (
                            <img src={session.teacher.avatar} className="w-20 h-20 rounded-[24px] object-cover border-2 border-primary/40 p-1" />
                          ) : (
                            <div className="w-20 h-20 bg-primary/20 rounded-[24px] flex items-center justify-center text-primary text-3xl font-black">
                               {session.teacher?.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                             <h4 className="text-2xl font-black tracking-tighter leading-none mb-2">{session.teacher?.name}</h4>
                             {session.teacher?.averageRating && (
                               <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                                  <Star className="w-3 h-3 text-accent fill-current" />
                                  <span className="text-[10px] font-black tracking-widest uppercase">{session.teacher.averageRating.toFixed(1)} ALPHA</span>
                               </div>
                             )}
                          </div>
                       </div>
                       <Link to={`/profile/${session.teacher?._id}`} className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors">
                          Inspect Node <ChevronRight className="w-4 h-4" />
                       </Link>
                    </div>
                 </div>

                 {/* LEARNER NODE */}
                 <div className="bg-white p-12 border border-border rounded-[56px] shadow-sm relative group">
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-10">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Target Node</span>
                          <User className="w-6 h-6 text-text-muted" />
                       </div>
                       <div className="flex items-center gap-6 mb-10">
                          {session.learner?.avatar ? (
                            <img src={session.learner.avatar} className="w-20 h-20 rounded-[24px] object-cover border-2 border-border p-1" />
                          ) : (
                            <div className="w-20 h-20 bg-bg-alt rounded-[24px] flex items-center justify-center text-text-muted text-3xl font-black">
                               {session.learner?.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                             <h4 className="text-2xl font-black text-text-main tracking-tighter leading-none mb-2">{session.learner?.name}</h4>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active Subscriber</p>
                          </div>
                       </div>
                       <Link to={`/profile/${session.learner?._id}`} className="inline-flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors">
                          Inspect Node <ChevronRight className="w-4 h-4" />
                       </Link>
                    </div>
                 </div>
              </div>

              {/* ACTION NODE */}
              <div className="bg-white p-10 rounded-[48px] border border-border flex flex-col sm:flex-row items-center justify-between gap-8">
                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {canJoinSession() && (
                      <button 
                         onClick={handleJoin}
                         className="w-full sm:w-auto px-12 py-5 bg-emerald-500 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                      >
                         <Video className="w-4 h-4 fill-current" /> Join signal nexus
                      </button>
                    )}

                    {session.status === "completed" && session.hasSummary && (
                      <button 
                         onClick={() => navigate(`/sessions/${sessionId}/summary`)}
                         className="w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:rotate-1 transition-all flex items-center gap-3"
                      >
                         <FileText className="w-4 h-4" /> View Synthetic Intel
                      </button>
                    )}

                    {session.status === "scheduled" && (
                      <button 
                         onClick={handleCancel}
                         disabled={cancelling}
                         className="w-full sm:w-auto px-12 py-5 bg-white border border-border text-red-500 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                      >
                         {cancelling ? "Aborting..." : "Terminate Protocol"}
                      </button>
                    )}
                 </div>

                 <button className="flex items-center gap-3 px-8 py-5 bg-bg-alt text-text-main rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all">
                    <MessageSquare className="w-4 h-4" /> Open Comms Hub
                 </button>
              </div>

              {/* TERMINATION WARNING */}
              {session.status === "scheduled" && !canCancelSession() && (
                <div className="flex items-center gap-4 p-8 bg-amber-50 rounded-[32px] border border-amber-200">
                   <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                   <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">
                      Signal Lock: Mandatory 24h protocol for credit reclamation is active. Termination will be processed as a loss of blocks.
                   </p>
                </div>
              )}
           </div>
        </section>

        {/* METRICS FEEDEER */}
        <section className="mt-24 px-6 max-w-4xl mx-auto">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Flow Type", val: session.sessionType || "One-on-One" },
                { label: "Index Date", val: format(new Date(session.createdAt), "MMM d, yyyy") },
                { label: "Completion Hub", val: session.completedAt ? format(new Date(session.completedAt), "MMM d, yyyy") : "Pending" },
                { label: "Distributor", val: "Quantum Swaply" }
              ].map((m, i) => (
                <div key={i} className="text-center">
                   <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">{m.label}</p>
                   <p className="text-xs font-black text-text-main uppercase tracking-widest">{m.val}</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default memo(SessionDetails);
