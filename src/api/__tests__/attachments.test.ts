import { describe, it, expect } from "vitest";
import * as attachments from "../attachments";
import * as tickets from "../tickets";

describe("attachments api", () => {
  it("lists attachments for a ticket", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket for attachments",
      descriptionMd: "Test",
    });

    const { data } = await attachments.listByTicket(ticket.id);
    expect(Array.isArray(data)).toBe(true);
  });

  it("presigns an upload", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { data } = await attachments.presignUpload(ticket.id, {
      fileName: "test.pdf",
      mimeType: "application/pdf",
    });

    expect(data.uploadUrl).toBeDefined();
    expect(data.key).toBeDefined();
    expect(data.key).toContain(ticket.id);
  });

  it("confirms an upload", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { data: presign } = await attachments.presignUpload(ticket.id, {
      fileName: "test.pdf",
      mimeType: "application/pdf",
    });

    const { data } = await attachments.confirmUpload(ticket.id, {
      fileName: "test.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
      storageUrl: presign.key,
    });

    expect(data.fileName).toBe("test.pdf");
    expect(data.mimeType).toBe("application/pdf");
    expect(data.fileSize).toBe(1024);
    expect(data.ticketId).toBe(ticket.id);
  });

  it("deletes an attachment", async () => {
    const { data: ticket } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Test ticket",
      descriptionMd: "Test",
    });

    const { data: presign } = await attachments.presignUpload(ticket.id, {
      fileName: "test.pdf",
      mimeType: "application/pdf",
    });

    const { data: created } = await attachments.confirmUpload(ticket.id, {
      fileName: "test.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
      storageUrl: presign.key,
    });

    await attachments.remove(created.id);
    // Delete should not throw
    expect(true).toBe(true);
  });
});

