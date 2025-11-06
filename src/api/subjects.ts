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

export const listForClient = (
  clientId: string,
  params: ListSubjectsQuery = {}
) =>
  api.get<PaginatedResponse<Subject>>(`/clients/${clientId}/subjects`, {
    params,
  });

export const createForClient = (
  clientId: string,
  payload: SubjectCreateRequest
) => api.post<Subject>(`/clients/${clientId}/subjects`, payload);

export const update = (id: string, payload: SubjectUpdateRequest) =>
  api.post<Subject>(`/subjects/${id}`, payload);
