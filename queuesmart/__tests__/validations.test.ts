import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  validateRequired,
  validateMaxLength,
} from "@/lib/validations";

describe("Validations", () => {
  // ─── validateEmail ───────────────────────────────────────

  describe("validateEmail", () => {
    it("returns null for valid email", () => {
      expect(validateEmail("user@example.com")).toBeNull();
    });

    it("returns error for empty string", () => {
      expect(validateEmail("")).toBe("Please enter your email address.");
    });

    it("returns error for whitespace only", () => {
      expect(validateEmail("   ")).toBe("Please enter your email address.");
    });

    it("returns error for invalid format", () => {
      expect(validateEmail("notanemail")).toBe("Please enter a valid email address.");
    });

    it("returns error for missing domain", () => {
      expect(validateEmail("user@")).toBe("Please enter a valid email address.");
    });

    it("returns error for missing @", () => {
      expect(validateEmail("userexample.com")).toBe("Please enter a valid email address.");
    });
  });

  // ─── validatePassword ────────────────────────────────────

  describe("validatePassword", () => {
    it("returns null for valid password", () => {
      expect(validatePassword("password123")).toBeNull();
    });

    it("returns null for exactly 6 characters", () => {
      expect(validatePassword("abcdef")).toBeNull();
    });

    it("returns error for empty string", () => {
      expect(validatePassword("")).toBe("Please enter your password.");
    });

    it("returns error for short password", () => {
      expect(validatePassword("abc")).toBe("Password must be at least 6 characters.");
    });

    it("returns error for 5 characters", () => {
      expect(validatePassword("abcde")).toBe("Password must be at least 6 characters.");
    });
  });

  // ─── validateName ────────────────────────────────────────

  describe("validateName", () => {
    it("returns null for valid name", () => {
      expect(validateName("Dylan Miller")).toBeNull();
    });

    it("returns null for exactly 2 characters", () => {
      expect(validateName("Al")).toBeNull();
    });

    it("returns error for empty string", () => {
      expect(validateName("")).toBe("Please enter your name.");
    });

    it("returns error for whitespace only", () => {
      expect(validateName("   ")).toBe("Please enter your name.");
    });

    it("returns error for single character", () => {
      expect(validateName("A")).toBe("Name must be at least 2 characters.");
    });

    it("returns error for name over 50 characters", () => {
      const longName = "A".repeat(51);
      expect(validateName(longName)).toBe("Name must be 50 characters or fewer.");
    });

    it("returns null for exactly 50 characters", () => {
      const name = "A".repeat(50);
      expect(validateName(name)).toBeNull();
    });
  });

  // ─── validateConfirmPassword ─────────────────────────────

  describe("validateConfirmPassword", () => {
    it("returns null when passwords match", () => {
      expect(validateConfirmPassword("password123", "password123")).toBeNull();
    });

    it("returns error for empty confirm", () => {
      expect(validateConfirmPassword("password123", "")).toBe(
        "Please confirm your password."
      );
    });

    it("returns error for mismatch", () => {
      expect(validateConfirmPassword("password123", "different")).toBe(
        "Passwords do not match."
      );
    });
  });

  // ─── validateRequired ────────────────────────────────────

  describe("validateRequired", () => {
    it("returns null for non-empty value", () => {
      expect(validateRequired("hello", "a field")).toBeNull();
    });

    it("returns error for empty string", () => {
      expect(validateRequired("", "your email")).toBe("Please enter your email.");
    });

    it("returns error for whitespace only", () => {
      expect(validateRequired("   ", "your name")).toBe("Please enter your name.");
    });
  });

  // ─── validateMaxLength ───────────────────────────────────

  describe("validateMaxLength", () => {
    it("returns null when within limit", () => {
      expect(validateMaxLength("short", 100, "Name")).toBeNull();
    });

    it("returns null at exact limit", () => {
      expect(validateMaxLength("abcde", 5, "Name")).toBeNull();
    });

    it("returns error when over limit", () => {
      expect(validateMaxLength("abcdef", 5, "Name")).toBe(
        "Name must be 5 characters or fewer."
      );
    });
  });
});
