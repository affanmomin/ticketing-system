import { describe, it, expect } from "vitest";
import * as tickets from "../tickets";

describe("tickets api", () => {
  it("returns paginated tickets", async () => {
    const { data } = await tickets.list({ limit: 5, offset: 0, projectId: "project-1" });
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
  });

  it("creates a ticket", async () => {
    const payload = {
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-2",
      statusId: "stat-todo",
      title: "API smoke test ticket",
      descriptionMd: "Created via unit test",
      assignedToUserId: "u2",
    } as const;
    const { data } = await tickets.create(payload);
    expect(data).toMatchObject({ title: payload.title, streamId: payload.streamId });
  });

  it("updates a ticket", async () => {
    const { data: created } = await tickets.create({
      projectId: "project-1",
      streamId: "stream-1",
      subjectId: "subject-1",
      priorityId: "pri-3",
      statusId: "stat-todo",
      title: "Ticket to update",
      descriptionMd: "Initial description",
    });

    const { data: updated } = await tickets.update(created.id, {
      title: "Updated title",
      statusId: "stat-progress",
      assignedToUserId: "u2",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe("Updated title");
    expect(updated.statusId).toBe("stat-progress");
  });
});
