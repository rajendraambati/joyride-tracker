import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/data/mockData";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const mockUsers: Record<UserRole, AuthUser> = {
  admin: { id: "a1", name: "School Admin", email: "admin@school.com", role: "admin" },
  parent: { id: "p1", name: "Anita Sharma", email: "anita@email.com", role: "parent" },
  driver: { id: "d1", name: "Rajesh Kumar", email: "rajesh@school.com", role: "driver" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (role: UserRole) => setUser(mockUsers[role]);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
