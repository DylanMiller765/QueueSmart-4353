import {
    buildNotificationMessage,
    validateNotificationInput,
    seedNotifications,
  } from "../src/lib/queue-logic";
  
  describe("seedNotifications", () => {
    it("has at least one notification", () => {
      expect(seedNotifications.length).toBeGreaterThanOrEqual(1);
    });
    it("each notification has required fields", () => {
      seedNotifications.forEach((n) => {
        expect(n.id).toBeDefined();
        expect(n.title).toBeDefined();
        expect(n.message).toBeDefined();
        expect(n.type).toBeDefined();
        expect(typeof n.read).toBe("boolean");
        expect(n.createdAt).toBeDefined();
      });
    });
  });
  
  describe("buildNotificationMessage", () => {
    it("returns correct title for joined type", () => {
      const result = buildNotificationMessage("joined", "General Consultation", 3);
      expect(result.title).toBe("Joined Queue");
      expect(result.notifType).toBe("info");
    });
    it("includes position in joined message", () => {
      const result = buildNotificationMessage("joined", "Technical Support", 5);
      expect(result.message).toContain("5");
    });
    it("returns correct title for almost_ready type", () => {
      const result = buildNotificationMessage("almost_ready", "Account Services");
      expect(result.title).toBe("Almost Your Turn");
      expect(result.notifType).toBe("warning");
    });
    it("includes service name in message", () => {
      const result = buildNotificationMessage("joined", "Document Processing", 1);
      expect(result.message).toContain("Document Processing");
    });
    it("handles missing position gracefully", () => {
      const result = buildNotificationMessage("joined", "General Consultation");
      expect(result.message).toContain("N/A");
    });
  });
  
  describe("validateNotificationInput", () => {
    const valid = { userId: "user-1", type: "joined", serviceName: "General Consultation" };
  
    it("passes with valid input", () => {
      expect(validateNotificationInput(valid)).toHaveLength(0);
    });
    it("fails with missing userId", () => {
      expect(validateNotificationInput({ ...valid, userId: "" }).some(e => e.field === "userId")).toBe(true);
    });
    it("fails with invalid type", () => {
      expect(validateNotificationInput({ ...valid, type: "invalid" }).some(e => e.field === "type")).toBe(true);
    });
    it("fails with missing serviceName", () => {
      expect(validateNotificationInput({ ...valid, serviceName: "" }).some(e => e.field === "serviceName")).toBe(true);
    });
    it("fails with serviceName over 100 chars", () => {
      expect(validateNotificationInput({ ...valid, serviceName: "A".repeat(101) }).some(e => e.field === "serviceName")).toBe(true);
    });
    it("returns multiple errors at once", () => {
      expect(validateNotificationInput({ userId: "", type: "bad", serviceName: "" }).length).toBeGreaterThanOrEqual(3);
    });
  });