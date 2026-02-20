"use client";

import { useNotifications } from "@/context/NotificationContext";

const iconMap = {
  queue_update: "🔔",
  status_change: "⚡",
  info: "✅",
};

const colorMap = {
  queue_update: "#2563EB",
  status_change: "#F59E0B",
  info: "#10B981",
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      zIndex: 9999,
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderLeft: `4px solid ${colorMap[toast.type]}`,
            borderRadius: "12px",
            padding: "14px 18px",
            minWidth: "300px",
            maxWidth: "360px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            animation: "slideIn 0.3s ease",
          }}
        >
          <span style={{ fontSize: "20px" }}>{iconMap[toast.type]}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: "#111827" }}>
              {toast.title}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6B7280" }}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: "18px",
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
