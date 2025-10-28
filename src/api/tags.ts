import { api } from "@/lib/axios";
import type { Tag } from "@/types/api";

export const list = (params: { clientId?: string } = {}) =>
  api.get<Tag[]>("/tags", { params });
export const create = (dto: {
  name: string;
  color: string;
  clientId?: string;
}) => api.post<Tag>("/tags", dto);
export const remove = (id: string) => api.delete(`/tags/${id}`);
