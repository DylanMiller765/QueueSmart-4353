"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Bell } from "lucide-react";

const initialServices = [
  { id: 1, name: "Customer Support", queueLength: 7, duration: 15, priority: "high", open: true },
  { id: 2, name: "Technical Assistance", queueLength: 3, duration: 30, priority: "medium", open: true },
  { id: 3, name: "Billing Inquiry", queueLength: 12, duration: 10, priority: "low", open: true },
  { id: 4, name: "Account Management", queueLength: 0, duration: 20, priority: "medium", open: false },
];

export default function AdminDashboard() {
  const [services, setServices] = useState(initialServices);

  const toggleQueue = (id: number) => {
    setServices(services.map(s => s.id === id ? { ...s, open: !s.open } : s));
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "bg-red-100 text-red-600";
    if (p === "medium") return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1280px] items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin/admin-dashboard" className="text-[15px] font-semibold tracking-tight text-foreground">
              QueueSmart
            </Link>
            <div className="hidden items-center gap-6 sm:flex">
              <Link href="/admin/admin-dashboard" className="text-[13px] font-medium text-foreground">
                Dashboard
              </Link>
              <Link href="/admin/service-management" className="text-[13px] text-muted transition-colors hover:text-foreground">
                Services
              </Link>
              <Link href="/admin/queue-management" className="text-[13px] text-muted transition-colors hover:text-foreground">
                Queues
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} strokeWidth={1.5} className="text-muted" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-muted">
              AD
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1280px] px-8 py-10">
        {/* Header */}
        <div className="mb-8" style={{ animation: "fadeUp 0.5s ease-out both" }}>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-[15px] text-muted">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4" style={{ animation: "fadeUp 0.5s ease-out 0.05s both" }}>
          {[
            { label: "Total Services", value: services.length },
            { label: "Active Queues", value: services.filter(s => s.open).length },
            { label: "People Waiting", value: services.reduce((a, s) => a + s.queueLength, 0) },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">{stat.label}</p>
              <p className="mt-2 text-[40px] font-semibold leading-none tracking-tight text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Services Table */}
        <div className="rounded-2xl bg-white p-8" style={{ animation: "fadeUp 0.5s ease-out 0.1s both" }}>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">All Services</p>
            <Link href="/admin/service-management"
              className="rounded-full bg-accent px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover">
              + New Service
            </Link>
          </div>

          <div className="divide-y divide-black/[0.06]">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[14px] font-medium text-foreground">{s.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted">{s.queueLength} waiting · ~{s.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${priorityColor(s.priority)}`}>
                    {s.priority}
                  </span>
                  <span className={`text-[13px] font-medium ${s.open ? "text-green-600" : "text-red-500"}`}>
                    {s.open ? "● Open" : "● Closed"}
                  </span>
                  <button
                    onClick={() => toggleQueue(s.id)}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                      s.open
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {s.open ? "Close" : "Open"}
                  </button>
                  <Link href="/admin/queue-management">
                    <ChevronRight size={15} strokeWidth={1.5} className="text-[#d2d2d7]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}