import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionAPI, summaryAPI } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  User,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  BookOpen,
  Filter,
  LayoutDashboard,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, completed, all
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'upcoming') params.upcoming = true;
      else if (filter === 'past') params.past = true;
      else if (filter === 'completed') params.status = 'completed';

      const response = await sessionAPI.getAll(params);
      setSessions(response.sessions || []);
    } catch (error) {
      toast.error('Sync failed: Could not retrieve session nodes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { color: 'text-blue-500', bg: 'bg-blue-50', icon: Calendar, label: 'Transmission Scheduled' },
      in_progress: { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: Zap, label: 'Active Transmission' },
      completed: { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: ShieldCheck, label: 'Data Synced' },
      cancelled: { color: 'text-red-500', bg: 'bg-red-50', icon: X, label: 'Aborted' },
      no_show: { color: 'text-amber-500', bg: 'bg-amber-50', icon: RotateCcw, label: 'Ghost Node' }
    };
    return configs[status] || configs.scheduled;
  };

  const canJoinSession = (session) => {
    if (session.status === 'cancelled') return false;
    const sessionTime = new Date(session.scheduledAt);
    const now = new Date();
    const timeDiff = sessionTime - now;
    const duration = session.duration || 60;
    const isInWindow = timeDiff <= 15 * 60 * 1000 && timeDiff >= -(duration * 60 * 1000);
    return isInWindow || session.status === 'in_progress';
  };

  const handleJoin = async (id) => {
    try {
      await sessionAPI.join(id);
      navigate(`/sessions/${id}/video`);
    } catch {
      toast.error('Auth Denied: Access window is not yet open');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Terminate this transmission? Refunding subject to 24h protocol.')) return;
    try {
      await sessionAPI.cancel(id);
      toast.success('Transmission Terminated');
      fetchSessions();
    } catch {
      toast.error('Termination Failed');
    }
  };

  const handleGenerateSummary = async (id) => {
    try {
      setGeneratingSummary(prev => ({ ...prev, [id]: true }));
      await summaryAPI.generateMockSummary(id);
      toast.success('AI Synthesis Complete');
      navigate(`/sessions/${id}/summary`);
    } catch {
      toast.error('Synthesis Failed');
    } finally {
      setGeneratingSummary(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* PREMIUM HERO */}
        <section className="relative pt-40 pb-20 px-6">
           <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none">
              <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[100%] bg-primary/5 blur-[120px] rounded-full" />
              <div className="absolute bottom-0 left-[-10%] w-[50%] h-[80%] bg-secondary/5 blur-[100px] rounded-full" />
           </div>

           <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-border shadow-xl rounded-full mb-10 group">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
                       <Calendar className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">Neural Exchange Hub</span>
                 </div>
                 
                 <h1 className="text-7xl md:text-9xl font-black text-text-main tracking-tighter leading-[0.8] mb-8">
                    My<br />
                    <span className="text-primary italic font-serif">Session</span> Nodes.
                 </h1>
                 <p className="text-xl text-text-muted font-medium max-w-xl leading-relaxed">
                    Track your intellectual transmissions. Join ongoing sessions or review synthesized knowledge from past exchanges.
                 </p>
              </motion.div>

              {/* STATS PILL */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex items-center gap-6 p-10 bg-white shadow-2xl shadow-primary/5 rounded-[48px] border border-border"
              >
                 <div className="text-center px-6 border-r border-border">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Queue</p>
                    <p className="text-4xl font-black text-text-main">{sessions.filter(s => s.status === 'scheduled').length}</p>
                 </div>
                 <div className="text-center px-6">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Synced</p>
                    <p className="text-4xl font-black text-primary">{sessions.filter(s => s.status === 'completed').length}</p>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* CONTROLS */}
        <section className="px-6 mx-auto max-w-7xl mb-12">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white border border-border rounded-[32px] shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                 {['upcoming', 'completed', 'past', 'all'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        filter === f ? 'bg-text-main text-white shadow-xl scale-105' : 'bg-bg-alt text-text-muted hover:bg-border'
                      }`}
                    >
                       {f}
                    </button>
                 ))}
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="text" 
                      placeholder="Node SKU or Topic..." 
                      className="w-full pl-12 pr-4 py-3 bg-bg-alt rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-primary transition-all"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* SESSION LIST */}
        <section className="px-6 mx-auto max-w-7xl">
           {loading ? (
             <div className="py-32 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Accessing Node Database...</p>
             </div>
           ) : sessions.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white rounded-[64px] border border-border">
                <div className="w-24 h-24 bg-bg-alt rounded-[40px] flex items-center justify-center mx-auto mb-8 text-text-muted/30">
                   <LayoutDashboard className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-text-main mb-3 tracking-tighter">Zero Transmissions Detected</h3>
                <p className="text-text-muted font-medium italic mb-12">"Your intellectual queue is currently dormant."</p>
                <Link to="/courses" className="px-12 py-5 bg-text-main text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all">Explore Skills</Link>
             </motion.div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {sessions.map((s, i) => {
                  const conf = getStatusConfig(s.status);
                  const isJoinable = canJoinSession(s);
                  
                  return (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white rounded-[48px] border border-border p-10 hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                    >
                       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
                          {/* Info Part */}
                          <div className="flex-1 flex flex-col md:flex-row items-start gap-10">
                             <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-all ${conf.bg} ${conf.color}`}>
                                <conf.icon className="w-10 h-10" />
                             </div>
                             
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                   <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${conf.color.replace('text', 'border')} ${conf.bg}`}>
                                      {conf.label}
                                   </span>
                                   {s.sessionType && <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">{s.sessionType} Flow</span>}
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-text-main tracking-tighter mb-4 group-hover:text-primary transition-colors">{s.skill}</h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Mentor Node</span>
                                      <Link to={`/profile/${s.teacher?._id}`} className="text-xs font-black text-text-main hover:text-primary uppercase flex items-center gap-2">
                                         <User className="w-3 h-3 text-primary" /> {s.teacher?.name || 'Unknown'}
                                      </Link>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Sync Date</span>
                                      <p className="text-xs font-black text-text-main uppercase">{format(new Date(s.scheduledAt), 'PPP')}</p>
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Sync Window</span>
                                      <p className="text-xs font-black text-text-main uppercase">{format(new Date(s.scheduledAt), 'p')} <span className="text-[10px] text-text-muted">({s.duration} MIN)</span></p>
                                   </div>
                                   {s.rating && (
                                     <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Feedback</span>
                                        <div className="flex items-center gap-1">
                                           <Award className="w-3.5 h-3.5 text-accent fill-current" />
                                           <span className="text-xs font-black text-text-main uppercase">{s.rating}/10</span>
                                        </div>
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>

                          {/* Action Part */}
                          <div className="flex flex-col sm:flex-row items-center gap-4 min-w-[220px]">
                             {isJoinable && (
                               <button 
                                 onClick={() => handleJoin(s._id)}
                                 className="w-full sm:flex-1 py-5 px-8 bg-emerald-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                               >
                                  <Play className="w-4 h-4 fill-current" /> Join Hub
                               </button>
                             )}
                             
                             {s.status === 'scheduled' && !isJoinable && (
                               <button 
                                 onClick={() => handleCancel(s._id)}
                                 className="w-full sm:w-auto py-5 px-8 bg-white border border-border text-red-500 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                               >
                                  Terminate
                               </button>
                             )}

                             {s.status === 'completed' && (
                               <div className="w-full flex flex-col gap-3">
                                  {s.hasSummary ? (
                                    <button 
                                      onClick={() => navigate(`/sessions/${s._id}/summary`)}
                                      className="w-full py-5 px-8 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:rotate-1 transition-all flex items-center justify-center gap-3"
                                    >
                                       <Sparkles className="w-4 h-4" /> Sync Intel
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleGenerateSummary(s._id)}
                                      disabled={generatingSummary[s._id]}
                                      className="w-full py-5 px-8 bg-text-main text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-primary transition-all flex items-center justify-center gap-3"
                                    >
                                       {generatingSummary[s._id] ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                       Process Intel
                                    </button>
                                  )}
                                  
                                  {s.recording && (
                                    <Link 
                                      to={`/recordings/${s.recording}`}
                                      className="w-full py-4 text-center text-[10px] font-black text-text-muted hover:text-text-main uppercase tracking-widest"
                                    >
                                       View Footage
                                    </Link>
                                  )}
                               </div>
                             )}
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
             </div>
           )}
        </section>

        {/* ECOSYSTEM CTA */}
        <section className="mt-40 px-6">
           <div className="max-w-7xl mx-auto p-12 lg:p-24 bg-text-main rounded-[64px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[800px] h-full bg-linear-to-bl from-primary/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                 <div className="max-w-2xl text-center lg:text-left">
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Continuous Learning</h2>
                    <h3 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                       Expand Your <span className="text-primary italic">Neural</span> Graph.
                    </h3>
                    <p className="text-white/60 font-medium text-xl leading-relaxed mb-12">
                       Don't let the knowledge flow stop. Review your synthesized logs or book your next intellectual exchange with world-class experts.
                    </p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                       <Link to="/teachers" className="px-12 py-6 bg-primary text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Find Mentors</Link>
                       <Link to="/community" className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Community Hub</Link>
                    </div>
                 </div>
                 
                 <div className="w-80 h-80 bg-primary/20 rounded-[64px] blur-[100px] absolute -bottom-20 -right-20 animate-pulse pointer-events-none" />
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default memo(Sessions);
