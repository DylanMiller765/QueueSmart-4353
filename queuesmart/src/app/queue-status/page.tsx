"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QueueStatusPage() {
  const router = useRouter();

  // just mock values for A2
  const position = 3;
  const serviceName = "Technical Support";
  const minutesRemaining = 12;

  const [status, setStatus] = useState<"Waiting" | "Almost ready">("Waiting");
  const [banner, setBanner] = useState("");

  function handleLeaveQueue() {
    setBanner(`You left the queue for ${serviceName}.`);
    setTimeout(() => router.push("/user/join-queue"), 450);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-[34px] font-semibold tracking-tight text-foreground">
          Queue Status
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          View your current position, estimated wait time, and status updates.
        </p>

        {banner && (
          <div className="mt-6 rounded-2xl border border-[#e5e5ea] bg-white px-5 py-3 text-[14px] text-foreground">
            ✅ {banner}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-[#e5e5ea] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold tracking-widest text-muted">
                YOUR QUEUE
              </p>

              <div className="mt-3 text-[64px] font-semibold leading-none text-foreground">
                {position}
              </div>

              <p className="mt-3 text-[20px] font-medium text-foreground">
                Position in {serviceName}
              </p>

              <p className="mt-2 text-[14px] text-muted">
                About {minutesRemaining} minutes remaining
              </p>

              {/* simple progress bar */}
              <div className="mt-6 h-[6px] w-full max-w-[340px] rounded-full bg-[#e5e5ea]">
                <div
                  className="h-[6px] rounded-full bg-accent"
                  style={{ width: "55%" }}
                />
              </div>

              <p className="mt-4 text-[14px] text-muted">
                Status:{" "}
                <span className="font-medium text-foreground">{status}</span>
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  disabled
                  className="rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-white opacity-60 cursor-not-allowed"
                >
                  View Details
                </button>

                <button
                  onClick={handleLeaveQueue}
                  className="rounded-full px-6 py-3 text-[14px] font-medium text-accent hover:underline"
                >
                  Leave Queue
                </button>

                {/* just to demo status changes */}
                <button
                  onClick={() =>
                    setStatus((prev) =>
                      prev === "Waiting" ? "Almost ready" : "Waiting"
                    )
                  }
                  className="rounded-full border border-[#e5e5ea] bg-white px-6 py-3 text-[14px] font-medium text-foreground hover:bg-[#f5f5f7]"
                >
                  Simulate Status
                </button>
              </div>
            </div>

            {/* wait bubble on the right */}
            <div className="flex items-center justify-center">
              <div className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full border-[10px] border-[#e5e5ea]">
                <div className="absolute inset-0 rounded-full border-[10px] border-accent border-l-transparent border-b-transparent rotate-[45deg]" />
                <div className="text-center">
                  <p className="text-[12px] font-semibold tracking-widest text-muted">
                    WAIT
                  </p>
                  <p className="text-[22px] font-semibold text-foreground">
                    {minutesRemaining}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[12px] leading-relaxed text-muted/60">
          Demo — queue position and status are mocked for Assignment 2.
        </p>
      </div>
    </div>
  );
}