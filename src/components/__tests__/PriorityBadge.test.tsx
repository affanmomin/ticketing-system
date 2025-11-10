import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { PriorityBadge } from "../PriorityBadge";

describe("PriorityBadge", () => {
  it("renders with icon only by default", () => {
    const { container } = render(<PriorityBadge priority="high" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with label when showLabel is true", () => {
    render(<PriorityBadge priority="high" showLabel />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders all priority levels", () => {
    const priorities = ["low", "medium", "high", "urgent"] as const;
    priorities.forEach((priority) => {
      const { unmount } = render(
        <PriorityBadge priority={priority} showLabel />
      );
      expect(screen.getByText(/Low|Medium|High|Urgent/i)).toBeInTheDocument();
      unmount();
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <PriorityBadge priority="medium" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

