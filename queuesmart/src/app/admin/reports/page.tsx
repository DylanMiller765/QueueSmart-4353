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
    // just hits the csv endpoint, browser handles the download
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

      <p className="text-xs text-gray-400 mt-6">
        Last updated: {new Date(stats.generated_at).toLocaleString()}
      </p>
    </div>
  );
}