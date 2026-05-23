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
import { useLanguage } from "../components/context/LanguageContext";
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
  User as UserIcon,
} from "lucide-react";

// ==================== STAT CARD ====================
const StatCard = memo(({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-8 rounded-[40px] border border-border hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
  >
    <div
      className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`}
    />
    <div className="relative z-10">
      <div
        className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p className="text-3xl font-black tracking-tight text-text-main">
        {value}
      </p>
    </div>
  </motion.div>
));

StatCard.displayName = "StatCard";

// ==================== DASHBOARD HOME ====================
const Home = () => {
  const { user } = useUser();
  const { tokens } = useTokens();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const featuredTeachers = useMemo(() => teachers.slice(0, 3), []);

  const stats = [
    {
      icon: Coins,
      label: t("home_vault_balance"),
      value: `${tokens} TK`,
      color: "bg-primary text-primary",
      delay: 0.1,
    },
    {
      icon: Target,
      label: t("home_active_goals"),
      value: "3 Skills",
      color: "bg-secondary text-secondary",
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      label: t("home_global_rank"),
      value: "Top 4%",
      color: "bg-accent text-accent",
      delay: 0.3,
    },
    {
      icon: Users,
      label: t("home_network"),
      value: "128 Swaps",
      color: "bg-indigo-500 text-indigo-500",
      delay: 0.4,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-alt selection:bg-primary/20">
      <Navbar />

      <main className="pb-24">
        {/* NEW ADVANCED HERO SECTION */}
        <section className="relative px-6 pt-32 pb-20 overflow-hidden">
          {/* Immersive Background */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-[-5%] w-[40%] h-[50%] bg-secondary/5 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
              {/* Left: Personalized Welcome & Mission */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center px-4 py-2 mb-8 space-x-2 bg-white border rounded-full shadow-sm border-border">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {t("home_intelligence_briefing")}
                  </span>
                </div>

                <h1 className="text-6xl md:text-7xl font-black text-text-main tracking-tighter mb-8 leading-[0.9]">
                  {t("home_welcome")},
                  <br />
                  <span className="font-serif italic capitalize text-primary">
                    {user?.name?.split(" ")[0] || t("home_scholar")}
                  </span>
                  .
                </h1>

                <p className="max-w-xl mb-10 text-xl font-medium leading-relaxed text-text-muted">
                  {t("home_journey")}{" "}
                  <span className="font-black text-primary">
                    {t("home_recommended_sessions")}
                  </span>{" "}
                  {t("home_that_align")}
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate("/teachers")}
                    className="flex items-center px-10 py-5 space-x-3 text-xs font-black tracking-widest text-white uppercase transition-all shadow-2xl bg-text-main rounded-3xl shadow-text-main/20 hover:scale-105 active:scale-95"
                  >
                    <span>{t("home_initiate_swap")}</span>
                    <Rocket className="w-4 h-4" />
                  </button>
                  <button className="px-10 py-5 bg-white border border-border text-text-main rounded-3xl font-black uppercase tracking-widest text-xs hover:border-primary transition-all flex items-center space-x-3 group">
                    <span>{t("home_view_roadmap")}</span>
                    <BarChart3 className="w-4 h-4 transition-transform text-primary group-hover:scale-110" />
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
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-2xl text-secondary">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="mb-8 text-2xl font-black text-text-main">
                    {t("home_ecosystem_mastery")}
                  </h3>

                  {/* Simplified Skill Matrix Visualizer */}
                  <div className="space-y-8">
                    {[
                      {
                        label: "Frontend Architecture",
                        level: 85,
                        color: "bg-primary",
                      },
                      {
                        label: "UI Motion Design",
                        level: 62,
                        color: "bg-secondary",
                      },
                      {
                        label: "Strategic Leadership",
                        level: 45,
                        color: "bg-accent",
                      },
                    ].map((skill, i) => (
                      <div key={i}>
                        <div className="flex items-end justify-between mb-3">
                          <span className="text-xs font-black tracking-widest uppercase text-text-muted">
                            {skill.label}
                          </span>
                          <span className="text-sm font-black text-text-main">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="w-full h-3 overflow-hidden rounded-full bg-bg-alt">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{
                              duration: 1.5,
                              delay: 0.5 + i * 0.1,
                              ease: "circOut",
                            }}
                            className={`h-full ${skill.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-8 mt-12 border-t border-border">
                    <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                        {t("home_total_wisdom")}
                      </p>
                      <p className="text-3xl font-black text-text-main">
                        2.4k <span className="text-xs text-text-muted">XP</span>
                      </p>
                    </div>
                    <div className="flex -space-x-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 overflow-hidden border-2 border-white rounded-full bg-bg-alt"
                        >
                          <img
                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                            alt="avatar"
                          />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-text-main flex items-center justify-center text-[10px] text-white font-black">
                        +12
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Detail Card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-10 -right-10 bg-primary p-6 rounded-[32px] text-white shadow-2xl z-20 hidden md:block"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        Legacy Status
                      </p>
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
          <div className="relative z-30 grid grid-cols-1 gap-6 mb-24 -mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Core Sections Grid */}
          <div className="grid grid-cols-1 gap-16 mb-24 lg:grid-cols-3">
            {/* Left: Active Learning Content */}
            <div className="space-y-16 lg:col-span-2">
              {/* Achievement Recap Card */}
              <AnimatedSection animation="fadeInUp">
                <div className="bg-white p-12 rounded-[56px] border border-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10 grid items-center grid-cols-1 gap-12 md:grid-cols-2">
                    <div>
                      <h2 className="mb-6 text-4xl font-black leading-tight text-text-main">
                        {t("home_you_achieved")}{" "}
                        <span className="italic text-secondary">{t("home_mastery")}</span>{" "}
                        {t("home_in_skills_month")}
                      </h2>
                      <p className="mb-10 font-medium text-text-muted">
                        {t("home_teaching_influence")}
                      </p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-secondary" />
                          <span className="text-xs font-black tracking-widest uppercase text-text-main">
                            {t("home_earned_tokens")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-xs font-black tracking-widest uppercase text-text-main">
                            {t("home_star_avg")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 text-center transition-all bg-bg-alt rounded-3xl group-hover:bg-white group-hover:shadow-xl h-fit">
                        <Award className="w-8 h-8 mx-auto mb-3 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                          {t("home_badges")}
                        </p>
                        <p className="text-xl font-black text-text-main">
                          Elite
                        </p>
                      </div>
                      <div className="p-6 mt-8 text-center transition-all bg-bg-alt rounded-3xl group-hover:bg-white group-hover:shadow-xl h-fit">
                        <Globe className="w-8 h-8 mx-auto mb-3 text-secondary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                          {t("home_reach")}
                        </p>
                        <p className="text-xl font-black text-text-main">
                          Global
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Active Course */}
              <div>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black tracking-widest uppercase text-text-main">
                    {t("home_active_pulse")}
                  </h2>
                  <Link
                    to="/sessions"
                    className="text-xs font-black text-primary flex items-center group uppercase tracking-[0.2em]"
                  >
                    {t("home_deep_dive")}{" "}
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <AnimatedCard className="bg-white p-10 rounded-[48px] border border-border flex flex-col md:flex-row items-center gap-12 group hover:border-primary/20 transition-all">
                  <div className="w-full md:w-64 aspect-square bg-bg-alt rounded-[40px] flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                    <Play className="w-12 h-12 transition-transform duration-500 text-primary fill-primary group-hover:scale-125" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "75%" }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap justify-center gap-3 mb-6 md:justify-start">
                      <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full">
                        {t("home_phase_integration")}
                      </span>
                      <span className="px-4 py-1.5 bg-bg-alt text-text-muted text-[10px] font-black uppercase tracking-widest rounded-full">
                        {t("home_pro_level")}
                      </span>
                    </div>
                    <h3 className="mb-4 text-3xl font-black tracking-tight text-text-main">
                      {t("home_advanced_systems")}
                    </h3>
                    <p className="mb-8 text-lg font-medium leading-relaxed text-text-muted">
                      {t("home_scaling_knowledge")}
                    </p>
                    <div className="flex items-center justify-center space-x-10 text-xs font-black tracking-widest uppercase md:justify-start text-text-muted">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>12m {t("home_remaining")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-secondary" />
                        <span>{t("home_with")} Sarah Chen</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full md:w-auto p-8 bg-text-main text-white rounded-[32px] hover:bg-primary transition-all shadow-xl group/btn">
                    <ArrowRight className="w-8 h-8 transition-transform group-hover/btn:translate-x-2" />
                  </button>
                </AnimatedCard>
              </div>
            </div>

            {/* Right: Insights & Social */}
            <div className="space-y-16">
              <div>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black tracking-widest uppercase text-text-main">
                    {t("home_master_grid")}
                  </h2>
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
                            src={
                              teacher.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=7c3aed&color=fff`
                            }
                            alt={teacher.name}
                            className="object-cover w-16 h-16 transition-all duration-500 rounded-2xl grayscale group-hover:grayscale-0"
                          />
                          <div className="absolute flex items-center justify-center w-5 h-5 bg-white border rounded-lg -bottom-1 -right-1 border-border">
                            <Star className="w-2.5 h-2.5 text-accent fill-accent" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black tracking-widest uppercase truncate transition-colors text-text-main group-hover:text-primary">
                            {teacher.name}
                          </h4>
                          <p className="text-[10px] font-bold text-text-muted mt-0.5 truncate">
                            {teacher.skillsToTeach?.[0]?.name ||
                              "Strategic Mentor"}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 transition-colors text-border group-hover:text-primary" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Link
                  to="/teachers"
                  className="mt-10 block py-5 text-center border-2 border-border border-dashed rounded-4xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:border-primary hover:text-primary transition-all bg-white/50"
                >
                  {t("home_expand_network")}
                </Link>
              </div>

              <div className="bg-text-main p-10 rounded-[48px] relative overflow-hidden shadow-2xl">
                <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                <div className="flex items-center mb-8 space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-2xl text-primary">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="text-xl font-black tracking-widest text-white uppercase">
                    {t("home_flux_alpha")}
                  </h3>
                </div>
                <div className="p-6 mb-8 border bg-white/5 backdrop-blur-md rounded-3xl border-white/10">
                  <p className="mb-2 text-2xl italic font-black leading-none text-white">
                    {t("home_ui_architecture")}
                  </p>
                  <p className="text-xs font-medium tracking-wide uppercase text-white/50">
                    {t("home_new_demand")}
                  </p>
                </div>
                <button className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                  {t("home_bridge_skill")}
                </button>
              </div>
            </div>
          </div>

          {/* CTA SECTION: THE ECOSYSTEM BRIDGE */}
          <section className="mb-24 py-20 px-10 bg-primary rounded-[64px] relative overflow-hidden text-center group">
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/20 to-transparent" />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"
            />

            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                {t("home_scale_influence")}
              </div>
              <h2 className="text-5xl font-black leading-none tracking-tighter text-white md:text-7xl">
                {t("home_ready_elevate")}?
              </h2>
              <p className="text-xl font-medium text-white/70">
                {t("home_successful_members")}
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <button
                  onClick={() => navigate("/teachers")}
                  className="px-12 py-6 bg-white text-primary rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-110 active:scale-95 transition-all"
                >
                  {t("home_find_mentor")}
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-12 py-6 bg-transparent border-2 border-white/20 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all backdrop-blur-md"
                >
                  {t("home_become_master")}
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
