import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { Users } from "../Users";
import { useAuthStore } from "@/store/auth";

describe("Users page", () => {
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

  it("renders users page", async () => {
    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
    });
  });

  it("displays users list", async () => {
    render(<Users />);

    await waitFor(() => {
      expect(screen.getByText(/Test Admin/i)).toBeInTheDocument();
    });
  });

  it("shows create user button", async () => {
    render(<Users />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /New user|Invite|Create/i })).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    render(<Users />);

    expect(screen.getByText(/Users/i)).toBeInTheDocument();
  });
});

