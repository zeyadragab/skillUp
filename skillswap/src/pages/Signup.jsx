import React, { memo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import { useLanguage } from "../components/context/LanguageContext";
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
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignUp = memo(() => {
  const { t } = useLanguage();
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
    if (!formData.name.trim()) newErrors.name = t("auth_name_label") + " " + t("common_error");
    if (!formData.email) newErrors.email = t("auth_error_email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t("auth_error_valid_email");
    if (!formData.password) newErrors.password = t("auth_error_password_required");
    else if (formData.password.length < 8)
      newErrors.password = "Minimum 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords match error";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "password") setPasswordStrength(calculateStrength(value));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors, calculateStrength],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      const result = await register(formData);
      if (result.success) setRegistrationSuccess(true);
      else setErrors({ submit: result.error });
    },
    [formData, validateForm, register],
  );

  const strengthLabels = [
    t("auth_very_weak"),
    t("auth_weak"),
    t("auth_fair"),
    t("auth_good"),
    t("auth_strong"),
  ];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-primary",
  ];

  if (registrationSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl text-center"
        >
          <div className="inline-flex p-6 rounded-[40px] bg-primary/10 mb-8">
            <MailCheck className="w-16 h-16 text-primary" />
          </div>
          <h1 className="mb-6 text-5xl font-black text-text-main">
            Check your inbox
          </h1>
          <p className="max-w-md mx-auto mb-12 text-xl font-medium text-text-muted">
            We've sent a verification link to{" "}
            <span className="font-bold text-primary">{formData.email}</span>.
            Click it to activate your 50 free tokens!
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/signin"
              className="px-12 py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all"
            >
              Sign In Now
            </Link>
            <button
              onClick={() => setRegistrationSuccess(false)}
              className="px-12 py-5 border-2 border-border text-text-main rounded-[24px] font-black text-lg hover:bg-bg-alt transition-all"
            >
              Back to Registration
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-white selection:bg-primary/10">
      {/* Left Side: Visual */}
      <div className="relative flex-col justify-between hidden p-16 overflow-hidden lg:flex lg:w-1/2 bg-bg-alt">
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center mb-20 space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 transition-transform shadow-lg bg-primary rounded-xl group-hover:rotate-12 shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-text-main">
              SkillUp
            </span>
          </Link>

          <h2 className="text-6xl font-black text-text-main leading-[1.1] mb-8">
            Swap your <span className="italic text-primary">skills</span>,<br />{" "}
            grow your <span className="italic text-secondary">world</span>.
          </h2>
          <p className="max-w-sm text-xl font-medium text-text-muted">
            Join a global collective of 5,000+ creators trading wisdom.
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white shadow-lg rounded-2xl">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <p className="font-bold text-text-main">
              Launch your mentorship profile in minutes.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white shadow-lg rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-secondary" />
            </div>
            <p className="font-bold text-text-main">
              100% secure tokenized skill exchange.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 flex items-center justify-center w-full p-8 overflow-y-auto lg:w-1/2"
      >
        <div className="w-full max-w-md py-12">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="mb-3 text-4xl font-black tracking-tight text-text-main">
              Create Account
            </h1>
            <p className="text-lg font-medium text-text-muted">
              Start your journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start p-4 space-x-3 border border-red-100 rounded-2xl bg-red-50"
                >
                  <span className="font-bold text-red-500">⚠️</span>
                  <span className="text-sm font-bold text-red-600">
                    {errors.submit}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name */}
            <div className="space-y-2">
              <label className="pl-1 text-sm font-black tracking-widest uppercase text-text-main">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white ${errors.name ? "border-red-200" : ""}`}
              />
              {errors.name && (
                <p className="pl-1 text-xs font-black text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="pl-1 text-sm font-black tracking-widest uppercase text-text-main">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white ${errors.email ? "border-red-200" : ""}`}
              />
              {errors.email && (
                <p className="pl-1 text-xs font-black text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="pl-1 text-sm font-black tracking-widest uppercase text-text-main">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 chars"
                  className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white pr-14 ${errors.password ? "border-red-200" : ""}`}
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
              </div>

              {/* Strength Meter */}
              {formData.password && (
                <div className="px-1 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Strength
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength >= 3 ? "text-primary" : "text-text-muted"}`}
                    >
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-500 ${i <= passwordStrength - 1 ? strengthColors[passwordStrength] : "bg-border"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="pl-1 text-xs font-black text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="pl-1 text-sm font-black tracking-widest uppercase text-text-main">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Verify password"
                  className={`w-full px-6 py-4 bg-bg-alt border-2 border-transparent rounded-[20px] outline-none transition-all font-bold focus:border-primary focus:bg-white pr-14 ${errors.confirmPassword ? "border-red-200" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute transition-colors -translate-y-1/2 right-5 top-1/2 text-text-muted hover:text-primary"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="pl-1 text-xs font-black text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start px-1 space-x-3">
              <input
                type="checkbox"
                required
                className="w-5 h-5 mt-1 border-2 rounded-lg cursor-pointer border-border text-primary focus:ring-primary/20 accent-primary"
              />
              <p className="text-xs font-bold leading-snug text-text-muted">
                By joining, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-12 font-bold text-center text-text-muted">
            Already a member?{" "}
            <Link
              to="/signin"
              className="font-black text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
});

SignUp.displayName = "SignUp";
export default SignUp;
