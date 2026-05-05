"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";

interface SmartEstimate {
  estimatedWaitMinutes: number;
  basedOn: "history" | "default";
  sampleSize: number;
  confidence: "high" | "medium" | "low";
  averagePerPerson: number;
}

interface QueueEntry {
  id: string;
  service_name: string;
  position: number;
  status: string;
}

export default function QueueStatusPage() {
  const router = useRouter();

  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [smart, setSmart] = useState<SmartEstimate | null>(null);
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(true);

  const serviceName = entry?.service_name ?? "—";
  const position = entry?.position ?? 0;
  const defaultDuration = 5;
  const minutesRemaining = position * defaultDuration;

  useEffect(() => {
    const userRaw = localStorage.getItem("queuesmart_user");
    if (!userRaw) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userRaw);

    fetch(`/api/queue/my-entry?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.entry) {
          setBanner("You're not in a queue right now.");
          setLoading(false);
          return;
        }
        setEntry(data.entry);

        // fetch smart estimate for their actual service + position
        const url = `/api/wait-time/smart?position=${data.entry.position}&serviceName=${encodeURIComponent(data.entry.service_name)}&duration=${defaultDuration}`;
        return fetch(url).then((r) => (r.ok ? r.json() : null));
      })
      .then((smartData) => {
        if (smartData) setSmart(smartData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleLeaveQueue() {
    const userRaw = localStorage.getItem("queuesmart_user");
    if (!userRaw) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userRaw);

    try {
      const res = await fetch("/api/queue/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        setBanner(`You left the queue for ${serviceName}.`);
        setTimeout(() => router.push("/join-queue"), 450);
      } else {
        const data = await res.json();
        setBanner(`Couldn't leave queue: ${data.message ?? "error"}`);
      }
    } catch {
      setBanner("Something went wrong. Try again.");
    }
  }

  const status = entry?.status === "serving" ? "Almost ready" : "Waiting";
  const progressPercent = entry
    ? Math.min(95, Math.max(10, 100 - position * 15))
    : 0;

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
                className="text-[13px] text-muted transition-colors hover:text-foreground"
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

      <div className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-[34px] font-semibold tracking-tight text-foreground">
          Queue Status
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          View your current position, estimated wait time, and status updates.
        </p>

        {banner && (
          <div className="mt-6 rounded-2xl border border-[#e5e5ea] bg-white px-5 py-3 text-[14px] text-foreground">
            {banner}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-center text-[14px] text-muted">Loading...</div>
        ) : entry ? (
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
                About {smart?.estimatedWaitMinutes ?? minutesRemaining} minutes remaining
              </p>

              {smart && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#e5e5ea] bg-[#f5f5f7] px-3 py-1 text-[12px] text-muted">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      smart.confidence === "high"
                        ? "bg-green-500"
                        : smart.confidence === "medium"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span>
                    {smart.basedOn === "history"
                      ? `Smart estimate · based on ${smart.sampleSize} past visits · ${smart.confidence} confidence`
                      : "Default estimate · no history yet"}
                  </span>
                </div>
              )}

              {/* simple progress bar */}
              <div className="mt-6 h-[6px] w-full max-w-[340px] rounded-full bg-[#e5e5ea]">
                <div
                  className="h-[6px] rounded-full bg-accent"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="mt-4 text-[14px] text-muted">
                Status:{" "}
                <span className="font-medium text-foreground">{status}</span>
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={handleLeaveQueue}
                  className="rounded-full px-6 py-3 text-[14px] font-medium text-accent hover:underline"
                >
                  Leave Queue
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
                    {smart?.estimatedWaitMinutes ?? minutesRemaining}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-[#e5e5ea] bg-white p-8 text-center">
            <p className="text-[15px] text-muted">You&apos;re not in a queue right now.</p>
            <Link
              href="/join-queue"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-white"
            >
              Join a Queue
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
