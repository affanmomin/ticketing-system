import { api } from "@/lib/axios";
import { sanitizeFilename } from "@/lib/utils";
import type { Attachment } from "@/types/api";

export const listByTicket = (ticketId: string) =>
  api.get<Attachment[]>(`/tickets/${ticketId}/attachments`);

export const upload = (ticketId: string, file: File) => {
  const formData = new FormData();
  
  // Sanitize filename to prevent Content-Disposition header issues
  const sanitizedName = sanitizeFilename(file.name);
  const sanitizedFile = sanitizedName !== file.name
    ? new File([file], sanitizedName, { type: file.type, lastModified: file.lastModified })
    : file;
  
  formData.append("file", sanitizedFile);
  return api.post<Attachment>(`/tickets/${ticketId}/attachments`, formData, {
    // Don't set Content-Type - axios will set it automatically with boundary
  });
};

export const download = (attachmentId: string) =>
  api.get(`/attachments/${attachmentId}/download`, {
    responseType: "blob",
    headers: {
      Accept: "*/*", // Accept any content type for binary downloads
    },
  });

export const remove = (id: string) => api.delete<void>(`/attachments/${id}`);
