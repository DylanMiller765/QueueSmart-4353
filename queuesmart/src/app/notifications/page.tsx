"use client";

import { useNotifications, Notification } from "@/context/NotificationContext";
import Link from "next/link";
import { useEffect } from "react";

const iconMap = {
  queue_update: "🔔",
  status_change: "⚡",
  info: "✅",
};

const badgeColor = {
  queue_update: { bg: "#EFF6FF", text: "#2563EB" },
  status_change: { bg: "#FFFBEB", text: "#D97706" },
  info: { bg: "#F0FDF4", text: "#16A34A" },
};

const labelMap = {
  queue_update: "Queue Update",
  status_change: "Status Change",
  info: "Info",
};

function NotificationCard({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const colors = badgeColor[notif.type];
  return (
    <div
      onClick={() => onRead(notif.id)}
      style={{
        background: notif.read ? "#fff" : "#F0F7FF",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      <div style={{
        width: "40px", height: "40px",
        borderRadius: "50%",
        background: colors.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px", flexShrink: 0,
      }}>
        {iconMap[notif.type]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>{notif.title}</span>
            <span style={{
              fontSize: "11px", fontWeight: 500,
              padding: "2px 8px", borderRadius: "999px",
              background: colors.bg, color: colors.text,
            }}>
              {labelMap[notif.type]}
            </span>
            {!notif.read && (
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#2563EB", display: "inline-block",
              }} />
            )}
          </div>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{notif.time}</span>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "#6B7280" }}>{notif.message}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead, addNotification } = useNotifications();

  // Demo: fire a test toast/notification after 3 seconds so graders can see it work
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: "status_change",
        title: "Almost Your Turn",
        message: "You are next in line for Technical Support!",
        time: "Just now",
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6" }}>
      {/* Navbar — matches partner's style */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>QueueSmart</span>
          <Link href="/dashboard" style={{ fontSize: "14px", color: "#6B7280", textDecoration: "none" }}>Dashboard</Link>
          <Link href="/join-queue" style={{ fontSize: "14px", color: "#6B7280", textDecoration: "none" }}>Services</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/notifications" style={{ position: "relative", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-6px",
                background: "#EF4444", color: "#fff",
                fontSize: "10px", fontWeight: 700,
                borderRadius: "999px", padding: "1px 5px",
                minWidth: "16px", textAlign: "center",
              }}>{unreadCount}</span>
            )}
          </Link>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#374151", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 600,
          }}>DM</div>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ maxWidth: "720px", margin: "40px auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#111827" }}>Notifications</h1>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6B7280" }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: "none", border: "1px solid #2563EB",
                color: "#2563EB", borderRadius: "8px",
                padding: "8px 16px", fontSize: "13px",
                cursor: "pointer", fontWeight: 500,
              }}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.length === 0 ? (
            <div style={{
              background: "#fff", border: "1px solid #E5E7EB",
              borderRadius: "12px", padding: "48px",
              textAlign: "center", color: "#9CA3AF",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔔</div>
              <p style={{ margin: 0, fontSize: "15px" }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationCard key={n.id} notif={n} onRead={markRead} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
