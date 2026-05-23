import React, { memo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import { useLanguage } from "../components/context/LanguageContext";
import {
  Eye,
  EyeOff,
  Loader,
  Smartphone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignIn = memo(() => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useUser();
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = t("auth_error_email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth_error_valid_email");
    }
    if (!formData.password) {
      newErrors.password = t("auth_error_password_required");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth_error_password_min");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      const result = await login(formData.email, formData.password);
      if (result.success) navigate("/home");
      else setErrors({ submit: result.error });
    },
    [formData, validateForm, login, navigate],
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-white selection:bg-primary/10">
      {/* Left Side: Form Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 flex items-center justify-center w-full p-8 lg:w-1/2"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-12 space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 transition-transform shadow-lg rounded-xl group-hover:rotate-12 shadow-primary/20">
              <img src="./skillup.png" className="w-9 h-9" />
            </div>
            {/* <span className="text-2xl font-black tracking-tight text-text-main">
              SkillUp
            </span> */}
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="mb-3 text-4xl font-black tracking-tight text-text-main">
              {t("auth_welcome_back")}
            </h1>
            <p className="text-lg font-medium text-text-muted">
              {t("auth_continue_journey")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start p-4 space-x-3 border border-red-100 rounded-2xl bg-red-50"
                >
                  <span className="font-bold text-red-500">⚠️</span>
                  <span className="text-sm font-bold leading-tight text-red-600">
                    {errors.submit}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="pl-1 text-sm font-black tracking-widest uppercase text-text-main">
                {t("auth_email_label")}
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("auth_email_placeholder")}
                  className={`w-full px-6 py-4 bg-bg-alt border-2 rounded-[20px] outline-none transition-all font-bold ${
                    errors.email
                      ? "border-red-200 focus:border-red-500"
                      : "border-transparent focus:border-primary focus:bg-white"
                  }`}
                />
                <div className="absolute inset-0 rounded-[20px] pointer-events-none border-2 border-primary/0 group-focus-within:border-primary/20 transition-all scale-[1.02]" />
              </div>
              {errors.email && (
                <p className="pl-1 text-xs font-black text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="text-sm font-black tracking-widest uppercase text-text-main">
                  {t("auth_password_label")}
                </label>
                <Link
                  to="/forgot-password"
                  size="sm"
                  className="text-xs font-black tracking-widest uppercase text-primary hover:underline"
                >
                  {t("auth_forgot_password")}
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
                  className="absolute transition-colors -translate-y-1/2 right-5 top-1/2 text-text-muted hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-[20px] pointer-events-none border-2 border-primary/0 group-focus-within:border-primary/20 transition-all scale-[1.02]" />
              </div>
              {errors.password && (
                <p className="pl-1 text-xs font-black text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="flex items-center justify-center w-full py-5 space-x-3 text-lg font-black text-white transition-all shadow-xl bg-primary rounded-3xl shadow-primary/20 hover:bg-primary-hover disabled:opacity-50"
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>{t("auth_sign_in")}</span>
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
                <span className="px-4 font-bold tracking-widest uppercase bg-white text-text-muted">
                  {t("auth_or_continue")}
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-4 font-bold transition-colors border-2 border-border rounded-2xl hover:bg-bg-alt group"
              >
                <svg
                  className="w-5 h-5 mr-3 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("auth_google")}
              </button>
              <Link
                to="/otp-login"
                className="flex items-center justify-center px-4 py-4 font-bold transition-colors border-2 border-border rounded-2xl hover:bg-bg-alt"
              >
                <Smartphone className="w-5 h-5 mr-3 text-secondary" />
                {t("auth_phone")}
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="font-bold text-text-muted">
              {t("auth_no_account")}{" "}
              <Link
                to="/signup"
                className="font-black text-primary hover:underline"
              >
                {t("auth_sign_up")}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Visual Section */}
      <div className="relative flex-col justify-between hidden p-16 overflow-hidden lg:flex lg:w-1/2 bg-text-main">
        {/* Abstract Background */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [bg-size:40px_40px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center mb-12 space-x-3 text-white/50">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-[0.2em]">
              Verified Community
            </span>
          </div>

          <h2 className="mb-8 text-5xl font-black leading-tight text-white">
            "The best way to{" "}
            <span className="italic text-primary">predict</span> the future is
            to create it together."
          </h2>
        </div>

        {/* Dynamic Cards Overlay */}
        <div className="relative z-10 h-[300px]">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 p-8 glass-dark border-white/10 rounded-4xl w-72"
          >
            <div className="flex items-center mb-6 space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/20 text-secondary">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-white">Quick Skill</p>
                <p className="text-xs text-white/50">Recently Swapped</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="w-full h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{ width: ["0%", "85%"] }}
                  className="h-full bg-secondary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 border-2 rounded-full border-slate-900 bg-slate-700"
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-white/80">
                  +12 More
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-0 left-0 p-8 glass-dark border-white/10 rounded-4xl w-72"
          >
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                <Star className="w-5 h-5 text-white" />
              </div>
              <p className="font-black text-white">Top Talent</p>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/60">
              Connect with the top 1% of creative minds in our network.
            </p>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] text-white font-black uppercase tracking-widest">
                UX Design
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] text-white font-black uppercase tracking-widest">
                React
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/30">
          <span className="text-xs font-black tracking-widest uppercase">
            © 2025 SkillUp
          </span>
          <div className="flex space-x-6 text-xs font-black tracking-widest uppercase">
            <a href="#" className="transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

SignIn.displayName = "SignIn";
export default SignIn;
