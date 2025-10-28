import { api } from "@/lib/axios";
import type { Attachment } from "@/types/api";

export const listByTicket = (ticketId: string) =>
  api.get<Attachment[]>(`/tickets/${ticketId}/attachments`);

export const upload = (data: { file: File; ticketId: string }) => {
  const fd = new FormData();
  fd.append("file", data.file);
  fd.append("ticketId", data.ticketId);
  return api.post<Attachment>("/attachments", fd);
};

export const remove = (id: string) => api.delete(`/attachments/${id}`);
