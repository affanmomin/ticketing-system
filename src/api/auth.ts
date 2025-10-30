import { api } from "@/lib/axios";
import type { LoginRequest, LoginResponse, AuthUser } from "@/types/api";

export const login = (data: LoginRequest) =>
  api.post<LoginResponse>("/auth/login", data);

export const me = () => api.get<{ user: AuthUser }>("/auth/me");

export type DashboardData = {
  user: {
    userId: string;
    tenantId: string;
    role: string;
    clientId: string;
  };
  dashboard: {
    totalTickets: {
      count: number;
      change: number;
      changeLabel: string;
      changeSummary: string;
    };
    activeProjects: {
      count: number;
      change: number;
      changeLabel: string;
      changeSummary: string;
    };
    totalUsers: {
      count: number;
      change: number;
      changeLabel: string;
      changeSummary: string;
    };
    completedTickets: {
      count: number;
      change: number;
      changeLabel: string;
      changeSummary: string;
    };
    recentActivity: Array<{
      ticketId: string;
      title: string;
      message: string;
      timeAgo: string;
      updatedBy: string | null;
      status: string;
    }>;
  };
};

export const getDashboard = () => api.get<DashboardData>("/auth/me");
