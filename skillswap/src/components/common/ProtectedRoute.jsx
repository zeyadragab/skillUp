import React, { memo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

// ==================== PROTECTED ROUTE ====================
const ProtectedRoute = memo(({ children }) => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-white/30 border-t-white animate-spin"></div>
          <p className="text-lg font-semibold text-white">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
});

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
