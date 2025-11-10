import { describe, it, expect } from "vitest";
import * as users from "../users";

describe("users api", () => {
  it("lists users", async () => {
    const { data } = await users.list({ limit: 10, offset: 0 });
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
  });

  it("filters users by role", async () => {
    const { data } = await users.list({ limit: 10, offset: 0, role: "ADMIN" });
    expect(data.data.every((user) => user.role === "ADMIN")).toBe(true);
  });

  it("filters users by active status", async () => {
    const { data } = await users.list({ limit: 10, offset: 0, isActive: true });
    expect(data.data.every((user) => user.isActive)).toBe(true);
  });

  it("searches users", async () => {
    const { data } = await users.list({ limit: 10, offset: 0, search: "admin" });
    expect(data.data.length).toBeGreaterThan(0);
    expect(
      data.data.some(
        (user) =>
          user.fullName.toLowerCase().includes("admin") ||
          user.email.toLowerCase().includes("admin")
      )
    ).toBe(true);
  });

  it("creates an employee", async () => {
    const { data } = await users.createEmployee({
      fullName: "New Employee",
      email: "employee@example.com",
      password: "password123",
    });
    expect(data.role).toBe("EMPLOYEE");
    expect(data.email).toBe("employee@example.com");
    expect(data.isActive).toBe(true);
  });

  it("creates a client user", async () => {
    const { data } = await users.createClientUser({
      fullName: "Client User",
      email: "clientuser@example.com",
      password: "password123",
      clientId: "client-1",
    });
    expect(data.role).toBe("CLIENT");
    expect(data.email).toBe("clientuser@example.com");
    expect(data.clientId).toBe("client-1");
    expect(data.isActive).toBe(true);
  });

  it("updates a user", async () => {
    const { data: created } = await users.createEmployee({
      fullName: "Update Test User",
      email: "updatetest@example.com",
      password: "password123",
    });

    const { data: updated } = await users.update(created.id, {
      fullName: "Updated Name",
      email: "updated@example.com",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.fullName).toBe("Updated Name");
    expect(updated.email).toBe("updated@example.com");
  });

  it("changes user password", async () => {
    const { data: created } = await users.createEmployee({
      fullName: "Password Test User",
      email: "passwordtest@example.com",
      password: "oldpassword",
    });

    await users.changePassword(created.id, {
      password: "newpassword",
    });

    // Password change should not throw
    expect(true).toBe(true);
  });

  it("handles pagination", async () => {
    const { data: page1 } = await users.list({ limit: 1, offset: 0 });
    const { data: page2 } = await users.list({ limit: 1, offset: 1 });
    
    expect(page1.data.length).toBe(1);
    expect(page2.data.length).toBe(1);
    if (page1.data.length > 0 && page2.data.length > 0) {
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    }
  });
});

