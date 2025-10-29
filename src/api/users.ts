import { api } from "@/lib/axios";

export type UserType = "ADMIN" | "EMPLOYEE" | "CLIENT";

export type User = {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  tenantId: string;
  clientCompanyId?: string | null;
  clientCompanyName?: string | null;
  active: boolean;
  lastSignInAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssignableUser = { id: string; name: string; email: string };

export type CreateUserRequest = {
  email: string;
  name: string;
  password: string;
  userType?: UserType;
  clientCompanyId?: string;
  active?: boolean;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  password?: string;
  userType?: UserType;
  clientCompanyId?: string;
  active?: boolean;
};

export type ListUsersParams = {
  limit?: number;
  offset?: number;
  userType?: UserType;
  clientCompanyId?: string;
  active?: boolean;
  search?: string;
};

export type ListUsersResponse = {
  data: User[];
  total: number;
  limit: number;
  offset: number;
};

// Create a new user (Admin only)
export const create = (data: CreateUserRequest) =>
  api.post<User>("/users", data);

// List users with filters
export const list = (params?: ListUsersParams) =>
  api.get<ListUsersResponse>("/users", { params });

// Get user by ID
export const get = (id: string) => api.get<User>(`/users/${id}`);

// Update user
export const update = (id: string, data: UpdateUserRequest) =>
  api.put<User>(`/users/${id}`, data);

// Delete user (soft or hard)
export const remove = (id: string, hard: boolean = false) =>
  api.delete<{ deleted: boolean; hard: boolean }>(`/users/${id}`, {
    params: { hard },
  });

// Get assignable users for a client
export const assignableUsers = (clientId: string) =>
  api.get<AssignableUser[]>("/users/assignable", { params: { clientId } });
