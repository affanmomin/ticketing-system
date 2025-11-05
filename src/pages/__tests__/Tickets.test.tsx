import { describe, it, expect } from "vitest";
import { render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Tickets } from "../Tickets";

describe("Tickets page", () => {
  it("fetches and displays tickets with pagination controls", async () => {
    rtlRender(
      <MemoryRouter>
        <ThemeProvider>
          <Tickets />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Page heading should be present
    expect(
      await screen.findByRole("heading", { name: /tickets/i })
    ).toBeInTheDocument();

    // Expect table to be rendered
    expect(await screen.findByRole("table")).toBeInTheDocument();

    // Expect pagination buttons to be present
    expect(
      screen.getByRole("button", { name: /previous/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });
});
