"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";

interface QueueEntry {
  id: string;
  service_name: string;
  position: number;
  status: string;
  joined_at: string;
  served_at: string | null;
  completed_at: string | null;
  wait_time_minutes: number | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userRaw = localStorage.getItem("queuesmart_user");
    if (!userRaw) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userRaw);

    fetch(`/api/queue/history?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't load your history");
        setLoading(false);
      });
  }, [router]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusStyle(status: string) {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-gray-100 text-gray-600";
    if (status === "no-show") return "bg-red-100 text-red-700";
    if (status === "waiting" || status === "serving") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1280px] items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-[15px] font-semibold tracking-tight text-foreground">
              QueueSmart
            </Link>
            <div className="hidden items-center gap-6 sm:flex">
              <Link href="/dashboard" className="text-[13px] text-muted hover:text-foreground">Dashboard</Link>
              <Link href="/join-queue" className="text-[13px] text-muted hover:text-foreground">Services</Link>
              <Link href="/history" className="text-[13px] font-medium text-foreground">History</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} strokeWidth={1.5} className="text-muted" />
            <button
              onClick={() => router.push("/login")}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-muted"
            >
              DM
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-[28px] font-semibold tracking-tight">Your History</h1>
        <p className="mt-2 text-[15px] text-muted">
          All the queues you've joined and how they ended up.
        </p>

        {loading ? (
          <p className="mt-8 text-muted">Loading...</p>
        ) : error ? (
          <p className="mt-8 text-red-600">{error}</p>
        ) : entries.length === 0 ? (
          <div className="mt-8 rounded-xl border border-[#e5e5ea] bg-[#fafafa] p-8 text-center">
            <p className="text-[15px] text-muted">No queue activity yet.</p>
            <Link href="/join-queue" className="mt-2 inline-block text-[14px] font-medium text-blue-600">
              Join a queue →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-[#e5e5ea] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[16px] font-semibold">{entry.service_name}</h2>
                    <p className="mt-1 text-[13px] text-muted">
                      Joined {formatDate(entry.joined_at)}
                    </p>
                    {entry.wait_time_minutes !== null && (
                      <p className="mt-0.5 text-[13px] text-muted">
                        Waited {entry.wait_time_minutes} min
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle(
                      entry.status
                    )}`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}