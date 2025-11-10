import { describe, it, expect, beforeEach } from "vitest";
import * as auth from "../auth";
import { useAuthStore } from "@/store/auth";

describe("auth api", () => {
  beforeEach(() => {
    // Reset auth store
    useAuthStore.getState().setToken(undefined);
    useAuthStore.getState().setUser(undefined);
  });

  it("logs in successfully", async () => {
    const { data } = await auth.login({
      email: "admin@example.com",
      password: "password",
    });
    expect(data.accessToken).toBe("test-token");
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("admin@example.com");
  });

  it("fails login with invalid credentials", async () => {
    await expect(
      auth.login({
        email: "fail@example.com",
        password: "wrong",
      })
    ).rejects.toThrow();
  });

  it("gets current user", async () => {
    useAuthStore.getState().setToken("test-token");
    const { data } = await auth.me();
    expect(data).toBeDefined();
    expect(data.email).toBe("admin@example.com");
  });

  it("signs up successfully", async () => {
    const { data } = await auth.signup({
      email: "newuser@example.com",
      password: "password123",
      fullName: "New User",
      organizationName: "New Org",
    });
    expect(data.accessToken).toBe("test-token-signup");
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("newuser@example.com");
    expect(data.organizationId).toBeDefined();
  });

  it("fails signup with missing fields", async () => {
    await expect(
      auth.signup({
        email: "",
        password: "",
        fullName: "",
        organizationName: "",
      })
    ).rejects.toThrow();
  });

  it("logs out successfully", async () => {
    useAuthStore.getState().setToken("test-token");
    await auth.logout();
    // Logout should not throw
    expect(true).toBe(true);
  });
});

