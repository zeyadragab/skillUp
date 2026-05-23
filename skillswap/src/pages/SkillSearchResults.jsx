import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import TeacherCard from "../components/teachers/TeacherCard";
import { Search, ArrowLeft, Loader } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://skillupbackend-rouge.vercel.app/api";

const SkillSearchResults = () => {
  const { skillName } = useParams();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillInfo, setSkillInfo] = useState(null);
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    fetchTeachersForSkill();
  }, [skillName]);

  const fetchTeachersForSkill = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/users/skill/${encodeURIComponent(skillName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
        setSkillInfo(data.skill || null);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedTeachers = () => {
    const sorted = [...teachers];
    switch (sortBy) {
      case "rating":
        return sorted.sort(
          (a, b) =>
            (b.averageRating || b.rating || 0) -
            (a.averageRating || a.rating || 0)
        );
      case "sessions":
        return sorted.sort(
          (a, b) =>
            (b.totalSessionsTaught || b.sessionsCompleted || 0) -
            (a.totalSessionsTaught || a.sessionsCompleted || 0)
        );
      case "price":
        return sorted.sort((a, b) => {
          const aPrice =
            a.skillsToTeach?.find((s) => s.name === skillName)?.tokensPerHour || 0;
          const bPrice =
            b.skillsToTeach?.find((s) => s.name === skillName)?.tokensPerHour || 0;
          return aPrice - bPrice;
        });
      default:
        return sorted;
    }
  };

  // Normalise fields so TeacherCard gets what it expects
  const normalise = (teacher) => ({
    ...teacher,
    averageRating: teacher.averageRating ?? teacher.rating ?? 0,
    tokensPerSession:
      teacher.skillsToTeach?.find((s) => s.name === skillName)?.tokensPerHour ?? 30,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-10 h-10 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-gray-600">Loading teachers…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-indigo-600 transition-colors hover:text-indigo-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mb-1 text-4xl font-bold text-gray-900">
                {skillInfo?.icon} {skillName}
              </h1>
              <p className="text-gray-500">
                {teachers.length}{" "}
                {teachers.length === 1 ? "teacher" : "teachers"} available
              </p>
              {skillInfo?.description && (
                <p className="mt-1 text-sm text-gray-400">
                  {skillInfo.description}
                </p>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="rating">Highest Rated</option>
                <option value="sessions">Most Sessions</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {teachers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No teachers found
            </h3>
            <p className="mb-6 text-gray-600">
              There are currently no teachers available for {skillName}.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Browse All Skills
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getSortedTeachers().map((teacher) => (
              <TeacherCard key={teacher._id} teacher={normalise(teacher)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SkillSearchResults;
