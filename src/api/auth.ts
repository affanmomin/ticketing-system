import { api } from "@/lib/axios";
import type { LoginRequest, LoginResponse, AuthUser } from "@/types/api";

export const login = (data: LoginRequest) =>
  api.post<LoginResponse>("/auth/login", data);
export const me = () => api.get<{ user: AuthUser }>("/auth/me");
