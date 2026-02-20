"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotificationType = "queue_update" | "status_change" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string; // e.g. "Just now", "1h ago"
  read: boolean;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: Notification[];
  toasts: Toast[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "queue_update",
    title: "Queue Update",
    message: "You moved up to position #3 in Technical Support.",
    time: "10h ago",
    read: false,
  },
  {
    id: "2",
    type: "status_change",
    title: "Almost Your Turn",
    message: "You are next in line for General Consultation!",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "Service Complete",
    message: "Your Account Services appointment has been completed.",
    time: "Yesterday",
    read: true,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, "id" | "read">) => {
    const id = Date.now().toString();
    const newNotif: Notification = { ...n, id, read: false };
    setNotifications((prev) => [newNotif, ...prev]);

    // Also show a toast
    const toast: Toast = { id, title: n.title, message: n.message, type: n.type };
    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, toasts, unreadCount, addNotification, markAllRead, markRead, dismissToast }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
