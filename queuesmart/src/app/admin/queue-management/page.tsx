"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronLeft, ChevronUp, ChevronDown } from "lucide-react";

interface QueueUser {
  id: number;
  name: string;
  joinedAt: string;
  waitTime: number;
  status: "waiting" | "almost ready" | "serving";
}

const initialQueues: Record<string, QueueUser[]> = {
  "Customer Support": [
    { id: 1, name: "James Wilson", joinedAt: "9:02 AM", waitTime: 12, status: "serving" },
    { id: 2, name: "Sarah Ahmed", joinedAt: "9:15 AM", waitTime: 25, status: "almost ready" },
    { id: 3, name: "Carlos Rivera", joinedAt: "9:22 AM", waitTime: 38, status: "waiting" },
    { id: 4, name: "Emily Chen", joinedAt: "9:30 AM", waitTime: 51, status: "waiting" },
  ],
  "Technical Assistance": [
    { id: 5, name: "Mike Johnson", joinedAt: "9:10 AM", waitTime: 8, status: "serving" },
    { id: 6, name: "Priya Patel", joinedAt: "9:35 AM", waitTime: 20, status: "waiting" },
  ],
  "Billing Inquiry": [
    { id: 7, name: "Tom Baker", joinedAt: "8:55 AM", waitTime: 5, status: "serving" },
    { id: 8, name: "Lisa Wong", joinedAt: "9:05 AM", waitTime: 15, status: "almost ready" },
    { id: 9, name: "David Kim", joinedAt: "9:18 AM", waitTime: 25, status: "waiting" },
  ],
};

export default function QueueManagement() {
  const [queues, setQueues] = useState(initialQueues);
  const [selectedService, setSelectedService] = useState("Customer Support");
  const [notification, setNotification] = useState("");

  const services = Object.keys(queues);
  const currentQueue = queues[selectedService] || [];

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const serveNext = () => {
    if (currentQueue.length === 0) return;
    const queue = [...currentQueue];
    const served = queue.shift();
    setQueues({ ...queues, [selectedService]: queue });
    showNotif(`✓ ${served?.name} has been served and removed from the queue.`);
  };

  const removeUser = (id: number) => {
    const user = currentQueue.find(u => u.id === id);
    setQueues({ ...queues, [selectedService]: currentQueue.filter(u => u.id !== id) });
    showNotif(`${user?.name} has been removed from the queue.`);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const queue = [...currentQueue];
    [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
    setQueues({ ...queues, [selectedService]: queue });
  };

  const moveDown = (index: number) => {
    if (index === currentQueue.length - 1) return;
    const queue = [...currentQueue];
    [queue[index], queue[index + 1]] = [queue[index + 1], queue[index]];
    setQueues({ ...queues, [selectedService]: queue });
  };

  const statusStyle = (status: string) => {
    if (status === "serving") return "bg-blue-100 text-blue-600";
    if (status === "almost ready") return "bg-yellow-100 text-yellow-600";
    return "bg-[#f5f5f7] text-muted";
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <nav className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1280px] items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin/admin-dashboard" className="text-[15px] font-semibold tracking-tight text-foreground">
              QueueSmart
            </Link>
            <div className="hidden items-center gap-6 sm:flex">
              <Link href="/admin/admin-dashboard" className="text-[13px] text-muted transition-colors hover:text-foreground">Dashboard</Link>
              <Link href="/admin/service-management" className="text-[13px] text-muted transition-colors hover:text-foreground">Services</Link>
              <Link href="/admin/queue-management" className="text-[13px] font-medium text-foreground">Queues</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} strokeWidth={1.5} className="text-muted" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-muted">AD</div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-8" style={{ animation: "fadeUp 0.5s ease-out both" }}>
          <Link href="/admin/admin-dashboard" className="mb-3 flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">Queue Management</h1>
          <p className="mt-1 text-[15px] text-muted">View, reorder, and manage users in each service queue</p>
        </div>

        {notification && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-[14px] text-green-700">
            {notification}
          </div>
        )}

        {/* Service Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap" style={{ animation: "fadeUp 0.5s ease-out 0.05s both" }}>
          {services.map(s => (
            <button key={s} onClick={() => setSelectedService(s)}
              className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
                selectedService === s
                  ? "bg-accent text-white"
                  : "bg-white text-muted hover:text-foreground border border-black/[0.08]"
              }`}>
              {s}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${selectedService === s ? "bg-white/20 text-white" : "bg-[#f5f5f7] text-muted"}`}>
                {queues[s].length}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-8" style={{ animation: "fadeUp 0.5s ease-out 0.1s both" }}>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              {selectedService} — {currentQueue.length} in queue
            </p>
            <button onClick={serveNext} disabled={currentQueue.length === 0}
              className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
                currentQueue.length === 0
                  ? "bg-[#f5f5f7] text-muted cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}>
              ✓ Serve Next
            </button>
          </div>

          {currentQueue.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[17px] font-medium text-foreground">Queue is empty</p>
              <p className="mt-1 text-[14px] text-muted">No users are currently waiting for this service.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {currentQueue.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${index === 0 ? "bg-accent text-white" : "bg-[#f5f5f7] text-muted"}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-foreground">{user.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted">Joined {user.joinedAt} · Est. wait: {user.waitTime} min</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle(user.status)}`}>
                    {user.status}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(index)} disabled={index === 0}
                      className={`rounded p-0.5 ${index === 0 ? "text-[#d2d2d7] cursor-not-allowed" : "text-muted hover:text-foreground hover:bg-[#f5f5f7]"}`}>
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveDown(index)} disabled={index === currentQueue.length - 1}
                      className={`rounded p-0.5 ${index === currentQueue.length - 1 ? "text-[#d2d2d7] cursor-not-allowed" : "text-muted hover:text-foreground hover:bg-[#f5f5f7]"}`}>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeUser(user.id)}
                    className="rounded-full bg-red-50 px-4 py-1.5 text-[13px] font-medium text-red-500 hover:bg-red-100">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}