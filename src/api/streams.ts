import { api } from "@/lib/axios";
import type { PaginatedResponse, Stream } from "@/types/api";

export interface ListStreamsQuery {
  limit?: number;
  offset?: number;
  active?: boolean;
}

export interface StreamCreateRequest {
  name: string;
  description?: string;
}

export interface StreamUpdateRequest {
  name?: string;
  description?: string | null;
  active?: boolean;
}

export const listForProject = (
  projectId: string,
  params: ListStreamsQuery = {}
) =>
  api.get<PaginatedResponse<Stream>>(`/projects/${projectId}/streams`, {
    params,
  });

export const createForProject = (
  projectId: string,
  payload: StreamCreateRequest
) => api.post<Stream>(`/projects/${projectId}/streams`, payload);

export const update = (id: string, payload: StreamUpdateRequest) =>
  api.patch<Stream>(`/streams/${id}`, payload);
