import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  memo,
  useMemo,
} from "react";
import { authAPI } from "../../services/api";

// ==================== USER CONTEXT ====================
const UserContext = createContext(null);

export const UserProvider = memo(({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true during initial load
  const [error, setError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token) {
        try {
          // Try to fetch fresh user data from API
          const response = await authAPI.getMe();
          setUser(response.user);
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(response.user));
        } catch (error) {
          console.error("Error loading user from API:", error);

          // Fallback to stored user data if API fails
          // This prevents logout on refresh when backend is temporarily unavailable
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              console.log("Using cached user data");
            } catch (parseError) {
              console.error("Error parsing stored user:", parseError);
              // Only clear storage if the data is corrupted
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            }
          } else {
            // No stored user and API failed - clear token
            localStorage.removeItem("token");
          }
        }
      }
      // Set loading to false after attempt
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ email, password });

      // Store token and user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error("All fields are required");
      }

      const response = await authAPI.register(formData);

      // Store token and user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || "Update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user, isLoading, error, login, register, logout, updateUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
});

UserProvider.displayName = "UserProvider";

// Hook to use context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
