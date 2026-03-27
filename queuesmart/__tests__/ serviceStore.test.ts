import {
    getAllServices, getServiceById, createService,
    updateService, deleteService,
    validateServiceInput, validateUpdateInput,
    __resetStore,
  } from "../src/lib/serviceStore";
  
  beforeEach(() => { __resetStore(); });
  
  describe("getAllServices", () => {
    it("returns all seeded services", () => {
      expect(getAllServices().length).toBeGreaterThanOrEqual(3);
    });
    it("filters active only", () => {
      updateService(1, { isActive: false });
      expect(getAllServices(true).every(s => s.isActive)).toBe(true);
    });
    it("returns a new array each call", () => {
      expect(getAllServices()).not.toBe(getAllServices());
    });
  });
  
  describe("getServiceById", () => {
    it("returns the correct service", () => {
      expect(getServiceById(1)?.id).toBe(1);
    });
    it("returns undefined for unknown id", () => {
      expect(getServiceById(9999)).toBeUndefined();
    });
  });
  
  describe("createService", () => {
    it("creates and returns a new service", () => {
      const s = createService({ name: "Test", description: "Desc", duration: 10, priority: "low" });
      expect(s.id).toBeDefined();
      expect(s.isActive).toBe(true);
    });
    it("trims whitespace", () => {
      const s = createService({ name: "  Hi  ", description: "  Desc  ", duration: 5, priority: "low" });
      expect(s.name).toBe("Hi");
      expect(s.description).toBe("Desc");
    });
    it("adds to the store", () => {
      const before = getAllServices().length;
      createService({ name: "New", description: "D", duration: 5, priority: "medium" });
      expect(getAllServices().length).toBe(before + 1);
    });
    it("generates unique ids", () => {
      const a = createService({ name: "A", description: "D", duration: 5, priority: "low" });
      const b = createService({ name: "B", description: "D", duration: 5, priority: "low" });
      expect(a.id).not.toBe(b.id);
    });
  });
  
  describe("updateService", () => {
    it("updates a field", () => {
      expect(updateService(1, { name: "Updated" })?.name).toBe("Updated");
    });
    it("preserves other fields", () => {
      const original = getServiceById(1)!;
      expect(updateService(1, { name: "X" })?.description).toBe(original.description);
    });
    it("returns undefined for unknown id", () => {
      expect(updateService(9999, { name: "X" })).toBeUndefined();
    });
    it("can deactivate a service", () => {
      updateService(1, { isActive: false });
      expect(getServiceById(1)?.isActive).toBe(false);
    });
  });
  
  describe("deleteService", () => {
    it("removes the service", () => {
      const before = getAllServices().length;
      expect(deleteService(1)).toBe(true);
      expect(getAllServices().length).toBe(before - 1);
    });
    it("returns false for unknown id", () => {
      expect(deleteService(9999)).toBe(false);
    });
  });
  
  describe("validateServiceInput", () => {
    const valid = { name: "Valid", description: "A description", duration: 15, priority: "medium" as const };
  
    it("passes with valid input", () => { expect(validateServiceInput(valid)).toHaveLength(0); });
    it("fails with empty name", () => { expect(validateServiceInput({ ...valid, name: "" }).some(e => e.field === "name")).toBe(true); });
    it("fails with name under 2 chars", () => { expect(validateServiceInput({ ...valid, name: "A" }).some(e => e.field === "name")).toBe(true); });
    it("fails with name over 100 chars", () => { expect(validateServiceInput({ ...valid, name: "A".repeat(101) }).some(e => e.field === "name")).toBe(true); });
    it("fails with empty description", () => { expect(validateServiceInput({ ...valid, description: "" }).some(e => e.field === "description")).toBe(true); });
    it("fails with description over 500 chars", () => { expect(validateServiceInput({ ...valid, description: "D".repeat(501) }).some(e => e.field === "description")).toBe(true); });
    it("fails with missing duration", () => { expect(validateServiceInput({ ...valid, duration: undefined as any }).some(e => e.field === "duration")).toBe(true); });
    it("fails with zero duration", () => { expect(validateServiceInput({ ...valid, duration: 0 }).some(e => e.field === "duration")).toBe(true); });
    it("fails with negative duration", () => { expect(validateServiceInput({ ...valid, duration: -1 }).some(e => e.field === "duration")).toBe(true); });
    it("fails with duration over 480", () => { expect(validateServiceInput({ ...valid, duration: 481 }).some(e => e.field === "duration")).toBe(true); });
    it("passes with duration of 480", () => { expect(validateServiceInput({ ...valid, duration: 480 })).toHaveLength(0); });
    it("fails with invalid priority", () => { expect(validateServiceInput({ ...valid, priority: "extreme" as any }).some(e => e.field === "priority")).toBe(true); });
    it("returns multiple errors at once", () => { expect(validateServiceInput({ name: "", description: "", duration: -1, priority: "bad" as any }).length).toBeGreaterThanOrEqual(4); });
  });
  
  describe("validateUpdateInput", () => {
    it("passes with empty object", () => { expect(validateUpdateInput({})).toHaveLength(0); });
    it("fails with empty name", () => { expect(validateUpdateInput({ name: "" }).some(e => e.field === "name")).toBe(true); });
    it("fails with description over 500 chars", () => { expect(validateUpdateInput({ description: "D".repeat(501) }).some(e => e.field === "description")).toBe(true); });
    it("fails with invalid priority", () => { expect(validateUpdateInput({ priority: "extreme" as any }).some(e => e.field === "priority")).toBe(true); });
    it("fails with non-boolean isActive", () => { expect(validateUpdateInput({ isActive: "yes" as any }).some(e => e.field === "isActive")).toBe(true); });
    it("passes with valid partial input", () => { expect(validateUpdateInput({ name: "New Name" })).toHaveLength(0); });
  });
  