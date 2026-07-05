import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import type { SelectUser } from "@shared/schema";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, AdminLoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export interface AdminLoginData {
  username: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [, navigate] = useLocation();

  // Check authentication status with secure cookies and local storage backup
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      // First check if we have a stored user in localStorage
      const storedUser = localStorage.getItem('auth-user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem('auth-user');
        }
      }

      const response = await fetch("/api/user", {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
          setError(null);
          // Store user in localStorage for persistence
          localStorage.setItem('auth-user', JSON.stringify(result.user));
          localStorage.setItem('auth-timestamp', Date.now().toString());
          return true;
        }
      }
      
      // Session is invalid - clear stored data
      setUser(null);
      setError(null);
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-timestamp');
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      setError(error as Error);
      setUser(null);
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-timestamp');
      return false;
    }
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include", // Include cookies for session
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();
      
      if (!result.success || !result.user) {
        throw new Error("Invalid server response");
      }

      return result.user;
    },
    onSuccess: (userData: SelectUser) => {
      setUser(userData);
      setError(null);
      
      // Store authentication data for persistence
      localStorage.setItem('auth-user', JSON.stringify(userData));
      localStorage.setItem('auth-timestamp', Date.now().toString());
      
      // Navigate to admin dashboard
      navigate("/admin");
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      setError(error);
      setUser(null);
      
      // No toast to prevent layout issues - error handled in component
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include", // Include cookies for session
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear all authentication state
      setUser(null);
      setError(null);
      
      // Clear stored authentication data
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-timestamp');
      
      // Navigate to login page
      navigate("/admin/login");
    },
    onError: (error: Error) => {
      console.error("Logout failed:", error);
      
      // Force clear state even if logout request failed
      setUser(null);
      setError(null);
      
      // Clear stored authentication data
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-timestamp');

      navigate("/admin/login");
    }
  });

  // Initialize authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing secure authentication...");
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(error as Error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Run only once on mount

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    loginMutation,
    logoutMutation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}