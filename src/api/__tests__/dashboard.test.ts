import { describe, it, expect, beforeEach } from "vitest";
import { server } from "@/test/server";
import { http, HttpResponse } from "msw";
import { getMetrics, getActivity, getUserActivity } from "../dashboard";
import { useAuthStore } from "@/store/auth";

const API = (path: string) =>
  `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}${path}`;

describe("Dashboard API", () => {
  beforeEach(() => {
    useAuthStore.getState().setToken("test-token");
    useAuthStore.getState().setUser({
      id: "u1",
      organizationId: "org-1",
      role: "ADMIN",
      clientId: null,
      fullName: "Test Admin",
      email: "admin@example.com",
      isActive: true,
    });
  });

  describe("getMetrics", () => {
    it("fetches dashboard metrics for admin", async () => {
      const { data } = await getMetrics();

      expect(data).toHaveProperty("tickets");
      expect(data).toHaveProperty("projects");
      expect(data).toHaveProperty("clients");
      expect(data).toHaveProperty("users");
      expect(data.tickets).toHaveProperty("total");
      expect(data.tickets).toHaveProperty("open");
      expect(data.tickets).toHaveProperty("closed");
      expect(data.tickets).toHaveProperty("byStatus");
      expect(data.tickets).toHaveProperty("byPriority");
    });

    it("handles unauthorized requests", async () => {
      useAuthStore.getState().setToken(undefined);

      await expect(getMetrics()).rejects.toThrow();
    });
  });

  describe("getActivity", () => {
    it("fetches dashboard activity with default limit", async () => {
      const { data } = await getActivity();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0]).toHaveProperty("id");
        expect(data[0]).toHaveProperty("type");
        expect(data[0]).toHaveProperty("ticketId");
        expect(data[0]).toHaveProperty("ticketTitle");
        expect(data[0]).toHaveProperty("actorId");
        expect(data[0]).toHaveProperty("createdAt");
      }
    });

    it("fetches dashboard activity with custom limit", async () => {
      const { data } = await getActivity(5);

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeLessThanOrEqual(5);
    });

    it("handles unauthorized requests", async () => {
      useAuthStore.getState().setToken(undefined);

      await expect(getActivity()).rejects.toThrow();
    });
  });

  describe("getUserActivity", () => {
    it("fetches user activity for admin", async () => {
      const { data } = await getUserActivity("u1");

      expect(data).toHaveProperty("user");
      expect(data).toHaveProperty("tickets");
      expect(data).toHaveProperty("activity");
      expect(data).toHaveProperty("performance");
      expect(data).toHaveProperty("projects");
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("email");
      expect(data.user).toHaveProperty("fullName");
      expect(data.tickets).toHaveProperty("created");
      expect(data.tickets).toHaveProperty("assigned");
      expect(data.tickets).toHaveProperty("closed");
      expect(data.tickets).toHaveProperty("open");
      expect(data.activity).toHaveProperty("totalEvents");
      expect(data.activity).toHaveProperty("totalComments");
      expect(data.performance).toHaveProperty("averageResponseTime");
      expect(data.performance).toHaveProperty("averageResolutionTime");
    });

    it("handles 404 for non-existent user", async () => {
      server.use(
        http.get(API("/dashboard/users/:id/activity"), () => {
          return HttpResponse.json(
            { code: "NOT_FOUND", message: "User not found" },
            { status: 404 }
          );
        })
      );

      await expect(getUserActivity("non-existent")).rejects.toThrow();
    });

    it("handles 403 for non-admin users", async () => {
      useAuthStore.getState().setUser({
        id: "u2",
        organizationId: "org-1",
        role: "EMPLOYEE",
        clientId: null,
        fullName: "Employee",
        email: "employee@example.com",
        isActive: true,
      });

      server.use(
        http.get(API("/dashboard/users/:id/activity"), () => {
          return HttpResponse.json(
            {
              code: "FORBIDDEN",
              message: "Only admins can view user activity",
            },
            { status: 403 }
          );
        })
      );

      await expect(getUserActivity("u1")).rejects.toThrow();
    });

    it("handles unauthorized requests", async () => {
      useAuthStore.getState().setToken(undefined);

      await expect(getUserActivity("u1")).rejects.toThrow();
    });
  });
});
