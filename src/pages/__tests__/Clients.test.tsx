import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { Clients } from "../Clients";
import { useAuthStore } from "@/store/auth";

describe("Clients page", () => {
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

  it("renders clients page", async () => {
    render(<Clients />);

    await waitFor(() => {
      expect(screen.getByText(/Clients/i)).toBeInTheDocument();
    });
  });

  it("displays clients list", async () => {
    render(<Clients />);

    await waitFor(() => {
      expect(screen.getByText(/Acme Co/i)).toBeInTheDocument();
    });
  });

  it("shows create client button", async () => {
    render(<Clients />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /New client|Create/i })).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    render(<Clients />);

    expect(screen.getByText(/Clients/i)).toBeInTheDocument();
  });
});

