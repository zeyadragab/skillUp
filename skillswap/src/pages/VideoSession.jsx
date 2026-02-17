import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { toast } from "react-toastify";
import { sessionAPI, recordingAPI } from "../services/api";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  CircleDot,
  Settings,
  Clock,
  Maximize2,
  Minimize2,
  Users,
  ShieldCheck,
  Zap,
  MoreHorizontal,
  Info,
  ChevronRight,
  ShieldAlert,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VideoSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Refs
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);

  // Session state
  const [session, setSession] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracks
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);

  // Controls state
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Initialize Agora client
  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    return () => {
      if (clientRef.current) clientRef.current.leave();
    };
  }, []);

  // Join session and get Agora credentials
  useEffect(() => {
    const joinSession = async () => {
      try {
        const response = await sessionAPI.join(sessionId);
        setSession(response.session);
        setCredentials(response.videoCredentials);

        const sessionEnd = new Date(response.session.scheduledAt).getTime() + response.session.duration * 60 * 1000;
        const remaining = sessionEnd - Date.now();
        setTimeRemaining(Math.max(0, Math.floor(remaining / 1000)));

        setLoading(false);
      } catch (error) {
        toast.error("Access Window Expired or Invalid Protocol");
        navigate("/sessions");
      }
    };
    joinSession();
  }, [sessionId, navigate]);

  // Create local tracks and join channel
  useEffect(() => {
    if (!credentials || joined) return;
    const initializeAgora = async () => {
      try {
        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack(),
        ]);

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        if (localVideoRef.current) videoTrack.play(localVideoRef.current);

        await clientRef.current.join(
          credentials.appId,
          credentials.channelName,
          credentials.rtcToken,
          parseInt(credentials.userId)
        );

        await clientRef.current.publish([audioTrack, videoTrack]);
        setJoined(true);
      } catch (error) {
        toast.error("Hardware Protocol Failure: Check Camera/Mic Permissions");
      }
    };
    initializeAgora();
  }, [credentials, joined]);

  // Handle remote users
  useEffect(() => {
    if (!clientRef.current) return;
    const handleUserPublished = async (user, mediaType) => {
      await clientRef.current.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteUsers((prev) => prev.find(u => u.uid === user.uid) ? prev : [...prev, user]);
      }
      if (mediaType === "audio") user.audioTrack?.play();
    };
    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === "video") setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };
    const handleUserLeft = (user) => setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));

    clientRef.current.on("user-published", handleUserPublished);
    clientRef.current.on("user-unpublished", handleUserUnpublished);
    clientRef.current.on("user-left", handleUserLeft);

    return () => {
      clientRef.current.off("user-published", handleUserPublished);
      clientRef.current.off("user-unpublished", handleUserUnpublished);
      clientRef.current.off("user-left", handleUserLeft);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!joined) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [joined]);

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(micMuted);
      setMicMuted(!micMuted);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(cameraOff);
      setCameraOff(!cameraOff);
    }
  };

  const startRecording = async () => {
    try {
      await recordingAPI.startRecording(sessionId);
      setIsRecording(true);
      toast.success("AI Session Logging Started");
    } catch {
      toast.error("Logger Sync Failed");
    }
  };

  const stopRecording = async () => {
    try {
      await recordingAPI.stopRecording(sessionId);
      setIsRecording(false);
      toast.info("Logger Finalizing... Data being synced to cloud.");
    } catch {
      toast.error("Logger Sync Error");
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
        await clientRef.current.unpublish([localVideoTrack]);
        await clientRef.current.publish([screenTrack]);
        setScreenSharing(true);
      } else {
        await clientRef.current.unpublish();
        await clientRef.current.publish([localVideoTrack, localAudioTrack]);
        setScreenSharing(false);
      }
    } catch {
      toast.error("Screen Transfer Interrupted");
    }
  };

  const handleEndSession = async () => {
    try {
      if (isRecording) await stopRecording();
      if (joined && clientRef.current) {
        await clientRef.current.leave();
        localVideoTrack?.close();
        localAudioTrack?.close();
      }
      navigate(`/sessions/${sessionId}/summary`);
    } catch {
      navigate("/sessions");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
         <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-t-primary rounded-full" />
         </div>
         <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Initializing Signal...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-sans">
      {/* TOP DECK - SYSTEM STATUS */}
      <header className="fixed top-0 left-0 w-full z-[100] p-6 lg:p-8 pointer-events-none">
         <div className="max-w-[1920px] mx-auto flex items-start justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
               <div className="flex items-center gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-3xl pointer-events-auto">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group">
                     <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                     <h1 className="text-xs font-black text-white uppercase tracking-widest">{session?.skill}</h1>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Protocol Stream: {sessionId.substr(0, 8)}</p>
                  </div>
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-end gap-3">
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-3xl pointer-events-auto flex items-center gap-4">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Signal Remaining</p>
                     <p className={`text-2xl font-black tracking-tighter ${timeRemaining < 300 ? "text-red-500 animate-pulse" : "text-white"}`}>{formatTime(timeRemaining)}</p>
                  </div>
                  <Clock className={`w-6 h-6 ${timeRemaining < 300 ? "text-red-500" : "text-white/40"}`} />
               </div>
               
               {isRecording && (
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full pointer-events-auto">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Neural Logging Active</span>
                 </motion.div>
               )}
            </motion.div>
         </div>
      </header>

      {/* MAIN SIGNAL GRID */}
      <main className="flex-1 relative bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05),transparent)]">
         <div className={`h-full w-full p-6 lg:p-12 transition-all duration-700 grid gap-6 ${
           remoteUsers.length > 0 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
         }`}>
            {/* LOCAL SIGNAL */}
            <motion.div 
               layout
               className="relative rounded-[48px] overflow-hidden bg-white/5 border border-white/10 group shadow-2xl"
            >
               {localVideoTrack && !cameraOff ? (
                 <div ref={localVideoRef} className="w-full h-full object-cover grayscale-0 group-hover:grayscale-[0.2] transition-all duration-1000" />
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                    <div className="w-40 h-40 bg-white/5 rounded-[60px] flex items-center justify-center text-white/10 mb-6">
                       <VideoOff className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Signal Dormant</p>
                 </div>
               )}
               
               <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${cameraOff ? "bg-red-500" : "bg-emerald-500"}`} />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">You (Alpha Node)</span>
                  </div>
                  {micMuted && (
                    <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                       <MicOff className="w-4 h-4" />
                    </div>
                  )}
               </div>
            </motion.div>

            {/* REMOTE SIGNALs */}
            {remoteUsers.map((user) => (
              <motion.div
                key={user.uid}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[48px] overflow-hidden bg-white/5 border border-white/10 group shadow-2xl"
              >
                <div
                  ref={(ref) => ref && user.videoTrack?.play(ref)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 flex items-center gap-4">
                   <div className="px-6 py-3 bg-primary/20 backdrop-blur-3xl border border-primary/30 rounded-3xl flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">
                         {user.uid === credentials?.teacherId ? "Senior Mentor" : "External Learner"}
                      </span>
                   </div>
                </div>
              </motion.div>
            ))}

            {/* WAITING STATE */}
            {remoteUsers.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:absolute lg:inset-0 lg:m-12 relative h-full rounded-[48px] bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center border-dashed">
                 <div className="w-24 h-24 border-2 border-primary/20 rounded-full flex items-center justify-center animate-spin-slow mb-8">
                    <Target className="w-8 h-8 text-primary/40" />
                 </div>
                 <h3 className="text-3xl font-black text-white/20 tracking-tighter uppercase mb-3">Awaiting Handshake</h3>
                 <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Synchronizing Nexus Protocols...</p>
                 
                 <div className="absolute bottom-12 flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                    <Info className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-bold text-white/40 max-w-[200px] leading-relaxed uppercase">
                       A notification has been broadcast to all authorized nodes. Use the chat hub to ping participants.
                    </p>
                 </div>
              </motion.div>
            )}
         </div>
      </main>

      {/* FLOATING COMMAND DECK */}
      <footer className="fixed bottom-0 left-0 w-full p-8 flex justify-center pointer-events-none z-[100]">
         <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="flex items-center gap-4 bg-zinc-900 p-3 rounded-[32px] border border-white/10 shadow-3xl pointer-events-auto"
         >
            {/* Audio Toggle */}
            <button 
              onClick={toggleMic}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                micMuted ? "bg-red-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
               {micMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Video Toggle */}
            <button 
              onClick={toggleCamera}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                cameraOff ? "bg-red-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
               {cameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>

            <div className="w-px h-8 bg-white/10 mx-2" />

            {/* Sharing Tools */}
            <button 
              onClick={toggleScreenShare}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                screenSharing ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
               <Monitor className="w-6 h-6" />
            </button>

            <button 
              onClick={() => setShowChat(!showChat)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                showChat ? "bg-indigo-500 text-white" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
               <MessageSquare className="w-6 h-6" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-2" />

            {/* Neural Log Tool */}
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-8 h-14 rounded-2xl flex items-center gap-3 transition-all ${
                isRecording ? "bg-red-500 text-white animate-pulse" : "bg-primary/20 text-primary border border-primary/20"
              }`}
            >
               <CircleDot className={`w-4 h-4 ${isRecording ? "fill-white" : ""}`} />
               <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">AI Logging</span>
            </button>

            <div className="w-px h-8 bg-white/10 mx-2" />

            {/* End Protoocl */}
            <button 
              onClick={handleEndSession}
              className="w-16 h-16 bg-red-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-red-600/20 hover:scale-110 active:scale-90 transition-all"
            >
               <PhoneOff className="w-8 h-8" />
            </button>
         </motion.div>
      </footer>

      {/* CHAT HUD OVERLAY */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 w-full max-w-sm h-full bg-zinc-900 border-l border-white/10 z-[200] flex flex-col p-8"
          >
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                      <MessageSquare className="w-5 h-5" />
                   </div>
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Protocol Chat</h3>
                </div>
                <button onClick={() => setShowChat(false)} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40">
                   <ChevronRight className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-6 pb-24 no-scrollbar">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                   <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">System Voice</span>
                   </div>
                   <p className="text-xs text-white/60 leading-relaxed font-medium">Neural recording has started. All voice interactions are being indexed for the session summary. Protocol active.</p>
                </div>
             </div>

             <div className="absolute bottom-8 left-8 right-8">
                <div className="relative">
                   <input type="text" placeholder="Transmit signal..." className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all" />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-text-main rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-primary transition-all">
                      <Zap className="w-4 h-4 fill-current" />
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default memo(VideoSession);
