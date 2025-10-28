import { api } from "@/lib/axios";
import type { Comment } from "@/types/api";

export const listByTicket = (ticketId: string) =>
  api.get<Comment[]>(`/tickets/${ticketId}/comments`);

export const create = (dto: { ticketId: string; bodyMd: string }) =>
  api.post<Comment>("/comments", dto);
