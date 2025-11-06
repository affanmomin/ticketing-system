import { api } from "@/lib/axios";
import type { AuthUser, PaginatedResponse, UserRole } from "@/types/api";

export interface ListUsersQuery {
  limit?: number;
  offset?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export interface UserUpdateRequest {
  fullName?: string;
  email?: string;
  isActive?: boolean;
}

export interface CreateEmployeeRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface CreateClientUserRequest extends CreateEmployeeRequest {
  clientId: string;
}

export interface ChangePasswordRequest {
  password: string;
}

export const list = (params: ListUsersQuery = {}) =>
  api.get<PaginatedResponse<AuthUser>>("/users", { params });

export const get = (id: string) => api.get<AuthUser>(`/users/${id}`);

export const update = (id: string, payload: UserUpdateRequest) =>
  api.post<AuthUser>(`/users/${id}`, payload);

export const changePassword = (id: string, payload: ChangePasswordRequest) =>
  api.post<void>(`/users/${id}/password`, payload);

export const createEmployee = (payload: CreateEmployeeRequest) =>
  api.post<AuthUser>("/employees", payload);

export const createClientUser = (payload: CreateClientUserRequest) =>
  api.post<AuthUser>("/client-users", payload);
