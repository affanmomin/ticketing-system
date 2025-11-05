import { describe, it, expect } from "vitest";
import * as projects from "../projects";

describe("projects api", () => {
  it("lists projects by client", async () => {
    const { data } = await projects.list({ clientId: "client-1", limit: 10, offset: 0 });
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.total).toBeGreaterThan(0);
    expect(data.data[0]).toMatchObject({ clientId: "client-1" });
  });

  it("creates a project", async () => {
    const payload = {
      clientId: "client-1",
      name: "New Migration",
      description: "Migrate legacy system",
    };
    const { data } = await projects.create(payload);
    expect(data).toMatchObject({ name: payload.name, clientId: payload.clientId });
  });
});
