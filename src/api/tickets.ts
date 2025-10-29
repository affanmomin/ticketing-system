import { api } from "@/lib/axios";
import type {
  Ticket,
  Paged,
  TicketsListQuery,
  UpdateTicketPatch,
} from "@/types/api";

export const pagedList = (query: TicketsListQuery) =>
  api.get<Paged<Ticket>>("/tickets", { params: query });

export const create = (dto: {
  clientId: string;
  projectId: string;
  title: string;
  descriptionMd: string;
  streamId?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  dueDate?: string; // ISO
  points?: number;
  tagIds?: string[];
}) => api.post<Ticket>("/tickets", dto);

export const get = (id: string) => api.get<Ticket>(`/tickets/${id}`);

export const update = (id: string, patch: UpdateTicketPatch) =>
  api.post<Ticket>(`/tickets-update/${id}`, patch);
