import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";

type UserRole = "admin" | "project_manager" | "team_member" | "sales_finance";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("oneflow_token");
    if (token) {
      authAPI.getMe()
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem("oneflow_token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem("oneflow_token", response.token);
    setUser(response.user);
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    const response = await authAPI.signup(email, password, name, role);
    localStorage.setItem("oneflow_token", response.token);
    setUser(response.user);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("oneflow_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
