import { api } from "@/lib/axios";
import type { Project } from "@/types/api";

export const list = (params: { clientId?: string } = {}) =>
  api.get<Project[]>("/projects", { params });

export const create = (dto: {
  clientId: string;
  name: string;
  code: string;
  active?: boolean;
}) => api.post("/projects", dto);

export const get = (id: string) => api.get<Project>(`/projects/${id}`);

export const update = (
  id: string,
  patch: { name?: string; code?: string; active?: boolean }
) => api.patch(`/projects/${id}`, patch);
