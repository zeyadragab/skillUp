import React, { memo, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  PlayCircle,
  ChevronRight,
} from "lucide-react";

const CoursesSection = memo(() => {
  const [courses] = useState([
    {
      id: 1,
      title: "Advanced React Patterns",
      instructor: "Alex Chen",
      progress: 85,
      status: "in-progress",
      hours: "8/12",
      certificate: false,
    },
    {
      id: 2,
      title: "Node.js Backend Mastery",
      instructor: "John Smith",
      progress: 100,
      status: "completed",
      hours: "12/12",
      certificate: true,
    },
    {
      id: 3,
      title: "Python Data Science",
      instructor: "Sarah Johnson",
      progress: 45,
      status: "in-progress",
      hours: "6/12",
      certificate: false,
    },
    {
      id: 4,
      title: "Web Design Fundamentals",
      instructor: "Mike Wilson",
      progress: 100,
      status: "completed",
      hours: "10/10",
      certificate: true,
    },
    {
      id: 5,
      title: "TypeScript Essentials",
      instructor: "Emma Davis",
      progress: 30,
      status: "in-progress",
      hours: "3/10",
      certificate: false,
    },
    {
      id: 6,
      title: "CSS Grid & Flexbox",
      instructor: "Lisa Brown",
      progress: 100,
      status: "completed",
      hours: "8/8",
      certificate: true,
    },
  ]);

  const enrolledCourses = courses.filter((c) => c.status === "in-progress");
  const completedCourses = courses.filter((c) => c.status === "completed");

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="p-6 text-center bg-white border border-gray-200 rounded-xl">
          <div className="text-3xl font-bold text-indigo-600">
            {enrolledCourses.length}
          </div>
          <p className="mt-2 text-sm text-gray-600">Courses In Progress</p>
        </div>
        <div className="p-6 text-center bg-white border border-gray-200 rounded-xl">
          <div className="text-3xl font-bold text-green-600">
            {completedCourses.length}
          </div>
          <p className="mt-2 text-sm text-gray-600">Completed</p>
        </div>
        <div className="p-6 text-center bg-white border border-gray-200 rounded-xl">
          <div className="text-3xl font-bold text-purple-600">
            {completedCourses.length}
          </div>
          <p className="mt-2 text-sm text-gray-600">Certificates</p>
        </div>
        <div className="p-6 text-center bg-white border border-gray-200 rounded-xl">
          <div className="text-3xl font-bold text-blue-600">
            {courses.reduce(
              (sum, c) => sum + parseInt(c.hours.split("/")[0]),
              0
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">Hours Learned</p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
            📚
          </span>
          <span>Enrolled Courses ({enrolledCourses.length})</span>
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {enrolledCourses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg"
            >
              {/* Course Header */}
              <div className="h-32 bg-gradient-to-br from-indigo-400 to-purple-500"></div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  by {course.instructor}
                </p>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Progress
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                    <div
                      className="h-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Hours */}
                <p className="flex items-center mt-3 space-x-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{course.hours}</span>
                </p>

                {/* Action Button */}
                <button className="flex items-center justify-center w-full py-2 mt-4 space-x-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  <PlayCircle className="w-4 h-4" />
                  <span>Continue Learning</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Courses */}
      <div>
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            ✓
          </span>
          <span>Completed Courses ({completedCourses.length})</span>
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {completedCourses.map((course) => (
            <div
              key={course.id}
              className="relative overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg"
            >
              {/* Course Header */}
              <div className="h-32 bg-gradient-to-br from-green-400 to-emerald-500"></div>

              {/* Completed Badge */}
              <div className="absolute flex items-center px-3 py-1 space-x-1 text-xs font-bold text-white bg-green-500 rounded-full top-4 right-4">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  by {course.instructor}
                </p>

                {/* Certificate */}
                {course.certificate && (
                  <div className="flex items-center p-3 mt-4 space-x-2 border border-yellow-200 rounded-lg bg-yellow-50">
                    <Award className="flex-shrink-0 w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-xs font-bold text-yellow-900">
                        Certificate Earned
                      </p>
                      <p className="text-xs text-yellow-700">
                        Download your achievement
                      </p>
                    </div>
                  </div>
                )}

                {/* Hours */}
                <p className="flex items-center mt-4 space-x-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{course.hours} completed</span>
                </p>

                {/* Action Button */}
                <button className="flex items-center justify-center w-full py-2 mt-4 space-x-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Award className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CoursesSection.displayName = "CoursesSection";

export default CoursesSection;
