import React, { memo, useState, useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "../components/context/LanguageContext";
import {
  BookOpen,
  Users,
  Coins,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  Star,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Brain,
  Rocket,
  Award,
  User,
} from "lucide-react";

// Lazy load 3D component
const Hero3D = lazy(() => import("../components/hero/Hero3D"));

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

// ==================== NAV ====================
const LandingNavbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass py-2 border-b border-border shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img
              src="/skillup.png"
              alt="SkillUp Logo"
              className="w-auto h-12 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="items-center hidden space-x-10 md:flex">
            {[
              { key: "land_features", id: "features" },
              { key: "land_pricing", id: "pricing" },
              { key: "land_community", id: "community" },
            ].map((item) => (
              <a
                key={item.key}
                href={`#${item.id}`}
                className="text-sm font-semibold tracking-wide transition-colors text-text-muted hover:text-primary text-uppercase"
              >
                {t(item.key)}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/signin"
              className="px-5 py-2 text-sm font-semibold transition-all text-text-main hover:text-primary"
            >
              {t("nav_signin")}
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 text-sm font-bold text-white transition-all bg-primary rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 hover:scale-105"
            >
              {t("land_join_community")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
});

LandingNavbar.displayName = "LandingNavbar";

// ==================== HERO SECTION ====================
const HeroSection = memo(() => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden bg-bg-alt">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="relative z-10 px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center px-4 py-2 mb-8 space-x-2 border rounded-full shadow-sm glass border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary">
                {t("land_future_learning")}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mb-8 text-5xl font-black leading-[1.1] text-text-main md:text-6xl lg:text-7xl"
            >
              {t("land_master_skill")} <br />
              <span className="font-serif italic text-primary">
                {t("land_through_exchange")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="max-w-xl mb-10 text-lg leading-relaxed text-text-muted md:text-xl"
            >
              {t("land_connect_experts")}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/signup"
                className="flex items-center justify-center px-8 py-4 space-x-3 text-lg font-bold text-white transition-all shadow-xl bg-primary rounded-2xl hover:bg-primary-hover shadow-primary/20 hover:scale-105 lg:hover:translate-x-1"
              >
                <span>{t("land_join_community")}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="flex items-center justify-center px-8 py-4 space-x-3 text-lg font-bold transition-all border-2 bg-white/50 border-border text-text-main rounded-2xl hover:bg-white hover:border-primary hover:text-primary">
                <Play className="w-5 h-5 fill-current" />
                <span>{t("land_see_action")}</span>
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center mt-12 space-x-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 overflow-hidden border-4 border-white rounded-full shadow-md bg-slate-200"
                  >
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                <span className="block text-lg font-bold text-text-main">
                  {t("land_learners")}
                </span>
                <span className="text-text-muted">{t("land_growing_daily")}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual - 3D Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-full bg-white/50 border-primary/20 animate-pulse">
                    <Brain className="w-20 h-20 text-primary/30" />
                  </div>
                }
              >
                <Hero3D />
              </Suspense>

              {/* Floating feature cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-48 p-6 shadow-2xl top-10 -left-10 glass border-border rounded-3xl"
              >
                <div className="flex items-center mb-3 space-x-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <span className="text-sm font-bold">Skills 24/7</span>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-primary/10">
                  <div className="w-2/3 h-full bg-primary" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute w-48 p-6 shadow-2xl bottom-20 -right-10 glass border-border rounded-3xl"
              >
                <div className="flex items-center mb-3 space-x-2">
                  <Coins className="w-6 h-6 text-accent" />
                  <span className="text-sm font-bold">Earn Tokens</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-6 rounded-full bg-accent/20"
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

// ==================== FEATURES SECTION ====================
const FeaturesSection = memo(() => {
  const { t } = useLanguage();
  const features = [
    {
      icon: Brain,
      title: t("land_smart_matching"),
      desc: t("land_smart_matching_desc"),
      color: "blue",
    },
    {
      icon: Users,
      title: t("land_active_community"),
      desc: t("land_active_community_desc"),
      color: "emerald",
    },
    {
      icon: Zap,
      title: t("land_instant_booking"),
      desc: t("land_instant_booking_desc"),
      color: "amber",
    },
    {
      icon: Shield,
      title: t("land_trusted_network"),
      desc: t("land_trusted_network_desc"),
      color: "purple",
    },
    {
      icon: Globe,
      title: t("land_learn_anything"),
      desc: t("land_learn_anything_desc"),
      color: "rose",
    },
    {
      icon: TrendingUp,
      title: t("land_track_growth"),
      desc: t("land_track_growth_desc"),
      color: "indigo",
    },
  ];

  return (
    <section id="features" className="py-32 bg-white">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto mb-24 text-center">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-text-main md:text-5xl">
            {t("land_everything_needed")}{" "}
            <span className="text-secondary">{t("land_mastery")}</span>
          </h2>
          <p className="text-xl text-text-muted">
            {t("land_designed_learner")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-10 transition-all duration-300 border border-border group bg-bg-alt rounded-[40px] hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div
                className={`w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8 text-primary" />
              </div>

              <h3 className="mb-4 text-2xl font-black text-text-main">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-text-muted">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ==================== HOW IT WORKS ====================
const HowItWorks = memo(() => {
  const { t } = useLanguage();
  const steps = [
    {
      num: "01",
      title: t("land_create_identity"),
      desc: t("land_create_identity_desc"),
      icon: User,
      color: "bg-primary/10 text-primary",
      accent: "bg-primary",
    },
    {
      num: "02",
      title: t("land_list_skills"),
      desc: t("land_list_skills_desc"),
      icon: BookOpen,
      color: "bg-secondary/10 text-secondary",
      accent: "bg-secondary",
    },
    {
      num: "03",
      title: t("land_connect_swap"),
      desc: t("land_connect_swap_desc"),
      icon: Zap,
      color: "bg-accent/10 text-accent",
      accent: "bg-accent",
    },
    {
      num: "04",
      title: t("land_grow_together"),
      desc: t("land_grow_together_desc"),
      icon: TrendingUp,
      color: "bg-indigo-500/10 text-indigo-500",
      accent: "bg-indigo-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-bg-alt">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="flex flex-col items-end justify-between gap-8 mb-24 lg:flex-row">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-4xl font-black tracking-tight text-text-main md:text-5xl">
              {t("land_simple_steps")} <br />
              <span className="font-serif italic text-primary">
                {t("land_transformation")}
              </span>
            </h2>
            <p className="text-xl text-text-muted">
              {t("land_refined_process")}
            </p>
          </div>
          <Link
            to="/signup"
            className="flex items-center space-x-3 font-bold group text-primary"
          >
            <span>{t("land_get_started_today")}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="mb-10 overflow-hidden rounded-[40px] bg-bg-alt border border-border aspect-square flex items-center justify-center relative group-hover:bg-white group-hover:border-primary/30 transition-all duration-500 shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/5">
                {/* Background Number */}
                <span className="absolute font-black transition-all select-none top-10 right-10 text-8xl text-text-main/5 group-hover:scale-110 group-hover:text-primary/5">
                  {step.num}
                </span>

                {/* Icon Container */}
                <div
                  className={`relative w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <step.icon className="w-12 h-12" />
                  {/* Floating accents */}
                  <div
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${step.accent} opacity-0 group-hover:opacity-100 transition-all blur-sm`}
                  />
                  <div
                    className={`absolute -bottom-2 -left-2 w-4 h-4 rounded-full ${step.accent} opacity-0 group-hover:opacity-100 transition-all delay-100 blur-xs`}
                  />
                </div>
              </div>

              <div className="relative">
                <h3 className="mb-4 text-2xl font-black transition-colors text-text-main group-hover:text-primary">
                  {step.title}
                </h3>
                <p className="font-medium leading-relaxed text-text-muted">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ==================== CTA SECTION ====================
const CTASection = memo(() => {
  const { t } = useLanguage();

  return (
    <section className="py-32 overflow-hidden">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="relative p-16 overflow-hidden bg-primary rounded-[60px] text-center">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="mb-8 text-4xl font-extrabold text-white md:text-6xl">
              {t("land_ready_redefine")} <br /> {t("land_your_potential")}?
            </h2>
            <p className="mb-12 text-xl font-medium text-white/80">
              {t("land_thousands_experts")}
            </p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Link
                to="/signup"
                className="px-10 py-5 text-lg font-black transition-all bg-white shadow-2xl text-primary rounded-2xl hover:scale-105"
              >
                {t("land_start_swapping")}
              </Link>
              <Link
                to="/signin"
                className="px-10 py-5 text-lg font-black text-white transition-all border-2 border-white/30 rounded-2xl hover:bg-white/10"
              >
                {t("nav_signin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// ==================== FOOTER ====================
const Footer = memo(() => {
  return (
    <footer className="py-24 bg-white border-t border-border">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-16 mb-20 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-8 space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-text-main">SkillUp</span>
            </Link>
            <p className="leading-relaxed text-text-muted">
              Empowering individuals to grow through collective knowledge
              exchange.
            </p>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-black tracking-widest uppercase text-text-main">
              Resources
            </h4>
            <ul className="space-y-4 text-sm font-semibold text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-black tracking-widest uppercase text-text-main">
              Company
            </h4>
            <ul className="space-y-4 text-sm font-semibold text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-black tracking-widest uppercase text-text-main">
              Newsletter
            </h4>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm font-medium border outline-none bg-bg-alt border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button className="absolute px-4 text-white transition-colors rounded-lg right-2 top-2 bottom-2 bg-primary hover:bg-primary-hover">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 text-sm font-bold text-center border-t text-text-muted border-border">
          <p>&copy; 2025 SkillUp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});

// ==================== MAIN COMPONENT ====================
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default memo(LandingPage);
