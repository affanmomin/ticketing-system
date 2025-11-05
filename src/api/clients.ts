import { api } from "@/lib/axios";
import type { Client, PaginatedResponse } from "@/types/api";

export interface ListClientsQuery {
  limit?: number;
  offset?: number;
  active?: boolean;
  search?: string;
}

export interface ClientCreateRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ClientUpdateRequest {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  active?: boolean;
}

export const list = (params: ListClientsQuery = {}) =>
  api.get<PaginatedResponse<Client>>("/clients", { params });

export const create = (dto: ClientCreateRequest) =>
  api.post<Client>("/clients", dto);

export const get = (id: string) => api.get<Client>(`/clients/${id}`);

export const update = (id: string, patch: ClientUpdateRequest) =>
  api.patch<Client>(`/clients/${id}`, patch);
