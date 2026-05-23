import React, { memo, useState, useCallback, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { skillsAPI, authAPI } from "../../../services/api";
import { useLanguage } from "../../context/LanguageContext";
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
  X,
  Pencil,
  Check,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Level helpers ──────────────────────────────────────────────────────────────
const LEVELS = [
  { key: "beginner",     label: "Beginner",     desc: "Foundational",   emoji: "🌱" },
  { key: "intermediate", label: "Intermediate", desc: "Professional",   emoji: "⚡" },
  { key: "advanced",     label: "Advanced",     desc: "Strategic",      emoji: "🔥" },
  { key: "expert",       label: "Expert",       desc: "Industry lead",  emoji: "👑" },
];

const getLevelStyles = (level) => {
  switch (level?.toLowerCase()) {
    case "beginner":    return "bg-blue-50 text-blue-600 border-blue-100";
    case "intermediate":return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "advanced":    return "bg-primary/5 text-primary border-primary/10";
    case "expert":      return "bg-accent/5 text-accent border-accent/10";
    default:            return "bg-bg-alt text-text-muted border-border";
  }
};

// ── Inline delete-confirm button ───────────────────────────────────────────────
const DeleteConfirm = memo(({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-4xl bg-white/95 backdrop-blur-sm z-10 p-4"
  >
    <AlertTriangle className="w-6 h-6 text-red-500" />
    <p className="text-[11px] font-black uppercase tracking-widest text-text-main text-center">
      Remove this skill?
    </p>
    <div className="flex gap-2 w-full">
      <button
        onClick={onCancel}
        className="flex-1 py-2 rounded-xl bg-bg-alt text-text-muted text-[10px] font-black uppercase tracking-widest hover:bg-border transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
      >
        Remove
      </button>
    </div>
  </motion.div>
));
DeleteConfirm.displayName = "DeleteConfirm";

// ── Level + tokens selector modal (shared by Add and Edit) ─────────────────────
const LevelTokenModal = memo(({
  skill,
  initialLevel,
  initialTokens,
  activeTab,
  isEdit,
  onConfirm,
  onCancel,
  isSaving,
}) => {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel || "intermediate");
  const [tokensPerHour, setTokensPerHour] = useState(initialTokens || 50);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-text-main/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-md bg-white rounded-t-[36px] sm:rounded-4xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="text-3xl">{skill.icon || "🎯"}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black truncate text-text-main">
              {skill.name}
            </h3>
            <p className="text-xs font-semibold text-text-muted">
              {isEdit ? "Edit skill details" : "Select your level"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 transition-colors rounded-xl bg-bg-alt text-text-muted hover:text-text-main shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Grid — 2x2 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {LEVELS.map(({ key, label, desc, emoji }) => (
            <button
              key={key}
              onClick={() => setSelectedLevel(key)}
              className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                selectedLevel === key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 bg-bg-alt"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{emoji}</span>
                {selectedLevel === key && (
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className={`font-black text-xs uppercase tracking-wider ${selectedLevel === key ? "text-primary" : "text-text-main"}`}>
                {label}
              </p>
              <p className="text-[10px] text-text-muted font-semibold mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Token input — visible for teaching tab or edit of teaching skill */}
        {(activeTab === "teaching" || isEdit) && (
          <div className="flex items-center gap-3 p-3 mb-4 border bg-bg-alt rounded-2xl border-border">
            <Coins className="w-5 h-5 text-primary shrink-0" />
            <span className="flex-1 text-xs font-black tracking-wider uppercase text-text-muted">
              Tokens per hour
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTokensPerHour(Math.max(10, tokensPerHour - 10))}
                className="text-sm font-black transition-all bg-white border rounded-lg w-7 h-7 border-border text-text-main hover:border-primary hover:text-primary active:scale-90"
              >
                −
              </button>
              <span className="w-10 text-base font-black text-center text-text-main">
                {tokensPerHour}
              </span>
              <button
                onClick={() => setTokensPerHour(Math.min(500, tokensPerHour + 10))}
                className="text-sm font-black transition-all bg-white border rounded-lg w-7 h-7 border-border text-text-main hover:border-primary hover:text-primary active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 py-3.5 font-black uppercase tracking-widest text-xs text-text-muted hover:text-text-main bg-bg-alt rounded-2xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedLevel, tokensPerHour)}
            disabled={isSaving}
            className="flex-2 py-3.5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : isEdit ? (
              <>
                <Check className="w-4 h-4" /> Save Changes
              </>
            ) : (
              "Confirm Add"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});
LevelTokenModal.displayName = "LevelTokenModal";

// ── Teacher skill card (own profile, teaching tab) ─────────────────────────────
const TeacherSkillCard = memo(({ skill, idx, onEdit, onRemove }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      key={skill._id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: idx * 0.05 }}
      className="relative p-8 transition-all bg-white border border-border rounded-4xl hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 group overflow-hidden"
    >
      <AnimatePresence>
        {confirmDelete && (
          <DeleteConfirm
            onConfirm={() => {
              setConfirmDelete(false);
              onRemove(skill._id);
            }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center mb-2 space-x-2">
            <span className="text-2xl">{skill.icon || "🎯"}</span>
            <h3 className="text-xl font-black tracking-tight transition-colors text-text-main group-hover:text-primary">
              {skill.name}
            </h3>
          </div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
            {skill.category}
          </span>
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(skill)}
            className="p-2.5 transition-colors text-text-muted rounded-xl hover:text-primary hover:bg-primary/5"
            title="Edit skill"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2.5 transition-colors text-text-muted rounded-xl hover:text-red-600 hover:bg-red-50"
            title="Remove skill"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getLevelStyles(skill.level)}`}
        >
          {skill.level}
        </span>
        <div className="flex items-center space-x-1.5 text-text-main font-black">
          <Coins className="w-4 h-4 text-primary" />
          <span>{skill.tokensPerHour || 50}</span>
        </div>
      </div>
    </motion.div>
  );
});
TeacherSkillCard.displayName = "TeacherSkillCard";

// ── Regular skill card (non-teacher view, or learning tab) ─────────────────────
const RegularSkillCard = memo(({ skill, idx, onRemove, showRemove, showTokens }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      key={skill._id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: idx * 0.05 }}
      className="relative p-8 transition-all bg-white border border-border rounded-4xl hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 group overflow-hidden"
    >
      <AnimatePresence>
        {confirmDelete && (
          <DeleteConfirm
            onConfirm={() => {
              setConfirmDelete(false);
              onRemove(skill._id);
            }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center mb-2 space-x-2">
            <span className="text-2xl">{skill.icon || "🎯"}</span>
            <h3 className="text-xl font-black tracking-tight transition-colors text-text-main group-hover:text-primary">
              {skill.name}
            </h3>
          </div>
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
            {skill.category}
          </span>
        </div>
        {showRemove && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-3 transition-colors opacity-0 text-text-muted rounded-xl hover:text-red-600 hover:bg-red-50 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getLevelStyles(skill.level)}`}
        >
          {skill.level}
        </span>
        {showTokens && (
          <div className="flex items-center space-x-1.5 text-text-main font-black">
            <Coins className="w-4 h-4 text-primary" />
            <span>{skill.hourlyRate || 50}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});
RegularSkillCard.displayName = "RegularSkillCard";

// ── Main component ─────────────────────────────────────────────────────────────
const SkillsSection = memo(() => {
  const { t } = useLanguage();
  const { user, updateUser } = useUser();

  const isTeacherOwnProfile = !!user?.isTeacher;

  const [teachingSkills, setTeachingSkills] = useState([]);
  const [learningSkills, setLearningSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [activeTab, setActiveTab] = useState("teaching");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // For add flow: global skill selected from catalog
  const [selectedSkillForLevel, setSelectedSkillForLevel] = useState(null);

  // For edit flow: existing skillsToTeach entry being edited
  const [editingSkill, setEditingSkill] = useState(null); // { _id, name, level, category, tokensPerHour, icon? }

  const [isSaving, setIsSaving] = useState(false);

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
        skillsAPI.getCategories(),
      ]);

      setAllSkills(skillsData.skills || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserSkills = async () => {
    const response = await authAPI.getMe();
    const freshUser = response.user;
    setTeachingSkills(freshUser?.skillsToTeach || []);
    setLearningSkills(freshUser?.skillsToLearn || []);
  };

  // ── Add flow ────────────────────────────────────────────────────────────────
  const handleSkillClick = (skill) => {
    setSelectedSkillForLevel(skill);
  };

  const handleConfirmAddSkill = useCallback(async (selectedLevel, tokensPerHour) => {
    if (!selectedSkillForLevel) return;
    setIsSaving(true);
    try {
      if (activeTab === "teaching") {
        await skillsAPI.addToTeach(selectedSkillForLevel._id, selectedLevel, tokensPerHour);
      } else {
        await skillsAPI.addToLearn(selectedSkillForLevel._id, selectedLevel);
      }
      await refreshUserSkills();
      setSelectedSkillForLevel(null);
      setShowAddSkill(false);
    } catch (error) {
      console.error("Error adding skill:", error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedSkillForLevel, activeTab]);

  // ── Remove flow ─────────────────────────────────────────────────────────────
  const handleRemoveSkill = useCallback(async (skillId) => {
    try {
      await skillsAPI.removeUserSkill(
        skillId,
        activeTab === "teaching" ? "teach" : "learn",
      );
      await refreshUserSkills();
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  }, [activeTab]);

  // ── Edit flow (teacher only, teaching tab) ──────────────────────────────────
  // NOTE: The backend `PUT /api/users/profile` does not accept `skillsToTeach`.
  // The `PUT /api/skills/teach/:id` endpoint also doesn't support updating an
  // existing entry. So we implement edit as: remove old entry → re-add with new
  // level/tokensPerHour using the global skill id looked up by name.
  const handleEditSkill = useCallback((skill) => {
    // Enrich with icon from global allSkills list (best effort)
    const globalMatch = allSkills.find(
      (s) => s.name.toLowerCase() === skill.name.toLowerCase()
    );
    setEditingSkill({
      ...skill,
      icon: globalMatch?.icon || skill.icon || "🎯",
      _globalId: globalMatch?._id || null,
    });
  }, [allSkills]);

  const handleConfirmEditSkill = useCallback(async (newLevel, newTokensPerHour) => {
    if (!editingSkill) return;

    if (!editingSkill._globalId) {
      // Global skill id not found — cannot re-add; show note
      console.warn(
        "SkillsSection edit: could not find global skill id for name:",
        editingSkill.name,
        "— edit aborted. The backend requires a global skill id to re-add."
      );
      // TODO: If the backend adds a PUT /api/skills/user/:skillId endpoint that
      // accepts { level, tokensPerHour }, use that instead of remove+re-add.
      setEditingSkill(null);
      return;
    }

    setIsSaving(true);
    try {
      // Step 1: remove old entry
      await skillsAPI.removeUserSkill(editingSkill._id, "teach");
      // Step 2: re-add with updated values
      await skillsAPI.addToTeach(editingSkill._globalId, newLevel, newTokensPerHour);
      await refreshUserSkills();
      setEditingSkill(null);
    } catch (error) {
      console.error("Error editing skill:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editingSkill]);

  // ── Derived state ───────────────────────────────────────────────────────────
  const filteredSkills = allSkills.filter((skill) => {
    const alreadyAdded =
      activeTab === "teaching"
        ? teachingSkills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())
        : learningSkills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
    if (alreadyAdded) return false;

    const matchesCategory =
      selectedCategory === "all" || skill.category === selectedCategory;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentSkills =
    activeTab === "teaching" ? teachingSkills : learningSkills;

  const showTeacherControls = isTeacherOwnProfile && activeTab === "teaching";

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-10 h-10 mb-4 text-primary animate-spin" />
        <p className="text-xs font-black tracking-widest uppercase text-text-muted">
          {t("skills_analyzing")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header with Custom Tabs */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl text-primary">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-text-main">
              {t("skills_matrix")}
            </h2>
          </div>

          <div className="flex p-1.5 bg-bg-alt rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab("teaching")}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === "teaching"
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              {t("skills_teaching")} ({teachingSkills.length})
            </button>
            <button
              onClick={() => setActiveTab("learning")}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                activeTab === "learning"
                  ? "bg-white text-secondary shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              {t("skills_learning")} ({learningSkills.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Teacher badge — visible on teaching tab */}
          {showTeacherControls && (
            <span className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl border border-primary/10">
              <Award className="w-3.5 h-3.5" />
              Mentor Controls
            </span>
          )}

          <button
            onClick={() => setShowAddSkill(true)}
            className="flex items-center px-8 py-4 space-x-3 font-black text-white transition-all shadow-xl bg-primary rounded-2xl hover:bg-primary-hover shadow-primary/20 hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span className="text-sm tracking-widest uppercase">
              {t("skills_add_new")}
            </span>
          </button>
        </div>
      </div>

      {/* Current Skills Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {currentSkills.length > 0 ? (
            currentSkills.map((skill, idx) =>
              showTeacherControls ? (
                <TeacherSkillCard
                  key={skill._id}
                  skill={skill}
                  idx={idx}
                  onEdit={handleEditSkill}
                  onRemove={handleRemoveSkill}
                />
              ) : (
                <RegularSkillCard
                  key={skill._id}
                  skill={skill}
                  idx={idx}
                  onRemove={handleRemoveSkill}
                  showRemove={true}
                  showTokens={activeTab === "teaching"}
                />
              )
            )
          ) : (
            <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-border rounded-[48px] group hover:border-primary/30 transition-all">
              <div className="inline-flex p-8 rounded-[40px] bg-bg-alt mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-12 h-12 text-primary/30" />
              </div>
              <h3 className="mb-3 text-2xl font-black text-text-main">
                {activeTab === "teaching"
                  ? t("skills_empty_teaching")
                  : t("skills_empty_learning")}
              </h3>
              <p className="max-w-sm mx-auto mb-10 font-medium text-text-muted">
                {t("skills_add_to_" + activeTab)}
              </p>
              <button
                onClick={() => setShowAddSkill(true)}
                className="px-10 py-5 text-sm font-black text-white transition-all shadow-xl bg-text-main rounded-3xl hover:bg-primary"
              >
                {t("skills_add_new")}
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Skill Catalog Modal */}
      <AnimatePresence>
        {showAddSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-100 bg-text-main/40 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-5xl max-h-[85vh] overflow-hidden bg-white rounded-[48px] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-10 border-b border-border shrink-0">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-text-main">
                    {t("skills_add_to_" + activeTab)}{" "}
                    <span
                      className={
                        activeTab === "teaching"
                          ? "text-primary"
                          : "text-secondary"
                      }
                    >
                      {activeTab === "teaching"
                        ? t("skills_teaching")
                        : t("skills_learning")}
                    </span>
                  </h3>
                  <p className="text-sm font-bold text-text-muted">
                    {t("skills_select_from_marketplace")}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="p-4 transition-colors text-text-muted hover:text-text-main bg-bg-alt rounded-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto grow no-scrollbar">
                {/* Search & Categories */}
                <div className="flex flex-col gap-6 mb-12 lg:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 transform -translate-y-1/2 text-text-muted left-6 top-1/2" />
                    <input
                      type="text"
                      placeholder={t("skills_search_skills")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-5 pl-16 pr-8 font-bold transition-all border-2 border-transparent outline-none bg-bg-alt rounded-3xl focus:border-primary focus:bg-white"
                    />
                  </div>
                  <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedCategory === "all"
                          ? "bg-primary text-white"
                          : "bg-bg-alt text-text-muted hover:bg-border"
                      }`}
                    >
                      {t("skills_all_skills")}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          selectedCategory === cat.name
                            ? "bg-primary text-white"
                            : "bg-bg-alt text-text-muted hover:bg-border"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Results Grid — already-added skills are filtered out */}
                {filteredSkills.length === 0 ? (
                  <div className="col-span-full py-16 text-center">
                    <Sparkles className="w-10 h-10 mx-auto text-primary/30 mb-4" />
                    <p className="text-sm font-black text-text-muted uppercase tracking-widest">
                      {searchQuery ? "No matching skills found" : "All skills already added"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSkills.map((skill) => (
                      <div
                        key={skill._id}
                        onClick={() => handleSkillClick(skill)}
                        className="p-8 bg-bg-alt border-2 border-transparent rounded-[32px] hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center mb-6 space-x-3">
                          <span className="text-3xl transition-transform group-hover:scale-110">
                            {skill.icon || "🎯"}
                          </span>
                          <h4 className="text-xl font-black text-text-main">
                            {skill.name}
                          </h4>
                        </div>
                        <p className="mb-6 text-sm font-semibold text-text-muted line-clamp-2">
                          {skill.description ||
                            "The art and science of mastering this domain."}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-text-muted">
                            <Users className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {skill.totalTeachers || 0} {t("skills_experts")}
                            </span>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 transition-all bg-white border rounded-xl text-primary border-border group-hover:bg-primary group-hover:text-white">
                            <Plus className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level + Tokens Modal — Add flow */}
      <AnimatePresence>
        {selectedSkillForLevel && (
          <LevelTokenModal
            skill={selectedSkillForLevel}
            initialLevel={activeTab === "teaching" ? "intermediate" : "beginner"}
            initialTokens={50}
            activeTab={activeTab}
            isEdit={false}
            onConfirm={handleConfirmAddSkill}
            onCancel={() => setSelectedSkillForLevel(null)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      {/* Level + Tokens Modal — Edit flow (teacher only) */}
      <AnimatePresence>
        {editingSkill && (
          <LevelTokenModal
            skill={editingSkill}
            initialLevel={editingSkill.level || "intermediate"}
            initialTokens={editingSkill.tokensPerHour || 50}
            activeTab="teaching"
            isEdit={true}
            onConfirm={handleConfirmEditSkill}
            onCancel={() => setEditingSkill(null)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

SkillsSection.displayName = "SkillsSection";

export default SkillsSection;
