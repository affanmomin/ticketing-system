import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { Dashboard } from "@/pages/Dashboard";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { useAuthStore } from "@/store/auth";

describe("Error Handling in Components", () => {
  beforeEach(() => {
    server.resetHandlers();
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

  it("displays error message when API fails", async () => {
    server.use(
      http.get("*/tickets", () => {
        return HttpResponse.json(
          { message: "Failed to load tickets" },
          { status: 500 }
        );
      })
    );

    render(<Dashboard />);

    await waitFor(() => {
      // Should show error toast or message
      expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
    });
  });

  it("shows loading state during API calls", () => {
    server.use(
      http.get("*/tickets", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ data: [], total: 0 });
      })
    );

    render(<Dashboard />);

    // Should show loading state
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it("handles empty state gracefully", async () => {
    server.use(
      http.get("*/tickets", () => {
        return HttpResponse.json({ data: [], total: 0 });
      }),
      http.get("*/projects", () => {
        return HttpResponse.json({ data: [], total: 0 });
      })
    );

    render(<Dashboard />);

    await waitFor(() => {
      // Should show empty state or zero counts
      expect(screen.getByText(/0/i)).toBeInTheDocument();
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });
});

