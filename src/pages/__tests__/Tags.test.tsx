import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { Tags } from "../Tags";
import { useAuthStore } from "@/store/auth";

describe("Tags page", () => {
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

  it("renders tags page", async () => {
    render(<Tags />);

    await waitFor(() => {
      expect(screen.getByText(/Tags/i)).toBeInTheDocument();
    });
  });

  it("shows create tag button", async () => {
    render(<Tags />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /New tag|Create/i })).toBeInTheDocument();
    });
  });
});

