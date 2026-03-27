import {
  estimateWaitTime,
  buildNotificationMessage,
  createHistoryEntry,
  updateHistoryEntry,
  validateNotificationInput,
  validateHistoryInput,
  ValidationError,
} from "../src/lib/queue-logic";

// ─── Wait Time Tests ────────────────────────────────────────────────────────
describe("estimateWaitTime", () => {
  it("calculates correct wait time", () => {
    expect(estimateWaitTime(3, 15)).toBe(45);
  });

  it("calculates wait time for position 1", () => {
    expect(estimateWaitTime(1, 10)).toBe(10);
  });

  it("handles large queue position", () => {
    expect(estimateWaitTime(50, 10)).toBe(500);
  });

  it("returns 0 when position is 0", () => {
    expect(estimateWaitTime(0, 15)).toBe(0);
  });

  it("calculates correctly for short duration", () => {
    expect(estimateWaitTime(2, 5)).toBe(10);
  });
});

// ─── Notification Tests ─────────────────────────────────────────────────────
describe("buildNotificationMessage", () => {
  it("builds joined notification with position", () => {
    const result = buildNotificationMessage("joined", "Customer Support", 3);
    expect(result.message).toBe(
      "You joined the queue for Customer Support. Your position is #3."
    );
    expect(result.notifType).toBe("info");
    expect(result.title).toBe("Joined Queue");
  });

  it("builds joined notification without position", () => {
    const result = buildNotificationMessage("joined", "Billing Inquiry");
    expect(result.message).toContain("N/A");
  });

  it("builds almost_ready notification", () => {
    const result = buildNotificationMessage("almost_ready", "Technical Support");
    expect(result.message).toBe(
      "You are almost ready to be served for Technical Support!"
    );
    expect(result.notifType).toBe("warning");
    expect(result.title).toBe("Almost Your Turn");
  });

  it("almost_ready notification has warning type", () => {
    const result = buildNotificationMessage("almost_ready", "Account Services");
    expect(result.notifType).toBe("warning");
  });

  it("joined notification has info type", () => {
    const result = buildNotificationMessage("joined", "General Consultation", 1);
    expect(result.notifType).toBe("info");
  });
});

// ─── Notification Validation Tests ─────────────────────────────────────────
describe("validateNotificationInput", () => {
  const valid = { userId: "u1", type: "joined" as const, serviceName: "General Consultation" };

  it("passes with valid input", () => {
    expect(validateNotificationInput(valid)).toHaveLength(0);
  });

  it("fails with missing userId", () => {
    expect(validateNotificationInput({ ...valid, userId: "" })
      .some((e: ValidationError) => e.field === "userId")).toBe(true);
  });

  it("fails with invalid type", () => {
    expect(validateNotificationInput({ ...valid, type: "invalid" as any })
      .some((e: ValidationError) => e.field === "type")).toBe(true);
  });

  it("fails with missing serviceName", () => {
    expect(validateNotificationInput({ ...valid, serviceName: "" })
      .some((e: ValidationError) => e.field === "serviceName")).toBe(true);
  });

  it("fails with serviceName over 100 chars", () => {
    expect(validateNotificationInput({ ...valid, serviceName: "A".repeat(101) })
      .some((e: ValidationError) => e.field === "serviceName")).toBe(true);
  });

  it("returns multiple errors at once", () => {
    expect(validateNotificationInput({ userId: "", type: "bad" as any, serviceName: "" }).length)
      .toBeGreaterThanOrEqual(3);
  });
});

// ─── History Tests ──────────────────────────────────────────────────────────
describe("createHistoryEntry", () => {
  it("creates a valid history entry", () => {
    const entry = createHistoryEntry("h10", "General Consultation");
    expect(entry.id).toBe("h10");
    expect(entry.serviceName).toBe("General Consultation");
    expect(entry.status).toBe("completed");
    expect(entry.waitTime).toBe(0);
  });

  it("created entry has today's date", () => {
    const entry = createHistoryEntry("h11", "Technical Support");
    const today = new Date().toISOString().split("T")[0];
    expect(entry.date).toBe(today);
  });

  it("trims whitespace from serviceName", () => {
    const entry = createHistoryEntry("h12", "  Account Services  ");
    expect(entry.serviceName).toBe("Account Services");
  });
});

describe("updateHistoryEntry", () => {
  it("updates entry to cancelled", () => {
    const entry = createHistoryEntry("h13", "Account Services");
    const updated = updateHistoryEntry(entry, "cancelled", 0);
    expect(updated.status).toBe("cancelled");
  });

  it("updates entry with wait time", () => {
    const entry = createHistoryEntry("h14", "General Consultation");
    const updated = updateHistoryEntry(entry, "completed", 20);
    expect(updated.waitTime).toBe(20);
  });

  it("updates entry to no-show", () => {
    const entry = createHistoryEntry("h15", "Technical Support");
    const updated = updateHistoryEntry(entry, "no-show", 0);
    expect(updated.status).toBe("no-show");
  });

  it("preserves serviceName after update", () => {
    const entry = createHistoryEntry("h16", "Billing Inquiry");
    const updated = updateHistoryEntry(entry, "completed", 10);
    expect(updated.serviceName).toBe("Billing Inquiry");
  });
});

// ─── History Validation Tests ───────────────────────────────────────────────
describe("validateHistoryInput", () => {
  const valid = { userId: "u1", serviceName: "General Consultation" };

  it("passes with valid input", () => {
    expect(validateHistoryInput(valid)).toHaveLength(0);
  });

  it("fails with missing userId", () => {
    expect(validateHistoryInput({ ...valid, userId: "" })
      .some((e: ValidationError) => e.field === "userId")).toBe(true);
  });

  it("fails with missing serviceName", () => {
    expect(validateHistoryInput({ ...valid, serviceName: "" })
      .some((e: ValidationError) => e.field === "serviceName")).toBe(true);
  });

  it("fails with serviceName over 100 chars", () => {
    expect(validateHistoryInput({ ...valid, serviceName: "A".repeat(101) })
      .some((e: ValidationError) => e.field === "serviceName")).toBe(true);
  });

  it("returns multiple errors at once", () => {
    expect(validateHistoryInput({ userId: "", serviceName: "" }).length)
      .toBeGreaterThanOrEqual(2);
  });
});