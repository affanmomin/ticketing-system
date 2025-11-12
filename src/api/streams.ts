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
  parentStreamId?: string | null;
}

export interface StreamUpdateRequest {
  name?: string;
  description?: string | null;
  active?: boolean;
  parentStreamId?: string | null;
}

export const listForProject = (
  projectId: string,
  params: ListStreamsQuery = {}
) =>
  api.get<PaginatedResponse<Stream>>(`/projects/${projectId}/streams`, {
    params,
  });

// Get parent streams (level 1) for a project
export const listParentsForProject = (projectId: string) =>
  api.get<Stream[]>(`/projects/${projectId}/streams/parents`);

// Get child streams (level 2) for a parent stream
export const listChildren = (parentStreamId: string) =>
  api.get<Stream[]>(`/streams/${parentStreamId}/children`);

export const createForProject = (
  projectId: string,
  payload: StreamCreateRequest
) => api.post<Stream>(`/projects/${projectId}/streams`, payload);

export const update = (id: string, payload: StreamUpdateRequest) =>
  api.post<Stream>(`/streams/${id}`, payload);
