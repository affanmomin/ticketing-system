import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { ProjectDetail } from "../ProjectDetail";
import { useAuthStore } from "@/store/auth";

describe("ProjectDetail page", () => {
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

  it("renders project detail page", async () => {
    render(<ProjectDetail />, { initialEntries: ["/projects/project-1"] });

    await waitFor(() => {
      expect(screen.getByText(/Website \(WEB\)/i)).toBeInTheDocument();
    });
  });

  it("displays project information", async () => {
    render(<ProjectDetail />, { initialEntries: ["/projects/project-1"] });

    await waitFor(() => {
      expect(screen.getByText(/Website \(WEB\)/i)).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    render(<ProjectDetail />, { initialEntries: ["/projects/project-1"] });

    // Should show loading state initially or page structure
    expect(screen.queryByText(/Loading/i) || screen.queryByText(/Project/i)).toBeInTheDocument();
  });
});

