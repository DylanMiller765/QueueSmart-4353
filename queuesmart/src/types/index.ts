export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface Service {
  id: string;
  name: string;
  description: string;
  expectedDuration: number;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  currentQueueLength: number;
}

export interface QueueEntry {
  id: string;
  userId: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  position: number;
  status: "waiting" | "almost-ready" | "served" | "cancelled";
  estimatedWaitTime: number;
  joinedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  createdAt: string;
}

export interface QueueHistory {
  id: string;
  serviceName: string;
  date: string;
  status: "completed" | "cancelled" | "no-show";
  waitTime: number;
}
