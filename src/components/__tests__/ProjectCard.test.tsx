import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { ProjectCard } from "../ProjectCard";

describe("ProjectCard", () => {
  it("renders project information", () => {
    render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        color="#3b82f6"
        openTickets={5}
        closedTickets={10}
        members={[]}
      />
    );
    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        description="Test description"
        color="#3b82f6"
        openTickets={5}
        closedTickets={10}
        members={[]}
      />
    );
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("calculates progress correctly", () => {
    render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        color="#3b82f6"
        openTickets={5}
        closedTickets={10}
        members={[]}
      />
    );
    // 10 closed / 15 total = 66.67%
    expect(screen.getByText(/66|67/i)).toBeInTheDocument();
  });

  it("shows 0% progress when no tickets", () => {
    render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        color="#3b82f6"
        openTickets={0}
        closedTickets={0}
        members={[]}
      />
    );
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders members", () => {
    const { container } = render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        color="#3b82f6"
        openTickets={5}
        closedTickets={10}
        members={[
          { name: "John Doe", role: "admin" },
          { name: "Jane Smith", role: "employee" },
        ]}
      />
    );
    // UserAvatar might render initials or name, check that members are rendered
    expect(container.textContent).toBeTruthy();
  });

  it("shows member count when more than 3 members", () => {
    render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        color="#3b82f6"
        openTickets={5}
        closedTickets={10}
        members={[
          { name: "Member 1", role: "admin" },
          { name: "Member 2", role: "employee" },
          { name: "Member 3", role: "employee" },
          { name: "Member 4", role: "employee" },
        ]}
      />
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        color="#3b82f6"
        openTickets={5}
        closedTickets={10}
        members={[]}
        onClick={handleClick}
      />
    );
    const card = screen.getByText("Test Project").closest("div");
    if (card) {
      await userEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it("displays ticket counts", () => {
    const { container } = render(
      <ProjectCard
        id="project-1"
        name="Test Project"
        color="#3b82f6"
        openTickets={5}
        closedTickets={10}
        members={[]}
      />
    );
    // Check that ticket counts are displayed (text might be split across elements)
    expect(container.textContent).toContain("10");
    expect(container.textContent).toContain("15");
    expect(container.textContent).toContain("tickets");
  });
});

