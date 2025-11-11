import { api } from "@/lib/axios";
import type {
  LoginRequest,
  AuthResponse,
  AuthUser,
  SignupRequest,
  SignupResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/api";

export const signup = (data: SignupRequest) =>
  api.post<SignupResponse>("/auth/signup", data);

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>("/auth/login", data);

export const me = () => api.get<AuthUser>("/auth/me");

export const logout = () => api.post("/auth/logout");

export const forgotPassword = (data: ForgotPasswordRequest) =>
  api.post<ForgotPasswordResponse>("/auth/forgot-password", data);

export const resetPassword = (data: ResetPasswordRequest) =>
  api.post<ResetPasswordResponse>("/auth/reset-password", data);
