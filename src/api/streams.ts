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

export const listForClient = (
  clientId: string,
  params: ListStreamsQuery = {}
) => api.get<PaginatedResponse<Stream>>(`/clients/${clientId}/streams`, {
  params,
});

export const createForClient = (
  clientId: string,
  payload: StreamCreateRequest
) => api.post<Stream>(`/clients/${clientId}/streams`, payload);

export const update = (id: string, payload: StreamUpdateRequest) =>
  api.patch<Stream>(`/streams/${id}`, payload);
