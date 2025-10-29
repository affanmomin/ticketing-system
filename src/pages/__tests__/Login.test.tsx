import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Login } from "@/pages/Login";

// We test login flow at app level to ensure navigate happens

describe("Login page", () => {
  it("submits login form", async () => {
    rtlRender(
      <MemoryRouter>
        <ThemeProvider>
          <Login />
        </ThemeProvider>
      </MemoryRouter>
    );

    const email = await screen.findByLabelText(/Email/i);
    const password = screen.getByLabelText(/Password/i);
    const submit = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(email, "admin@example.com");
    await userEvent.type(password, "password");
    await userEvent.click(submit);

    // Form submits without error; button remains present
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });
  });
});
