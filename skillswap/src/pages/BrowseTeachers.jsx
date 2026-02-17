import React, { memo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import TeacherCard from "../components/teachers/TeacherCard";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Loader,
  SlidersHorizontal,
  Star,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// Skill Categories
const CATEGORIES = [
  { id: "all", name: "All Categories", icon: "🌟" },
  { id: "programming", name: "Programming & Tech", icon: "💻" },
  { id: "design", name: "Design & Creative", icon: "🎨" },
  { id: "languages", name: "Languages", icon: "🌐" },
  { id: "business", name: "Business & Marketing", icon: "💼" },
  { id: "health", name: "Health & Wellness", icon: "🧘" },
  { id: "music", name: "Music & Arts", icon: "🎵" },
  { id: "academic", name: "Academic Subjects", icon: "📚" },
  { id: "lifestyle", name: "Lifestyle & Hobbies", icon: "🎯" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "students", label: "Most Students" },
  { value: "newest", label: "Newest First" },
];

const BrowseTeachers = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // Fetch teachers from API
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/users/search`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            isTeacher: true,
          },
        }
      );

      const teachersData = response.data.users || response.data.teachers || response.data || [];
      setTeachers(teachersData);
      setFilteredTeachers(teachersData);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers. Please try again.");

      // Fallback to mock data for development
      const mockTeachers = generateMockTeachers();
      setTeachers(mockTeachers);
      setFilteredTeachers(mockTeachers);
    } finally {
      setLoading(false);
    }
  };

  // Mock data generator for development/testing
  const generateMockTeachers = () => {
    const mockNames = [
      "Dr. Maria Rodriguez", "Alex Thompson", "Priya Sharma", "John Smith",
      "Sarah Chen", "Mohammed Ali", "Emma Wilson", "Carlos Garcia",
      "Yuki Tanaka", "Lisa Anderson", "David Kim", "Anna Kowalski"
    ];

    const mockSkills = {
      programming: ["JavaScript", "Python", "React", "Node.js", "Java"],
      design: ["UI/UX Design", "Graphic Design", "Figma", "Adobe XD"],
      languages: ["Spanish", "French", "Arabic", "Japanese", "German"],
      business: ["Marketing", "Business Strategy", "Project Management"],
      health: ["Yoga", "Meditation", "Nutrition", "Fitness"],
    };

    return mockNames.map((name, index) => ({
      _id: `teacher-${index}`,
      name,
      avatar: `https://i.pravatar.cc/400?img=${index + 1}`,
      bio: `Experienced ${Object.keys(mockSkills)[index % 5]} instructor with ${3 + index} years of teaching experience.`,
      headline: `${Object.keys(mockSkills)[index % 5]} Expert`,
      skillsToTeach: mockSkills[Object.keys(mockSkills)[index % 5]],
      category: Object.keys(mockSkills)[index % 5],
      averageRating: (4 + Math.random()).toFixed(1),
      totalStudents: Math.floor(Math.random() * 500) + 50,
      tokensPerSession: Math.floor(Math.random() * 15) + 3,
      languages: ["English", ["Spanish", "French", "Arabic"][index % 3]],
      country: ["USA", "UK", "Canada", "Australia"][index % 4],
      isVerified: index % 2 === 0,
    }));
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...teachers];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (teacher) => teacher.category === selectedCategory ||
                     teacher.skillsToTeach?.some(skill =>
                       skill.category?.toLowerCase() === selectedCategory
                     )
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (teacher) =>
          teacher.name?.toLowerCase().includes(query) ||
          teacher.bio?.toLowerCase().includes(query) ||
          teacher.skillsToTeach?.some((skill) =>
            (skill.name || skill).toLowerCase().includes(query)
          )
      );
    }

    // Price range filter
    result = result.filter((teacher) => {
      const price = teacher.tokensPerSession || teacher.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Rating filter
    if (minRating > 0) {
      result = result.filter((teacher) => {
        const rating = parseFloat(teacher.averageRating || teacher.rating || 0);
        return rating >= minRating;
      });
    }

    // Language filter
    if (selectedLanguages.length > 0) {
      result = result.filter((teacher) =>
        teacher.languages?.some((lang) => selectedLanguages.includes(lang))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "price-low":
          return (a.tokensPerSession || 0) - (b.tokensPerSession || 0);
        case "price-high":
          return (b.tokensPerSession || 0) - (a.tokensPerSession || 0);
        case "students":
          return (b.totalStudents || 0) - (a.totalStudents || 0);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: // popular
          return (b.totalStudents || 0) * (b.averageRating || 0) -
                 (a.totalStudents || 0) * (a.averageRating || 0);
      }
    });

    setFilteredTeachers(result);
  }, [teachers, selectedCategory, searchQuery, sortBy, priceRange, minRating, selectedLanguages]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("popular");
    setPriceRange([0, 100]);
    setMinRating(0);
    setSelectedLanguages([]);
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 py-12">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="mb-4 text-4xl font-bold text-white">
              Browse All Teachers
            </h1>
            <p className="text-xl text-indigo-100">
              Find the perfect teacher from our community of {teachers.length} experts
            </p>
          </div>
        </div>

        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Search and Filter Bar */}
          <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers or skills..."
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sort and Filter Buttons */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-300"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Price Range */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Price Range (tokens/session)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Minimum Rating
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                          minRating === rating
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300"
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        {rating > 0 ? `${rating}+` : "All"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredTeachers.length}</span> teachers
            </p>
          </div>

          {/* Teachers Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTeachers.map((teacher) => (
                <TeacherCard key={teacher._id || teacher.id} teacher={teacher} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="mb-4 text-xl font-semibold text-gray-900">No teachers found</p>
              <p className="mb-6 text-gray-600">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

BrowseTeachers.displayName = "BrowseTeachers";
export default BrowseTeachers;
