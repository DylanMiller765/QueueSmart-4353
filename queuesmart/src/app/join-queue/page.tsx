"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [banner, setBanner] = useState<string>("");

  function handleJoin(service: Service) {
    // UI-only simulation
    setBanner(`You joined the queue for ${service.name}.`);

    // Option A: navigate to Queue Status (recommended)
    // We'll pass the service in the URL for mock purposes
    setTimeout(() => {
      router.push(`/user/queue-status?service=${encodeURIComponent(service.name)}&pos=3&eta=12`);
    }, 450);
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          Join a Queue
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Select a service to join its queue and view your estimated wait time.
        </p>

        {banner && (
          <div className="mt-6 rounded-xl border border-[#d2d2d7] bg-white px-4 py-3 text-[14px] text-foreground">
            ✅ {banner}
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {MOCK_SERVICES.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-2xl border border-[#e5e5ea] bg-white p-5 shadow-[0_8px_25px_rgba(0,0,0,0.04)]"
            >
              <div>
                <h2 className="text-[18px] font-semibold text-foreground">{s.name}</h2>
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
  );
}