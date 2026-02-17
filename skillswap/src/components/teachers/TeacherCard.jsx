import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Users, Globe, ArrowRight, Coins } from "lucide-react";
import { motion } from "framer-motion";

const TeacherCard = memo(({ teacher, featured = false }) => {
  const navigate = useNavigate();

  const handleBookSession = (e) => {
    e.stopPropagation();
    navigate(`/profile/${teacher._id || teacher.id}`);
  };

  const handleCardClick = () => {
    navigate(`/profile/${teacher._id || teacher.id}`);
  };

  const displaySkills = teacher.skillsToTeach?.slice(0, 3) || teacher.skills?.slice(0, 3) || [];
  const totalSkills = teacher.skillsToTeach?.length || teacher.skills?.length || 0;
  const hasMoreSkills = totalSkills > 3;

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -8 }}
      className={`relative bg-white rounded-[32px] overflow-hidden border border-border transition-all duration-300 cursor-pointer group hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] ${
        featured ? "ring-2 ring-primary ring-offset-4 shadow-xl" : ""
      }`}
    >
      {/* Top Section with Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <motion.img
          src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&size=400&background=7c3aed&color=fff`}
          alt={teacher.name}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full shadow-lg flex items-center space-x-1 border border-white/30 backdrop-blur-md">
          <Star className="h-4 w-4 text-accent fill-current" />
          <span className="text-sm font-black text-text-main">
            {teacher.averageRating?.toFixed(1) || teacher.rating || "5.0"}
          </span>
        </div>
        
        {/* Verification Check */}
        {teacher.isVerified && (
          <div className="absolute bottom-4 left-4 bg-primary text-white p-2 rounded-xl shadow-lg">
             <Star className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-text-main group-hover:text-primary transition-colors mb-1">
              {teacher.name}
            </h3>
            <div className="flex items-center space-x-2 text-text-muted text-sm font-bold">
               <Globe className="h-4 w-4" />
               <span>{teacher.languages?.[0] || teacher.language || "Global"}</span>
            </div>
          </div>
        </div>

        <p className="text-text-muted text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
          {teacher.headline || teacher.bio?.substring(0, 50) || "Exchange skills and grow through personalized mentoring sessions."}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {displaySkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-xs font-black tracking-wide uppercase"
            >
              {skill.name || skill}
            </span>
          ))}
          {hasMoreSkills && (
            <span className="px-3 py-1 bg-bg-alt text-text-muted rounded-lg text-xs font-bold">
              +{totalSkills - 3}
            </span>
          )}
        </div>

        {/* Pricing & Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex flex-col">
            <span className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Price</span>
            <div className="flex items-center space-x-1">
               <Coins className="w-4 h-4 text-accent" />
               <span className="text-lg font-black text-text-main">
                {teacher.tokensPerSession || 5}
               </span>
            </div>
          </div>
          
          <motion.button
            onClick={handleBookSession}
            className="flex items-center justify-center bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 group-hover:bg-primary-hover group-hover:scale-110 transition-all"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

TeacherCard.displayName = "TeacherCard";

export default TeacherCard;
