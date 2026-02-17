import React, { useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import TeacherCard from "../components/teachers/TeacherCard";
import TokenCard from "../components/common/TokenCard";
import AnimatedSection from "../components/common/AnimatedSection";
import AnimatedCard from "../components/common/AnimatedCard";
import { teachers } from "../data/teachers";
import { useUser } from "../components/context/UserContext";
import { useTokens } from "../components/context/TokenContext";
import {
  BookOpen,
  Users,
  Coins,
  Zap,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  ChevronRight,
  MessageCircle,
  Target,
  Rocket,
  ShieldCheck,
  BarChart3,
  Globe,
  Play,
  User as UserIcon
} from "lucide-react";

// ==================== STAT CARD ====================
const StatCard = memo(({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-8 rounded-[40px] border border-border hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-text-main tracking-tight">{value}</p>
    </div>
  </motion.div>
));

StatCard.displayName = "StatCard";

// ==================== DASHBOARD HOME ====================
const Home = () => {
  const { user } = useUser();
  const { tokens } = useTokens();
  const navigate = useNavigate();
  const featuredTeachers = useMemo(() => teachers.slice(0, 3), []);

  const stats = [
    { icon: Coins, label: "Vault Balance", value: `${tokens} TK`, color: "bg-primary text-primary", delay: 0.1 },
    { icon: Target, label: "Active Goals", value: "3 Skills", color: "bg-secondary text-secondary", delay: 0.2 },
    { icon: TrendingUp, label: "Global Rank", value: "Top 4%", color: "bg-accent text-accent", delay: 0.3 },
    { icon: Users, label: "Network", value: "128 Swaps", color: "bg-indigo-500 text-indigo-500", delay: 0.4 },
  ];

  return (
    <div className="min-h-screen bg-bg-alt selection:bg-primary/20">
      <Navbar />

      <main className="pb-24">
        {/* NEW ADVANCED HERO SECTION */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
           {/* Immersive Background */}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute bottom-0 right-[-5%] w-[40%] h-[50%] bg-secondary/5 blur-[100px] rounded-full" />
           </div>

           <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 {/* Left: Personalized Welcome & Mission */}
                 <motion.div
                   initial={{ opacity: 0, x: -30 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.8 }}
                 >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-border rounded-full mb-8 shadow-sm">
                       <Sparkles className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Intelligence Briefing</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl font-black text-text-main tracking-tighter mb-8 leading-[0.9]">
                       Welcome back,<br />
                       <span className="text-primary italic font-serif capitalize">{user?.name?.split(' ')[0] || "Scholar"}</span>.
                    </h1>

                    <p className="text-xl text-text-muted font-medium mb-10 max-w-xl leading-relaxed">
                       Your journey at SkillSwap is more than just learning—it's a decentralized exchange of wisdom. 
                       Today, you have <span className="text-primary font-black">3 recommended sessions</span> that align with your growth trajectory.
                    </p>

                    <div className="flex flex-wrap gap-4">
                       <button 
                         onClick={() => navigate('/teachers')}
                         className="px-10 py-5 bg-text-main text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-text-main/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-3"
                       >
                          <span>Initiate Swap</span>
                          <Rocket className="w-4 h-4" />
                       </button>
                       <button className="px-10 py-5 bg-white border border-border text-text-main rounded-[24px] font-black uppercase tracking-widest text-xs hover:border-primary transition-all flex items-center space-x-3 group">
                          <span>View Roadmap</span>
                          <BarChart3 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                       </button>
                    </div>
                 </motion.div>

                 {/* Right: Real-time Analysis Visualizer */}
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                   animate={{ opacity: 1, scale: 1, rotate: 0 }}
                   transition={{ duration: 1, delay: 0.2 }}
                   className="relative"
                 >
                    <div className="bg-white p-10 rounded-[64px] border border-border shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8">
                          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                             <TrendingUp className="w-6 h-6" />
                          </div>
                       </div>
                       
                       <h3 className="text-2xl font-black text-text-main mb-8">Ecosystem Mastery</h3>
                       
                       {/* Simplified Skill Matrix Visualizer */}
                       <div className="space-y-8">
                          {[
                             { label: "Frontend Architecture", level: 85, color: "bg-primary" },
                             { label: "UI Motion Design", level: 62, color: "bg-secondary" },
                             { label: "Strategic Leadership", level: 45, color: "bg-accent" }
                          ].map((skill, i) => (
                             <div key={i}>
                                <div className="flex justify-between items-end mb-3">
                                   <span className="text-xs font-black uppercase tracking-widest text-text-muted">{skill.label}</span>
                                   <span className="text-sm font-black text-text-main">{skill.level}%</span>
                                </div>
                                <div className="h-3 w-full bg-bg-alt rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${skill.level}%` }}
                                     transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), ease: "circOut" }}
                                     className={`h-full ${skill.color} rounded-full`}
                                   />
                                </div>
                             </div>
                          ))}
                       </div>

                       <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Wisdom Earned</p>
                             <p className="text-3xl font-black text-text-main">2.4k <span className="text-xs text-text-muted">XP</span></p>
                          </div>
                          <div className="flex -space-x-4">
                             {[1,2,3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-bg-alt overflow-hidden">
                                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                                </div>
                             ))}
                             <div className="w-10 h-10 rounded-full border-2 border-white bg-text-main flex items-center justify-center text-[10px] text-white font-black">+12</div>
                          </div>
                       </div>
                    </div>

                    {/* Floating Detail Card */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-10 -right-10 bg-primary p-6 rounded-[32px] text-white shadow-2xl z-20 hidden md:block"
                    >
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                             <ShieldCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Legacy Status</p>
                             <p className="font-black">Top Verified Mentor</p>
                          </div>
                       </div>
                    </motion.div>
                 </motion.div>
              </div>
           </div>
        </section>

        <section className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
            {/* Rapid Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 -mt-10 relative z-30">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* Core Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
               {/* Left: Active Learning Content */}
               <div className="lg:col-span-2 space-y-16">
                  {/* Achievement Recap Card */}
                  <AnimatedSection animation="fadeInUp">
                     <div className="bg-white p-12 rounded-[56px] border border-border relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                           <div>
                              <h2 className="text-4xl font-black text-text-main mb-6 leading-tight">You achieved <span className="text-secondary italic">Mastery</span> in 4 skills this month.</h2>
                              <p className="text-text-muted font-medium mb-10">
                                 Your teaching influence has grown by 24% compared to last cycle. You've helped 18 students unlock new potential.
                              </p>
                              <div className="flex items-center space-x-6">
                                 <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-secondary rounded-full" />
                                    <span className="text-xs font-black uppercase tracking-widest text-text-main">+120 TK Earned</span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <span className="text-xs font-black uppercase tracking-widest text-text-main">4.9 Star Avg</span>
                                 </div>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-6 bg-bg-alt rounded-3xl text-center group-hover:bg-white group-hover:shadow-xl transition-all h-fit">
                                 <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                                 <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Badges</p>
                                 <p className="text-xl font-black text-text-main">Elite</p>
                              </div>
                              <div className="p-6 bg-bg-alt rounded-3xl text-center mt-8 group-hover:bg-white group-hover:shadow-xl transition-all h-fit">
                                 <Globe className="w-8 h-8 text-secondary mx-auto mb-3" />
                                 <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Reach</p>
                                 <p className="text-xl font-black text-text-main">Global</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </AnimatedSection>

                  {/* Active Course */}
                  <div>
                    <div className="flex items-center justify-between mb-10">
                       <h2 className="text-3xl font-black text-text-main tracking-tight uppercase tracking-widest">Active Pulse</h2>
                       <Link to="/sessions" className="text-xs font-black text-primary flex items-center group uppercase tracking-[0.2em]">
                          Deep Dive <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                       </Link>
                    </div>
                    
                    <AnimatedCard className="bg-white p-10 rounded-[48px] border border-border flex flex-col md:flex-row items-center gap-12 group hover:border-primary/20 transition-all">
                       <div className="w-full md:w-64 aspect-square bg-bg-alt rounded-[40px] flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                          <Play className="w-12 h-12 text-primary fill-primary group-hover:scale-125 transition-transform duration-500" />
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
                             <motion.div initial={{ width: 0 }} whileInView={{ width: '75%' }} className="h-full bg-primary" />
                          </div>
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                             <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full">Phase 3: Integration</span>
                             <span className="px-4 py-1.5 bg-bg-alt text-text-muted text-[10px] font-black uppercase tracking-widest rounded-full">Pro Level</span>
                          </div>
                          <h3 className="text-3xl font-black text-text-main mb-4 tracking-tight">Advanced Systems Design</h3>
                          <p className="text-text-muted font-medium mb-8 text-lg leading-relaxed">
                             Scaling knowledge ecosystems with modular design patterns and automated feedback loops.
                          </p>
                          <div className="flex items-center justify-center md:justify-start space-x-10 text-xs font-black uppercase tracking-widest text-text-muted">
                             <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>12m Remaining</span>
                             </div>
                             <div className="flex items-center space-x-2">
                                <UserIcon className="w-4 h-4 text-secondary" />
                                <span>With Sarah Chen</span>
                             </div>
                          </div>
                       </div>
                       <button className="w-full md:w-auto p-8 bg-text-main text-white rounded-[32px] hover:bg-primary transition-all shadow-xl group/btn">
                          <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-2 transition-transform" />
                       </button>
                    </AnimatedCard>
                  </div>
               </div>

               {/* Right: Insights & Social */}
               <div className="space-y-16">
                  <div>
                    <div className="flex items-center justify-between mb-10">
                       <h2 className="text-3xl font-black text-text-main tracking-tight uppercase tracking-widest">Master Grid</h2>
                    </div>
                    <div className="space-y-4">
                       {featuredTeachers.map((teacher, i) => (
                         <motion.div 
                           key={teacher.id}
                           initial={{ opacity: 0, x: 20 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           transition={{ delay: 0.1 * i }}
                           className="group p-6 bg-white rounded-[32px] border border-border hover:border-primary/20 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
                           onClick={() => navigate(`/profile/${teacher.id}`)}
                         >
                           <div className="flex items-center space-x-5">
                             <div className="relative shrink-0">
                                <img 
                                  src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=7c3aed&color=fff`} 
                                  alt={teacher.name}
                                  className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-border rounded-lg flex items-center justify-center">
                                   <Star className="w-2.5 h-2.5 text-accent fill-accent" />
                                </div>
                             </div>
                             <div className="flex-1 min-w-0">
                               <h4 className="font-black text-text-main text-sm uppercase tracking-widest group-hover:text-primary transition-colors truncate">{teacher.name}</h4>
                               <p className="text-[10px] font-bold text-text-muted mt-0.5 truncate">{teacher.skillsToTeach?.[0]?.name || "Strategic Mentor"}</p>
                             </div>
                             <ChevronRight className="w-5 h-5 text-border group-hover:text-primary transition-colors" />
                           </div>
                         </motion.div>
                       ))}
                    </div>
                    <Link to="/teachers" className="mt-10 block py-5 text-center border-2 border-border border-dashed rounded-[32px] text-[10px] font-black uppercase tracking-widest text-text-muted hover:border-primary hover:text-primary transition-all bg-white/50">
                       Expand Master Network
                    </Link>
                  </div>

                  <div className="bg-text-main p-10 rounded-[48px] relative overflow-hidden shadow-2xl">
                     <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                     <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                           <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Flux Alpha</h3>
                     </div>
                     <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 mb-8">
                        <p className="text-2xl font-black text-white mb-2 leading-none italic">UI Architecture</p>
                        <p className="text-xs font-medium text-white/50 tracking-wide uppercase">New Demand Spike</p>
                     </div>
                     <button className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                        Bridge this Skill
                     </button>
                  </div>
               </div>
            </div>

            {/* CTA SECTION: THE ECOSYSTEM BRIDGE */}
            <section className="mb-24 py-20 px-10 bg-primary rounded-[64px] relative overflow-hidden text-center group">
               <div className="absolute inset-0 bg-linear-to-b from-black/20 to-transparent pointer-events-none" />
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ duration: 20, repeat: Infinity }}
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]" 
               />
               
               <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                  <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                     Scale your Influence
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                     Ready to <span className="italic">Elevate</span> the Network?
                  </h2>
                  <p className="text-xl text-white/70 font-medium">
                     The most successful members on SkillSwap both teach and learn. Start your next session today and contribute to the collective wisdom.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-6">
                     <button 
                       onClick={() => navigate('/teachers')}
                       className="px-12 py-6 bg-white text-primary rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-110 active:scale-95 transition-all"
                     >
                        Find a Mentor
                     </button>
                     <button 
                       onClick={() => navigate('/profile')}
                       className="px-12 py-6 bg-transparent border-2 border-white/20 text-white rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all backdrop-blur-md"
                     >
                        Become a Master
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

export default memo(Home);
