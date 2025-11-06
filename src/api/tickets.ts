import { api } from "@/lib/axios";
import type {
  PaginatedResponse,
  Ticket,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketsListQuery,
} from "@/types/api";

export const list = (query: TicketsListQuery = {}) =>
  api.get<PaginatedResponse<Ticket>>("/tickets", { params: query });

export const create = (payload: TicketCreateRequest) =>
  api.post<Ticket>("/tickets", payload);

export const get = (id: string) => api.get<Ticket>(`/tickets/${id}`);

export const update = (id: string, payload: TicketUpdateRequest) =>
  api.post<Ticket>(`/tickets/${id}`, payload);

export const remove = (id: string) => api.delete<void>(`/tickets/${id}`);
