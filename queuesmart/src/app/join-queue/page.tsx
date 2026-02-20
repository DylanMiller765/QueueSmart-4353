"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";

type Service = {
  id: string;
  name: string;
  queueCount: number;
  waitText: string;
};

const MOCK_SERVICES: Service[] = [
  { id: "general", name: "General Consultation", queueCount: 8, waitText: "~15 min wait" },
  { id: "tech", name: "Technical Support", queueCount: 5, waitText: "~30 min wait" },
  { id: "account", name: "Account Services", queueCount: 3, waitText: "~10 min wait" },
];

export default function JoinQueuePage() {
  const router = useRouter();
  const [banner, setBanner] = useState("");
  const [joined, setJoined] = useState(false);

  function handleJoin(service: Service) {
    setBanner(`You joined the queue for ${service.name}.`);
    setJoined(true);
  }

  function goToStatus() {
    router.push("/queue-status");
  }

  return (
    <div className="min-h-screen bg-white">
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
                className="text-[13px] text-muted transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/join-queue"
                className="text-[13px] font-medium text-foreground"
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
            <button className="relative text-muted transition-colors hover:text-foreground">
              <Bell size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-muted"
            >
              DM
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          Join a Queue
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Select a service to join its queue and view your estimated wait time.
        </p>

        {banner && (
          <div className="mt-6 rounded-xl border border-[#d2d2d7] bg-white px-4 py-3 text-[14px] text-foreground flex items-center justify-between">
            <span>✅ {banner}</span>

            {joined && (
              <button
                onClick={goToStatus}
                className="ml-4 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-hover transition-all"
              >
                View Status
              </button>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {MOCK_SERVICES.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-2xl border border-[#e5e5ea] bg-white p-5 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-md transition-all"
            >
              <div>
                <h2 className="text-[18px] font-semibold text-foreground">
                  {s.name}
                </h2>
                <p className="mt-1 text-[14px] text-muted">
                  {s.queueCount} in queue · {s.waitText}
                </p>
              </div>

              <button
                onClick={() => handleJoin(s)}
                className="rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98]"
              >
                Join Queue
              </button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[12px] leading-relaxed text-muted/60">
          Demo — queue lengths and wait times are mocked for the UI design assignment.
        </p>
      </div>
      </div>
    </div>
  );
}