import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (userData) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser(userData);
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
