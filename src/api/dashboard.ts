import { api } from "@/lib/axios";
import type {
  DashboardMetrics,
  DashboardActivity,
  UserActivityResponse,
} from "@/types/api";

export const getMetrics = () => api.get<DashboardMetrics>("/dashboard/metrics");

export const getActivity = (limit?: number) =>
  api.get<DashboardActivity[]>("/dashboard/activity", {
    params: limit ? { limit } : undefined,
  });

export const getUserActivity = (userId: string) =>
  api.get<UserActivityResponse>(`/dashboard/users/${userId}/activity`);

