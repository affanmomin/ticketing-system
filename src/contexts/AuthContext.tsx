import React, { createContext, useContext } from "react";
import { useAuthStore } from "@/store/auth";

type UserProfile = {
  full_name: string;
  email: string;
  role: "admin" | "employee" | "client";
};

interface AuthContextType {
  user: { id: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserProfile["role"]
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  const profile: UserProfile | null = store.user
    ? {
        full_name: store.user.id,
        email: `${store.user.id}@example.com`,
        role: store.user.role.toLowerCase() as any,
      }
    : null;

  const value: AuthContextType = {
    user: store.user ? { id: store.user.id } : null,
    profile,
    loading: store.loading,
    signIn: async (email: string, password: string) => {
      await store.login(email, password);
    },
    // Not supported in API; provide no-op stubs
    signUp: async () => {
      throw new Error("Sign up not supported");
    },
    signOut: async () => {
      store.logout();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
