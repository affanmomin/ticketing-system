import { describe, it, expect } from "vitest";
import * as tickets from "../tickets";

describe("tickets api", () => {
  it("returns paged list", async () => {
    const { data } = await tickets.pagedList({ limit: 5, offset: 0 });
    expect(data.items.length).toBe(5);
    expect(data.count).toBeGreaterThan(0);
  });

  it("creates a ticket", async () => {
    const { data } = await tickets.create({
      clientId: "c1",
      projectId: "p1",
      title: "x",
      descriptionMd: "y",
    });
    expect(data.id).toBeTruthy();
  });

  it("updates a ticket via POST /tickets/:id", async () => {
    const { data } = await tickets.update("tk_123", {
      title: "Updated title",
      status: "IN_PROGRESS",
    });
    expect(data.id).toBe("tk_123");
    expect(data.title).toBe("Updated title");
    expect(data.status).toBe("IN_PROGRESS");
  });
});
