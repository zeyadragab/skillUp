import React, { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherCard from "../teachers/TeacherCard";
import { ChevronRight, Loader } from "lucide-react";
import axios from "axios";

const FeaturedTeachers = memo(() => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTeachers();
  }, []);

  const fetchFeaturedTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch all teachers and pick top rated
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

      const allTeachers = response.data.users || response.data.teachers || response.data || [];
      // Sort by rating and total students (popularity) and get top 3
      const featured = allTeachers
        .sort((a, b) => {
          const scoreA = (a.averageRating || 0) * (a.totalSessionsTaught || a.totalStudents || 1);
          const scoreB = (b.averageRating || 0) * (b.totalSessionsTaught || b.totalStudents || 1);
          return scoreB - scoreA;
        })
        .slice(0, 3);

      setTeachers(featured);
    } catch (error) {
      console.error("Error fetching featured teachers:", error);
      // Use mock data for development
      setTeachers(getMockFeaturedTeachers());
    } finally {
      setLoading(false);
    }
  };

  const getMockFeaturedTeachers = () => {
    return [
      {
        _id: "teacher-1",
        name: "Dr. Maria Rodriguez",
        avatar: "https://i.pravatar.cc/400?img=1",
        bio: "Native Spanish speaker with 8 years of teaching experience. Specialized in conversational Spanish and grammar.",
        headline: "Spanish Language Expert",
        skillsToTeach: [
          { name: "Spanish" },
          { name: "Conversation" },
          { name: "Grammar" },
        ],
        averageRating: 4.9,
        totalStudents: 245,
        tokensPerSession: 5,
        languages: ["Spanish", "English"],
        country: "Spain",
        isVerified: true,
      },
      {
        _id: "teacher-2",
        name: "Alex Thompson",
        avatar: "https://i.pravatar.cc/400?img=2",
        bio: "Senior developer with 10+ years experience in JavaScript, React, Node.js, and cloud technologies.",
        headline: "Full-Stack Developer",
        skillsToTeach: [
          { name: "JavaScript" },
          { name: "React" },
          { name: "Node.js" },
        ],
        averageRating: 4.8,
        totalStudents: 189,
        tokensPerSession: 8,
        languages: ["English"],
        country: "USA",
        isVerified: true,
      },
      {
        _id: "teacher-3",
        name: "Priya Sharma",
        avatar: "https://i.pravatar.cc/400?img=3",
        bio: "Certified yoga instructor with 6 years of experience in Hatha, Vinyasa, and meditation practices.",
        headline: "Yoga & Meditation Guide",
        skillsToTeach: [
          { name: "Hatha Yoga" },
          { name: "Vinyasa" },
          { name: "Meditation" },
        ],
        averageRating: 4.95,
        totalStudents: 312,
        tokensPerSession: 4,
        languages: ["English", "Hindi"],
        country: "India",
        isVerified: true,
      },
    ];
  };

  const handleBrowseAll = () => {
    navigate("/teachers");
  };

  return (
    <section className="py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
              Featured Teachers
            </h2>
            <p className="text-lg text-gray-600">
              Learn from our community of expert teachers
            </p>
          </div>

          <button
            onClick={handleBrowseAll}
            className="items-center hidden gap-2 px-6 py-3 font-semibold text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-lg sm:flex group"
          >
            Browse All Teachers
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher, index) => (
                <TeacherCard
                  key={teacher._id || teacher.id}
                  teacher={teacher}
                  featured={index === 1} // Make the middle one featured
                />
              ))}
            </div>

            {/* Mobile Browse Button */}
            <div className="flex justify-center sm:hidden">
              <button
                onClick={handleBrowseAll}
                className="flex items-center gap-2 px-8 py-4 font-semibold text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-lg group"
              >
                Browse All Teachers
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
});

FeaturedTeachers.displayName = "FeaturedTeachers";

export default FeaturedTeachers;
