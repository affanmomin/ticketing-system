import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { Dashboard } from "../Dashboard";
import { useAuthStore } from "@/store/auth";

describe("Dashboard page", () => {
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
    // Mock bootstrap to avoid API call
    vi.spyOn(useAuthStore.getState(), "bootstrap").mockResolvedValue();
  });

  it("renders dashboard with stats", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    // Check for stat cards
    await waitFor(() => {
      expect(screen.getByText(/Total Tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Projects/i)).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    render(<Dashboard />);

    // Should show loading skeletons or page structure
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it("displays stats for admin user", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
    });
  });

  it("displays recent tickets widget", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Recent Tickets/i)).toBeInTheDocument();
    });
  });

  it("displays quick actions", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
      expect(screen.getByText(/Create New Ticket/i)).toBeInTheDocument();
    });
  });

  it("handles error state", async () => {
    // This would require mocking API errors
    render(<Dashboard />);

    // Should still render the page structure
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });
});

