import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";

type RenderOptions = {
  // kept for backward compat with earlier tests; ignored
  router?: "memory" | "browser";
  initialEntries?: string[];
};

export function render(ui: React.ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ["/"] } = options;
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: <ThemeProvider>{ui}</ThemeProvider>,
      },
    ],
    { initialEntries }
  );

  return rtlRender(<RouterProvider router={router} />);
}

export * from "@testing-library/react";
