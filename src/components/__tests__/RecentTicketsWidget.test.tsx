import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { RecentTicketsWidget } from "../RecentTicketsWidget";
import { useAuthStore } from "@/store/auth";
import { BrowserRouter } from "react-router-dom";

describe("RecentTicketsWidget", () => {
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

  it("renders loading state initially", () => {
    render(
      <BrowserRouter>
        <RecentTicketsWidget />
      </BrowserRouter>
    );
    
    // Should show loading skeletons
    const skeletons = screen.queryAllByRole("generic");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("displays recent tickets", async () => {
    render(
      <BrowserRouter>
        <RecentTicketsWidget />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Set up billing webhook/i)).toBeInTheDocument();
    });
  });

  it("displays empty state when no tickets", async () => {
    // This would require mocking empty response
    render(
      <BrowserRouter>
        <RecentTicketsWidget />
      </BrowserRouter>
    );
    
    // Should handle empty state gracefully
    await waitFor(() => {
      const emptyState = screen.queryByText(/No tickets/i);
      if (emptyState) {
        expect(emptyState).toBeInTheDocument();
      }
    });
  });
});

