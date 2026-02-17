import React, { memo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import {
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  MailCheck,
  ArrowRight,
  Sparkles,
  Rocket,
  ShieldCheck,
  Award,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignUp = memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "both",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { register, isLoading } = useUser();
  const navigate = useNavigate();

  const calculateStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Minimum 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords match error";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setPasswordStrength(calculateStrength(value));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors, calculateStrength]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await register(formData);
    if (result.success) setRegistrationSuccess(true);
    else setErrors({ submit: result.error });
  }, [formData, validateForm, register]);

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-primary"];

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl text-center"
        >
          <div className="inline-flex p-6 rounded-[40px] bg-primary/10 mb-8">
            <MailCheck className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-5xl font-black text-text-main mb-6">Check your inbox</h1>
          <p className="text-xl text-text-muted font-medium mb-12 max-w-md mx-auto">
            We've sent a verification link to <span className="text-primary font-bold">{formData.email}</span>. Click it to activate your 50 free tokens!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/signin" className="px-12 py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                Sign In Now
             </Link>
             <button onClick={() => setRegistrationSuccess(false)} className="px-12 py-5 border-2 border-border text-text-main rounded-[24px] font-black text-lg hover:bg-bg-alt transition-all">
                Back to Registration
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white selection:bg-primary/10 overflow-hidden">
      {/* Left Side: Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-alt relative overflow-hidden p-16 flex-col justify-between">
        <div className="absolute inset-0">
           <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
           <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
           <Link to="/" className="flex items-center mb-20 space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-text-main tracking-tight">SkillSwap</span>
           </Link>
           
           <h2 className="text-6xl font-black text-text-main leading-[1.1] mb-8">
              Swap your <span className="text-primary italic">skills</span>,<br /> grow your <span className="text-secondary italic">world</span>.
           </h2>
           <p className="text-xl text-text-muted font-medium max-w-sm">
             Join a global collective of 5,000+ creators trading wisdom.
           </p>
        </div>

        <div className="relative z-10 space-y-8">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                 <Rocket className="text-primary w-6 h-6" />
              </div>
              <p className="text-text-main font-bold">Launch your mentorship profile in minutes.</p>
           </div>
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                 <ShieldCheck className="text-secondary w-6 h-6" />
              </div>
              <p className="text-text-main font-bold">100% secure tokenized skill exchange.</p>
           </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center w-full p-8 lg:w-1/2 relative z-10 overflow-y-auto"
      >
        <div className="w-full max-w-md py-12">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="mb-3 text-4xl font-black text-text-main tracking-tight">
              Create Account
            </h1>
            <p className="text-lg text-text-muted font-medium">
              Start your journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {errors.submit && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-red-100 rounded-2xl bg-red-50 flex items-start space-x-3"
                >
                  <span className="text-red-500 font-bold">⚠️</span>
                  <span className="text-sm font-bold text-red-600">{errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-black text-text-main uppercase tracking-widest pl-1">Full Name</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white ${errors.name ? "border-red-200" : ""}`}
              />
              {errors.name && <p className="text-xs font-black text-red-500 pl-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-black text-text-main uppercase tracking-widest pl-1">Email Address</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white ${errors.email ? "border-red-200" : ""}`}
              />
              {errors.email && <p className="text-xs font-black text-red-500 pl-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-black text-text-main uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                  placeholder="Min. 8 chars"
                  className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white pr-14 ${errors.password ? "border-red-200" : ""}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {formData.password && (
                <div className="px-1 pt-1">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Strength</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength >= 3 ? 'text-primary' : 'text-text-muted'}`}>
                        {strengthLabels[passwordStrength]}
                      </span>
                   </div>
                   <div className="flex gap-1 h-1.5">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= passwordStrength - 1 ? strengthColors[passwordStrength] : 'bg-border'}`} />
                      ))}
                   </div>
                </div>
              )}
              {errors.password && <p className="text-xs font-black text-red-500 pl-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-black text-text-main uppercase tracking-widest pl-1">Confirm Password</label>
              <div className="relative group">
                <input
                  type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Verify password"
                  className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white pr-14 ${errors.confirmPassword ? "border-red-200" : ""}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs font-black text-red-500 pl-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3 px-1">
               <input type="checkbox" required className="mt-1 w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer" />
               <p className="text-xs font-bold text-text-muted leading-snug">
                 By joining, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
               </p>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <><span>Sign Up</span><ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </form>

          <p className="mt-12 text-center text-text-muted font-bold">
            Already a member?{" "}
            <Link to="/signin" className="text-primary hover:underline font-black">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
});

SignUp.displayName = "SignUp";
export default SignUp;
