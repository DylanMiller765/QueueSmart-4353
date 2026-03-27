import { Notification, QueueHistory } from "@/types";

// ─── Validation Error Type ──────────────────────────────────────────────────
export interface ValidationError {
  field: string;
  message: string;
}

// ─── Wait Time ──────────────────────────────────────────────────────────────
export function estimateWaitTime(
  position: number,
  serviceDuration: number
): number {
  return position * serviceDuration;
}

// ─── Notification Logic ─────────────────────────────────────────────────────
export function buildNotificationMessage(
  type: "joined" | "almost_ready",
  serviceName: string,
  position?: number
): { title: string; message: string; notifType: Notification["type"] } {
  if (type === "joined") {
    return {
      title: "Joined Queue",
      message: `You joined the queue for ${serviceName}. Your position is #${position ?? "N/A"}.`,
      notifType: "info",
    };
  }
  return {
    title: "Almost Your Turn",
    message: `You are almost ready to be served for ${serviceName}!`,
    notifType: "warning",
  };
}

export function validateNotificationInput(input: {
  userId: string;
  type: string;
  serviceName: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.userId || !input.userId.trim()) {
    errors.push({ field: "userId", message: "userId is required" });
  }

  if (!input.type || !["joined", "almost_ready"].includes(input.type)) {
    errors.push({ field: "type", message: "type must be 'joined' or 'almost_ready'" });
  }

  if (!input.serviceName || !input.serviceName.trim()) {
    errors.push({ field: "serviceName", message: "serviceName is required" });
  } else if (input.serviceName.length > 100) {
    errors.push({ field: "serviceName", message: "serviceName must be under 100 characters" });
  }

  return errors;
}

// ─── History Logic ──────────────────────────────────────────────────────────
export function createHistoryEntry(
  id: string,
  serviceName: string
): QueueHistory {
  return {
    id,
    serviceName: serviceName.trim(),
    date: new Date().toISOString().split("T")[0],
    status: "completed",
    waitTime: 0,
  };
}

export function updateHistoryEntry(
  entry: QueueHistory,
  status: QueueHistory["status"],
  waitTime: number
): QueueHistory {
  return { ...entry, status, waitTime };
}

export function validateHistoryInput(input: {
  userId: string;
  serviceName: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.userId || !input.userId.trim()) {
    errors.push({ field: "userId", message: "userId is required" });
  }

  if (!input.serviceName || !input.serviceName.trim()) {
    errors.push({ field: "serviceName", message: "serviceName is required" });
  } else if (input.serviceName.length > 100) {
    errors.push({ field: "serviceName", message: "serviceName must be under 100 characters" });
  }

  return errors;
}

// ─── Seed Data ──────────────────────────────────────────────────────────────
export const seedNotifications: Notification[] = [
  {
    id: "nl1",
    title: "Joined Queue",
    message: "You joined the queue for General Consultation. Your position is #3.",
    type: "info",
    read: false,
    createdAt: "2026-02-17T10:30:00Z",
  },
  {
    id: "nl2",
    title: "Almost Your Turn",
    message: "You are almost ready to be served for Technical Support!",
    type: "warning",
    read: false,
    createdAt: "2026-02-17T11:00:00Z",
  },
];

export const seedHistory: QueueHistory[] = [
  { id: "h1", serviceName: "General Consultation", date: "2026-02-15", status: "completed", waitTime: 18 },
  { id: "h2", serviceName: "Account Services", date: "2026-02-14", status: "completed", waitTime: 8 },
  { id: "h3", serviceName: "Technical Support", date: "2026-02-10", status: "cancelled", waitTime: 0 },
  { id: "h4", serviceName: "Document Processing", date: "2026-02-05", status: "completed", waitTime: 25 },
];