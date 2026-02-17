import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Users } from "lucide-react";
import { skillsAPI } from "../../services/api";

const SkillsBrowser = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const [skillsData, categoriesData] = await Promise.all([
        skillsAPI.getAll(),
        skillsAPI.getCategories()
      ]);

      setSkills(skillsData.skills || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSkillClick = (skillName) => {
    navigate(`/skills/${encodeURIComponent(skillName)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-4xl font-bold text-gray-900">
          Browse Skills
        </h2>
        <p className="text-xl text-gray-600">
          Find teachers for any skill you want to learn
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
          <input
            type="text"
            placeholder="Search for any skill (e.g., React, Guitar, Spanish)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-12 pr-4 text-lg transition-all border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-indigo-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          All Categories
        </button>
        {categories.slice(0, 8).map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.name
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSkills.slice(0, 12).map((skill) => (
            <div
              key={skill._id}
              onClick={() => handleSkillClick(skill.name)}
              className="overflow-hidden transition-all duration-300 bg-white border-2 border-transparent shadow-md cursor-pointer rounded-xl hover:shadow-2xl group hover:border-indigo-500"
            >
              <div className="p-6">
                {/* Skill Icon & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{skill.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 line-clamp-1">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-gray-500">{skill.category}</p>
                  </div>
                </div>

                {/* Description */}
                {skill.description && (
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                    {skill.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-indigo-600">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{skill.totalTeachers || 0}</span>
                    <span className="text-gray-500">teachers</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">{skill.totalLearners || 0}</span>
                    <span className="text-gray-500">learning</span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                {skill.difficulty && (
                  <div className="flex justify-end mt-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        skill.difficulty === "beginner"
                          ? "bg-green-100 text-green-700"
                          : skill.difficulty === "intermediate"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {skill.difficulty}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover Overlay */}
              <div className="h-1 transition-transform duration-300 transform scale-x-0 bg-le-to-r from-indigo-500 to-purple-600 group-hover:scale-x-100"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No skills found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Show More Link */}
      {filteredSkills.length > 12 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Showing 12 of {filteredSkills.length} skills
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillsBrowser;
