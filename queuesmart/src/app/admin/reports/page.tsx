"use client";
import { useEffect, useState } from "react";

interface PerService {
  service_name: string;
  users_served: number;
  avg_wait_time: number;
}

interface Stats {
  total_users_served: number;
  avg_wait_time_minutes: number;
  cancelled_count: number;
  no_show_count: number;
  currently_in_queue: number;
  per_service: PerService[];
  generated_at: string;
}

interface ServiceActivity {
  service_id: number;
  service_name: string;
  description: string;
  expected_duration: number;
  priority_level: string;
  is_active: boolean;
  total_visits: number;
  completed: number;
  currently_waiting: number;
  cancelled: number;
  no_show: number;
  avg_wait_minutes: number;
}

interface UserHistory {
  user_id: string;
  total_visits: number;
  completed: number;
  cancelled: number;
  avg_wait_minutes: number;
  services: string[];
  last_visit: string;
}

function ServiceActivitySection() {
  const [services, setServices] = useState<ServiceActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border rounded-xl p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Service Details & Queue Activity</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading service activity...</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-gray-500">No services found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 uppercase text-xs">
              <th className="pb-2">Service</th>
              <th className="pb-2">Priority</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2 text-right">Waiting Now</th>
              <th className="pb-2 text-right">Completed</th>
              <th className="pb-2 text-right">Cancelled</th>
              <th className="pb-2 text-right">Avg Wait</th>
              <th className="pb-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.service_id} className="border-b last:border-0">
                <td className="py-3">
                  <p className="font-medium">{s.service_name}</p>
                  <p className="text-xs text-gray-400">{s.description}</p>
                </td>
                <td className="py-3 capitalize">{s.priority_level}</td>
                <td className="py-3">{s.expected_duration} min</td>
                <td className="py-3 text-right font-semibold">{s.currently_waiting}</td>
                <td className="py-3 text-right text-green-600">{s.completed}</td>
                <td className="py-3 text-right text-red-500">{s.cancelled}</td>
                <td className="py-3 text-right">{s.avg_wait_minutes} min</td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UserHistorySection() {
  const [users, setUsers] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports/history")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function downloadHistoryCSV() {
    window.location.href = "/api/admin/reports/history/csv";
  }

  return (
    <div className="bg-white border rounded-xl p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">User Queue Participation History</h2>
        <button
          onClick={downloadHistoryCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Download History CSV
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Loading user history...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500">No user history available yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 uppercase text-xs">
              <th className="pb-2">User ID</th>
              <th className="pb-2 text-right">Total Visits</th>
              <th className="pb-2 text-right">Completed</th>
              <th className="pb-2 text-right">Cancelled</th>
              <th className="pb-2 text-right">Avg Wait (min)</th>
              <th className="pb-2">Services Used</th>
              <th className="pb-2">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-b last:border-0">
                <td className="py-3 font-mono text-xs">{u.user_id.slice(0, 8)}...</td>
                <td className="py-3 text-right">{u.total_visits}</td>
                <td className="py-3 text-right text-green-600">{u.completed}</td>
                <td className="py-3 text-right text-red-500">{u.cancelled}</td>
                <td className="py-3 text-right">{u.avg_wait_minutes}</td>
                <td className="py-3 text-xs text-gray-500">{u.services.join(", ")}</td>
                <td className="py-3 text-xs text-gray-500">
                  {new Date(u.last_visit).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function downloadCSV() {
    window.location.href = "/api/admin/reports/csv";
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Queue usage statistics and activity
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium"
        >
          Download CSV
        </button>
      </div>

      {/* Top stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total Users Served
          </p>
          <p className="text-4xl font-bold mt-2">
            {stats.total_users_served}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Average Wait Time
          </p>
          <p className="text-4xl font-bold mt-2">
            {stats.avg_wait_time_minutes}
            <span className="text-lg font-normal text-gray-500 ml-1">min</span>
          </p>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Currently In Queue
          </p>
          <p className="text-4xl font-bold mt-2">
            {stats.currently_in_queue}
          </p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Cancelled
          </p>
          <p className="text-2xl font-semibold mt-1">{stats.cancelled_count}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            No-Show
          </p>
          <p className="text-2xl font-semibold mt-1">{stats.no_show_count}</p>
        </div>
      </div>

      {/* Per-service breakdown */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">By Service</h2>
        {stats.per_service.length === 0 ? (
          <p className="text-sm text-gray-500">
            No completed entries yet. Stats will show up here after admins
            serve users.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 uppercase text-xs">
                <th className="pb-2">Service</th>
                <th className="pb-2 text-right">Users Served</th>
                <th className="pb-2 text-right">Avg Wait (min)</th>
              </tr>
            </thead>
            <tbody>
              {stats.per_service.map((s) => (
                <tr key={s.service_name} className="border-b last:border-0">
                  <td className="py-3">{s.service_name}</td>
                  <td className="py-3 text-right">{s.users_served}</td>
                  <td className="py-3 text-right">{s.avg_wait_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Service Details & Queue Activity */}
      <ServiceActivitySection />

      {/* User Participation History */}
      <UserHistorySection />

      <p className="text-xs text-gray-400 mt-6">
        Last updated: {new Date(stats.generated_at).toLocaleString()}
      </p>
    </div>
  );
}