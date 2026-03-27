import { register, login, logout, getCurrentUser, getAllUsers } from "@/lib/auth";

describe("Auth Store", () => {
  // ─── Login ───────────────────────────────────────────────

  describe("login", () => {
    it("logs in with valid user credentials", () => {
      const result = login("user@queuesmart.com", "user123");
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.email).toBe("user@queuesmart.com");
      expect(result.user!.role).toBe("user");
    });

    it("logs in with valid admin credentials", () => {
      const result = login("admin@queuesmart.com", "admin123");
      expect(result.success).toBe(true);
      expect(result.user!.role).toBe("admin");
    });

    it("is case-insensitive for email", () => {
      const result = login("Admin@QueueSmart.com", "admin123");
      expect(result.success).toBe(true);
    });

    it("fails for non-existent email", () => {
      const result = login("nobody@example.com", "password");
      expect(result.success).toBe(false);
      expect(result.error).toBe("No account found with this email.");
    });

    it("fails for wrong password", () => {
      const result = login("user@queuesmart.com", "wrongpassword");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Incorrect password. Please try again.");
    });

    it("does not return password in user object", () => {
      const result = login("user@queuesmart.com", "user123");
      expect(result.user).toBeDefined();
      expect((result.user as Record<string, unknown>)["password"]).toBeUndefined();
    });

    it("sets current user on successful login", () => {
      logout();
      expect(getCurrentUser()).toBeNull();
      login("user@queuesmart.com", "user123");
      expect(getCurrentUser()).not.toBeNull();
      expect(getCurrentUser()!.email).toBe("user@queuesmart.com");
    });
  });

  // ─── Register ────────────────────────────────────────────

  describe("register", () => {
    it("registers a new user", () => {
      const result = register("Test User", "test@example.com", "password123");
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.email).toBe("test@example.com");
      expect(result.user!.name).toBe("Test User");
      expect(result.user!.role).toBe("user");
    });

    it("trims name and lowercases email", () => {
      const result = register("  Spaced Name  ", "  UPPER@Test.COM  ", "password123");
      expect(result.success).toBe(true);
      expect(result.user!.name).toBe("Spaced Name");
      expect(result.user!.email).toBe("upper@test.com");
    });

    it("fails for duplicate email", () => {
      const result = register("Admin Clone", "admin@queuesmart.com", "password123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("An account with this email already exists.");
    });

    it("duplicate check is case-insensitive", () => {
      const result = register("Admin Clone", "ADMIN@QUEUESMART.COM", "password123");
      expect(result.success).toBe(false);
    });

    it("sets current user after registration", () => {
      logout();
      register("New Person", "newperson@example.com", "password123");
      expect(getCurrentUser()).not.toBeNull();
      expect(getCurrentUser()!.email).toBe("newperson@example.com");
    });

    it("does not return password in user object", () => {
      const result = register("Safe User", "safe@example.com", "password123");
      expect((result.user as Record<string, unknown>)["password"]).toBeUndefined();
    });

    it("assigns incremental IDs", () => {
      const r1 = register("User A", "usera@example.com", "password123");
      const r2 = register("User B", "userb@example.com", "password123");
      expect(Number(r2.user!.id)).toBeGreaterThan(Number(r1.user!.id));
    });
  });

  // ─── Logout ──────────────────────────────────────────────

  describe("logout", () => {
    it("clears current user", () => {
      login("user@queuesmart.com", "user123");
      expect(getCurrentUser()).not.toBeNull();
      logout();
      expect(getCurrentUser()).toBeNull();
    });
  });

  // ─── getAllUsers ──────────────────────────────────────────

  describe("getAllUsers", () => {
    it("returns users without passwords", () => {
      const users = getAllUsers();
      expect(users.length).toBeGreaterThanOrEqual(2);
      users.forEach((u) => {
        expect((u as Record<string, unknown>)["password"]).toBeUndefined();
      });
    });
  });
});
