import { Service, QueueEntry, Notification, QueueHistory } from "@/types";

export const mockServices: Service[] = [
  {
    id: "1",
    name: "General Consultation",
    description: "Standard consultation for general inquiries and support.",
    expectedDuration: 15,
    priority: "medium",
    isActive: true,
    currentQueueLength: 8,
  },
  {
    id: "2",
    name: "Technical Support",
    description: "Help with technical issues and troubleshooting.",
    expectedDuration: 30,
    priority: "high",
    isActive: true,
    currentQueueLength: 5,
  },
  {
    id: "3",
    name: "Account Services",
    description: "Account creation, updates, and billing inquiries.",
    expectedDuration: 10,
    priority: "low",
    isActive: true,
    currentQueueLength: 3,
  },
  {
    id: "4",
    name: "Document Processing",
    description: "Submit and process official documents and forms.",
    expectedDuration: 20,
    priority: "medium",
    isActive: false,
    currentQueueLength: 0,
  },
];

export const mockCurrentQueue: QueueEntry = {
  id: "q1",
  userId: "u1",
  userName: "Dylan Miller",
  serviceId: "2",
  serviceName: "Technical Support",
  position: 3,
  status: "waiting",
  estimatedWaitTime: 12,
  joinedAt: "2026-02-17T10:30:00Z",
};

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Queue Update",
    message: "You moved up to position #3 in Technical Support.",
    type: "info",
    read: false,
    createdAt: "2026-02-17T10:45:00Z",
  },
  {
    id: "n2",
    title: "Almost Your Turn",
    message: "You are next in line for General Consultation!",
    type: "warning",
    read: false,
    createdAt: "2026-02-17T09:30:00Z",
  },
  {
    id: "n3",
    title: "Service Complete",
    message: "Your Account Services appointment has been completed.",
    type: "success",
    read: true,
    createdAt: "2026-02-16T14:00:00Z",
  },
];

export const mockHistory: QueueHistory[] = [
  {
    id: "h1",
    serviceName: "General Consultation",
    date: "2026-02-15",
    status: "completed",
    waitTime: 18,
  },
  {
    id: "h2",
    serviceName: "Account Services",
    date: "2026-02-14",
    status: "completed",
    waitTime: 8,
  },
  {
    id: "h3",
    serviceName: "Technical Support",
    date: "2026-02-10",
    status: "cancelled",
    waitTime: 0,
  },
  {
    id: "h4",
    serviceName: "Document Processing",
    date: "2026-02-05",
    status: "completed",
    waitTime: 25,
  },
];
