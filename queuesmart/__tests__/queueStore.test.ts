import {
  validateQueueInput,
  validateUpdateInput,
} from "../src/lib/queueStore";

describe("validateQueueInput", () => {
  const valid = { service_id: "1", status: "open" as const };

  it("passes with valid input", () => {
    expect(validateQueueInput(valid)).toHaveLength(0);
  });

  it("fails with missing service_id", () => {
    expect(validateQueueInput({ ...valid, service_id: "" })
      .some(e => e.field === "service_id")).toBe(true);
  });

  it("fails with service_id over 100 characters", () => {
    expect(validateQueueInput({ ...valid, service_id: "a".repeat(101) })
      .some(e => e.field === "service_id")).toBe(true);
  });

  it("fails with invalid status", () => {
    expect(validateQueueInput({ ...valid, status: "invalid" as any })
      .some(e => e.field === "status")).toBe(true);
  });

  it("passes with status open", () => {
    expect(validateQueueInput({ service_id: "1", status: "open" })).toHaveLength(0);
  });

  it("passes with status closed", () => {
    expect(validateQueueInput({ service_id: "1", status: "closed" })).toHaveLength(0);
  });

  it("passes without status (optional)", () => {
    expect(validateQueueInput({ service_id: "1" })).toHaveLength(0);
  });

  it("returns multiple errors at once", () => {
    expect(validateQueueInput({ service_id: "", status: "bad" as any }).length)
      .toBeGreaterThanOrEqual(2);
  });
});

describe("validateUpdateInput", () => {
  it("passes with valid open status", () => {
    expect(validateUpdateInput({ status: "open" })).toHaveLength(0);
  });

  it("passes with valid closed status", () => {
    expect(validateUpdateInput({ status: "closed" })).toHaveLength(0);
  });

  it("fails with missing status", () => {
    expect(validateUpdateInput({})
      .some(e => e.field === "status")).toBe(true);
  });

  it("fails with invalid status", () => {
    expect(validateUpdateInput({ status: "pending" as any })
      .some(e => e.field === "status")).toBe(true);
  });

  it("fails with empty string status", () => {
    expect(validateUpdateInput({ status: "" as any })
      .some(e => e.field === "status")).toBe(true);
  });
});