import { api } from "@/lib/axios";
import type { Priority, Status } from "@/types/api";

export const listPriorities = () =>
  api.get<Priority[]>("/taxonomy/priority");

export const listStatuses = () =>
  api.get<Status[]>("/taxonomy/status");

