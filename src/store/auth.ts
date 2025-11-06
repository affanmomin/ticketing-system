import { create, type StateCreator } from "zustand";
import * as authApi from "@/api/auth";
import type { AuthUser, LoginRequest, UserRole } from "@/types/api";

type State = {
  token?: string;
  user?: AuthUser;
  organizationId?: string;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
};

type Actions = {
  setToken: (token?: string) => void;
  setUser: (user?: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const TOKEN_STORAGE_KEY = "cc_token";

const initializer: StateCreator<State & Actions> = (set, get) => ({
  token:
    typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_STORAGE_KEY) || undefined
      : undefined,
  user: undefined,
  organizationId: undefined,
  isAuthenticated: !!(
    typeof window !== "undefined" && localStorage.getItem(TOKEN_STORAGE_KEY)
  ),
  loading: false,
  error: undefined,

  setToken: (token?: string) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    set({ token, isAuthenticated: !!token });
  },

  setUser: (user?: AuthUser) => {
    set({ user });
  },

  clearError: () => set({ error: undefined }),

  login: async (email: string, password: string) => {
    set({ loading: true, error: undefined });
    try {
      const payload: LoginRequest = { email, password };
      const { data } = await authApi.login(payload);
      get().setToken(data.accessToken);
      await get().bootstrap();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Authentication failed";
      set({ error: message, loading: false });
      throw error;
    }
    set({ loading: false });
  },

  bootstrap: async () => {
    const { token } = get();
    if (!token) {
      set({
        user: undefined,
        organizationId: undefined,
        isAuthenticated: false,
      });
      return;
    }

    set({ loading: true });
    try {
      const { data } = await authApi.me();
      const normalizedRole = (data.role ?? "").toString().toUpperCase();
      const role: UserRole = ["ADMIN", "EMPLOYEE", "CLIENT"].includes(
        normalizedRole as UserRole
      )
        ? (normalizedRole as UserRole)
        : "CLIENT";

      const user: AuthUser = {
        ...data,
        role,
      };

      set({
        user,
        organizationId: data.organizationId,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to bootstrap auth state", error);
      get().setToken(undefined);
      set({
        user: undefined,
        organizationId: undefined,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Non-blocking – still proceed with local cleanup
      console.warn("Logout request failed", error);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    set({
      token: undefined,
      user: undefined,
      organizationId: undefined,
      isAuthenticated: false,
      loading: false,
      error: undefined,
    });
  },
});

export const useAuthStore = create<State & Actions>(initializer);
