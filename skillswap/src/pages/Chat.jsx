import { useState, useEffect, useRef, memo } from "react";
import { useUser } from "../components/context/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  Search,
  MessageCircle,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Image,
  User,
  Clock,
  ChevronLeft,
  Zap,
  Sparkles
} from "lucide-react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";

const Chat = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const currentUserId = (user?.id || user?._id)?.toString();

  useEffect(() => {
    if (!user) return;
    socketRef.current = io("http://localhost:5000", { transports: ["websocket"] });
    socketRef.current.emit("join", currentUserId);
    socketRef.current.on("new-message", (data) => {
      const messageSenderId = typeof data.message.sender === 'object' ? data.message.sender._id : data.message.sender;
      if (selectedConversation && data.conversationId === selectedConversation._id && messageSenderId?.toString() !== currentUserId?.toString()) {
        setMessages((prev) => [...prev, data.message]);
      }
      fetchConversations();
    });
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [user, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        if (socketRef.current) socketRef.current.emit("join-conversation", conversationId);
      }
    } catch (error) { console.error(error); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;
    try {
      setSending(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: selectedConversation._id, content: newMessage.trim(), messageType: "text" }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        fetchConversations();
      }
    } catch (error) { console.error(error); } finally { setSending(false); }
  };

  const createConversation = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data.conversation);
        fetchMessages(data.conversation._id);
        fetchConversations();
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const userIdParam = searchParams.get("userId");
      if (userIdParam) createConversation(userIdParam);
    }
  }, [user]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find((p) => p._id !== currentUserId);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) { navigate("/signin"); return null; }

  return (
    <div className="h-screen bg-bg-alt flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex pt-[72px] relative overflow-hidden">
        {/* Sidebar: Conversations */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          absolute lg:relative z-30 w-full lg:w-[400px] h-full bg-white border-r border-border transition-transform duration-300 ease-in-out flex flex-col
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border">
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-text-main tracking-tight uppercase tracking-widest flex items-center gap-2">
                   <MessageCircle className="w-6 h-6 text-primary" />
                   Messages
                </h1>
                <div className="w-10 h-10 bg-bg-alt rounded-2xl flex items-center justify-center text-text-muted hover:text-primary transition-colors cursor-pointer">
                   <MoreVertical className="w-5 h-5" />
                </div>
             </div>
             
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-bg-alt border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
             </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                <div className="w-16 h-16 bg-bg-alt rounded-full flex items-center justify-center mb-4">
                   <Sparkles className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-[10px]">No echoes yet</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherUser = getOtherParticipant(conv);
                const isActive = selectedConversation?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 rounded-[28px] flex items-center gap-4 transition-all ${
                      isActive ? "bg-text-main text-white shadow-xl shadow-text-main/10" : "hover:bg-bg-alt bg-white"
                    }`}
                  >
                    <div className="relative shrink-0">
                       <img 
                        src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=7c3aed&color=fff`} 
                        className={`w-14 h-14 rounded-2xl object-cover grayscale transition-all ${isActive ? 'grayscale-0' : 'group-hover:grayscale-0'}`} 
                       />
                       {otherUser?.isOnline && (
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                       )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-black truncate text-sm uppercase tracking-wide ${isActive ? 'text-white' : 'text-text-main'}`}>
                           {otherUser?.name}
                        </h3>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-white/60' : 'text-text-muted'}`}>
                           {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-xs font-medium truncate ${isActive ? 'text-white/80' : 'text-text-muted'}`}>
                        {conv.lastMessage?.content || "No transmissions..."}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-[88px] px-6 border-b border-border flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setIsSidebarOpen(true)}
                     className="lg:hidden w-10 h-10 bg-bg-alt rounded-xl flex items-center justify-center text-text-main hover:text-primary transition-colors"
                   >
                      <ChevronLeft className="w-5 h-5" />
                   </button>
                   <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={getOtherParticipant(selectedConversation)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherParticipant(selectedConversation)?.name || 'User')}&background=7c3aed&color=fff`} 
                          className="w-12 h-12 rounded-2xl object-cover" 
                        />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <h3 className="font-black text-text-main text-sm uppercase tracking-widest">
                           {getOtherParticipant(selectedConversation)?.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Presence</p>
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button className="hidden sm:flex w-10 h-10 bg-bg-alt rounded-2xl items-center justify-center text-text-muted hover:text-primary transition-all"><Phone className="w-4 h-4" /></button>
                   <button className="hidden sm:flex w-10 h-10 bg-bg-alt rounded-2xl items-center justify-center text-text-muted hover:text-secondary transition-all"><Video className="w-4 h-4" /></button>
                   <button className="w-10 h-10 bg-bg-alt rounded-2xl flex items-center justify-center text-text-muted hover:text-accent transition-all"><Info className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-bg-alt/30 custom-scrollbar">
                <AnimatePresence mode='popLayout'>
                  {messages.map((message, idx) => {
                    const senderId = (typeof message.sender === 'object' ? message.sender._id : message.sender)?.toString();
                    const isOwn = senderId === currentUserId;
                    const showAvatar = idx === 0 || (messages[idx-1] && (typeof messages[idx-1].sender === 'object' ? messages[idx-1].sender._id : messages[idx-1].sender)?.toString() !== senderId);

                    return (
                      <motion.div
                        key={message._id || idx}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                           {!isOwn && (
                             <div className="w-8 h-8 rounded-xl bg-white border border-border flex-shrink-0 overflow-hidden shadow-sm">
                                {showAvatar ? (
                                  <img 
                                    src={getOtherParticipant(selectedConversation)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherParticipant(selectedConversation)?.name || 'User')}&background=7c3aed&color=fff`} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : null}
                             </div>
                           )}
                           
                           <div className="space-y-1">
                              <div className={`px-6 py-4 shadow-2xl shadow-primary/5 text-sm font-medium leading-relaxed relative ${
                                isOwn 
                                ? "bg-primary text-white rounded-[28px] rounded-br-sm" 
                                : "bg-white text-text-main border border-border rounded-[28px] rounded-bl-sm"
                              }`}>
                                {message.content}
                              </div>
                              <div className={`flex items-center gap-1.5 px-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                                 <span className="text-[10px] font-bold text-text-muted">{formatTime(message.createdAt)}</span>
                                 {isOwn && (
                                   message.readBy?.length > 1 
                                   ? <CheckCheck className="w-3 h-3 text-primary" /> 
                                   : <Check className="w-3 h-3 text-text-muted" />
                                 )}
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Container */}
              <div className="p-6 md:p-8 bg-white border-t border-border">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-4 bg-bg-alt p-2 rounded-[32px] border border-border/50 shadow-inner focus-within:border-primary/30 transition-all">
                  <div className="hidden sm:flex items-center gap-1 pl-4">
                     <button type="button" className="p-2 text-text-muted hover:text-primary transition-colors"><Smile className="w-5 h-5" /></button>
                     <button type="button" className="p-2 text-text-muted hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
                  </div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your transmission..."
                    className="flex-1 bg-transparent border-none py-4 px-2 text-sm font-medium focus:ring-0 placeholder:text-text-muted/50"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-14 h-14 bg-text-main text-white rounded-full flex items-center justify-center hover:bg-primary hover:rotate-12 transition-all shadow-xl shadow-text-main/10 disabled:opacity-50"
                  >
                    {sending ? <Clock className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-bg-alt/20 p-10 text-center">
              <div className="relative mb-8">
                 <div className="w-32 h-32 bg-primary/10 rounded-[48px] flex items-center justify-center text-primary group animate-bounce duration-3000">
                    <MessageCircle className="w-12 h-12" />
                 </div>
                 <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary animate-pulse">
                    <Zap className="w-5 h-5" />
                 </div>
              </div>
              <h2 className="text-3xl font-black text-text-main mb-4 tracking-tighter uppercase tracking-widest">Quantum Comms</h2>
              <p className="text-text-muted max-w-sm font-medium leading-relaxed italic">
                 "Select a transmission channel to initiate the wisdom exchange. All communications are encrypted on-platform."
              </p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default memo(Chat);
