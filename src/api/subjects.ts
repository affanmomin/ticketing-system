import { api } from "@/lib/axios";
import type { PaginatedResponse, Subject } from "@/types/api";

export interface ListSubjectsQuery {
  limit?: number;
  offset?: number;
  active?: boolean;
}

export interface SubjectCreateRequest {
  name: string;
  description?: string;
}

export interface SubjectUpdateRequest {
  name?: string;
  description?: string | null;
  active?: boolean;
}

export const listForProject = (
  projectId: string,
  params: ListSubjectsQuery = {}
) =>
  api.get<PaginatedResponse<Subject>>(`/projects/${projectId}/subjects`, {
    params,
  });

export const createForProject = (
  projectId: string,
  payload: SubjectCreateRequest
) => api.post<Subject>(`/projects/${projectId}/subjects`, payload);

export const update = (id: string, payload: SubjectUpdateRequest) =>
  api.post<Subject>(`/subjects/${id}`, payload);
