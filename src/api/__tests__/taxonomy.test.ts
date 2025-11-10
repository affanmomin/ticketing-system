import { describe, it, expect } from "vitest";
import * as taxonomy from "../taxonomy";

describe("taxonomy api", () => {
  it("lists priorities", async () => {
    const { data } = await taxonomy.listPriorities();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((p) => p.id && p.name)).toBe(true);
  });

  it("lists statuses", async () => {
    const { data } = await taxonomy.listStatuses();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((s) => s.id && s.name)).toBe(true);
  });

  it("priorities have required fields", async () => {
    const { data } = await taxonomy.listPriorities();
    data.forEach((priority) => {
      expect(priority.id).toBeDefined();
      expect(priority.name).toBeDefined();
      expect(typeof priority.rank).toBe("number");
      expect(priority.colorHex).toBeDefined();
    });
  });

  it("statuses have required fields", async () => {
    const { data } = await taxonomy.listStatuses();
    data.forEach((status) => {
      expect(status.id).toBeDefined();
      expect(status.name).toBeDefined();
      expect(typeof status.sequence).toBe("number");
      expect(typeof status.isClosed).toBe("boolean");
    });
  });

  it("priorities are sorted by rank", async () => {
    const { data } = await taxonomy.listPriorities();
    const ranks = data.map((p) => p.rank);
    const sortedRanks = [...ranks].sort((a, b) => a - b);
    expect(ranks).toEqual(sortedRanks);
  });

  it("statuses are sorted by sequence", async () => {
    const { data } = await taxonomy.listStatuses();
    const sequences = data.map((s) => s.sequence);
    const sortedSequences = [...sequences].sort((a, b) => a - b);
    expect(sequences).toEqual(sortedSequences);
  });
});

