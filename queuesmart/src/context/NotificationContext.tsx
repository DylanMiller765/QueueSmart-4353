"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export type NotificationType = "queue_update" | "status_change" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
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

function formatTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return "Yesterday";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get logged-in user from /api/auth/me
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        setUserId(data.user?.id ?? null);
      } catch {
        console.error("Failed to fetch current user");
      }
    }
    fetchUser();
  }, []);

  // Fetch real notifications from Supabase once we have userId
  useEffect(() => {
    if (!userId) return;

    async function fetchNotifications() {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        if (!res.ok) return;
        const data = await res.json();

        const mapped: Notification[] = (data.notifications ?? []).map((n: {
          id: string;
          type: string;
          title: string;
          message: string;
          status: string;
          created_at: string;
        }) => ({
          id: n.id,
          type: (n.type as NotificationType) ?? "info",
          title: n.title ?? "Notification",
          message: n.message,
          time: formatTime(n.created_at),
          read: n.status === "viewed",
        }));

        setNotifications(mapped);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    }

    fetchNotifications();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, "id" | "read">) => {
    const id = Date.now().toString();
    const newNotif: Notification = { ...n, id, read: false };
    setNotifications((prev) => [newNotif, ...prev]);

    const toast: Toast = { id, title: n.title, message: n.message, type: n.type };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const markRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
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
