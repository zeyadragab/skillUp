import React, { memo } from "react";
import { Mail, MapPin, Globe, Award, Calendar, Sparkles, Target } from "lucide-react";

const UserInfoSection = memo(({ user }) => {
  return (
    <div className="p-10 bg-white border border-border shadow-sm rounded-[48px] relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-10">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black text-text-main tracking-tight">
            About Me
          </h2>
        </div>

        <div className="space-y-10">
          {/* Bio */}
          <div className="relative">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-4">Biography</h3>
            <p className="text-lg leading-relaxed text-text-muted font-medium">
              {user?.bio || "You haven't shared your story yet. Add a bio to help the community get to know your unique strengths and journey."}
            </p>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center space-x-4 group/item">
              <div className="w-12 h-12 rounded-2xl bg-bg-alt flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300">
                 <Mail className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Email</p>
                 <p className="text-sm font-bold text-text-main">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 group/item">
              <div className="w-12 h-12 rounded-2xl bg-bg-alt flex items-center justify-center text-secondary group-hover/item:bg-secondary group-hover/item:text-white transition-all duration-300">
                 <MapPin className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Location</p>
                 <p className="text-sm font-bold text-text-main">{user?.country || "Global Citizen"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 group/item">
              <div className="w-12 h-12 rounded-2xl bg-bg-alt flex items-center justify-center text-accent group-hover/item:bg-accent group-hover/item:text-white transition-all duration-300">
                 <Globe className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Languages</p>
                 <p className="text-sm font-bold text-text-main">{user?.languages?.join(", ") || "English"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 group/item">
              <div className="w-12 h-12 rounded-2xl bg-bg-alt flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300">
                 <Calendar className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Joined Community</p>
                 <p className="text-sm font-bold text-text-main">January 2024</p>
              </div>
            </div>
          </div>

          {/* Achievements / Badges */}
          <div>
            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Expertise Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="px-5 py-2.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/10 hover:bg-primary hover:text-white transition-all cursor-default">
                Top Rated
              </div>
              <div className="px-5 py-2.5 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-widest rounded-xl border border-secondary/10 hover:bg-secondary hover:text-white transition-all cursor-default">
                Active Mentor
              </div>
              <div className="px-5 py-2.5 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-widest rounded-xl border border-accent/20 hover:bg-accent hover:text-white transition-all cursor-default">
                100+ Hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

UserInfoSection.displayName = "UserInfoSection";

export default UserInfoSection;
