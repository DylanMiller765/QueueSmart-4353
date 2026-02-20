"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Bell } from "lucide-react";
import {
  mockServices,
  mockCurrentQueue,
  mockNotifications,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const router = useRouter();
  const [notifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeServices = mockServices.filter((s) => s.isActive);

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  function formatRelativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return "Yesterday";
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1280px] items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-[15px] font-semibold tracking-tight text-foreground"
            >
              QueueSmart
            </Link>
            <div className="hidden items-center gap-6 sm:flex">
              <Link
                href="/dashboard"
                className="text-[13px] font-medium text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/join-queue"
                className="text-[13px] text-muted transition-colors hover:text-foreground"
              >
                Services
              </Link>
              <Link
                href="/history"
                className="text-[13px] text-muted transition-colors hover:text-foreground"
              >
                History
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
          <Link href="/notifications" className="relative text-muted transition-colors hover:text-foreground">
            <Bell size={18} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-error" />
            )}
          </Link>
            <button
              onClick={() => router.push("/login")}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-muted"
            >
              DM
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-[1280px] px-8 py-10">
        {/* Greeting */}
        <div
          className="mb-8"
          style={{ animation: "fadeUp 0.5s ease-out both" }}
        >
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">
            {getGreeting()}, Dylan.
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — Queue status (featured) */}
          <div
            className="lg:col-span-2"
            style={{ animation: "fadeUp 0.5s ease-out 0.05s both" }}
          >
            <div className="rounded-2xl bg-white p-8">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                Your Queue
              </p>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[64px] font-semibold leading-none tracking-tight text-foreground">
                    {mockCurrentQueue.position}
                  </p>
                  <p className="mt-3 text-[19px] text-foreground">
                    Position in {mockCurrentQueue.serviceName}
                  </p>
                  <p className="mt-1 text-[15px] text-muted">
                    About {mockCurrentQueue.estimatedWaitTime} minutes remaining
                  </p>

                  {/* Progress */}
                  <div className="mt-6 h-[3px] w-64 rounded-full bg-[#e8e8ed]">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-700"
                      style={{ width: "60%" }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-7 flex items-center gap-5">
                    <Link
                      href="/queue-status"
                      className="rounded-full bg-accent px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-accent-hover"
                    >
                      View Details
                    </Link>
                    <button className="text-[14px] font-medium text-accent transition-colors hover:text-accent-hover">
                      Leave Queue
                    </button>
                  </div>
                </div>

                {/* Right side — visual indicator */}
                <div className="hidden items-center justify-center sm:flex">
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="#e8e8ed"
                        strokeWidth="6"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${0.6 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                        Wait
                      </p>
                      <p className="text-[20px] font-semibold text-foreground">
                        {mockCurrentQueue.estimatedWaitTime}m
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Services + Recent stacked */}
          <div
            className="flex flex-col gap-6"
            style={{ animation: "fadeUp 0.5s ease-out 0.1s both" }}
          >
            {/* Services */}
            <div className="flex-1 rounded-2xl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  Services
                </p>
                <Link
                  href="/join-queue"
                  className="text-[13px] font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-black/[0.06]">
                {activeServices.map((service) => (
                  <Link
                    key={service.id}
                    href="/join-queue"
                    className="group flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-[14px] font-medium text-foreground">
                        {service.name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {service.currentQueueLength} in queue &middot; ~
                        {service.expectedDuration} min
                      </p>
                    </div>
                    <ChevronRight
                      size={15}
                      strokeWidth={1.5}
                      className="text-[#d2d2d7] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl bg-white p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                Recent
              </p>

              <div className="space-y-4">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-2.5">
                    {!n.read ? (
                      <span className="mt-[6px] h-[6px] w-[6px] shrink-0 rounded-full bg-accent" />
                    ) : (
                      <span className="mt-[6px] h-[6px] w-[6px] shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p
                          className={`text-[13px] ${
                            !n.read
                              ? "font-medium text-foreground"
                              : "text-foreground/60"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="shrink-0 text-[11px] text-muted/50">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
