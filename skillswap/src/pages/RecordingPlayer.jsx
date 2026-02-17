import { useState, useEffect, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { toast } from 'react-toastify';
import { recordingAPI } from '../services/api';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Eye,
  Zap,
  ShieldCheck,
  ChevronRight,
  Info,
  Maximize2,
  Settings,
  Monitor,
  HardDrive,
  UserCheck,
  History,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RecordingPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recording, setRecording] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchRecording();
  }, [id]);

  const fetchRecording = async () => {
    try {
      setLoading(true);
      const res = await recordingAPI.getRecording(id);
      const recData = res.data.recording;
      setRecording(recData);

      const pbRes = await recordingAPI.getPlaybackUrl(id, recData.accessToken);
      setPlaybackUrl(pbRes.data.playbackUrl);
    } catch {
      toast.error('Signal Lost: Could not retrieve playback stream');
      navigate('/recordings');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
         <div className="relative w-20 h-20 mb-8 text-primary">
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-t-primary rounded-full" />
         </div>
         <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Initializing Playback Engine...</p>
      </div>
    );
  }

  if (!recording || !playbackUrl) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
         <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-8">
            <Zap className="w-10 h-10" />
         </div>
         <p className="text-2xl font-black text-white mb-8 tracking-tighter uppercase">Signal Signature Inaccessible</p>
         <button onClick={() => navigate('/recordings')} className="px-10 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Return to Archive</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans overflow-x-hidden">
      {/* HEADER DECK */}
      <header className="px-8 py-8 lg:px-12 bg-linear-to-b from-black/80 to-transparent z-[100] fixed top-0 left-0 w-full pointer-events-none">
         <div className="max-w-[1920px] mx-auto flex items-start justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="pointer-events-auto">
               <button onClick={() => navigate('/recordings')} className="group flex items-center gap-3 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.3em] mb-8 transition-all">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to History
               </button>
               
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                     <div className="px-5 py-2 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-full">
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">H-Sync Playback</span>
                     </div>
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{recording.skill} Protocol</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">{recording.title || 'Archived Intellectual Flow'}</h1>
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-end gap-4 pointer-events-auto">
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[32px] flex items-center gap-8">
                  <div className="text-right">
                     <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Signal Retention</p>
                     <p className="text-xl font-black text-white tracking-tighter">{formatDuration(recording.duration)}</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-8">
                     <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Node Accesses</p>
                     <p className="text-xl font-black text-white tracking-tighter">{recording.views || 0}</p>
                  </div>
                  <Monitor className="w-6 h-6 text-primary" />
               </div>
            </motion.div>
         </div>
      </header>

      {/* CINEMATIC PLAYER */}
      <main className="flex-1 flex flex-col pt-48 pb-12 px-8 lg:px-12">
         <div className="max-w-[1920px] mx-auto w-full flex-1 flex flex-col lg:flex-row gap-10">
            
            {/* STAGE AREA */}
            <div className="flex-1 flex flex-col h-full">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 className="relative w-full aspect-video bg-zinc-900 rounded-[48px] overflow-hidden shadow-3xl border border-white/5 group"
               >
                  <ReactPlayer
                    url={playbackUrl}
                    width="100%"
                    height="100%"
                    playing={playing}
                    controls
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    config={{ file: { attributes: { controlsList: 'nodownload', className: "object-cover" } } }}
                  />
                  {!playing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none group-hover:bg-black/20 transition-all duration-700">
                       <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center text-primary shadow-2xl scale-110 group-hover:scale-125 transition-transform duration-500">
                          <Zap className="w-12 h-12 fill-current" />
                       </div>
                    </div>
                  )}
               </motion.div>
            </div>

            {/* SIDEBAR METADATA */}
            <aside className="w-full lg:w-[400px] flex flex-col gap-8">
               
               {/* NODE ARCHIVE CARD */}
               <motion.div 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-zinc-900/50 backdrop-blur-3xl border border-white/5 p-10 rounded-[48px] flex flex-col"
               >
                  <div className="flex items-center gap-3 mb-12">
                     <History className="w-5 h-5 text-primary" />
                     <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Signal Metadata</h3>
                  </div>
                  
                  <div className="space-y-10">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 shrink-0">
                           <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Index timestamp</p>
                           <p className="text-sm font-black text-white uppercase tracking-tighter">{recording.scheduledAt ? format(new Date(recording.scheduledAt), 'MMMM d, yyyy') : 'N/A'}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 shrink-0">
                           <Maximize2 className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Resolution Protocol</p>
                           <p className="text-sm font-black text-white uppercase tracking-tighter">{recording.resolution || 'Quantum HD'}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 shrink-0">
                           <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Signal Payload</p>
                           <p className="text-sm font-black text-white uppercase tracking-tighter">{(recording.fileSize / (1024 * 1024)).toFixed(2)} MB Sync</p>
                        </div>
                     </div>
                  </div>

                  {recording.description && (
                    <div className="mt-12 pt-10 border-t border-white/5">
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Subject Description</p>
                       <p className="text-sm font-medium text-white/60 leading-relaxed italic">"{recording.description}"</p>
                    </div>
                  )}
               </motion.div>

               {/* PARTICIPANT NODES */}
               <div className="bg-primary/5 border border-primary/10 p-10 rounded-[48px] space-y-8">
                  <div className="flex items-center gap-3">
                     <UserCheck className="w-5 h-5 text-primary" />
                     <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Authorized Nodes</h3>
                  </div>
                  
                  <div className="space-y-6">
                     {recording.teacher && (
                       <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-lg font-black shrink-0 transition-transform group-hover:rotate-6">
                             {recording.teacher.avatar ? <img src={recording.teacher.avatar} className="w-full h-full object-cover rounded-2xl" /> : recording.teacher.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white leading-none mb-1 group-hover:text-primary transition-colors">{recording.teacher.name}</p>
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Senior Mentor Node</p>
                          </div>
                       </div>
                     )}
                     {recording.learner && (
                       <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 text-lg font-black shrink-0 transition-transform group-hover:rotate-6">
                             {recording.learner.avatar ? <img src={recording.learner.avatar} className="w-full h-full object-cover rounded-2xl" /> : recording.learner.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white leading-none mb-1 group-hover:text-primary transition-colors">{recording.learner.name}</p>
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Subscriber Node</p>
                          </div>
                       </div>
                     )}
                  </div>
               </div>

               {/* QUICK LINKS */}
               <div className="flex gap-4">
                  <button onClick={() => navigate(`/sessions/${recording.session?._id}`)} className="flex-1 px-8 py-5 bg-white text-text-main rounded-2xl text-[8px] font-black uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all">Node Intel</button>
                  <button onClick={() => navigate('/chat')} className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Open Comms</button>
               </div>

            </aside>
         </div>
      </main>

      <Footer />
      
      <style>{`
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8); }
      `}`</style>
    </div>
  );
};

export default memo(RecordingPlayer);
