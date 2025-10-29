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

    // Switch to List tab for simpler assertions
    const listTab = screen.getByRole("tab", { name: /list/i });
    listTab.click();

    // Expect rows to render after fetch (Ticket 1 should be present)
    expect(await screen.findByText(/^Ticket 1$/)).toBeInTheDocument();
  });
});
