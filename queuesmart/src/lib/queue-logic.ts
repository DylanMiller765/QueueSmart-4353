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

// ─── Smart Wait Time ────────────────────────────────────────────────────────
export interface SmartWaitEstimate {
  estimatedWaitMinutes: number;
  basedOn: "history" | "default";
  sampleSize: number;
  confidence: "high" | "medium" | "low";
  averagePerPerson: number;
}

export function estimateSmartWaitTime(
  position: number,
  serviceName: string,
  history: QueueHistory[],
  fallbackDuration: number
): SmartWaitEstimate {
  const relevant = history.filter(
    (h) =>
      h.serviceName === serviceName &&
      h.status === "completed" &&
      h.waitTime > 0
  );

  if (relevant.length === 0) {
    return {
      estimatedWaitMinutes: position * fallbackDuration,
      basedOn: "default",
      sampleSize: 0,
      confidence: "low",
      averagePerPerson: fallbackDuration,
    };
  }

  const avgPerPerson =
    relevant.reduce((sum, h) => sum + h.waitTime, 0) / relevant.length;

  const confidence: SmartWaitEstimate["confidence"] =
    relevant.length >= 10 ? "high" : relevant.length >= 3 ? "medium" : "low";

  return {
    estimatedWaitMinutes: Math.round(position * avgPerPerson),
    basedOn: "history",
    sampleSize: relevant.length,
    confidence,
    averagePerPerson: Math.round(avgPerPerson * 10) / 10,
  };
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
  // General Consultation — 12 completed entries → HIGH confidence
  { id: "h1",  serviceName: "General Consultation", date: "2026-04-22", status: "completed", waitTime: 17 },
  { id: "h2",  serviceName: "General Consultation", date: "2026-04-21", status: "completed", waitTime: 19 },
  { id: "h3",  serviceName: "General Consultation", date: "2026-04-20", status: "completed", waitTime: 16 },
  { id: "h4",  serviceName: "General Consultation", date: "2026-04-18", status: "completed", waitTime: 21 },
  { id: "h5",  serviceName: "General Consultation", date: "2026-04-17", status: "completed", waitTime: 18 },
  { id: "h6",  serviceName: "General Consultation", date: "2026-04-15", status: "completed", waitTime: 15 },
  { id: "h7",  serviceName: "General Consultation", date: "2026-04-14", status: "completed", waitTime: 20 },
  { id: "h8",  serviceName: "General Consultation", date: "2026-04-12", status: "completed", waitTime: 17 },
  { id: "h9",  serviceName: "General Consultation", date: "2026-04-10", status: "completed", waitTime: 22 },
  { id: "h10", serviceName: "General Consultation", date: "2026-04-08", status: "completed", waitTime: 18 },
  { id: "h11", serviceName: "General Consultation", date: "2026-04-05", status: "completed", waitTime: 19 },
  { id: "h12", serviceName: "General Consultation", date: "2026-04-02", status: "completed", waitTime: 16 },

  // Account Services — 5 completed entries → MEDIUM confidence
  { id: "h13", serviceName: "Account Services", date: "2026-04-23", status: "completed", waitTime: 7 },
  { id: "h14", serviceName: "Account Services", date: "2026-04-19", status: "completed", waitTime: 9 },
  { id: "h15", serviceName: "Account Services", date: "2026-04-16", status: "completed", waitTime: 8 },
  { id: "h16", serviceName: "Account Services", date: "2026-04-13", status: "completed", waitTime: 10 },
  { id: "h17", serviceName: "Account Services", date: "2026-04-09", status: "completed", waitTime: 7 },

  // Technical Support — 1 completed entry → LOW confidence
  { id: "h18", serviceName: "Technical Support", date: "2026-04-21", status: "completed", waitTime: 28 },
  { id: "h19", serviceName: "Technical Support", date: "2026-04-15", status: "cancelled", waitTime: 0 },

  // Document Processing — only cancellations → DEFAULT fallback
  { id: "h20", serviceName: "Document Processing", date: "2026-04-20", status: "cancelled", waitTime: 0 },
  { id: "h21", serviceName: "Document Processing", date: "2026-04-14", status: "no-show",   waitTime: 0 },
];