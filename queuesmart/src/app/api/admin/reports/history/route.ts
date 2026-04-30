import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("start");
    const endDate = url.searchParams.get("end");
    const serviceFilter = url.searchParams.get("service");

    const supabase = getServiceSupabase();

    let query = supabase
      .from("queue_entries")
      .select("user_id, service_name, status, joined_at, served_at, wait_time_minutes")
      .order("joined_at", { ascending: false });

    if (startDate) query = query.gte("joined_at", startDate);
    if (endDate) query = query.lte("joined_at", endDate);
    if (serviceFilter) query = query.ilike("service_name", serviceFilter);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const entries = data ?? [];

    // group by user
    const userMap: Record<string, {
      user_id: string;
      total_visits: number;
      completed: number;
      cancelled: number;
      avg_wait_minutes: number;
      services: string[];
      last_visit: string;
    }> = {};

    for (const entry of entries) {
      if (!userMap[entry.user_id]) {
        userMap[entry.user_id] = {
          user_id: entry.user_id,
          total_visits: 0,
          completed: 0,
          cancelled: 0,
          avg_wait_minutes: 0,
          services: [],
          last_visit: entry.joined_at,
        };
      }

      const u = userMap[entry.user_id];
      u.total_visits++;
      if (entry.status === "completed") u.completed++;
      if (entry.status === "cancelled") u.cancelled++;
      if (!u.services.includes(entry.service_name)) {
        u.services.push(entry.service_name);
      }
      if (entry.joined_at > u.last_visit) u.last_visit = entry.joined_at;
    }

    // calculate avg wait per user
    for (const userId of Object.keys(userMap)) {
      const userEntries = entries.filter(
        (e) => e.user_id === userId && e.wait_time_minutes !== null
      );
      if (userEntries.length > 0) {
        const total = userEntries.reduce(
          (sum, e) => sum + (e.wait_time_minutes ?? 0), 0
        );
        userMap[userId].avg_wait_minutes = Math.round(total / userEntries.length);
      }
    }

    return Response.json({
      users: Object.values(userMap),
      total_users: Object.keys(userMap).length,
      generated_at: new Date().toISOString(),
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate history report";
    return Response.json({ error: msg }, { status: 500 });
  }
}