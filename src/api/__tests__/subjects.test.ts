import { describe, it, expect } from "vitest";
import * as subjects from "../subjects";

describe("subjects api", () => {
  it("lists subjects for a client", async () => {
    const { data } = await subjects.listForClient("client-1", {
      limit: 10,
      offset: 0,
    });
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
    expect(data.data.every((subject) => subject.clientId === "client-1")).toBe(
      true
    );
  });

  it("creates a subject for a client", async () => {
    const { data } = await subjects.createForClient("client-1", {
      name: "Test Subject",
      description: "Test description",
    });
    expect(data.name).toBe("Test Subject");
    expect(data.description).toBe("Test description");
    expect(data.clientId).toBe("client-1");
    expect(data.active).toBe(true);
  });

  it("creates a subject with minimal fields", async () => {
    const { data } = await subjects.createForClient("client-1", {
      name: "Minimal Subject",
    });
    expect(data.name).toBe("Minimal Subject");
    expect(data.active).toBe(true);
  });

  it("updates a subject", async () => {
    const { data: created } = await subjects.createForClient("client-1", {
      name: "Update Test Subject",
    });

    const { data: updated } = await subjects.update(created.id, {
      name: "Updated Subject Name",
      description: "Updated description",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Updated Subject Name");
    expect(updated.description).toBe("Updated description");
  });

  it("deactivates a subject", async () => {
    const { data: created } = await subjects.createForClient("client-1", {
      name: "Deactivate Test Subject",
    });

    const { data: updated } = await subjects.update(created.id, {
      active: false,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.active).toBe(false);
  });
});

