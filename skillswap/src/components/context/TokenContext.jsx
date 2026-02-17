import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  memo,
  useMemo,
} from "react";
import { userAPI } from "../../services/api";
import { useUser } from "./UserContext";

// ==================== TOKEN CONTEXT ====================
const TokenContext = createContext(null);

export const TokenProvider = memo(({ children }) => {
  const { user } = useUser();
  const [tokens, setTokens] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load tokens and transactions from backend when user is authenticated
  useEffect(() => {
    const loadTokenData = async () => {
      if (!user) {
        setTokens(0);
        setTransactions([]);
        return;
      }

      try {
        setIsLoading(true);
        const [balanceResponse, transactionsResponse] = await Promise.all([
          userAPI.getTokenBalance(),
          userAPI.getTransactions(),
        ]);

        setTokens(balanceResponse.tokens || 0);
        setTransactions(transactionsResponse.transactions || []);
      } catch (error) {
        console.error("Error loading token data:", error);
        // Fallback to user object tokens if API fails
        setTokens(user.tokens || 0);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokenData();
  }, [user]);

  // Refresh token data from backend
  const refreshTokens = useCallback(async () => {
    if (!user) return;

    try {
      const [balanceResponse, transactionsResponse] = await Promise.all([
        userAPI.getTokenBalance(),
        userAPI.getTransactions(),
      ]);

      setTokens(balanceResponse.tokens || 0);
      setTransactions(transactionsResponse.transactions || []);
    } catch (error) {
      console.error("Error refreshing token data:", error);
    }
  }, [user]);

  // Add tokens (optimistic update)
  const addTokens = useCallback(
    (amount) => {
      setTokens((prev) => prev + amount);
      // The actual transaction is created by the backend
      // Refresh to get latest data
      setTimeout(refreshTokens, 1000);
    },
    [refreshTokens]
  );

  // Deduct tokens (optimistic update)
  const deductTokens = useCallback(
    (amount) => {
      setTokens((prev) => {
        if (prev < amount) return prev; // Not enough tokens
        return prev - amount;
      });
      // The actual transaction is created by the backend
      // Refresh to get latest data
      setTimeout(refreshTokens, 1000);
    },
    [refreshTokens]
  );

  const value = useMemo(
    () => ({
      tokens,
      transactions,
      isLoading,
      addTokens,
      deductTokens,
      refreshTokens,
    }),
    [tokens, transactions, isLoading, addTokens, deductTokens, refreshTokens]
  );

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
});

TokenProvider.displayName = "TokenProvider";

// Hook to use context
export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within TokenProvider");
  }
  return context;
};
