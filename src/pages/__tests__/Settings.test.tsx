import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { Settings } from "../Settings";
import { useAuthStore } from "@/store/auth";

describe("Settings page", () => {
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

  it("renders settings page", async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });
  });

  it("displays user profile information", async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText(/Test Admin/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
    });
  });
});

