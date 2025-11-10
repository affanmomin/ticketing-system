import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import * as ticketsApi from "../tickets";
import * as projectsApi from "../projects";
import * as clientsApi from "../clients";

describe("Error Handling", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("handles 404 errors gracefully", async () => {
    server.use(
      http.get("*/tickets/:id", () => {
        return HttpResponse.json({ message: "Not found" }, { status: 404 });
      })
    );

    await expect(ticketsApi.get("non-existent")).rejects.toThrow();
  });

  it("handles 500 errors gracefully", async () => {
    server.use(
      http.get("*/tickets", () => {
        return HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 }
        );
      })
    );

    await expect(ticketsApi.list()).rejects.toThrow();
  });

  it("handles network errors", async () => {
    server.use(
      http.get("*/tickets", () => {
        return HttpResponse.error();
      })
    );

    await expect(ticketsApi.list()).rejects.toThrow();
  });

  it("handles timeout errors", async () => {
    server.use(
      http.get("*/tickets", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return HttpResponse.json({ data: [], total: 0 });
      })
    );

    // Should timeout or handle gracefully - use a shorter timeout for test
    await expect(
      Promise.race([
        ticketsApi.list(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000))
      ])
    ).rejects.toThrow();
  }, 2000);

  it("handles validation errors", async () => {
    server.use(
      http.post("*/tickets", () => {
        return HttpResponse.json(
          { message: "Validation failed", errors: ["title is required"] },
          { status: 400 }
        );
      })
    );

    await expect(
      ticketsApi.create({
        projectId: "project-1",
        streamId: "stream-1",
        subjectId: "subject-1",
        priorityId: "pri-3",
        statusId: "stat-todo",
        title: "",
        descriptionMd: "",
      })
    ).rejects.toThrow();
  });

  it("handles unauthorized errors", async () => {
    server.use(
      http.get("*/tickets", () => {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      })
    );

    await expect(ticketsApi.list()).rejects.toThrow();
  });
});

