import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { sessionAPI, recordingAPI } from "../services/api";
import { useUser } from "../components/context/UserContext";
import SessionChat from "../components/session/SessionChat";
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
  Target,
  AlertTriangle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VideoSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const currentUserId = (user?.id || user?._id)?.toString() || '';
  const currentUserName = user?.name || user?.username || 'You';

  // Refs
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const socketRef = useRef(null);
  const showChatRef = useRef(false);

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

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Bad-word detection alert state
  const [badWordAlert, setBadWordAlert] = useState(null); // { warning, flaggedWords }
  const badWordDismissTimer = useRef(null);
  const pendingMessageRef = useRef(null); // optimistic message text awaiting server echo

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Keep showChatRef in sync to avoid stale closures in socket callback
  useEffect(() => { showChatRef.current = showChat; }, [showChat]);

  // Socket.io session chat connection
  useEffect(() => {
    if (!sessionId || !currentUserId) return;
    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('join-session-chat', { sessionId, userId: currentUserId, userName: currentUserName });
    socketRef.current.on('session-chat-message', (data) => {
      // If this echo matches the pending optimistic message, it was not flagged — clear it
      if (pendingMessageRef.current && data.userId === currentUserId) {
        pendingMessageRef.current = null;
      }
      setChatMessages((prev) => [...prev, data]);
      if (!showChatRef.current && data.userId !== currentUserId) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socketRef.current.on('bad-word-detected', ({ flaggedWords, warning }) => {
      // Drop the optimistic message that was held back — server rejected it
      pendingMessageRef.current = null;
      // Show the inline alert
      setBadWordAlert({ warning, flaggedWords: flaggedWords || [] });
      // Auto-dismiss after 5 seconds
      if (badWordDismissTimer.current) clearTimeout(badWordDismissTimer.current);
      badWordDismissTimer.current = setTimeout(() => {
        setBadWordAlert(null);
        badWordDismissTimer.current = null;
      }, 5000);
    });

    return () => {
      if (badWordDismissTimer.current) clearTimeout(badWordDismissTimer.current);
      socketRef.current?.emit('leave-session-chat', { sessionId, userId: currentUserId, userName: currentUserName });
      socketRef.current?.disconnect();
    };
  }, [sessionId, currentUserId]);

  const handleSendChatMessage = useCallback((messageText) => {
    if (!messageText.trim() || !socketRef.current) return;
    // Store message so we can suppress it if bad-word-detected arrives before server echo
    pendingMessageRef.current = messageText.trim();
    socketRef.current.emit('session-chat-message', {
      sessionId,
      message: messageText,
      userId: currentUserId,
      userName: currentUserName,
    });
  }, [sessionId, currentUserId, currentUserName]);

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

        const sessionEnd =
          new Date(response.session.scheduledAt).getTime() +
          response.session.duration * 60 * 1000;
        const remaining = sessionEnd - Date.now();
        setTimeRemaining(Math.max(0, Math.floor(remaining / 1000)));

        setLoading(false);
      } catch (error) {
        toast.error("Session access expired or invalid");
        navigate("/sessions");
      }
    };
    joinSession();
  }, [sessionId, navigate]);

  // Create local tracks and join channel
  useEffect(() => {
    if (!credentials || joined) return;
    const initializeAgora = async () => {
      const handleUserPublished = async (user, mediaType) => {
        try {
          await clientRef.current.subscribe(user, mediaType);
          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              const exists = prev.find((u) => u.uid === user.uid);
              return exists
                ? prev.map((u) => (u.uid === user.uid ? user : u))
                : [...prev, user];
            });
          }
          if (mediaType === "audio") user.audioTrack?.play();
        } catch (error) {
          console.error(`Failed to subscribe to user ${user.uid} (${mediaType}):`, error);
        }
      };
      const handleUserUnpublished = (user, mediaType) => {
        if (mediaType === "video")
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      };
      const handleUserLeft = (user) =>
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));

      try {
        clientRef.current.on("user-published", handleUserPublished);
        clientRef.current.on("user-unpublished", handleUserUnpublished);
        clientRef.current.on("user-left", handleUserLeft);

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
          parseInt(credentials.userId),
        );

        await clientRef.current.publish([audioTrack, videoTrack]);
        setJoined(true);
      } catch (error) {
        toast.error("Media Access Error: Please check camera and microphone permissions");
      }
    };
    initializeAgora();
  }, [credentials, joined]);

  // Replay remote video tracks if videoTrack arrives after the div mounts
  useEffect(() => {
    remoteUsers.forEach((user) => {
      const container = remoteVideoRefs.current[user.uid];
      if (container && user.videoTrack && !user.videoTrack.isPlaying) {
        try {
          user.videoTrack.play(container);
        } catch (error) {
          console.error(`Failed to play video for user ${user.uid}:`, error);
        }
      }
    });
  }, [remoteUsers]);

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
      toast.success("Recording started");
    } catch {
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      await recordingAPI.stopRecording(sessionId);
      setIsRecording(false);
      toast.info("Recording saved and being processed");
    } catch {
      toast.error("Error stopping recording");
    }
  };

  const screenTrackRef = useRef(null);

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        // Create screen track
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
        screenTrackRef.current = screenTrack;

        // Handle native "Stop Sharing" button in browser
        screenTrack.on("track-ended", () => {
          stopScreenShare();
        });

        // Unpublish camera, publish screen
        if (localVideoTrack) {
          await clientRef.current.unpublish([localVideoTrack]);
        }
        await clientRef.current.publish([screenTrack]);
        
        setScreenSharing(true);
        toast.info("Screen sharing active");
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error("Screen share error:", error);
      toast.error("Could not start screen share");
    }
  };

  const stopScreenShare = async () => {
    try {
      if (screenTrackRef.current) {
        await clientRef.current.unpublish([screenTrackRef.current]);
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }
      
      // Re-publish camera if it's supposed to be on
      if (localVideoTrack && !cameraOff) {
        await clientRef.current.publish([localVideoTrack]);
      }
      
      setScreenSharing(false);
      toast.info("Screen sharing stopped");
    } catch (error) {
      console.error("Stop screen share error:", error);
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
      const isMentor =
        session?.teacherId?.toString() === currentUserId ||
        session?.teacher?._id?.toString() === currentUserId ||
        session?.teacher?.toString() === currentUserId;
      navigate(isMentor ? `/sessions/${sessionId}/mentor-debrief` : `/sessions/${sessionId}/summary`);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0c]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-2 rounded-full border-white/5" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 rounded-full border-t-indigo-500"
          />
        </div>
        <p className="text-sm font-medium text-white/40 tracking-tight">
          Connecting to session...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-[#0a0a0c] text-white">
      {/* HEADER: COMPACT ON MOBILE */}
      <header className="fixed top-0 left-0 w-full z-[100] px-4 py-3 lg:px-6 lg:py-4 flex items-center justify-between pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 lg:gap-4 px-3 py-1.5 lg:px-4 lg:py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl lg:rounded-2xl pointer-events-auto"
        >
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-500/20 rounded-lg lg:rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-[11px] lg:text-sm font-semibold tracking-tight truncate max-w-[80px] lg:max-w-none">
              {session?.skill}
            </h1>
            <p className="text-[9px] lg:text-[11px] font-medium text-white/30 uppercase tracking-wider">
              Live
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          {isRecording && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-red-400 uppercase">Recording</span>
            </div>
          )}
          <div className="flex items-center gap-3 lg:gap-4 px-3 py-1.5 lg:px-4 lg:py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl lg:rounded-2xl pointer-events-auto">
            <div className="text-right">
              <p className="hidden lg:block text-[10px] font-bold text-white/30 uppercase tracking-tight">Remaining</p>
              <p className={`text-sm lg:text-lg font-bold tabular-nums ${timeRemaining < 300 ? "text-red-400" : "text-white"}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
            <Clock className={`w-4 h-4 lg:w-5 lg:h-5 ${timeRemaining < 300 ? "text-red-400" : "text-white/20"}`} />
          </div>
        </motion.div>
      </header>

      {/* MAIN VIDEO AREA */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden pt-16 pb-28 lg:pt-0 lg:pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_50%)]" />
        
        {/* MAIN VIDEO AREA: SCREEN SHARE (priority) > REMOTE > LOCAL */}
        <div className="w-full h-full max-w-[1600px] max-h-[900px] px-4 lg:px-12 flex items-center justify-center">
          {screenSharing && screenTrackRef.current ? (
            <div className="w-full h-full relative rounded-2xl lg:rounded-[32px] overflow-hidden bg-black border border-white/10 shadow-2xl">
              <div
                ref={(ref) => ref && screenTrackRef.current?.play(ref)}
                className="w-full h-full object-contain bg-zinc-900"
              />
              <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 flex items-center gap-3 px-3 py-1.5 lg:px-4 lg:py-2 bg-indigo-500/20 backdrop-blur-lg border border-indigo-500/30 rounded-lg lg:rounded-xl">
                <Monitor className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-indigo-400" />
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-wide text-indigo-400">
                  Sharing screen
                </span>
              </div>
            </div>
          ) : remoteUsers.length > 0 ? (
            <div className="w-full h-full relative rounded-2xl lg:rounded-[32px] overflow-hidden bg-black border border-white/5 shadow-2xl">
              {remoteUsers.map((user) => (
                <div
                  key={user.uid}
                  ref={(ref) => {
                    if (ref) {
                      remoteVideoRefs.current[user.uid] = ref;
                      try {
                        user.videoTrack?.play(ref);
                      } catch (error) {
                        console.error(`Failed to play video for user ${user.uid}:`, error);
                      }
                    } else {
                      delete remoteVideoRefs.current[user.uid];
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              ))}
              <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 flex items-center gap-3 px-3 py-1.5 lg:px-4 lg:py-2 bg-black/40 backdrop-blur-lg border border-white/10 rounded-lg lg:rounded-xl">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-wide">
                  Participant
                </span>
              </div>
            </div>
          ) : localVideoTrack && !cameraOff ? (
            <div className="w-full h-full relative rounded-2xl lg:rounded-[32px] overflow-hidden bg-black border border-white/5 shadow-2xl">
              <div
                ref={localVideoRef}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              <div className="absolute bottom-12 left-0 w-full flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest animate-pulse">
                    Waiting for others to join...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl lg:rounded-[32px] border-dashed p-8">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-500/5 rounded-full flex items-center justify-center mb-4 lg:mb-6">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-white/10" />
              </div>
              <p className="text-xs lg:text-sm font-medium text-white/30 tracking-tight text-center">
                Waiting for others to join...
              </p>
            </div>
          )}
        </div>

        {/* LOCAL VIDEO (PIP) - ONLY VISIBLE IF NOT IN MAIN VIEW */}
        <AnimatePresence>
          {(remoteUsers.length > 0 || screenSharing) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              drag
              dragConstraints={{ left: -300, right: 300, top: -500, bottom: 500 }}
              className="absolute bottom-32 right-4 lg:right-12 w-32 lg:w-64 aspect-video rounded-xl lg:rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-3xl cursor-grab active:cursor-grabbing z-50 group"
            >
              {screenSharing && remoteUsers.length > 0 ? (
                // While screen sharing, show remote user in PIP
                <div
                  ref={(ref) => {
                    if (ref && remoteUsers[0]?.videoTrack) {
                      try { remoteUsers[0].videoTrack.play(ref); } catch (_) {}
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              ) : screenSharing ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-500/10">
                  <Monitor className="w-4 h-4 lg:w-8 lg:h-8 text-indigo-500/40 mb-1 lg:mb-2" />
                  <span className="text-[8px] lg:text-[10px] font-bold text-indigo-500/40 uppercase">Sharing</span>
                </div>
              ) : localVideoTrack && !cameraOff ? (
                <div ref={localVideoRef} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                  <VideoOff className="w-4 h-4 lg:w-8 lg:h-8 text-white/10 mb-1 lg:mb-2" />
                  <span className="text-[8px] lg:text-[10px] font-bold text-white/20 uppercase">Off</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 flex items-center gap-1.5 lg:gap-2 px-1.5 py-0.5 lg:px-2.5 lg:py-1 bg-black/60 backdrop-blur-md rounded-md lg:rounded-lg">
                <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full ${screenSharing ? "bg-indigo-500 animate-pulse" : cameraOff ? "bg-red-500" : "bg-emerald-500"}`} />
                <span className="text-[8px] lg:text-[10px] font-bold text-white/80 uppercase">
                  {screenSharing ? "Sharing" : "You"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FLOATING CONTROL DOCK: ULTRA-COMPACT FOR MOBILE */}
      <footer className="fixed bottom-0 left-0 w-full p-3 lg:p-10 flex justify-center z-[200]">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 lg:gap-3 p-1.5 lg:p-2.5 bg-[#151518]/95 backdrop-blur-2xl border border-white/10 rounded-2xl lg:rounded-[28px] shadow-3xl"
        >
          <button
            onClick={toggleMic}
            className={`w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center transition-all ${
              micMuted ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {micMuted ? <MicOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Mic className="w-4 h-4 lg:w-5 lg:h-5" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center transition-all ${
              cameraOff ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cameraOff ? <VideoOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Video className="w-4 h-4 lg:w-5 lg:h-5" />}
          </button>

          <div className="w-px h-6 lg:h-8 mx-0.5 lg:mx-1 bg-white/5" />

          <button
            onClick={toggleScreenShare}
            className={`w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center transition-all ${
              screenSharing ? "bg-indigo-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>

          <button
            onClick={() => { setShowChat(!showChat); if (!showChat) setUnreadCount(0); }}
            className={`relative w-9 h-9 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center transition-all ${
              showChat ? "bg-indigo-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5" />
            {!showChat && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 lg:h-8 mx-0.5 lg:mx-1 bg-white/5" />

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center justify-center lg:gap-3 w-9 lg:w-auto lg:px-6 h-9 lg:h-12 rounded-lg lg:rounded-2xl transition-all ${
              isRecording ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
            }`}
          >
            {isRecording ? (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse lg:hidden" />
            ) : (
              <CircleDot className="w-4 h-4 lg:hidden" />
            )}
            <div className={`hidden lg:block w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-indigo-400/30"}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden lg:block">
              {isRecording ? "Stop" : "Record"}
            </span>
          </button>

          <div className="w-px h-6 lg:h-8 mx-0.5 lg:mx-1 bg-white/5" />

          <button
            onClick={handleEndSession}
            className="w-11 h-9 lg:w-14 lg:h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg lg:rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/10 transition-transform active:scale-95"
          >
            <PhoneOff className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </motion.div>
      </footer>

      {/* CHAT OVERLAY: RESPONSIVE WIDTH */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-[#0d0d0f] border-l border-white/5 z-[300] flex flex-col p-6 shadow-4xl"
          >
            {/* BAD-WORD ALERT BANNER */}
            <AnimatePresence>
              {badWordAlert && (
                <motion.div
                  key="bad-word-alert"
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="mb-3 rounded-xl border border-red-500/30 bg-red-950/60 backdrop-blur-sm px-4 py-3 flex flex-col gap-1.5"
                  role="alert"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[13px] font-semibold text-red-300 leading-snug">
                        Your message was flagged: {badWordAlert.warning}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (badWordDismissTimer.current) {
                          clearTimeout(badWordDismissTimer.current);
                          badWordDismissTimer.current = null;
                        }
                        setBadWordAlert(null);
                      }}
                      className="shrink-0 p-0.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
                      aria-label="Dismiss warning"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {badWordAlert.flaggedWords.length > 0 && (
                    <p className="text-[11px] text-white/40 leading-tight pl-6">
                      Flagged:{" "}
                      {badWordAlert.flaggedWords.map((word, i) => (
                        <span key={i} className="font-bold text-amber-400/80">
                          {word}{i < badWordAlert.flaggedWords.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <SessionChat
              messages={chatMessages}
              onSend={handleSendChatMessage}
              currentUserId={currentUserId}
              onClose={() => setShowChat(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .shadow-3xl { shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  );
};

export default memo(VideoSession);
