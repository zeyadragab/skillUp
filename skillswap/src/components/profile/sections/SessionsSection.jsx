import React, { memo, useState, useEffect } from "react";
import {
  Star,
  User,
  Calendar,
  Clock,
  MessageSquare,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { sessionsAPI } from "../../../services/api";

const SessionsSection = memo(() => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionsAPI.getAll({ past: true, status: 'completed' });

      // Transform backend data to match component format
      const transformedSessions = response.sessions.map(session => {
        const isTeaching = session.teacher._id === user?._id;
        const rating = isTeaching
          ? session.teacherRating?.rating
          : session.learnerRating?.rating;
        const feedback = isTeaching
          ? session.teacherRating?.review
          : session.learnerRating?.review;

        return {
          id: session._id,
          type: isTeaching ? 'teach' : 'learn',
          title: session.title,
          student: isTeaching ? session.learner?.name : undefined,
          teacher: !isTeaching ? session.teacher?.name : undefined,
          rating: rating || 0,
          feedback: feedback || 'No feedback provided',
          date: new Date(session.scheduledAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          duration: `${session.duration / 60}h`,
        };
      });

      setSessions(transformedSessions);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const teachingSessions = sessions.filter((s) => s.type === "teach");
  const learningSessions = sessions.filter((s) => s.type === "learn");

  const avgTeachingRating = (
    teachingSessions.reduce((sum, s) => sum + s.rating, 0) /
    teachingSessions.length
  ).toFixed(1);
  const avgLearningRating = (
    learningSessions.reduce((sum, s) => sum + s.rating, 0) /
    learningSessions.length
  ).toFixed(1);

  const SessionCard = ({ session, isTeaching }) => (
    <div className="p-6 transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{session.title}</h3>
          <p className="flex items-center mt-1 space-x-1 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{isTeaching ? session.student : session.teacher}</span>
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isTeaching
              ? "bg-indigo-100 text-indigo-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {isTeaching ? "Teaching" : "Learning"}
        </span>
      </div>

      {/* Feedback */}
      <div className="p-4 mb-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-700">Feedback</p>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < session.rating
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-xs font-bold text-gray-700">
              {session.rating}.0
            </span>
          </div>
        </div>
        <p className="text-sm italic text-gray-700">"{session.feedback}"</p>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{session.date}</span>
        </span>
        <span className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{session.duration}</span>
        </span>
      </div>

      {/* Action */}
      <button className="w-full py-2 mt-4 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200">
        View Details
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Teaching Sessions
              </p>
              <h3 className="mt-2 text-3xl font-bold text-indigo-600">
                {teachingSessions.length}
              </h3>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl">
              <span>👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Learning Sessions
              </p>
              <h3 className="mt-2 text-3xl font-bold text-green-600">
                {learningSessions.length}
              </h3>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
              <span>👨‍🎓</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Teaching Rating
              </p>
              <h3 className="mt-2 text-3xl font-bold text-yellow-600">
                {avgTeachingRating}
              </h3>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <h3 className="mt-2 text-3xl font-bold text-purple-600">
                {sessions
                  .reduce((sum, s) => sum + parseFloat(s.duration), 0)
                  .toFixed(1)}
              </h3>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Sessions */}
      <div>
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
            👨‍🏫
          </span>
          <span>Sessions as Teacher ({teachingSessions.length})</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadSessions}
              className="px-4 py-2 mt-4 text-sm font-medium text-indigo-600 transition-colors rounded-lg bg-indigo-50 hover:bg-indigo-100"
            >
              Try Again
            </button>
          </div>
        ) : teachingSessions.length === 0 ? (
          <div className="p-12 text-center border border-gray-200 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">No teaching sessions yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Start teaching to build your session history
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {teachingSessions.map((session) => (
              <SessionCard key={session.id} session={session} isTeaching={true} />
            ))}
          </div>
        )}
      </div>

      {/* Learning Sessions */}
      <div>
        <h2 className="flex items-center mb-6 space-x-2 text-2xl font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            👨‍🎓
          </span>
          <span>Sessions as Learner ({learningSessions.length})</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadSessions}
              className="px-4 py-2 mt-4 text-sm font-medium text-green-600 transition-colors rounded-lg bg-green-50 hover:bg-green-100"
            >
              Try Again
            </button>
          </div>
        ) : learningSessions.length === 0 ? (
          <div className="p-12 text-center border border-gray-200 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">No learning sessions yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Book sessions to start learning new skills
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {learningSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isTeaching={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

SessionsSection.displayName = "SessionsSection";

export default SessionsSection;
