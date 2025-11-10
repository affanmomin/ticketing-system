import { describe, it, expect } from "vitest";
import * as streams from "../streams";

describe("streams api", () => {
  it("lists streams for a client", async () => {
    const { data } = await streams.listForClient("client-1", {
      limit: 10,
      offset: 0,
    });
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
    expect(data.data.every((stream) => stream.clientId === "client-1")).toBe(
      true
    );
  });

  it("creates a stream for a client", async () => {
    const { data } = await streams.createForClient("client-1", {
      name: "Test Stream",
      description: "Test description",
    });
    expect(data.name).toBe("Test Stream");
    expect(data.description).toBe("Test description");
    expect(data.clientId).toBe("client-1");
    expect(data.active).toBe(true);
  });

  it("creates a stream with minimal fields", async () => {
    const { data } = await streams.createForClient("client-1", {
      name: "Minimal Stream",
    });
    expect(data.name).toBe("Minimal Stream");
    expect(data.active).toBe(true);
  });

  it("updates a stream", async () => {
    const { data: created } = await streams.createForClient("client-1", {
      name: "Update Test Stream",
    });

    const { data: updated } = await streams.update(created.id, {
      name: "Updated Stream Name",
      description: "Updated description",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Updated Stream Name");
    expect(updated.description).toBe("Updated description");
  });

  it("deactivates a stream", async () => {
    const { data: created } = await streams.createForClient("client-1", {
      name: "Deactivate Test Stream",
    });

    const { data: updated } = await streams.update(created.id, {
      active: false,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.active).toBe(false);
  });
});

