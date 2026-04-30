"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";

interface Service {
  service_id: number;
  service_name: string;
  is_active: boolean;
}

interface QueueEntry {
  id: string;
  user_id: string;
  service_id: number;
  service_name: string;
  position: number;
  status: string;
  joined_at: string;
  wait_time_minutes: number | null;
}

export default function QueueManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [entriesByService, setEntriesByService] = useState<Record<number, QueueEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [busy, setBusy] = useState(false);

  // load services, then load entries for each
  useEffect(() => {
    loadEverything();
  }, []);

  async function loadEverything() {
    setLoading(true);
    try {
      const svcRes = await fetch("/api/services");
      const svcData = await svcRes.json();
      const activeServices: Service[] = (svcData.data ?? []).filter(
        (s: Service) => s.is_active
      );
      setServices(activeServices);

      if (activeServices.length > 0 && selectedServiceId === null) {
        setSelectedServiceId(activeServices[0].service_id);
      }

      // grab queue entries for each service
      const map: Record<number, QueueEntry[]> = {};
      for (const svc of activeServices) {
        const res = await fetch(`/api/queue/entries?service_id=${svc.service_id}`);
        const data = await res.json();
        map[svc.service_id] = data.entries ?? [];
      }
      setEntriesByService(map);
    } catch {
      showNotif("Couldn't load queues");
    } finally {
      setLoading(false);
    }
  }

  function showNotif(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  }

  async function serveNext() {
    if (!selectedServiceId || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/queue/serve-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: selectedServiceId }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotif(`✓ User served. Wait time: ${data.servedUser.wait_time_minutes} min`);
        await loadEverything();
      } else {
        showNotif(data.message ?? "Couldn't serve next");
      }
    } catch {
      showNotif("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(entry: QueueEntry) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/queue/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: entry.user_id }),
      });
      if (res.ok) {
        showNotif("User removed from queue");
        await loadEverything();
      } else {
        const data = await res.json();
        showNotif(data.message ?? "Couldn't remove user");
      }
    } catch {
      showNotif("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function statusStyle(status: string) {
    if (status === "serving") return "bg-blue-100 text-blue-600";
    if (status === "waiting") return "bg-[#f5f5f7] text-muted";
    return "bg-[#f5f5f7] text-muted";
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function shortUserId(uid: string) {
    return `User ${uid.slice(0, 8)}`;
  }

  const currentEntries = selectedServiceId
    ? entriesByService[selectedServiceId] ?? []
    : [];
  const selectedService = services.find((s) => s.service_id === selectedServiceId);

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
              <Link href="/admin/reports" className="text-[13px] text-muted transition-colors hover:text-foreground">Reports</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} strokeWidth={1.5} className="text-muted" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-muted">AD</div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-8">
          <Link href="/admin/admin-dashboard" className="mb-3 flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground">Queue Management</h1>
          <p className="mt-1 text-[15px] text-muted">View and manage users in each service queue</p>
        </div>

        {notification && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-[14px] text-green-700">
            {notification}
          </div>
        )}

        {loading ? (
          <p className="text-muted">Loading queues...</p>
        ) : services.length === 0 ? (
          <p className="text-muted">No services available.</p>
        ) : (
          <>
            {/* Service Tabs */}
            <div className="mb-6 flex gap-2 flex-wrap">
              {services.map((s) => (
                <button
                  key={s.service_id}
                  onClick={() => setSelectedServiceId(s.service_id)}
                  className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
                    selectedServiceId === s.service_id
                      ? "bg-accent text-white"
                      : "bg-white text-muted hover:text-foreground border border-black/[0.08]"
                  }`}
                >
                  {s.service_name}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                    selectedServiceId === s.service_id ? "bg-white/20 text-white" : "bg-[#f5f5f7] text-muted"
                  }`}>
                    {entriesByService[s.service_id]?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  {selectedService?.service_name} — {currentEntries.length} in queue
                </p>
                <button
                  onClick={serveNext}
                  disabled={currentEntries.length === 0 || busy}
                  className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
                    currentEntries.length === 0 || busy
                      ? "bg-[#f5f5f7] text-muted cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  ✓ Serve Next
                </button>
              </div>

              {currentEntries.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[17px] font-medium text-foreground">Queue is empty</p>
                  <p className="mt-1 text-[14px] text-muted">No users are currently waiting for this service.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/[0.06]">
                  {currentEntries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${
                        index === 0 ? "bg-accent text-white" : "bg-[#f5f5f7] text-muted"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-foreground">{shortUserId(entry.user_id)}</p>
                        <p className="mt-0.5 text-[12px] text-muted">
                          Joined {formatTime(entry.joined_at)}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle(entry.status)}`}>
                        {entry.status}
                      </span>
                      <button
                        onClick={() => removeUser(entry)}
                        disabled={busy}
                        className="rounded-full bg-red-50 px-4 py-1.5 text-[13px] font-medium text-red-500 hover:bg-red-100 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}