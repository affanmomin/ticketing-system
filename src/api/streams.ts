import { api } from "@/lib/axios";
import type { Stream } from "@/types/api";

export const list = (projectId: string) =>
  api.get<Stream[]>("/streams", { params: { projectId } });

export const create = (dto: { projectId: string; name: string }) =>
  api.post("/streams", dto);

export const update = (id: string, patch: { name?: string }) =>
  api.post(`/streams-update/${id}`, patch);
