import { api } from "@/lib/axios";
import { sanitizeFilename } from "@/lib/utils";
import type {
  PaginatedResponse,
  Ticket,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketsListQuery,
} from "@/types/api";

export const list = (query: TicketsListQuery = {}) =>
  api.get<PaginatedResponse<Ticket>>("/tickets", { params: query });

export const create = (
  payload: TicketCreateRequest,
  files?: File[]
): Promise<{ data: Ticket }> => {
  // If no files, use JSON
  if (!files || files.length === 0) {
    return api.post<Ticket>("/tickets", payload);
  }

  // If files exist, use FormData
  const formData = new FormData();

  // Add ticket fields
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Add files (field names: file1, file2, file3, etc.)
  files.forEach((file, index) => {
    // Sanitize filename to prevent Content-Disposition header issues
    const sanitizedName = sanitizeFilename(file.name);
    const sanitizedFile = sanitizedName !== file.name
      ? new File([file], sanitizedName, { type: file.type, lastModified: file.lastModified })
      : file;
    
    formData.append(`file${index + 1}`, sanitizedFile);
  });

  return api.post<Ticket>("/tickets", formData, {
    // Don't set Content-Type - axios will set it automatically with boundary
  });
};

export const get = (id: string) => api.get<Ticket>(`/tickets/${id}`);

export const update = (id: string, payload: TicketUpdateRequest) =>
  api.post<Ticket>(`/tickets/${id}`, payload);

export const remove = (id: string) => api.delete<void>(`/tickets/${id}`);
