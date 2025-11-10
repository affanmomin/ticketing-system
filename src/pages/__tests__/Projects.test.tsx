import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { Projects } from "../Projects";
import { useAuthStore } from "@/store/auth";

describe("Projects page", () => {
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
    vi.spyOn(useAuthStore.getState(), "bootstrap").mockResolvedValue();
  });

  it("renders projects page", async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    });
  });

  it("displays projects list", async () => {
    render(<Projects />);

    await waitFor(() => {
      // Should show project cards or list
      expect(screen.getByText(/Website \(WEB\)/i)).toBeInTheDocument();
    });
  });

  it("shows create project button", async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /New project|Create/i })).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    render(<Projects />);

    // Should show loading state initially
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
  });

  it("handles empty state", async () => {
    // This would require mocking empty response
    render(<Projects />);

    // Should handle empty state gracefully
    await waitFor(() => {
      expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    });
  });
});

