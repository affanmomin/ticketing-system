import { api } from "@/lib/axios";
import type {
  Attachment,
  AttachmentConfirmRequest,
  AttachmentPresignRequest,
  AttachmentPresignResponse,
} from "@/types/api";

export const listByTicket = (ticketId: string) =>
  api.get<Attachment[]>(`/tickets/${ticketId}/attachments`);

export const presignUpload = (
  ticketId: string,
  payload: AttachmentPresignRequest
) =>
  api.post<AttachmentPresignResponse>(
    `/tickets/${ticketId}/attachments/presign`,
    payload
  );

export const confirmUpload = (
  ticketId: string,
  payload: AttachmentConfirmRequest
) =>
  api.post<Attachment>(`/tickets/${ticketId}/attachments/confirm`, payload);

export const remove = (id: string) => api.delete<void>(`/attachments/${id}`);
