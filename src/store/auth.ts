import { create, type StateCreator } from "zustand";
import { api } from "@/lib/axios";
import type { AuthUser, LoginRequest, UserRole } from "@/types/api";

type State = {
  token?: string;
  user?: AuthUser;
  tenantId?: string;
  isAuthenticated: boolean;
  loading: boolean;
};

type Actions = {
  setToken: (t?: string) => void;
  login: (email: string, password: string, tenantId?: string) => Promise<void>;
  bootstrap: () => Promise<void>;
  logout: () => void;
};

const initializer: StateCreator<State & Actions> = (set, get) => ({
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("cc_token") || undefined
      : undefined,
  user: undefined,
  tenantId: undefined,
  isAuthenticated: !!(
    typeof window !== "undefined" && localStorage.getItem("cc_token")
  ),
  loading: false,

  setToken: (t?: string) => {
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("cc_token", t);
      else localStorage.removeItem("cc_token");
    }
    set({ token: t, isAuthenticated: !!t });
  },

  login: async (email: string, password: string, tenantId?: string) => {
    set({ loading: true });
    const payload: LoginRequest = { email, password };
    if (tenantId) payload.tenantId = tenantId;
    const { data } = await api.post("/auth/login", payload);
    get().setToken(data.accessToken);
    await get().bootstrap();
    set({ loading: false });
  },

  bootstrap: async () => {
    set({ loading: true });
    const { data: me } = await api.get("/auth/me");
    const { data: t } = await api.get("/tenants/me");
    // Normalize role from backend (case-insensitive safety)
    const rawRole = (me.user?.role ?? "").toString().toUpperCase();
    const normalizedRole: UserRole = ["ADMIN", "EMPLOYEE", "CLIENT"].includes(
      rawRole as UserRole
    )
      ? (rawRole as UserRole)
      : "CLIENT";
    const normalizedUser: AuthUser = {
      ...(me.user as AuthUser),
      role: normalizedRole,
    };
    set({
      user: normalizedUser,
      tenantId: t.id,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("cc_token");
    set({
      token: undefined,
      user: undefined,
      tenantId: undefined,
      isAuthenticated: false,
    });
  },
});

export const useAuthStore = create<State & Actions>(initializer);
