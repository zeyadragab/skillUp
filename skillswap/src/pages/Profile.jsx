import React, { memo, useState, useCallback } from "react";
import { useUser } from "../components/context/UserContext";
import { useLanguage } from "../components/context/LanguageContext";
import {
  Edit3,
  Settings as SettingsIcon,
  Share2,
  MapPin,
  Globe,
  CheckCircle,
  Award,
  Coins,
  Calendar,
  Zap,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Target,
  BookOpen,
  Users,
  Star,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserInfoSection from "../components/profile/sections/UserInfoSection";
import SkillsSection from "../components/profile/sections/SkillsSection";
import TokensSection from "../components/profile/sections/TokensSection";
import CoursesSection from "../components/profile/sections/CoursesSection";
import ConnectionsSection from "../components/profile/sections/ConnectionsSection";
import SessionsSection from "../components/profile/sections/SessionsSection";
import SettingsSection from "../components/profile/sections/SettingsSection";
import EditProfileModal from "../components/profile/modals/EditProfileModal";
import ProfilePictureUpload from "../components/profile/ProfilePictureUpload";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

// ==================== PROFILE NAVIGATION TABS ====================
const ProfileTabs = memo(({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  const tabs = [
    { id: "overview", label: t("prof_overview"), icon: UserIcon },
    { id: "skills", label: t("prof_skills"), icon: Target },
    { id: "courses", label: t("prof_courses"), icon: BookOpen },
    { id: "tokens", label: t("prof_tokens"), icon: Coins },
    { id: "connections", label: t("prof_connections"), icon: Users },
    { id: "sessions", label: t("prof_sessions"), icon: BarChart2 },
    { id: "settings", label: t("prof_settings"), icon: SettingsIcon },
  ];

  return (
    <div className="sticky z-20 border-b bg-white/80 backdrop-blur-md border-border top-16">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="flex items-center py-2 space-x-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap group ${
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-text-muted hover:text-text-main hover:bg-bg-alt"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-text-muted"}`}
                />
                <span className="tracking-widest uppercase">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ProfileTabs.displayName = "ProfileTabs";

// ==================== PROFILE HEADER ====================
const ProfileHeader = memo(
  ({ user, onEditClick, onSettingsClick, onAvatarClick }) => {
    const { t } = useLanguage();
    return (
      <div className="relative pt-24 pb-16 overflow-hidden bg-white">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute top-0 left-0 w-[500px] h-[200px] bg-secondary/5 blur-[80px]" />

        <div className="relative px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:gap-16">
            {/* Avatar Container */}
            <div className="relative group shrink-0">
              <div className="relative w-40 h-40 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl shadow-primary/10">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User",
                    )}&background=7c3aed&color=fff&size=200`
                  }
                  alt={user?.name}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <button
                  onClick={onAvatarClick}
                  className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-text-main/60 group-hover:opacity-100"
                >
                  <div className="text-center text-white">
                    <Edit3 className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t("prof_update_avatar")}
                    </span>
                  </div>
                </button>
              </div>
              {user?.isActive && (
                <div className="absolute flex items-center justify-center w-10 h-10 border-4 border-white shadow-lg -bottom-2 -right-2 bg-secondary rounded-2xl">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap justify-center gap-3 mb-6 lg:justify-start">
                {user?.isVerified && (
                  <span className="flex items-center space-x-2 px-4 py-1.5 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary/10">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t("prof_verified")}</span>
                  </span>
                )}
                {user?.isTeacher && (
                  <span className="flex items-center space-x-2 px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                    <Award className="w-3 h-3" />
                    <span>{t("prof_elite_mentor")}</span>
                  </span>
                )}
                <span className="flex items-center space-x-2 px-4 py-1.5 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full border border-accent/20">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>{t("prof_level")} {user?.level || 1}</span>
                </span>
              </div>

              <h1 className="mb-4 text-5xl font-black tracking-tight text-text-main">
                {user?.name}
              </h1>

              <p className="max-w-2xl mx-auto mb-8 text-xl font-medium leading-relaxed text-text-muted lg:mx-0">
                {user?.bio || t("prof_expert_learner")}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-8 lg:justify-start">
                <div className="flex items-center space-x-2 text-sm font-bold text-text-muted">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{user?.country || t("prof_global_citizen")}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-bold text-text-muted">
                  <Globe className="w-4 h-4 text-secondary" />
                  <span>{user?.languages?.join(", ") || t("prof_english")}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-bold text-text-muted">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{t("prof_member_since")}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex w-full gap-4 lg:flex-col lg:w-48">
              <button
                onClick={onEditClick}
                className="flex items-center justify-center flex-1 px-6 py-4 space-x-3 text-sm font-black text-white transition-all shadow-xl bg-primary rounded-2xl shadow-primary/20 hover:bg-primary-hover group"
              >
                <Edit3 className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span>{t("prof_edit_profile")}</span>
              </button>
              <button className="flex items-center justify-center p-4 transition-all border-2 border-border text-text-muted rounded-2xl hover:border-primary hover:text-primary">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Floating Stat Cards Overlay */}
          <div className="grid grid-cols-2 gap-6 mt-16 md:grid-cols-4">
            <div className="p-6 transition-all border bg-bg-alt rounded-3xl border-border group hover:bg-white hover:shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                {t("prof_avg_rating")}
              </p>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-black transition-colors text-text-main group-hover:text-primary">
                  {user?.averageRating?.toFixed(1) || "5.0"}
                </span>
                <Star className="w-5 h-5 text-accent fill-accent mb-1.5" />
              </div>
            </div>
            <div className="p-6 transition-all border bg-bg-alt rounded-3xl border-border group hover:bg-white hover:shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                {t("prof_tokens_balance")}
              </p>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-black transition-colors text-text-main group-hover:text-primary">
                  {user?.tokens || 0}
                </span>
                <Coins className="w-5 h-5 text-primary mb-1.5" />
              </div>
            </div>
            <div className="p-6 transition-all border bg-bg-alt rounded-3xl border-border group hover:bg-white hover:shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                {t("prof_total_sessions")}
              </p>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-black transition-colors text-text-main group-hover:text-primary">
                  {(user?.totalSessionsTaught || 0) +
                    (user?.totalSessionsLearned || 0)}
                </span>
                <BarChart2 className="w-5 h-5 text-secondary mb-1.5" />
              </div>
            </div>
            <div className="p-6 transition-all border bg-bg-alt rounded-3xl border-border group hover:bg-white hover:shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                {t("prof_network_rank")}
              </p>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-black transition-colors text-text-main group-hover:text-primary">
                  Top 5%
                </span>
                <TrendingUp className="w-5 h-5 text-accent mb-1.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ProfileHeader.displayName = "ProfileHeader";

// ==================== MAIN PROFILE COMPONENT ====================
const Profile = memo(() => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleAvatarUpdate = useCallback((newAvatar) => {
    console.log("Avatar updated:", newAvatar);
  }, []);

  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-main">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 rounded-full border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-xs font-black tracking-widest uppercase text-text-muted">
            {t("prof_accessing")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <ProfileHeader
          user={user}
          onEditClick={() => setShowEditModal(true)}
          onSettingsClick={() => handleTabChange("settings")}
          onAvatarClick={() => setShowAvatarUpload(true)}
        />

        <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="px-6 py-12 mx-auto max-w-7xl sm:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                  <div className="space-y-12 lg:col-span-2">
                    <UserInfoSection user={user} />
                  </div>
                  <div className="space-y-8">
                    <TokensSection />
                    <ConnectionsSection />
                  </div>
                </div>
              )}
              {activeTab === "skills" && <SkillsSection />}
              {activeTab === "courses" && <CoursesSection />}
              {activeTab === "tokens" && <TokensSection fullPage />}
              {activeTab === "connections" && <ConnectionsSection fullPage />}
              {activeTab === "sessions" && <SessionsSection />}
              {activeTab === "settings" && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      <Footer />

      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
      )}

      {showAvatarUpload && (
        <ProfilePictureUpload
          currentAvatar={user?.avatar}
          onClose={() => setShowAvatarUpload(false)}
          onUpdate={handleAvatarUpdate}
        />
      )}
    </div>
  );
});

Profile.displayName = "Profile";

export default Profile;
