import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Users, TrendingUp, Filter } from "lucide-react";
import { skillsAPI } from "../services/api";

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category");

  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skillsData, categoriesData] = await Promise.all([
        skillsAPI.getAll(),
        skillsAPI.getCategories(),
      ]);

      setSkills(skillsData.skills || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const matchesCategory =
      selectedCategory === "all" || skill.category === selectedCategory;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "all" || skill.difficulty === selectedDifficulty;
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  const handleSkillClick = (skillName) => {
    navigate(`/skills/${encodeURIComponent(skillName)}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category !== "all") {
      navigate(`/courses?category=${encodeURIComponent(category)}`, { replace: true });
    } else {
      navigate("/courses", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="w-full px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
            Explore Skills & Courses
          </h1>
          <p className="text-xl text-gray-600">
            {selectedCategory !== "all"
              ? `Discover ${selectedCategory} skills taught by expert teachers`
              : "Find teachers for any skill you want to learn"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute w-6 h-6 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
            <input
              type="text"
              placeholder="Search for any skill (e.g., React, Guitar, Spanish)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-14 pr-4 text-lg transition-all border-2 border-gray-300 shadow-lg rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 mb-8 bg-white shadow-lg rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>

          {/* Category Filters */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Learning Path
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.name}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.name
                      ? "bg-indigo-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filters */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <div className="flex flex-wrap gap-2">
              {["all", "beginner", "intermediate", "advanced", "expert"].map(
                (level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedDifficulty === level
                        ? "bg-purple-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {level === "all" ? "All Levels" : level}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg text-gray-700">
            Found{" "}
            <span className="font-bold text-indigo-600">
              {filteredSkills.length}
            </span>{" "}
            {filteredSkills.length === 1 ? "skill" : "skills"}
            {selectedCategory !== "all" && (
              <span> in {selectedCategory}</span>
            )}
          </p>
        </div>

        {/* Skills Grid */}
        {filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill._id}
                onClick={() => handleSkillClick(skill.name)}
                className="overflow-hidden transition-all duration-300 bg-white border-2 border-transparent shadow-lg cursor-pointer rounded-2xl hover:shadow-2xl group hover:border-indigo-500 hover:scale-105"
              >
                <div className="p-6">
                  {/* Skill Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                      <span className="text-3xl">{skill.icon || "📚"}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 line-clamp-1">
                        {skill.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-500">
                        {skill.category}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {skill.description && (
                    <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2">
                      {skill.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pb-4 mb-4 text-sm border-b border-gray-100">
                    <div className="flex items-center gap-1 text-indigo-600">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">
                        {skill.totalTeachers || 0}
                      </span>
                      <span className="text-gray-500">teachers</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">
                        {skill.totalLearners || 0}
                      </span>
                      <span className="text-gray-500">learning</span>
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className="flex items-center justify-between">
                    {skill.difficulty && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          skill.difficulty === "beginner"
                            ? "bg-green-100 text-green-700"
                            : skill.difficulty === "intermediate"
                            ? "bg-yellow-100 text-yellow-700"
                            : skill.difficulty === "advanced"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {skill.difficulty}
                      </span>
                    )}
                    {skill.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {skill.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="h-1 transition-transform duration-300 transform scale-x-0 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:scale-x-100"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 rounded-full">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">
              No skills found
            </h3>
            <p className="mb-6 text-gray-600">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
                navigate("/courses", { replace: true });
              }}
              className="px-6 py-3 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
