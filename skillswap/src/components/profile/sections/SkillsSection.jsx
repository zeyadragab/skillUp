import React, { memo, useState, useCallback, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { skillsAPI } from "../../../services/api";
import {
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  BookOpen,
  Award,
  Loader,
  Search,
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Coins,
  CheckCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SkillsSection = memo(() => {
  const { user, updateUser } = useUser();
  const [teachingSkills, setTeachingSkills] = useState([]);
  const [learningSkills, setLearningSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [activeTab, setActiveTab] = useState("teaching");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillForLevel, setSelectedSkillForLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("intermediate");
  const [tokensPerHour, setTokensPerHour] = useState(50);

  // Load user's skills and all available skills
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setTeachingSkills(user?.skillsToTeach || []);
      setLearningSkills(user?.skillsToLearn || []);

      const [skillsData, categoriesData] = await Promise.all([
        skillsAPI.getAll(),
        skillsAPI.getCategories()
      ]);

      setAllSkills(skillsData.skills || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillClick = (skill) => {
    setSelectedSkillForLevel(skill);
    setSelectedLevel(activeTab === "teaching" ? "intermediate" : "beginner");
  };

  const handleConfirmAddSkill = useCallback(async () => {
    if (!selectedSkillForLevel) return;
    try {
      if (activeTab === "teaching") {
        await skillsAPI.addToTeach(selectedSkillForLevel._id, selectedLevel, tokensPerHour);
      } else {
        await skillsAPI.addToLearn(selectedSkillForLevel._id, selectedLevel);
      }
      await loadData();
      setSelectedSkillForLevel(null);
      setShowAddSkill(false);
      setTokensPerHour(50);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  }, [selectedSkillForLevel, selectedLevel, activeTab, tokensPerHour]);

  const handleRemoveSkill = useCallback(async (skillId, type) => {
    try {
      await skillsAPI.removeUserSkill(skillId, type);
      await loadData();
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  }, []);

  const getLevelStyles = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "bg-blue-50 text-blue-600 border-blue-100";
      case "intermediate": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "advanced": return "bg-primary/5 text-primary border-primary/10";
      case "expert": return "bg-accent/5 text-accent border-accent/10";
      default: return "bg-bg-alt text-text-muted border-border";
    }
  };

  const filteredSkills = allSkills.filter(skill => {
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentSkills = activeTab === "teaching" ? teachingSkills : learningSkills;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xs font-black text-text-muted uppercase tracking-widest">Analyzing Talents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header with Custom Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Target className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-black text-text-main tracking-tight">Skill Matrix</h2>
          </div>
          
          <div className="flex p-1.5 bg-bg-alt rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab("teaching")}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === "teaching" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Teaching ({teachingSkills.length})
            </button>
            <button
              onClick={() => setActiveTab("learning")}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === "learning" ? "bg-white text-secondary shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Learning ({learningSkills.length})
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowAddSkill(true)}
          className="flex items-center px-8 py-4 space-x-3 font-black text-white transition-all bg-primary rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="uppercase tracking-widest text-sm">Add New Skill</span>
        </button>
      </div>

      {/* Current Skills Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {currentSkills.length > 0 ? (
            currentSkills.map((skill, idx) => (
              <motion.div
                layout
                key={skill._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="p-8 bg-white border border-border rounded-[32px] hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 relative group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                       <span className="text-2xl">{skill.icon || "🎯"}</span>
                       <h3 className="text-xl font-black text-text-main tracking-tight group-hover:text-primary transition-colors">
                         {skill.name}
                       </h3>
                    </div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{skill.category}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(skill._id, activeTab === "teaching" ? "teach" : "learn")}
                    className="p-3 text-text-muted transition-colors rounded-xl hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getLevelStyles(skill.level)}`}>
                     {skill.level}
                   </span>
                   {activeTab === "teaching" && (
                     <div className="flex items-center space-x-1.5 text-text-main font-black">
                        <Coins className="w-4 h-4 text-primary" />
                        <span>{skill.hourlyRate || 50}</span>
                     </div>
                   )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-border rounded-[48px] group hover:border-primary/30 transition-all">
              <div className="inline-flex p-8 rounded-[40px] bg-bg-alt mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-12 h-12 text-primary/30" />
              </div>
              <h3 className="text-2xl font-black text-text-main mb-3">
                No {activeTab} skills yet
              </h3>
              <p className="text-text-muted font-medium mb-10 max-w-sm mx-auto">
                Ready to contribute? Start by adding your first skill to your {activeTab} list.
              </p>
              <button
                onClick={() => setShowAddSkill(true)}
                className="px-10 py-5 bg-text-main text-white rounded-[24px] font-black text-sm hover:bg-primary transition-all shadow-xl"
              >
                Get Started Now
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddSkill && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/40 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-5xl max-h-[85vh] overflow-hidden bg-white rounded-[48px] shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-border flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-3xl font-black text-text-main tracking-tight">
                    Add to <span className={activeTab === 'teaching' ? 'text-primary' : 'text-secondary'}>{activeTab === "teaching" ? "Teaching" : "Learning"}</span>
                  </h3>
                  <p className="text-text-muted font-bold text-sm">Select a skill from our global marketplace.</p>
                </div>
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="p-4 text-text-muted hover:text-text-main bg-bg-alt rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto grow no-scrollbar">
                {/* Search & Categories */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12">
                  <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 text-text-muted transform -translate-y-1/2 left-6 top-1/2" />
                    <input
                      type="text"
                      placeholder="What do you want to master?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-5 pl-16 pr-8 bg-bg-alt border-2 border-transparent rounded-3xl outline-none focus:border-primary focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedCategory === "all" ? "bg-primary text-white" : "bg-bg-alt text-text-muted hover:bg-border"
                      }`}
                    >
                      All Skills
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          selectedCategory === cat.name ? "bg-primary text-white" : "bg-bg-alt text-text-muted hover:bg-border"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Results Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSkills.map((skill) => (
                    <div
                      key={skill._id}
                      onClick={() => handleSkillClick(skill)}
                      className="p-8 bg-bg-alt border-2 border-transparent rounded-[32px] hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 mb-6">
                         <span className="text-3xl group-hover:scale-110 transition-transform">{skill.icon || "🎯"}</span>
                         <h4 className="font-black text-xl text-text-main">{skill.name}</h4>
                      </div>
                      <p className="text-sm text-text-muted font-semibold line-clamp-2 mb-6">{skill.description || "The art and science of mastering this domain."}</p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2 text-text-muted">
                            <Users className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{skill.totalTeachers || 0} Experts</span>
                         </div>
                         <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary border border-border group-hover:bg-primary group-hover:text-white transition-all">
                            <Plus className="w-4 h-4" />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Selection Modal */}
      <AnimatePresence>
        {selectedSkillForLevel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-[48px] p-12 shadow-2xl relative"
            >
              <div className="text-center mb-10">
                <div className="text-6xl mb-6">{selectedSkillForLevel.icon || "🎯"}</div>
                <h3 className="text-3xl font-black text-text-main mb-2">
                  {selectedSkillForLevel.name}
                </h3>
                <p className="text-text-muted font-bold text-sm">
                  Define your proficiency for {activeTab}.
                </p>
              </div>

              <div className="space-y-3 mb-10">
                {["beginner", "intermediate", "advanced", "expert"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group ${
                      selectedLevel === level ? "border-primary bg-primary/5 shadow-inner" : "border-border hover:border-text-muted"
                    }`}
                  >
                    <div>
                      <p className={`font-black uppercase tracking-widest text-xs mb-1 ${selectedLevel === level ? "text-primary" : "text-text-muted"}`}>{level}</p>
                      <p className="text-sm font-bold text-text-main/70">
                        {level === "beginner" && "Foundational knowledge"}
                        {level === "intermediate" && "Professional proficiency"}
                        {level === "advanced" && "Strategic domain mastery"}
                        {level === "expert" && "Industry leading expert"}
                      </p>
                    </div>
                    {selectedLevel === level && <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"><CheckCircle className="w-4 h-4 text-white" /></div>}
                  </button>
                ))}
              </div>

              {activeTab === "teaching" && (
                <div className="mb-10 p-8 bg-bg-alt rounded-[32px] border border-border">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">
                    Set Your Value (Tokens/Hr)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={tokensPerHour}
                      onChange={(e) => setTokensPerHour(parseInt(e.target.value) || 50)}
                      className="w-full py-5 px-8 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-primary font-black text-2xl pr-24"
                    />
                    <Coins className="absolute right-8 top-1/2 -translate-y-1/2 text-primary w-8 h-8 opacity-20" />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedSkillForLevel(null)}
                  className="flex-1 py-5 font-black uppercase tracking-widest text-xs text-text-muted hover:text-text-main transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmAddSkill}
                  className="flex-1 py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  Verify & Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SkillsSection.displayName = "SkillsSection";

export default SkillsSection;
