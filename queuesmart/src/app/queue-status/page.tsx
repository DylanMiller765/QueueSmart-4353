"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Status = "Waiting" | "Almost ready" | "Served";

export default function QueueStatusPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // mock data (optional query params from Join page)
  const service = sp.get("service") || "Technical Support";
  const position = Number(sp.get("pos") || 3);
  const eta = Number(sp.get("eta") || 12);

  const [status, setStatus] = useState<Status>("Waiting");
  const [banner, setBanner] = useState("");

  const progress = useMemo(() => {
    // simple fake progress based on status
    if (status === "Waiting") return 35;
    if (status === "Almost ready") return 75;
    return 100;
  }, [status]);

  function handleLeave() {
    setBanner(`You left the queue for ${service}.`);
    setTimeout(() => router.push("/user/join-queue"), 450);
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          Queue Status
        </h1>

        {banner && (
          <div className="mt-6 rounded-xl border border-[#d2d2d7] bg-white px-4 py-3 text-[14px] text-foreground">
            ✅ {banner}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-[#e5e5ea] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="text-center">
            <div className="text-[56px] font-semibold leading-none text-foreground">
              {position}
            </div>
            <div className="mt-2 text-[16px] font-medium text-foreground">
              Position in {service}
            </div>
            <div className="mt-2 text-[14px] text-muted">
              About {eta} minutes remaining
            </div>

            {/* progress bar */}
            <div className="mt-6 h-2 w-full rounded-full bg-[#f2f2f7]">
              <div
                className="h-2 rounded-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 text-[14px] text-muted">
              Status: <span className="font-medium text-foreground">{status}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              disabled
              className="w-full rounded-full border border-[#e5e5ea] bg-[#f5f5f7] px-6 py-3 text-[14px] font-medium text-muted sm:w-auto cursor-not-allowed"
            >
              View Details
            </button>

            <button
              onClick={handleLeave}
              className="w-full rounded-full border border-[#e5e5ea] bg-white px-6 py-3 text-[14px] font-medium text-foreground transition-all duration-200 hover:bg-[#f5f5f7] active:scale-[0.98] sm:w-auto"
            >
              Leave Queue
            </button>

            <button
              onClick={() =>
                setStatus((prev) =>
                  prev === "Waiting" ? "Almost ready" : prev === "Almost ready" ? "Served" : "Waiting"
                )
              }
              className="w-full rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] sm:w-auto"
            >
              Simulate Update
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-[12px] leading-relaxed text-muted/60">
          Demo — position, wait time, and status updates are mocked for Assignment 2.
        </p>
      </div>
    </div>
  );
}