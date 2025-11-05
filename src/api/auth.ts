import { api } from "@/lib/axios";
import type {
  LoginRequest,
  AuthResponse,
  AuthUser,
  SignupRequest,
  SignupResponse,
} from "@/types/api";

export const signup = (data: SignupRequest) =>
  api.post<SignupResponse>("/auth/signup", data);

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>("/auth/login", data);

export const me = () => api.get<AuthUser>("/auth/me");

export const logout = () => api.post("/auth/logout");
