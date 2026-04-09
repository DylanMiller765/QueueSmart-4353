/**
 * Unit tests for auth API route handlers.
 * Tests route logic by mocking Supabase and using real bcrypt.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import bcrypt from "bcryptjs";

// Build a chainable mock that resolves at .single()
function chainable(resolveValue: any) {
  const chain: any = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue(resolveValue);
  return chain;
}

let fromResults: any[] = [];
const mockFrom = jest.fn().mockImplementation(() => {
  return fromResults.shift() || chainable({ data: null, error: { code: "PGRST116" } });
});

jest.mock("@/lib/supabase", () => ({
  getServiceSupabase: () => ({ from: mockFrom }),
}));

function createMockRequest(body: any) {
  return { json: async () => body, headers: new Map() } as any;
}

import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";

describe("Auth API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fromResults = [];
  });

  // ─── Register ───────────────────────────────────────────

  describe("POST /api/auth/register", () => {
    it("returns 400 for missing name", async () => {
      const req = createMockRequest({ email: "test@test.com", password: "password123" });
      const res = await registerHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it("returns 400 for invalid email", async () => {
      const req = createMockRequest({ name: "Test", email: "bad-email", password: "password123" });
      const res = await registerHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("email");
    });

    it("returns 400 for short password", async () => {
      const req = createMockRequest({ name: "Test", email: "t@t.com", password: "12" });
      const res = await registerHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("6 characters");
    });

    it("returns 400 for invalid role", async () => {
      const req = createMockRequest({ name: "Test", email: "t@t.com", password: "password123", role: "superadmin" });
      const res = await registerHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("role");
    });

    it("returns 409 for duplicate email", async () => {
      fromResults = [
        chainable({ data: { id: "existing-id" }, error: null }), // email check
      ];
      const req = createMockRequest({ name: "Test", email: "dup@test.com", password: "password123" });
      const res = await registerHandler(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain("already exists");
    });

    it("creates user and profile on success", async () => {
      fromResults = [
        // email check - not found
        chainable({ data: null, error: { code: "PGRST116" } }),
        // insert credentials
        chainable({ data: { id: "new-uuid", email: "new@test.com", role: "user" }, error: null }),
        // insert profile
        { insert: jest.fn().mockResolvedValue({ error: null }) },
      ];
      const req = createMockRequest({ name: "New User", email: "new@test.com", password: "password123" });
      const res = await registerHandler(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.email).toBe("new@test.com");
      expect(data.user.name).toBe("New User");
      expect(data.user.role).toBe("user");
      expect(data.user).not.toHaveProperty("password");
      expect(data.user).not.toHaveProperty("encrypted_password");
    });

    it("normalizes email to lowercase and trims name", async () => {
      fromResults = [
        chainable({ data: null, error: { code: "PGRST116" } }),
        chainable({ data: { id: "id-1", email: "upper@test.com", role: "user" }, error: null }),
        { insert: jest.fn().mockResolvedValue({ error: null }) },
      ];
      const req = createMockRequest({ name: "  Spaced Name  ", email: "UPPER@TEST.COM", password: "password123" });
      const res = await registerHandler(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.user.name).toBe("Spaced Name");
    });
  });

  // ─── Login ───────────────────────────────────────────

  describe("POST /api/auth/login", () => {
    it("returns 400 for missing email", async () => {
      const req = createMockRequest({ password: "password123" });
      const res = await loginHandler(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for missing password", async () => {
      const req = createMockRequest({ email: "test@test.com" });
      const res = await loginHandler(req);
      expect(res.status).toBe(400);
    });

    it("returns 401 for non-existent email", async () => {
      fromResults = [
        chainable({ data: null, error: { code: "PGRST116" } }),
      ];
      const req = createMockRequest({ email: "nobody@test.com", password: "password123" });
      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("No account found with this email.");
    });

    it("returns 401 for wrong password", async () => {
      const hash = await bcrypt.hash("correctpassword", 10);
      fromResults = [
        chainable({
          data: { id: "uid", email: "user@test.com", encrypted_password: hash, role: "user" },
          error: null,
        }),
      ];
      const req = createMockRequest({ email: "user@test.com", password: "wrongpassword" });
      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Incorrect password. Please try again.");
    });

    it("returns user on successful login", async () => {
      const hash = await bcrypt.hash("password123", 10);
      fromResults = [
        // credentials lookup
        chainable({
          data: { id: "uid", email: "user@test.com", encrypted_password: hash, role: "user" },
          error: null,
        }),
        // profile lookup
        chainable({
          data: { full_name: "Test User", phone: "555-1234", preferences: { theme: "dark" } },
          error: null,
        }),
      ];
      const req = createMockRequest({ email: "user@test.com", password: "password123" });
      const res = await loginHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.email).toBe("user@test.com");
      expect(data.user.name).toBe("Test User");
      expect(data.user.role).toBe("user");
      expect(data.user.phone).toBe("555-1234");
    });

    it("never returns password or encrypted_password in response", async () => {
      const hash = await bcrypt.hash("password123", 10);
      fromResults = [
        chainable({ data: { id: "uid", email: "u@t.com", encrypted_password: hash, role: "user" }, error: null }),
        chainable({ data: { full_name: "User", phone: null, preferences: {} }, error: null }),
      ];
      const req = createMockRequest({ email: "u@t.com", password: "password123" });
      const res = await loginHandler(req);
      const data = await res.json();
      expect(data.user).not.toHaveProperty("password");
      expect(data.user).not.toHaveProperty("encrypted_password");
    });
  });
});

// ─── Password Hashing ───────────────────────────────

describe("Password Hashing (bcrypt)", () => {
  it("hashes passwords (not stored in plain text)", async () => {
    const password = "mySecretPassword";
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
  });

  it("verifies correct password", async () => {
    const hash = await bcrypt.hash("correctPass", 10);
    expect(await bcrypt.compare("correctPass", hash)).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const hash = await bcrypt.hash("correctPass", 10);
    expect(await bcrypt.compare("wrongPass", hash)).toBe(false);
  });

  it("generates unique hashes (salt)", async () => {
    const hash1 = await bcrypt.hash("same", 10);
    const hash2 = await bcrypt.hash("same", 10);
    expect(hash1).not.toBe(hash2);
    expect(await bcrypt.compare("same", hash1)).toBe(true);
    expect(await bcrypt.compare("same", hash2)).toBe(true);
  });
});
