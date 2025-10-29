import { describe, it, expect } from "vitest";
import * as projects from "../projects";

describe("projects api", () => {
  it("lists projects by client", async () => {
    const { data } = await projects.list({ clientId: "c1" });
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toMatchObject({ clientId: "c1" });
  });

  it("creates a project", async () => {
    const { data } = await projects.create({
      clientId: "c1",
      name: "New",
      code: "NEW",
      active: true,
    });
    expect(data).toMatchObject({ name: "New", code: "NEW", clientId: "c1" });
  });
});
