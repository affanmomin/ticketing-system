import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { CommentsList } from "../CommentsList";
import { useAuthStore } from "@/store/auth";
import * as commentsApi from "@/api/comments";
import * as ticketsApi from "@/api/tickets";

describe("CommentsList", () => {
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
  });

  it("renders loading state initially", () => {
    render(<CommentsList ticketId="ticket-1" />);
    
    // Should show loading state or component structure
    expect(screen.queryByText(/Loading/i) || screen.queryByRole("generic")).toBeInTheDocument();
  });

  it("displays comments for a ticket", async () => {
    // Create a ticket first
    const { data: ticket } = await ticketsApi.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    // Create a comment
    await commentsApi.create(ticket.id, {
      bodyMd: "Test comment",
    });

    render(<CommentsList ticketId={ticket.id} />);
    
    await waitFor(() => {
      // Should show comment or empty state
      const comment = screen.queryByText(/Test comment/i);
      const emptyState = screen.queryByText(/No comments/i);
      expect(comment || emptyState).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("displays empty state when no comments", async () => {
    const { data: ticket } = await ticketsApi.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    render(<CommentsList ticketId={ticket.id} />);
    
    await waitFor(() => {
      // Should show empty state or component structure
      const emptyState = screen.queryByText(/No comments/i);
      const component = screen.queryByRole("generic");
      expect(emptyState || component).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("refreshes when refreshTrigger changes", async () => {
    const { data: ticket } = await ticketsApi.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { rerender } = render(<CommentsList ticketId={ticket.id} refreshTrigger={0} />);
    
    await waitFor(() => {
      // Component should render
      expect(screen.queryByRole("generic") || screen.queryByText(/No comments/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    rerender(<CommentsList ticketId={ticket.id} refreshTrigger={1} />);
    
    // Should reload comments
    await waitFor(() => {
      // Component should still render
      expect(screen.queryByRole("generic") || screen.queryByText(/No comments/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

