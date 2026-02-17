import React, { memo, useState, useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// ==================== NAV ====================
const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "glass py-2 border-b border-border shadow-sm" : "bg-transparent py-6"
    }`}>
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 transition-transform bg-primary rounded-xl group-hover:scale-110 shadow-primary/20 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-text-main">
              Skill<span className="text-primary">Swap</span>
            </span>
          </Link>

          <div className="hidden items-center space-x-10 md:flex">
            {["Features", "Pricing", "Community"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-semibold transition-colors text-text-muted hover:text-primary tracking-wide text-uppercase"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/signin"
              className="px-5 py-2 text-sm font-semibold transition-all text-text-main hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 text-sm font-bold text-white transition-all bg-primary rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
});

// ==================== HERO SECTION ====================
const HeroSection = memo(() => {
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
              className="inline-flex items-center px-4 py-2 mb-8 space-x-2 border rounded-full glass border-primary/20 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                The Future of Learning
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="mb-8 text-5xl font-black leading-[1.1] text-text-main md:text-6xl lg:text-7xl"
            >
              Master Any Skill <br />
              <span className="text-primary italic font-serif">Through Exchange</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="max-w-xl mb-10 text-lg leading-relaxed text-text-muted md:text-xl"
            >
              Connect with experts worldwide to trade knowledge. Teach what you love, learn what you've always wanted. No fees, just growth.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/signup"
                className="flex items-center justify-center px-8 py-4 space-x-3 text-lg font-bold text-white transition-all bg-primary rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 hover:scale-105 lg:hover:translate-x-1"
              >
                <span>Join Community</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="flex items-center justify-center px-8 py-4 space-x-3 text-lg font-bold transition-all border-2 bg-white/50 border-border text-text-main rounded-2xl hover:bg-white hover:border-primary hover:text-primary">
                <Play className="w-5 h-5 fill-current" />
                <span>See it in action</span>
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
                    className="w-12 h-12 border-4 border-white rounded-full bg-slate-200 overflow-hidden shadow-md"
                  >
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                <span className="block text-text-main font-bold text-lg">5,000+ Learners</span>
                <span className="text-text-muted">Growing together daily</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual - 3D Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:block relative"
          >
            <div className="relative aspect-square">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-white/50 rounded-full border-2 border-dashed border-primary/20 animate-pulse">
                   <Brain className="w-20 h-20 text-primary/30" />
                </div>
              }>
                <Hero3D />
              </Suspense>
              
              {/* Floating feature cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-10 p-6 glass border-border shadow-2xl rounded-3xl w-48"
              >
                <div className="flex items-center mb-3 space-x-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <span className="font-bold text-sm">Skills 24/7</span>
                </div>
                <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3" />
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -right-10 p-6 glass border-border shadow-2xl rounded-3xl w-48"
              >
                <div className="flex items-center mb-3 space-x-2">
                  <Coins className="w-6 h-6 text-accent" />
                  <span className="font-bold text-sm">Earn Tokens</span>
                </div>
                <div className="flex gap-1">
                   {[1,2,3,4].map(i => <div key={i} className="h-6 w-2 bg-accent/20 rounded-full" />)}
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
  const features = [
    {
      icon: Brain,
      title: "Smart Matching",
      desc: "Our AI finds the perfect mentor for your unique learning style and goals.",
      color: "blue",
    },
    {
      icon: Users,
      title: "Active Community",
      desc: "Join study groups, forums, and live events with passionate learners.",
      color: "emerald",
    },
    {
      icon: Zap,
      title: "Instant Booking",
      desc: "Schedule video sessions with experts in just a few clicks.",
      color: "amber",
    },
    {
      icon: Shield,
      title: "Trusted Network",
      desc: "Every member is verified to ensure a safe and high-quality environment.",
      color: "purple",
    },
    {
      icon: Globe,
      title: "Learn Anything",
      desc: "From coding to cooking - find a teacher for any skill you imagine.",
      color: "rose",
    },
    {
      icon: TrendingUp,
      title: "Track Growth",
      desc: "Visualize your progress with detailed analytics and skill badges.",
      color: "indigo",
    },
  ];

  return (
    <section id="features" className="py-32 bg-white">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="max-w-3xl mb-24 text-center mx-auto">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-text-main md:text-5xl">
            Everything you need for <span className="text-secondary">mastery</span>
          </h2>
          <p className="text-xl text-text-muted">
            Designed for the modern learner who values community and knowledge transition.
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
                <feature.icon className="text-primary h-8 w-8" />
              </div>

              <h3 className="mb-4 text-2xl font-black text-text-main">
                {feature.title}
              </h3>
              <p className="text-text-muted leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ==================== HOW IT WORKS ====================
const HowItWorks = memo(() => {
  const steps = [
    {
      num: "01",
      title: "Create Your Identity",
      desc: "Build a profile that showcases your unique skills and what you're eager to learn.",
      icon: User,
      color: "bg-primary/10 text-primary",
      accent: "bg-primary",
    },
    {
      num: "02",
      title: "List Your Skills",
      desc: "Tell the community what you can teach. Every skill is valuable to someone.",
      icon: BookOpen,
      color: "bg-secondary/10 text-secondary",
      accent: "bg-secondary",
    },
    {
      num: "03",
      title: "Connect & Swap",
      desc: "Browse our marketplace and request a skill swap with your perfect match.",
      icon: Zap,
      color: "bg-accent/10 text-accent",
      accent: "bg-accent",
    },
    {
      num: "04",
      title: "Grow Together",
      desc: "Engage in live sessions, earn tokens, and unlock new levels of knowledge.",
      icon: TrendingUp,
      color: "bg-indigo-500/10 text-indigo-500",
      accent: "bg-indigo-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-bg-alt">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-4xl font-black tracking-tight text-text-main md:text-5xl">
              Simple steps to <br />
              <span className="text-primary italic font-serif">transformation</span>
            </h2>
            <p className="text-xl text-text-muted">
              We've refined the process of peer-to-peer learning to be as seamless as possible.
            </p>
          </div>
          <Link to="/signup" className="group flex items-center space-x-3 font-bold text-primary">
            <span>Get started today</span>
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
                 <span className="absolute top-10 right-10 text-8xl font-black text-text-main/5 select-none transition-all group-hover:scale-110 group-hover:text-primary/5">
                    {step.num}
                 </span>
                 
                 {/* Icon Container */}
                 <div className={`relative w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <step.icon className="w-12 h-12" />
                    {/* Floating accents */}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${step.accent} opacity-0 group-hover:opacity-100 transition-all blur-sm`} />
                    <div className={`absolute -bottom-2 -left-2 w-4 h-4 rounded-full ${step.accent} opacity-0 group-hover:opacity-100 transition-all delay-100 blur-xs`} />
                 </div>
              </div>
              
              <div className="relative">
                <h3 className="mb-4 text-2xl font-black text-text-main group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-text-muted font-medium leading-relaxed">
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
              Ready to redefine <br /> your potential?
            </h2>
            <p className="mb-12 text-xl text-white/80 font-medium">
              Join thousands of experts trading knowledge every day. Your next great skill is just a swap away.
            </p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <Link
                to="/signup"
                className="px-10 py-5 text-lg font-black text-primary transition-all bg-white rounded-2xl hover:scale-105 shadow-2xl"
              >
                Start Swapping Free
              </Link>
              <Link
                to="/signin"
                className="px-10 py-5 text-lg font-black text-white transition-all border-2 border-white/30 rounded-2xl hover:bg-white/10"
              >
                Sign In
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
    <footer className="py-24 border-t border-border bg-white">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-16 mb-20 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-text-main">SkillSwap</span>
            </Link>
            <p className="text-text-muted leading-relaxed">
              Empowering individuals to grow through collective knowledge exchange.
            </p>
          </div>
          
          <div>
            <h4 className="mb-8 text-sm font-black uppercase tracking-widest text-text-main">Resources</h4>
            <ul className="space-y-4 text-text-muted text-sm font-semibold">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-black uppercase tracking-widest text-text-main">Company</h4>
            <ul className="space-y-4 text-text-muted text-sm font-semibold">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-sm font-black uppercase tracking-widest text-text-main">Newsletter</h4>
            <div className="relative">
               <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium"
               />
               <button className="absolute right-2 top-2 bottom-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                  <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        <div className="pt-12 text-center text-text-muted text-sm font-bold border-t border-border">
          <p>&copy; 2025 SkillSwap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});

// ==================== MAIN COMPONENT ====================
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default memo(LandingPage);
