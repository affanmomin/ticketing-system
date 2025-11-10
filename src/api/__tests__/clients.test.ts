import { describe, it, expect } from "vitest";
import * as clients from "../clients";

describe("clients api", () => {
  it("lists clients", async () => {
    const { data } = await clients.list({ limit: 10, offset: 0 });
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
  });

  it("lists active clients only", async () => {
    const { data } = await clients.list({ limit: 10, offset: 0, active: true });
    expect(data.data.every((client) => client.active)).toBe(true);
  });

  it("creates a client", async () => {
    const { data } = await clients.create({
      name: "Test Client",
      email: "test@example.com",
      phone: "+1-555-0123",
      address: "123 Test St",
    });
    expect(data.name).toBe("Test Client");
    expect(data.email).toBe("test@example.com");
    expect(data.active).toBe(true);
  });

  it("creates a client with minimal fields", async () => {
    const { data } = await clients.create({
      name: "Minimal Client",
    });
    expect(data.name).toBe("Minimal Client");
    expect(data.active).toBe(true);
  });

  it("updates a client", async () => {
    const { data: created } = await clients.create({
      name: "Update Test Client",
    });

    const { data: updated } = await clients.update(created.id, {
      name: "Updated Client Name",
      email: "updated@example.com",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Updated Client Name");
    expect(updated.email).toBe("updated@example.com");
  });

  it("handles pagination", async () => {
    const { data: page1 } = await clients.list({ limit: 1, offset: 0 });
    const { data: page2 } = await clients.list({ limit: 1, offset: 1 });
    
    expect(page1.data.length).toBe(1);
    expect(page2.data.length).toBe(1);
    if (page1.data.length > 0 && page2.data.length > 0) {
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    }
  });
});

