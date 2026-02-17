import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Search, Star, BookOpen, User, ArrowLeft } from "lucide-react";

const SkillSearchResults = () => {
  const { skillName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillInfo, setSkillInfo] = useState(null);
  const [sortBy, setSortBy] = useState("rating"); // rating, sessions, price

  useEffect(() => {
    fetchTeachersForSkill();
  }, [skillName]);

  const fetchTeachersForSkill = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch all users who teach this skill
      const response = await fetch(
        `http://localhost:5000/api/users/skill/${encodeURIComponent(
          skillName
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "sessions":
        return sorted.sort(
          (a, b) => (b.sessionsCompleted || 0) - (a.sessionsCompleted || 0)
        );
      case "price":
        return sorted.sort((a, b) => {
          const aPrice =
            a.skillsToTeach?.find((s) => s.name === skillName)?.tokensPerHour ||
            0;
          const bPrice =
            b.skillsToTeach?.find((s) => s.name === skillName)?.tokensPerHour ||
            0;
          return aPrice - bPrice;
        });
      default:
        return sorted;
    }
  };

  const getTeacherSkillLevel = (teacher) => {
    const skill = teacher.skillsToTeach?.find((s) => s.name === skillName);
    return skill?.level || "intermediate";
  };

  const getTeacherPrice = (teacher) => {
    const skill = teacher.skillsToTeach?.find((s) => s.name === skillName);
    return skill?.tokensPerHour || 30;
  };

  const handleTeacherClick = (teacherId) => {
    navigate(`/profile/${teacherId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading teachers...</p>
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
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-indigo-600 transition-colors hover:text-indigo-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                {skillInfo?.icon} {skillName}
              </h1>
              <p className="text-gray-600">
                {teachers.length}{" "}
                {teachers.length === 1 ? "teacher" : "teachers"} available
              </p>
              {skillInfo?.description && (
                <p className="mt-2 text-sm text-gray-500">
                  {skillInfo.description}
                </p>
              )}
            </div>

            {/* Sort Controls */}
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getSortedTeachers().map((teacher) => (
              <div
                key={teacher._id}
                onClick={() => handleTeacherClick(teacher._id)}
                className="overflow-hidden transition-all duration-300 bg-white shadow-md cursor-pointer rounded-xl hover:shadow-xl group"
              >
                {/* Teacher Header */}
                <div className="p-6 text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-indigo-600 bg-white rounded-full">
                        {teacher.profilePicture ? (
                          <img
                            src={teacher.profilePicture}
                            alt={teacher.name}
                            className="object-cover w-full h-full rounded-full"
                          />
                        ) : (
                          <User className="w-8 h-8" />
                        )}
                      </div>
                      {/* Online Status Badge */}
                      <div className="absolute w-4 h-4 bg-green-400 border-2 border-white rounded-full -bottom-1 -right-1"></div>
                    </div>

                    <div className="flex-1">
                      <h3 className="mb-1 text-xl font-bold group-hover:underline">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span className="font-semibold">
                          {teacher.rating ? teacher.rating.toFixed(1) : "New"}
                        </span>
                        <span className="opacity-80">
                          ({teacher.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="p-6">
                  {/* Skill Level */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Level:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          getTeacherSkillLevel(teacher) === "expert"
                            ? "bg-purple-100 text-purple-700"
                            : getTeacherSkillLevel(teacher) === "advanced"
                            ? "bg-blue-100 text-blue-700"
                            : getTeacherSkillLevel(teacher) === "intermediate"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getTeacherSkillLevel(teacher).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600">
                      <span className="text-2xl font-bold">
                        {getTeacherPrice(teacher)}
                      </span>
                      <span className="text-sm">tokens/hr</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 text-center rounded-lg bg-gray-50">
                      <div className="flex items-center justify-center gap-1 mb-1 text-gray-700">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-lg font-bold">
                          {teacher.sessionsCompleted || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Sessions</p>
                    </div>
                    <div className="p-3 text-center rounded-lg bg-gray-50">
                      <div className="flex items-center justify-center gap-1 mb-1 text-gray-700">
                        <User className="w-4 h-4" />
                        <span className="text-lg font-bold">
                          {teacher.totalStudents || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {teacher.bio && (
                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                      {teacher.bio}
                    </p>
                  )}

                  {/* View Profile Button */}
                  <button className="w-full py-3 font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 group-hover:shadow-lg">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SkillSearchResults;
