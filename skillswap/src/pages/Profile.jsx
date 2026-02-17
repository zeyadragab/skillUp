import React, { memo, useState, useCallback } from "react";
import { useUser } from "../components/context/UserContext";
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
  BarChart2
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
  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "skills", label: "Skills", icon: Target },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "tokens", label: "Tokens", icon: Coins },
    { id: "connections", label: "Connections", icon: Users },
    { id: "sessions", label: "Sessions", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="sticky z-20 bg-white/80 backdrop-blur-md border-b border-border top-16">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2">
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
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-text-muted"}`} />
                <span className="uppercase tracking-widest">{tab.label}</span>
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
const ProfileHeader = memo(({ user, onEditClick, onSettingsClick, onAvatarClick }) => {
  return (
    <div className="relative pt-24 pb-16 bg-white overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute top-0 left-0 w-[500px] h-[200px] bg-secondary/5 blur-[80px]" />

      <div className="relative px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-16">
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            <div className="relative w-40 h-40 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl shadow-primary/10">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "User"
                  )}&background=7c3aed&color=fff&size=200`
                }
                alt={user?.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <button
                onClick={onAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-text-main/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="text-center text-white">
                   <Edit3 className="w-6 h-6 mx-auto mb-1" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                </div>
              </button>
            </div>
            {user?.isActive && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary border-4 border-white rounded-2xl flex items-center justify-center shadow-lg">
                 <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              {user?.isVerified && (
                <span className="flex items-center space-x-2 px-4 py-1.5 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary/10">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              )}
              {user?.isTeacher && (
                <span className="flex items-center space-x-2 px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                  <Award className="w-3 h-3" />
                  <span>Elite Mentor</span>
                </span>
              )}
              <span className="flex items-center space-x-2 px-4 py-1.5 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full border border-accent/20">
                <Zap className="w-3 h-3 fill-current" />
                <span>Level {user?.level || 1}</span>
              </span>
            </div>

            <h1 className="text-5xl font-black text-text-main tracking-tight mb-4">
              {user?.name}
            </h1>
            
            <p className="text-xl text-text-muted font-medium mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {user?.bio || "Expert learner and contributor at SkillSwap. Passionate about growth and mentorship."}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-8 items-center">
               <div className="flex items-center space-x-2 text-text-muted text-sm font-bold">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{user?.country || "Global Citizen"}</span>
               </div>
               <div className="flex items-center space-x-2 text-text-muted text-sm font-bold">
                  <Globe className="w-4 h-4 text-secondary" />
                  <span>{user?.languages?.join(", ") || "English"}</span>
               </div>
               <div className="flex items-center space-x-2 text-text-muted text-sm font-bold">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>Member since 2024</span>
               </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex lg:flex-col gap-4 w-full lg:w-48">
            <button
              onClick={onEditClick}
              className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all group"
            >
              <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Edit Profile</span>
            </button>
            <button className="p-4 border-2 border-border text-text-muted rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Stat Cards Overlay */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
           <div className="bg-bg-alt p-6 rounded-3xl border border-border group hover:bg-white hover:shadow-xl transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Average Rating</p>
              <div className="flex items-end space-x-2">
                 <span className="text-3xl font-black text-text-main group-hover:text-primary transition-colors">{user?.averageRating?.toFixed(1) || "5.0"}</span>
                 <Star className="w-5 h-5 text-accent fill-accent mb-1.5" />
              </div>
           </div>
           <div className="bg-bg-alt p-6 rounded-3xl border border-border group hover:bg-white hover:shadow-xl transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Tokens Balance</p>
              <div className="flex items-end space-x-2">
                 <span className="text-3xl font-black text-text-main group-hover:text-primary transition-colors">{user?.tokens || 0}</span>
                 <Coins className="w-5 h-5 text-primary mb-1.5" />
              </div>
           </div>
           <div className="bg-bg-alt p-6 rounded-3xl border border-border group hover:bg-white hover:shadow-xl transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Total Sessions</p>
              <div className="flex items-end space-x-2">
                 <span className="text-3xl font-black text-text-main group-hover:text-primary transition-colors">
                    {(user?.totalSessionsTaught || 0) + (user?.totalSessionsLearned || 0)}
                 </span>
                 <BarChart2 className="w-5 h-5 text-secondary mb-1.5" />
              </div>
           </div>
           <div className="bg-bg-alt p-6 rounded-3xl border border-border group hover:bg-white hover:shadow-xl transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Network Rank</p>
              <div className="flex items-end space-x-2">
                 <span className="text-3xl font-black text-text-main group-hover:text-primary transition-colors">Top 5%</span>
                 <TrendingUp className="w-5 h-5 text-accent mb-1.5" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
});

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-main">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary/20 rounded-full border-t-primary animate-spin"></div>
          <p className="text-text-muted font-black uppercase tracking-widest text-xs">Accessing Profile...</p>
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
                    <div className="lg:col-span-2 space-y-12">
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
