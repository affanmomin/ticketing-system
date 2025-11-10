import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { Signup } from "../Signup";
import { useAuthStore } from "@/store/auth";

describe("Signup page", () => {
  beforeEach(() => {
    useAuthStore.getState().setToken(undefined);
    useAuthStore.getState().setUser(undefined);
  });

  it("renders signup form", () => {
    render(<Signup />);

    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Name/i)).toBeInTheDocument();
  });

  it("submits signup form with valid data", async () => {
    render(<Signup />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const orgNameInput = screen.getByLabelText(/Organization Name/i);
    const submitButton = screen.getByRole("button", { name: /Sign up/i });

    await userEvent.type(emailInput, "newuser@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.type(fullNameInput, "New User");
    await userEvent.type(orgNameInput, "New Organization");

    await userEvent.click(submitButton);

    await waitFor(() => {
      // Should redirect or show success
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  it("shows validation errors for empty fields", async () => {
    render(<Signup />);

    const submitButton = screen.getByRole("button", { name: /Sign up/i });
    await userEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      const errors = screen.queryAllByText(/required/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it("handles signup errors", async () => {
    render(<Signup />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const fullNameInput = screen.getByLabelText(/Full Name/i);
    const orgNameInput = screen.getByLabelText(/Organization Name/i);

    await userEvent.type(emailInput, "");
    await userEvent.type(passwordInput, "");
    await userEvent.type(fullNameInput, "");
    await userEvent.type(orgNameInput, "");

    const submitButton = screen.getByRole("button", { name: /Sign up/i });
    await userEvent.click(submitButton);

    // Should show error messages
    await waitFor(() => {
      expect(screen.queryByText(/required/i)).toBeInTheDocument();
    });
  });
});

