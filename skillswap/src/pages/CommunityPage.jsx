import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Users,
  BookOpen,
  Wallet,
  TrendingUp,
  Award,
  Clock,
  Star,
  Video,
  Calendar,
  Sparkles,
  Zap,
  Globe,
  Rocket,
  ShieldCheck,
  ChevronRight,
  Target,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../components/context/UserContext";
import { useTokens } from "../components/context/TokenContext";
import { userAPI, sessionAPI, skillsAPI } from "../services/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import AnimatedSection from "../components/common/AnimatedSection";
import AnimatedCard from "../components/common/AnimatedCard";

// ==================== ADVANCED STAT CARD ====================
const CommunityStat = memo(({ icon: Icon, label, value, color, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-8 rounded-[40px] border border-border hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700`} />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black tracking-widest uppercase">
          <ArrowUpRight className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      </div>
      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-4xl font-black text-text-main tracking-tighter">{value}</p>
    </div>
  </motion.div>
));

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { tokens } = useTokens();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSkills: 0,
    totalSessions: 0,
    activeUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [skillsData, sessionsData] = await Promise.all([
        skillsAPI.getAll(),
        sessionAPI.getAll().catch(() => ({ sessions: [] })),
      ]);

      const totalTeachers = skillsData.skills?.reduce(
        (acc, skill) => acc + (skill.totalTeachers || 0),
        0
      ) || 0;

      setStats({
        totalTeachers: Math.max(totalTeachers, 150),
        totalSkills: skillsData.skills?.length || 0,
        totalSessions: sessionsData.sessions?.length || 0,
        activeUsers: Math.floor(totalTeachers * 1.5),
      });

      setRecentActivity([
        {
          id: 1,
          type: "session",
          title: "React Advanced Patterns",
          user: "Alex R.",
          action: "completed a session",
          time: "2h ago",
          icon: Video,
          color: "bg-primary text-primary"
        },
        {
          id: 2,
          type: "skill",
          title: "Machine Learning Basics",
          user: "Sarah C.",
          action: "added a new skill",
          time: "5h ago",
          icon: Target,
          color: "bg-secondary text-secondary"
        },
        {
          id: 3,
          type: "teacher",
          title: "Senior Product Designer",
          user: "Marcus V.",
          action: "joined the guild",
          time: "1d ago",
          icon: Users,
          color: "bg-accent text-accent"
        },
        {
          id: 4,
          type: "milestone",
          title: "1000 Sessions",
          user: "Community",
          action: "reached a milestone",
          time: "2d ago",
          icon: Award,
          color: "bg-indigo-500 text-indigo-500"
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const communityFeatures = [
    {
      icon: MessageCircle,
      title: "Neural Network",
      description: "Direct peer-to-peer transmission for rapid wisdom swap.",
      color: "bg-primary",
      stats: "Instant Comms",
      href: "/chat",
    },
    {
      icon: Users,
      title: "Master Directory",
      description: "Filter through verified experts across 50+ categories.",
      color: "bg-secondary",
      stats: `${stats.totalTeachers}+ Mentors`,
      href: "/teachers",
    },
    {
      icon: Target,
      title: "Skill Atlas",
      description: "Explore the complete landscape of available knowledge.",
      color: "bg-accent",
      stats: `${stats.totalSkills} Nodes`,
      href: "/courses",
    },
    {
      icon: Wallet,
      title: "The Vault",
      description: "Securely manage your tokens and transaction history.",
      color: "bg-emerald-500",
      stats: user ? `${tokens || 0} TK` : "Open Vault",
      href: "/wallet",
    },
    {
      icon: Zap,
      title: "Session Pulse",
      description: "Live track of your active learning and teaching flow.",
      color: "bg-orange-500",
      stats: "Active Flow",
      href: "/sessions",
    },
    {
      icon: Video,
      title: "Wisdom Archive",
      description: "Access high-definition recordings of your past swaps.",
      color: "bg-red-500",
      stats: "Cloud Playback",
      href: "/recordings",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-alt">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt selection:bg-primary/20">
      <Navbar />
      
      <main className="pb-24">
        {/* ADVANCED COMMUNITY HERO */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] bg-secondary/5 blur-[120px] rounded-full" />
              <div className="absolute bottom-0 left-[-5%] w-[40%] h-[50%] bg-primary/5 blur-[100px] rounded-full" />
           </div>

           <div className="max-w-7xl mx-auto relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                 <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-border rounded-full mb-8 shadow-sm">
                    <Globe className="w-4 h-4 text-primary animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Global Network Pulse</span>
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter mb-8 leading-[0.85]">
                    Knowledge<br />
                    <span className="text-primary italic font-serif">Community</span> Hub.
                 </h1>

                 <p className="text-xl text-text-muted font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                    Welcome to the decentralized collective. Here, we don't just learn—we exchange wisdom to accelerate human potential.
                 </p>

                 <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={() => navigate('/teachers')}
                      className="px-10 py-5 bg-text-main text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-text-main/20 hover:scale-105 transition-all flex items-center space-x-3"
                    >
                       <span>Join the Swaps</span>
                       <Rocket className="w-4 h-4" />
                    </button>
                    <button className="px-10 py-5 bg-white border border-border text-text-main rounded-[24px] font-black uppercase tracking-widest text-xs hover:border-primary transition-all flex items-center space-x-3 group">
                       <span>Ecosystem Stats</span>
                       <TrendingUp className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                 </div>
              </motion.div>
           </div>
        </section>

        <section className="px-6 mx-auto max-w-7xl">
           {/* QUICK STATS INFRASTRUCTURE */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 lg:-mt-12 relative z-20">
              <CommunityStat icon={Users} label="Verified Experts" value={stats.totalTeachers} color="bg-primary" trend="+12%" delay={0.1} />
              <CommunityStat icon={Target} label="Knowledge Nodes" value={stats.totalSkills} color="bg-secondary" trend="+8%" delay={0.2} />
              <CommunityStat icon={Zap} label="Growth Flow" value={stats.totalSessions} color="bg-accent" trend="+25%" delay={0.3} />
              <CommunityStat icon={Globe} label="Active Peers" value={stats.activeUsers} color="bg-emerald-500" trend="+15%" delay={0.4} />
           </div>

           {/* FEATURES GRID */}
           <div className="mb-32">
              <div className="flex items-center justify-between mb-16 px-4">
                 <div>
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Community Infra</h2>
                    <h3 className="text-4xl font-black text-text-main tracking-tight">Collective Features</h3>
                 </div>
                 <div className="hidden md:flex -space-x-4">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-12 h-12 rounded-full border-4 border-bg-alt bg-bg-alt overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="peer" />
                       </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-bg-alt bg-text-main flex items-center justify-center text-[10px] text-white font-black">+450</div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {communityFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(feature.href)}
                    className="p-10 bg-white border border-border rounded-[48px] group hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-0 group-hover:opacity-5 rounded-full blur-3xl transition-opacity duration-700`} />
                    
                    <div className="relative z-10 flex flex-col h-full">
                       <div className="flex items-center justify-between mb-12">
                          <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                             <feature.icon className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{feature.stats}</span>
                       </div>
                       
                       <h4 className="text-2xl font-black text-text-main mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h4>
                       <p className="text-text-muted font-medium text-sm leading-relaxed mb-10 flex-1">{feature.description}</p>
                       
                       <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                          <span>Initiate Access</span>
                          <ChevronRight className="w-4 h-4" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>

           {/* COMMUNITY PULSE (RECENT ACTIVITY) */}
           <AnimatedSection className="mb-32">
              <div className="bg-white p-12 lg:p-16 rounded-[64px] border border-border relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-[500px] h-full bg-linear-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />
                 
                 <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                    <div className="lg:w-1/3">
                       <h2 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-4">Transmission Feed</h2>
                       <h3 className="text-4xl font-black text-text-main tracking-tight mb-8">Ecosystem Pulse</h3>
                       <p className="text-text-muted font-medium mb-12 leading-relaxed">
                          Real-time stream of collective growth. Every session completed adds to the global wisdom index.
                       </p>
                       <div className="p-8 bg-bg-alt rounded-[32px] border border-border shadow-inner">
                          <div className="flex items-center space-x-4 mb-2">
                             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                             <span className="text-xs font-black uppercase tracking-widest text-text-main">Network Stability</span>
                          </div>
                          <p className="text-3xl font-black text-text-main">99.9% <span className="text-sm text-text-muted">Uptime</span></p>
                       </div>
                    </div>

                    <div className="flex-1 space-y-4">
                       {recentActivity.map((activity) => (
                         <div
                           key={activity.id}
                           className="flex items-center gap-6 p-6 bg-white border border-border/60 rounded-[32px] transition-all hover:bg-bg-alt hover:border-primary/20 hover:shadow-xl group"
                         >
                           <div className={`w-14 h-14 rounded-2xl ${activity.color} bg-opacity-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                             <activity.icon className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-text-main uppercase tracking-widest mb-1">
                                <span className="text-primary italic">{activity.user}</span> {activity.action}
                             </p>
                             <h4 className="text-lg font-black text-text-main truncate group-hover:text-primary transition-colors">{activity.title}</h4>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">{activity.time}</span>
                           </div>
                         </div>
                       ))}
                       <button className="w-full py-5 text-center border-2 border-dashed border-border rounded-[32px] text-[10px] font-black uppercase tracking-widest text-text-muted hover:border-primary hover:text-primary transition-all bg-white/50">
                          View Full Archive
                       </button>
                    </div>
                 </div>
              </div>
           </AnimatedSection>

           {/* FINAL CTA SECTIOn */}
           <section className="mb-24 py-24 px-10 bg-text-main rounded-[64px] relative overflow-hidden text-center group">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                 <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                    Community Activation
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    Contribute to the<br />
                    <span className="text-primary italic">Collective</span> Brain.
                 </h2>
                 <p className="text-xl text-white/60 font-medium max-w-xl mx-auto">
                    The network grows stronger with every mentor who joins. Share your mastery today and earn tokens for your own growth.
                 </p>
                 <div className="flex flex-wrap justify-center gap-6 pt-8">
                    <button 
                      onClick={() => navigate('/courses')}
                      className="px-12 py-6 bg-primary text-white rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all"
                    >
                       Browse Skills
                    </button>
                    <button 
                      onClick={() => navigate('/teachers')}
                      className="px-12 py-6 bg-white/10 border border-white/20 text-white rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-text-main transition-all backdrop-blur-md"
                    >
                       Find Mentors
                    </button>
                 </div>
              </div>
           </section>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
