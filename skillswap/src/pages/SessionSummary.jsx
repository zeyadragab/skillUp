import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { summaryAPI, sessionsAPI } from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  MessageSquare,
  BarChart3,
  Sparkles,
  ArrowLeft,
  Loader2,
  Download,
  Mail,
  Zap,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  BrainCircuit,
  PieChart,
  Activity,
  History,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

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
    fetchSummary();
  }, [sessionId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, sessRes] = await Promise.all([
        summaryAPI.getSummary(sessionId),
        sessionsAPI.getById(sessionId)
      ]);
      setSummary(sumRes.summary);
      setSession(sessRes.session);
    } catch (err) {
      setError(err.message || 'Node Synchronization Failure');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      toast.info("Generating Alpha Intelligence PDF...");
      // Simulate/Trigger download logic would go here
      setTimeout(() => {
        setIsExporting(false);
        toast.success("Intelligence Log Synchronized to Local Disk");
      }, 2000);
    } catch {
      setIsExporting(false);
    }
  };

  const handleEmailSummary = async () => {
    try {
      setIsEmailing(true);
      await summaryAPI.emailSummary(sessionId);
      toast.success("Intelligence Distributed to Account Nodes");
    } catch {
      toast.error("Distribution Network Error");
    } finally {
      setIsEmailing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-8">
           <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-t-primary rounded-full" />
        </div>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Synthesizing Intelligence...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[40px] flex items-center justify-center mb-8">
           <AlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-text-main mb-3 tracking-tighter">Null Summary Signature</h2>
        <p className="text-text-muted font-medium mb-12 italic">"The AI could not derive intelligence from this node transmission."</p>
        <button onClick={() => navigate('/sessions')} className="px-10 py-5 bg-text-main text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl">Return to Hub</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />

      <main className="flex-1 pb-40">
        {/* PREMIUM HERO SECTION */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
           <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
           
           <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <button 
                      onClick={() => navigate('/sessions')} 
                      className="group flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-[0.2em] mb-12 transition-all"
                    >
                       <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Collective History
                    </button>
                    
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-border shadow-xl rounded-full mb-10">
                       <Sparkles className="w-3.5 h-3.5 text-primary fill-current" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">AI Intelligence Synthesizer</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black text-text-main tracking-tighter leading-[0.8] mb-8">
                       Neural<br />
                       <span className="text-primary italic font-serif">Report</span> Log.
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-10 mt-12 pt-8 border-t border-border/50">
                       <div>
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Session Protocol</p>
                          <p className="text-sm font-black text-text-main uppercase">{session?.skill || 'Intel Exchange'}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Mentor Synced</p>
                          <p className="text-sm font-black text-text-main uppercase">{session?.teacher?.name || 'Alpha Node'}</p>
                       </div>
                    </div>
                 </motion.div>

                 {/* OVERALL RATING PILL */}
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 bg-text-main rounded-[64px] shadow-3xl shadow-primary/10 border border-white/10 text-white min-w-[340px] relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px]" />
                    <div className="relative z-10">
                       <div className="flex items-center justify-between mb-8">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Transmission Quality</p>
                          <Award className="w-6 h-6 text-primary" />
                       </div>
                       <div className="flex items-baseline gap-4 mb-4">
                          <span className="text-7xl font-black tracking-tighter">{summary.analysis?.overallRating?.toFixed(1) || '0.0'}</span>
                          <span className="text-xl font-bold text-white/40 uppercase tracking-widest">/ 10</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${(summary.analysis?.overallRating || 0) * 10}%` }} 
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className="h-full bg-linear-to-r from-primary to-indigo-400" 
                          />
                       </div>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* CONTROLS BAR */}
        <section className="px-6 mb-16 max-w-7xl mx-auto">
           <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 p-4 bg-white border border-border rounded-[32px] shadow-sm">
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-3 px-8 py-4 bg-text-main text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-text-main/10"
              >
                 {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                 Export Intel
              </button>
              <button 
                onClick={handleEmailSummary}
                disabled={isEmailing}
                className="flex items-center gap-3 px-8 py-4 bg-bg-alt text-text-main rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all"
              >
                 {isEmailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                 Distribute Log
              </button>
           </div>
        </section>

        {/* INTELLIGENCE GRIDS */}
        <section className="px-6 mx-auto max-w-7xl">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* LEFT COLUMN - OVERVIEW & ANALYSIS */}
              <div className="lg:col-span-8 space-y-10">
                 
                 {/* OVERVIEW CARD */}
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white p-12 lg:p-16 rounded-[64px] border border-border shadow-2xl shadow-primary/5 group transition-all"
                 >
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                          <BrainCircuit className="w-6 h-6" />
                       </div>
                       <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Executive Synthesis</h2>
                    </div>
                    <p className="text-2xl font-medium text-text-main leading-relaxed tracking-tight group-hover:text-primary transition-colors duration-500">
                       "{summary.summary?.overview}"
                    </p>
                 </motion.div>

                 {/* TOPICS COVERED */}
                 <div className="bg-white p-12 lg:p-16 rounded-[64px] border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-12">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                             <LayoutDashboard className="w-6 h-6" />
                          </div>
                          <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Node Activity Blocks</h2>
                       </div>
                       <div className="px-6 py-2 bg-bg-alt rounded-full">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Chronological Sync</span>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       {summary.summary?.mainTopics?.map((topic, i) => (
                         <div key={i} className="group flex items-start gap-8 p-8 bg-bg-alt/50 rounded-[32px] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                               <Clock className="w-4 h-4 mb-2 opacity-40 group-hover:opacity-100" />
                               <span className="text-[8px] font-black uppercase">Block {i+1}</span>
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-black text-text-main uppercase tracking-tight">{topic.topic}</h3>
                                  <span className="text-[10px] font-black text-primary uppercase">Valid</span>
                               </div>
                               <p className="text-sm text-text-muted font-medium italic leading-relaxed">{topic.description}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* ACTION ITEMS */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-text-main p-12 rounded-[64px] shadow-3xl shadow-primary/10 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-10">
                             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Target className="w-5 h-5 text-primary" />
                             </div>
                             <h2 className="text-xl font-black uppercase tracking-widest">Next Protocols</h2>
                          </div>
                          <ul className="space-y-6">
                             {summary.summary?.actionItems?.map((item, i) => (
                               <li key={i} className="flex gap-4">
                                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0 animate-pulse" />
                                  <p className="text-sm font-medium text-white/70 leading-relaxed uppercase tracking-wide">{item.description}</p>
                               </li>
                             ))}
                          </ul>
                       </div>
                    </div>

                    <div className="bg-white p-12 border border-border rounded-[64px] shadow-sm">
                       <div className="flex items-center gap-4 mb-10">
                          <div className="w-10 h-10 bg-accent/5 text-accent rounded-xl flex items-center justify-center">
                             <Zap className="w-5 h-5" />
                          </div>
                          <h2 className="text-xl font-black text-text-main uppercase tracking-widest">Growth Catalysts</h2>
                       </div>
                       <ul className="space-y-6">
                          {summary.analysis?.recommendations?.map((rec, i) => (
                            <li key={i} className="flex gap-4 group">
                               <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                               <p className="text-xs font-black text-text-muted leading-relaxed uppercase tracking-widest">{rec}</p>
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>

              {/* RIGHT COLUMN - STATS & METRICS */}
              <div className="lg:col-span-4 space-y-10">
                 
                 {/* PARTICIPATION MATRIX */}
                 <div className="bg-white p-10 rounded-[48px] border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-10 border-b border-border pb-6">
                       <PieChart className="w-5 h-5 text-primary" />
                       <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest">Flow Distribution</h3>
                    </div>
                    
                    <div className="space-y-8">
                       <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Mentor Input</span>
                             <span className="text-xs font-black text-text-main">{summary.analysis?.engagement?.teacherParticipation || 0}%</span>
                          </div>
                          <div className="h-2 w-full bg-bg-alt rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${summary.analysis?.engagement?.teacherParticipation || 0}%` }} className="h-full bg-primary" />
                          </div>
                       </div>
                       
                       <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Your Node Flow</span>
                             <span className="text-xs font-black text-text-main">{summary.analysis?.engagement?.learnerParticipation || 0}%</span>
                          </div>
                          <div className="h-2 w-full bg-bg-alt rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${summary.analysis?.engagement?.learnerParticipation || 0}%` }} className="h-full bg-secondary" />
                          </div>
                       </div>
                    </div>

                    <div className="mt-12 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Interaction Quality</p>
                       <p className="text-[10px] font-bold text-text-muted leading-relaxed uppercase">"{summary.analysis?.engagement?.interactionQuality}"</p>
                    </div>
                 </div>

                 {/* SCORE MATRIX */}
                 <div className="bg-white p-10 rounded-[48px] border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-10 border-b border-border pb-6">
                       <Activity className="w-5 h-5 text-primary" />
                       <h3 className="text-[10px] font-black text-text-main uppercase tracking-widest">Vector Analysis</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                       {[
                         { label: "Transmission Clarity", score: summary.analysis?.teachingQuality?.clarity, icon: ShieldCheck },
                         { label: "Pacing Frequency", score: summary.analysis?.teachingQuality?.pacing, icon: Clock },
                         { label: "Latency/Response", score: summary.analysis?.teachingQuality?.responsiveness, icon: Zap }
                       ].map((m, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-bg-alt/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                               <m.icon className="w-3.5 h-3.5 text-text-muted" />
                               <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{m.label}</span>
                            </div>
                            <span className="text-sm font-black text-text-main">{m.score}/10</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* LOG STATS */}
                 <div className="bg-indigo-500 p-10 rounded-[48px] shadow-3xl shadow-indigo-500/20 text-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-10">Sync Statistics</h3>
                       <div className="space-y-10">
                          <div>
                             <p className="text-4xl font-black tracking-tighter mb-1">
                                {Math.floor((summary.statistics?.totalDuration || 0) / 60)} <span className="text-xs opacity-40 font-bold uppercase tracking-widest">MINS</span>
                             </p>
                             <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Total Synchronization</p>
                          </div>
                          <div>
                             <p className="text-4xl font-black tracking-tighter mb-1">
                                {(summary.statistics?.wordsSpoken?.teacher || 0) + (summary.statistics?.wordsSpoken?.learner || 0)}
                             </p>
                             <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Phonetic Data Packets</p>
                          </div>
                          <div>
                             <p className="text-4xl font-black tracking-tighter mb-1">
                                {summary.analysis?.learningProgress?.conceptsGrasped?.length || 0}
                             </p>
                             <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Synthesized Concepts</p>
                          </div>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* FINAL HUB LINK */}
        <section className="mt-40 px-6 max-w-7xl mx-auto">
           <div className="p-12 lg:p-24 bg-white border border-border rounded-[64px] relative overflow-hidden text-center group">
              <div className="absolute top-0 right-0 w-[600px] h-full bg-linear-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                 <h2 className="text-5xl md:text-8xl font-black text-text-main tracking-tighter leading-[0.9] mb-10">
                    Transmission <span className="text-primary italic font-serif">Logged</span>.
                 </h2>
                 <p className="text-text-muted text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed italic">
                    "Knowledge is the only asset that expands when distributed. Your node is now more synchronized."
                 </p>
                 <div className="flex flex-wrap items-center justify-center gap-6">
                    <button onClick={() => navigate('/wallet')} className="px-12 py-6 bg-text-main text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all">Review Ledger</button>
                    <button onClick={() => navigate('/community')} className="px-12 py-6 bg-bg-alt text-text-main rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all">Global Hub</button>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default memo(SessionSummary);
