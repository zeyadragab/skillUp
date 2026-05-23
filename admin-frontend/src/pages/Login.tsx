import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Shield,
  Users,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-rail">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(oklch(68% 0.17 55) 1px, transparent 1px), linear-gradient(90deg, oklch(68% 0.17 55) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-[480px] h-[480px] bg-accent/5 rounded-full blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-[oklch(15%_0.008_55)]" />
            </div>
            <span className="text-[15px] font-semibold text-fg-inv tracking-tight">
              skillup
            </span>
          </div>

          <div className="max-w-md">
            <p className="text-[11px] font-semibold text-accent uppercase tracking-widest mb-4">
              Admin Console
            </p>
            <h1 className="text-[44px] font-bold leading-[1.1] text-fg-inv mb-5">
              Platform
              <br />
              Operations
            </h1>
            <p className="text-[15px] text-fg-rail leading-relaxed mb-12">
              Manage users, verify teachers, moderate content, and track
              platform health from a single workspace.
            </p>
            <div className="space-y-3">
              {[
                {
                  icon: Users,
                  title: "User Management",
                  desc: "Full control over users and teachers",
                },
                {
                  icon: BarChart3,
                  title: "Real-time Analytics",
                  desc: "Track growth and engagement metrics",
                },
                {
                  icon: Shield,
                  title: "Secure Access",
                  desc: "Role-based permissions system",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-center gap-3.5 p-3.5 bg-rail-hi rounded-xl"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent-dim flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-fg-inv">
                      {title}
                    </p>
                    <p className="text-[11px] text-fg-rail">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[12px] text-fg-rail/50">
            © 2024 skillup. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-[oklch(15%_0.008_55)]" />
            </div>
            <span className="text-[15px] font-semibold text-fg-inv">
              skillup
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[24px] font-semibold text-fg-1 mb-1.5">
              Welcome back
            </h2>
            <p className="text-[14px] text-fg-3">
              Sign in to access the admin dashboard
            </p>
          </div>

          {error && (
            <div className="p-3.5 mb-5 border border-err/30 rounded-lg bg-err-bg">
              <p className="text-[13px] text-err">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skillup.com"
                  required
                  className="w-full h-10 pl-9 pr-4 bg-panel border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-10 pl-9 pr-10 bg-panel border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg-1 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 flex items-center justify-center gap-2 mt-6 font-semibold text-[13px] text-[oklch(15%_0.008_55)] bg-accent hover:bg-accent-hi rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[oklch(15%_0.008_55)]/30 border-t-[oklch(15%_0.008_55)] rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-panel border border-edge rounded-xl">
            <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-widest mb-3">
              Demo Credentials
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-fg-3">Email</span>
                <code className="text-[12px] text-accent bg-accent-dim px-2 py-0.5 rounded">
                  admin@swaply.com
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-fg-3">Password</span>
                <code className="text-[12px] text-accent bg-accent-dim px-2 py-0.5 rounded">
                  password123
                </code>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-center text-fg-3/60">
            Secure admin access · All activities are logged
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
