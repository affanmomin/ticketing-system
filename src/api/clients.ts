import { api } from "@/lib/axios";
import type { Client, Paged } from "@/types/api";

export const list = (params: { limit?: number; offset?: number } = {}) =>
  api.get<Paged<Client>>("/clients", { params });

export const create = (dto: {
  name: string;
  domain?: string;
  active?: boolean;
}) => api.post("/clients", dto);

export const get = (id: string) => api.get<Client>(`/clients/${id}`);

export const update = (
  id: string,
  patch: { name?: string; domain?: string; active?: boolean }
) => api.patch(`/clients/${id}`, patch);

export const remove = (id: string) => api.delete(`/clients/${id}`);

export const mapEmployee = (id: string, userId: string) =>
  api.post(`/clients/${id}/map-employee`, { userId });
