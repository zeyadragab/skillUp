import React, { memo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import { 
  Eye, 
  EyeOff, 
  Loader, 
  Smartphone, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignIn = memo(() => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useUser();
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await login(formData.email, formData.password);
    if (result.success) navigate("/home");
    else setErrors({ submit: result.error });
  }, [formData, validateForm, login, navigate]);

  return (
    <div className="flex min-h-screen bg-white selection:bg-primary/10 overflow-hidden">
      {/* Left Side: Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center w-full p-8 lg:w-1/2 relative z-10"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-12 space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-text-main tracking-tight">SkillSwap</span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="mb-3 text-4xl font-black text-text-main tracking-tight">
              Welcome Back
            </h1>
            <p className="text-lg text-text-muted font-medium">
              Continue your journey of knowledge exchange.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {errors.submit && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border border-red-100 rounded-2xl bg-red-50 flex items-start space-x-3"
                >
                  <span className="text-red-500 font-bold">⚠️</span>
                  <span className="text-sm font-bold text-red-600 leading-tight">{errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-black text-text-main uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full px-6 py-4 bg-bg-alt border-2 rounded-[20px] outline-none transition-all font-bold ${
                    errors.email 
                      ? "border-red-200 focus:border-red-500" 
                      : "border-transparent focus:border-primary focus:bg-white"
                  }`}
                />
                <div className="absolute inset-0 rounded-[20px] pointer-events-none border-2 border-primary/0 group-focus-within:border-primary/20 transition-all scale-[1.02]" />
              </div>
              {errors.email && <p className="text-xs font-black text-red-500 pl-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-sm font-black text-text-main uppercase tracking-widest">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-bg-alt border-2 rounded-[20px] outline-none transition-all font-bold pr-14 ${
                    errors.password 
                      ? "border-red-200 focus:border-red-500" 
                      : "border-transparent focus:border-primary focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-[20px] pointer-events-none border-2 border-primary/0 group-focus-within:border-primary/20 transition-all scale-[1.02]" />
              </div>
              {errors.password && <p className="text-xs font-black text-red-500 pl-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 text-text-muted font-bold bg-white uppercase tracking-widest">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center px-4 py-4 border-2 border-border rounded-2xl font-bold hover:bg-bg-alt transition-colors group">
                 <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                 </svg>
                 Google
              </button>
              <Link to="/otp-login" className="flex items-center justify-center px-4 py-4 border-2 border-border rounded-2xl font-bold hover:bg-bg-alt transition-colors">
                <Smartphone className="w-5 h-5 mr-3 text-secondary" />
                Phone
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-text-muted font-bold">
              New to the community?{" "}
              <Link to="/signup" className="text-primary hover:underline font-black">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-text-main relative overflow-hidden p-16 flex-col justify-between">
        {/* Abstract Background */}
        <div className="absolute inset-0">
           <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]" />
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        <div className="relative z-10">
           <div className="flex items-center space-x-3 text-white/50 mb-12">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Verified Community</span>
           </div>
           
           <h2 className="text-5xl font-black text-white leading-tight mb-8">
              "The best way to <span className="text-primary italic">predict</span> the future is to create it together."
           </h2>
        </div>

        {/* Dynamic Cards Overlay */}
        <div className="relative z-10 h-[300px]">
           <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-0 right-0 p-8 glass-dark border-white/10 rounded-[32px] w-72"
           >
             <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                   <Zap className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-white font-black">Quick Skill</p>
                   <p className="text-white/50 text-xs">Recently Swapped</p>
                </div>
             </div>
             <div className="space-y-4">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <motion.div animate={{ width: ['0%', '85%'] }} className="h-full bg-secondary" />
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700" />)}
                   </div>
                   <span className="text-white/80 text-xs font-black">+12 More</span>
                </div>
             </div>
           </motion.div>

           <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-0 left-0 p-8 glass-dark border-white/10 rounded-[32px] w-72"
           >
             <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                   <Star className="text-white w-5 h-5" />
                </div>
                <p className="text-white font-black">Top Talent</p>
             </div>
             <p className="text-white/60 text-sm leading-relaxed mb-4">
                Connect with the top 1% of creative minds in our network.
             </p>
             <div className="flex gap-2">
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] text-white font-black uppercase tracking-widest">UX Design</div>
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] text-white font-black uppercase tracking-widest">React</div>
             </div>
           </motion.div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-white/30">
           <span className="text-xs font-black uppercase tracking-widest">© 2025 SkillSwap</span>
           <div className="flex space-x-6 text-xs font-black uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
           </div>
        </div>
      </div>
    </div>
  );
});

SignIn.displayName = "SignIn";
export default SignIn;
