import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders status label", () => {
    render(<StatusBadge status="todo" />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("renders all status types", () => {
    const statuses = [
      "backlog",
      "todo",
      "in_progress",
      "review",
      "done",
      "cancelled",
    ] as const;
    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(
        screen.getByText(/Backlog|To Do|In Progress|Review|Done|Cancelled/i)
      ).toBeInTheDocument();
      unmount();
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatusBadge status="done" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

