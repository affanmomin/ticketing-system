import { api } from "@/lib/axios";
import type {
  PaginatedResponse,
  Project,
  ProjectMember,
  ProjectMemberRole,
} from "@/types/api";

export interface ListProjectsQuery {
  clientId?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface ProjectCreateRequest {
  clientId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
}

export interface ProjectMemberRequest {
  userId: string;
  role?: ProjectMemberRole;
  canRaise?: boolean;
  canBeAssigned?: boolean;
}

export interface ProjectMemberUpdateRequest {
  role?: ProjectMemberRole;
  canRaise?: boolean;
  canBeAssigned?: boolean;
}

export const list = (params: ListProjectsQuery = {}) =>
  api.get<PaginatedResponse<Project>>("/projects", { params });

export const create = (dto: ProjectCreateRequest) =>
  api.post<Project>("/projects", dto);

export const get = (id: string) => api.get<Project>(`/projects/${id}`);

export const update = (id: string, patch: ProjectUpdateRequest) =>
  api.patch<Project>(`/projects/${id}`, patch);

export const listMembers = (projectId: string) =>
  api.get<ProjectMember[]>(`/projects/${projectId}/members`);

export const addMember = (projectId: string, payload: ProjectMemberRequest) =>
  api.post<ProjectMember>(`/projects/${projectId}/members`, payload);

export const updateMember = (
  projectId: string,
  userId: string,
  payload: ProjectMemberUpdateRequest
) => api.patch<ProjectMember>(
  `/projects/${projectId}/members/${userId}`,
  payload
);

export const removeMember = (projectId: string, userId: string) =>
  api.delete<void>(`/projects/${projectId}/members/${userId}`);
