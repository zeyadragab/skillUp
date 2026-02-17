import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import SessionBookingModal from "../components/booking/SessionBookingModal";
import {
  ArrowLeft,
  Star,
  BookOpen,
  Users,
  MapPin,
  Globe,
  Languages,
  Award,
  Clock,
  Coins,
  CheckCircle,
  UserPlus,
  UserCheck,
  MessageCircle,
  ShieldCheck,
  Zap,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Target,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TeacherProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    fetchTeacherProfile();
  }, [userId]);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeacher(data.user);
        if (currentUser && data.user.followers) {
          setIsFollowing(data.user.followers.includes(currentUser.id));
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) { navigate("/signin"); return; }
    if (currentUser.id === userId) return;

    try {
      setFollowLoading(true);
      const token = localStorage.getItem("token");
      const endpoint = isFollowing ? "unfollow" : "follow";
      const method = isFollowing ? "DELETE" : "POST";

      const response = await fetch(`http://localhost:5000/api/users/${userId}/${endpoint}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setTeacher(prev => ({
          ...prev,
          followers: isFollowing
            ? (prev.followers || []).filter(id => id !== currentUser.id)
            : [...(prev.followers || []), currentUser.id]
        }));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBookSession = (skill) => {
    if (!currentUser) { navigate("/signin"); return; }
    setSelectedSkill(skill);
    setShowBookingModal(true);
  };

  const getLevelStyles = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "bg-blue-50 text-blue-600 border-blue-100";
      case "intermediate": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "advanced": return "bg-primary/5 text-primary border-primary/10";
      case "expert": return "bg-accent/5 text-accent border-accent/10";
      default: return "bg-bg-alt text-text-muted border-border";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Locating Master...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-bg-main">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
           <Zap className="w-16 h-16 text-primary/20 mb-6" />
           <h2 className="text-3xl font-black text-text-main mb-4">Master not found</h2>
           <button onClick={() => navigate(-1)} className="px-10 py-4 bg-text-main text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl shadow-primary/10">Return to Grid</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt">
      <Navbar />

      <main className="pt-24">
        {/* Navigation & Actions Row */}
        <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12 mb-8 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="group flex items-center space-x-2 text-text-muted hover:text-primary transition-all">
               <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                  <ArrowLeft className="w-4 h-4" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest">Back to Directory</span>
            </button>
            <div className="flex items-center space-x-2">
               <button className="hidden sm:flex items-center space-x-2 px-6 py-2.5 bg-white border border-border text-text-muted hover:text-text-main rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                  <Sparkles className="w-3 h-3" />
                  <span>Recommend Profile</span>
               </button>
            </div>
        </div>

        {/* Profile Card / Header Section */}
        <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
            <div className="bg-white rounded-[48px] border border-border overflow-hidden relative shadow-sm">
                {/* Decorative Mesh */}
                <div className="absolute top-0 right-0 w-[40%] h-full bg-linear-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="p-10 md:p-16 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
                        {/* Avatar Layer */}
                        <div className="relative group shrink-0">
                           <div className="w-48 h-48 rounded-[64px] overflow-hidden border-8 border-bg-alt shadow-2xl relative">
                               <img src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=7c3aed&color=fff&size=256`} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                               {teacher.isVerified && (
                                 <div className="absolute top-4 right-4 bg-secondary text-white p-2 rounded-2xl shadow-lg border-2 border-white">
                                    <ShieldCheck className="w-5 h-5" />
                                 </div>
                               )}
                           </div>
                           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full border border-border shadow-sm flex items-center space-x-2 whitespace-nowrap">
                              <Star className="w-4 h-4 text-accent fill-accent" />
                              <span className="text-sm font-black text-text-main">{teacher.averageRating?.toFixed(1) || "5.0"} <span className="text-text-muted font-bold text-xs">({teacher.totalRatings || 0})</span></span>
                           </div>
                        </div>

                        {/* Content Layer */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                               <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">Elite Mentor</span>
                               <span className="px-4 py-1.5 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary/10">Level {teacher.level || 1}</span>
                               <span className="px-4 py-1.5 bg-bg-alt text-text-muted text-[10px] font-black uppercase tracking-widest rounded-full border border-border flex items-center gap-1.5">
                                  <Users className="w-3 h-3" />
                                  {teacher.followers?.length || 0} Followers
                               </span>
                            </div>

                            <h1 className="text-5xl font-black text-text-main tracking-tight mb-4">
                               {teacher.name}
                            </h1>
                            
                            <p className="text-lg text-text-muted font-medium mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed italic">
                                "{teacher.bio || "Crafting growth experiences through expert mentorship and collaborative wisdom swap."}"
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-8 items-center text-text-muted">
                                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest">
                                   <MapPin className="w-4 h-4 text-primary" />
                                   <span>{teacher.country || "Global"}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest">
                                   <Globe className="w-4 h-4 text-secondary" />
                                   <span>{teacher.languages?.join(", ") || "English"}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest">
                                   <Clock className="w-4 h-4 text-accent" />
                                   <span>{teacher.timeZone || "UTC+0"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Direct Interaction Block */}
                        {currentUser?.id !== userId && (
                            <div className="w-full lg:w-56 space-y-4 pt-10 lg:pt-0">
                                <button
                                  onClick={handleFollowToggle}
                                  disabled={followLoading}
                                  className={`w-full flex items-center justify-center space-x-3 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
                                     isFollowing 
                                     ? "bg-bg-alt text-text-main hover:bg-white border border-border" 
                                     : "bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95"
                                  }`}
                                >
                                   {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                   <span>{isFollowing ? "Following" : "Connect"}</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/chat?userId=${userId}`)}
                                  className="w-full flex items-center justify-center space-x-3 py-5 bg-white border border-border text-text-main rounded-[24px] font-black uppercase tracking-widest text-xs hover:border-primary transition-all group"
                                >
                                   <MessageCircle className="w-4 h-4 group-hover:text-primary transition-colors" />
                                   <span>Send Direct</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Grid Overlay */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-border/50">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Taught</p>
                              <p className="text-xl font-black text-text-main">{teacher.totalSessionsTaught || 0} Sessions</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-secondary/5 text-secondary rounded-2xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Impact</p>
                              <p className="text-xl font-black text-text-main">{teacher.totalStudents || 0} Students</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-accent/5 text-accent rounded-2xl flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Rank</p>
                              <p className="text-xl font-black text-text-main">Top 1%</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-indigo-500/5 text-indigo-500 rounded-2xl flex items-center justify-center"><Award className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Karma</p>
                              <p className="text-xl font-black text-text-main">{teacher.tokensEarned || "Elite"}</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Offerings Matrix */}
        <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main column: Teaching Skills */}
            <div className="lg:col-span-2 space-y-10">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary"><Target className="w-4 h-4" /></div>
                   <h2 className="text-2xl font-black text-text-main uppercase tracking-widest">Expert Offerings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {teacher.skillsToTeach?.map((skill, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-8 bg-white border border-border rounded-[32px] group hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                      >
                         <div className="flex items-start justify-between mb-10 relative z-10">
                            <div>
                               <h3 className="text-xl font-black text-text-main mb-1 group-hover:text-primary transition-colors">{skill.name}</h3>
                               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{skill.category}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getLevelStyles(skill.level)}`}>{skill.level}</span>
                         </div>
                         
                         <div className="flex items-end justify-between relative z-10 pt-4 border-t border-border/50">
                            <div className="flex items-center space-x-2">
                               <Coins className="w-5 h-5 text-primary" />
                               <span className="text-2xl font-black text-text-main">{skill.tokensPerHour || 50}</span>
                               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">/ Hr</span>
                            </div>
                            {currentUser?.id !== userId && (
                               <button 
                                 onClick={() => handleBookSession(skill)}
                                 className="px-6 py-3 bg-text-main text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
                               >
                                  Reservice Slot
                               </button>
                            )}
                         </div>
                      </motion.div>
                   ))}
                </div>
            </div>

            {/* Sidebar column: Learning Aspirations */}
            <div className="space-y-10">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary"><Sparkles className="w-4 h-4" /></div>
                   <h2 className="text-2xl font-black text-text-main uppercase tracking-widest">Learning List</h2>
                </div>

                <div className="space-y-4">
                   {teacher.skillsToLearn?.map((skill, i) => (
                      <div key={i} className="p-6 bg-white border border-border rounded-3xl flex items-center justify-between group hover:border-secondary/30 transition-all">
                         <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-bg-alt rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></div>
                            <div>
                               <h4 className="font-black text-text-main text-sm">{skill.name}</h4>
                               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{skill.category}</p>
                            </div>
                         </div>
                         <span className="px-3 py-1 bg-bg-alt text-text-muted text-[10px] font-black uppercase tracking-widest rounded-lg">{skill.level}</span>
                      </div>
                   ))}
                </div>

                <div className="p-8 bg-primary/5 rounded-[40px] border border-primary/10">
                   <h4 className="text-lg font-black text-text-main mb-3">Swap Wisdom?</h4>
                   <p className="text-sm text-text-muted font-medium mb-6">If you are an expert in what {teacher.name?.split(' ')[0]} wants to learn, a direct swap might be possible.</p>
                   <button className="w-full py-4 bg-white text-primary border border-primary/20 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all">Proposed a Skill Swap</button>
                </div>
            </div>
        </div>
      </main>

      <SessionBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        teacher={teacher}
        skill={selectedSkill}
        onSuccess={() => {
          setShowBookingModal(false);
          navigate('/sessions');
        }}
      />

      <Footer />
    </div>
  );
};

export default TeacherProfile;
