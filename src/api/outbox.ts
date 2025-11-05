import { api } from "@/lib/axios";
import type { OutboxNotification } from "@/types/api";

export interface ListPendingQuery {
  limit?: number;
}

export interface ProcessPendingRequest {
  limit?: number;
}

export interface ProcessPendingResponse {
  processed: number;
  failed: number;
}

export const listPending = (params: ListPendingQuery = {}) =>
  api.get<OutboxNotification[]>("/_internal/outbox/pending", { params });

export const processPending = (payload: ProcessPendingRequest = {}) =>
  api.post<ProcessPendingResponse>("/_internal/outbox/process", payload);

