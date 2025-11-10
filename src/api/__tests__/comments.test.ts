import { describe, it, expect } from "vitest";
import * as comments from "../comments";
import * as tickets from "../tickets";

describe("comments api", () => {
  it("lists comments for a ticket", async () => {
    // First create a ticket
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket for comments",
      descriptionMd: "Test description",
    });

    // Create a comment
    await comments.create(ticket.id, {
      bodyMd: "Test comment",
      visibility: "PUBLIC",
    });

    const { data } = await comments.listByTicket(ticket.id);
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((c) => c.bodyMd === "Test comment")).toBe(true);
  });

  it("creates a public comment", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { data } = await comments.create(ticket.id, {
      bodyMd: "Public comment",
      visibility: "PUBLIC",
    });

    expect(data.bodyMd).toBe("Public comment");
    expect(data.visibility).toBe("PUBLIC");
    expect(data.ticketId).toBe(ticket.id);
  });

  it("creates an internal comment", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { data } = await comments.create(ticket.id, {
      bodyMd: "Internal comment",
      visibility: "INTERNAL",
    });

    expect(data.bodyMd).toBe("Internal comment");
    expect(data.visibility).toBe("INTERNAL");
  });

  it("creates a comment with default visibility", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { data } = await comments.create(ticket.id, {
      bodyMd: "Default visibility comment",
    });

    expect(data.bodyMd).toBe("Default visibility comment");
    expect(data.visibility).toBe("PUBLIC"); // Default
  });

  it("gets a comment by id", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { data: created } = await comments.create(ticket.id, {
      bodyMd: "Comment to get",
    });

    const { data } = await comments.get(created.id);
    expect(data.id).toBe(created.id);
    expect(data.bodyMd).toBe("Comment to get");
  });
});

