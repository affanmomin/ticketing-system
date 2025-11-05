import { api } from "@/lib/axios";
import type { Comment, CommentVisibility } from "@/types/api";

export interface CommentCreateRequest {
  bodyMd: string;
  visibility?: CommentVisibility;
}

export const listByTicket = (ticketId: string) =>
  api.get<Comment[]>(`/tickets/${ticketId}/comments`);

export const create = (ticketId: string, payload: CommentCreateRequest) =>
  api.post<Comment>(`/tickets/${ticketId}/comments`, payload);

export const get = (id: string) => api.get<Comment>(`/comments/${id}`);
