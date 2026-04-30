"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";

type Service = {
  service_id: number;
  service_name: string;
  description: string;
  expected_duration: number;
  priority_level: number;
  is_active: boolean;
};

export default function JoinQueuePage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

// grab real services from the db
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((response) => {
        // api returns { success: true, data: [...] }
        const list = response.data ?? [];
        setServices(list.filter((s: Service) => s.is_active));
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't load services");
        setLoading(false);
      });
  }, []);
  
  async function handleJoin(service: Service) {
    setError("");
    setBanner("");
    setJoiningId(service.service_id);

    // get logged in user from localstorage
    const userRaw = localStorage.getItem("queuesmart_user");
    if (!userRaw) {
      setError("Please log in first");
      setJoiningId(null);
      router.push("/login");
      return;
    }

    const user = JSON.parse(userRaw);

    try {
      const res = await fetch("/api/queue/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          serviceId: service.service_id,
          serviceName: service.service_name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to join queue");
        setJoiningId(null);
        return;
      }

      setBanner(`You joined the queue for ${service.service_name}.`);
      setJoined(true);
      setJoiningId(null);
    } catch {
      setError("Something went wrong. Try again.");
      setJoiningId(null);
    }
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

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <p className="mt-8 text-[14px] text-muted">Loading services...</p>
          ) : services.length === 0 ? (
            <p className="mt-8 text-[14px] text-muted">
              No services available right now.
            </p>
          ) : (
            <div className="mt-8 grid gap-4">
              {services.map((s) => (
                <div
                  key={s.service_id}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e5ea] bg-white p-5 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-md transition-all"
                >
                  <div>
                    <h2 className="text-[18px] font-semibold text-foreground">
                      {s.service_name}
                    </h2>
                    <p className="mt-1 text-[14px] text-muted">
                      {s.description} · ~{s.expected_duration} min
                    </p>
                  </div>

                  <button
                    onClick={() => handleJoin(s)}
                    disabled={joiningId === s.service_id}
                    className="rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    {joiningId === s.service_id ? "Joining..." : "Join Queue"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}