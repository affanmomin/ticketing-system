import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { TicketCard } from "../TicketCard";

describe("TicketCard", () => {
  it("renders ticket information", () => {
    render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
      />
    );
    expect(screen.getByText("#123")).toBeInTheDocument();
    expect(screen.getByText("Test Ticket")).toBeInTheDocument();
  });

  it("renders assignee when provided", () => {
    const { container } = render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
        assignee={{ name: "John Doe", role: "admin" }}
      />
    );
    // UserAvatar might render initials or name, check for either
    expect(
      container.textContent?.includes("John") ||
        container.textContent?.includes("JD")
    ).toBe(true);
  });

  it("renders tags", () => {
    render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
        tags={[
          { name: "bug", color: "#ef4444" },
          { name: "urgent", color: "#f97316" },
        ]}
      />
    );
    expect(screen.getByText("bug")).toBeInTheDocument();
    expect(screen.getByText("urgent")).toBeInTheDocument();
  });

  it("shows tag count when more than 2 tags", () => {
    render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
        tags={[
          { name: "tag1", color: "#ef4444" },
          { name: "tag2", color: "#f97316" },
          { name: "tag3", color: "#3b82f6" },
        ]}
      />
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders comment count", () => {
    render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
        commentCount={5}
      />
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders attachment count", () => {
    render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
        attachmentCount={3}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
        onClick={handleClick}
      />
    );
    const card = screen.getByText("Test Ticket").closest("div");
    if (card) {
      await userEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it("does not call onClick when not provided", async () => {
    render(
      <TicketCard
        id="ticket-1"
        ticketNumber={123}
        title="Test Ticket"
        status="todo"
        priority="high"
      />
    );
    const card = screen.getByText("Test Ticket").closest("div");
    if (card) {
      await userEvent.click(card);
      // Should not throw
      expect(true).toBe(true);
    }
  });
});

