import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { recordingAPI } from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  Play,
  Trash2,
  Clock,
  Calendar,
  Users,
  Search,
  Filter,
  BarChart3,
  HardDrive,
  Eye,
  ChevronRight,
  TrendingUp,
  History,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Activity,
  LayoutDashboard
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ready'); // ready, processing, all
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecordings();
    fetchStats();
  }, [filter]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await recordingAPI.getRecordings({
        status: filter === 'all' ? undefined : filter,
        limit: 50
      });
      setRecordings(response.data.recordings || []);
    } catch (error) {
      toast.error('Sync failed: Could not retrieve footage database');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await recordingAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this evidence? This action is permanent and irreversible.')) return;
    try {
      await recordingAPI.deleteRecording(id);
      toast.success('Footage Purged');
      fetchRecordings();
      fetchStats();
    } catch {
      toast.error('Purge Failed');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />

      <main className="flex-1 pb-40">
        {/* PREMIUM HERO */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
           <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
           
           <div className="max-w-7xl mx-auto relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-border shadow-xl rounded-full mb-10 group">
                    <div className="w-6 h-6 bg-text-main rounded-full flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
                       <History className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">Session Echo Archive</span>
                 </div>
                 
                 <h1 className="text-7xl md:text-9xl font-black text-text-main tracking-tighter leading-[0.8] mb-8">
                    Footage<br />
                    <span className="text-primary italic font-serif">Library</span> Archive.
                 </h1>
                 <p className="text-xl text-text-muted font-medium max-w-xl leading-relaxed">
                    Review your high-definition session recordings. Every intellectual exchange, indexed and ready for re-broadcast.
                 </p>
              </motion.div>
           </div>
        </section>

        {/* METRICS FEEDEER */}
        <section className="px-6 mb-20 max-w-7xl mx-auto">
           {stats && (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Archived Logs", val: stats.totalRecordings, icon: HardDrive, color: "text-primary" },
                  { label: "Global Views", val: stats.totalViews, icon: Eye, color: "text-indigo-500" },
                  { label: "Total Airtime", val: `${stats.totalDurationHours}h`, icon: Clock, color: "text-emerald-500" },
                  { label: "Grid Storage", val: `${stats.totalSizeGB}GB`, icon: BarChart3, color: "text-accent" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[40px] border border-border flex items-center justify-between hover:shadow-2xl hover:shadow-primary/5 transition-all"
                  >
                     <div>
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
                        <p className={`text-4xl font-black tracking-tighter ${s.color}`}>{s.val}</p>
                     </div>
                     <s.icon className={`w-8 h-8 ${s.color} opacity-20`} />
                  </motion.div>
                ))}
             </div>
           )}
        </section>

        {/* CONTROLS */}
        <section className="px-6 mb-12 max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white border border-border rounded-[32px] shadow-sm">
              <div className="flex items-center gap-2">
                 {['ready', 'processing', 'all'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        filter === f ? 'bg-text-main text-white shadow-xl scale-105' : 'bg-bg-alt text-text-muted hover:bg-border'
                      }`}
                    >
                       {f}
                    </button>
                 ))}
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64 text-text-muted">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="SKU Search..." 
                      className="w-full pl-12 pr-4 py-3 bg-bg-alt rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-primary transition-all text-text-main"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* RECORDINGS GRID */}
        <section className="px-6 mx-auto max-w-7xl">
           {loading ? (
             <div className="py-32 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Syncing Flux Records...</p>
             </div>
           ) : recordings.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center bg-white rounded-[64px] border border-border">
                <div className="w-24 h-24 bg-bg-alt rounded-[40px] flex items-center justify-center mx-auto mb-8 text-text-muted/30">
                   <Activity className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-text-main mb-3 tracking-tighter">No Recorded Pulses</h3>
                <p className="text-text-muted font-medium italic mb-12">"Your archive is currently in silent mode."</p>
                <Link to="/sessions" className="px-12 py-5 bg-text-main text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all">Go to Live Hub</Link>
             </motion.div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {recordings.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white rounded-[48px] overflow-hidden border border-border hover:shadow-3xl hover:shadow-primary/10 transition-all flex flex-col"
                  >
                     {/* THUMBNAIL */}
                     <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                        {r.thumbnailUrl ? (
                          <img src={r.thumbnailUrl} className="w-full h-full object-cover grayscale-0 group-hover:grayscale-[0.4] group-hover:scale-110 transition-all duration-1000" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/5">
                             <Play className="w-20 h-20 fill-current" />
                          </div>
                        )}
                        
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/80 to-transparent flex items-center justify-between">
                           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span className="text-[8px] font-black text-white uppercase tracking-widest">{formatDuration(r.duration)}</span>
                           </div>
                           <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                             r.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                             'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                           }`}>
                              {r.status}
                           </div>
                        </div>

                        {r.status === 'ready' && (
                          <Link 
                            to={`/recordings/${r._id}`}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 backdrop-blur-sm"
                          >
                             <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-primary shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                                <Play className="w-8 h-8 fill-current" />
                             </div>
                          </Link>
                        )}
                     </div>

                     {/* CONTENT */}
                     <div className="p-10 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">Session Key:</span>
                           <span className="text-[8px] font-black text-primary uppercase tracking-widest">{r._id.substr(0, 12)}</span>
                        </div>
                        <h3 className="text-xl font-black text-text-main uppercase tracking-tight mb-8 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{r.title || 'Spectral Transmission Log'}</h3>
                        
                        <div className="grid grid-cols-2 gap-6 mb-10 mt-auto">
                           <div>
                              <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Index Date</p>
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-3.5 h-3.5 text-primary" />
                                 <p className="text-[10px] font-black text-text-main uppercase tracking-widest">{r.scheduledAt ? format(new Date(r.scheduledAt), 'MMM d, yy') : 'N/A'}</p>
                              </div>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Node Reach</p>
                              <div className="flex items-center gap-2">
                                 <Eye className="w-3.5 h-3.5 text-primary" />
                                 <p className="text-[10px] font-black text-text-main uppercase tracking-widest">{r.views || 0} Pulses</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-border">
                           <div className="w-8 h-8 rounded-full bg-bg-alt flex items-center justify-center text-[10px] font-black text-text-muted">
                              {r.teacher?.name?.charAt(0)}
                           </div>
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex-1">Participated with <span className="text-text-main">{r.teacher?.name}</span></p>
                           <button onClick={() => handleDelete(r._id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </motion.div>
                ))}
             </div>
           )}
        </section>

        {/* SYSTEM CTA */}
        <section className="mt-40 px-6 max-w-7xl mx-auto">
           <div className="p-12 lg:p-24 bg-text-main rounded-[64px] relative overflow-hidden text-center group">
              <div className="absolute top-0 right-0 w-[800px] h-full bg-linear-to-bl from-white/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                 <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-10">
                    Live <span className="text-primary italic font-serif">Signals</span> Active.
                 </h2>
                 <p className="text-white/40 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed italic">
                    "Historical logs are valuable, but real-time flow is the source of all evolution."
                 </p>
                 <div className="flex flex-wrap items-center justify-center gap-6">
                    <button onClick={() => navigate('/home')} className="px-12 py-6 bg-primary text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all">Broadcast Search</button>
                    <button onClick={() => navigate('/sessions')} className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Active Queue</button>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default memo(Recordings);
