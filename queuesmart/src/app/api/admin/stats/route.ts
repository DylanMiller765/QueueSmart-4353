import { getAllEntries } from "@/lib/queueStore";

export async function GET() {
  try {
    const entries = await getAllEntries();

    // only people who actually got served count toward stats
    const completed = entries.filter((e) => e.status === "completed");

    const totalUsersServed = completed.length;

    // avg wait across everyone served
    const totalWait = completed.reduce(
      (sum, e) => sum + (e.wait_time_minutes ?? 0),
      0
    );
    const avgWaitTime =
      totalUsersServed > 0 ? Math.round(totalWait / totalUsersServed) : 0;

    // per service breakdown
    const byService: Record<string, { service_name: string; users_served: number; avg_wait_time: number }> = {};

    for (const entry of completed) {
      const key = entry.service_name;
      if (!byService[key]) {
        byService[key] = {
          service_name: entry.service_name,
          users_served: 0,
          avg_wait_time: 0,
        };
      }
      byService[key].users_served += 1;
      byService[key].avg_wait_time += entry.wait_time_minutes ?? 0;
    }

    // turn the running totals into actual averages
    const perService = Object.values(byService).map((s) => ({
      ...s,
      avg_wait_time: Math.round(s.avg_wait_time / s.users_served),
    }));

    // also include cancelled + no-show counts for context
    const cancelled = entries.filter((e) => e.status === "cancelled").length;
    const noShow = entries.filter((e) => e.status === "no-show").length;
    const stillWaiting = entries.filter(
      (e) => e.status === "waiting" || e.status === "serving"
    ).length;

    return Response.json({
      total_users_served: totalUsersServed,
      avg_wait_time_minutes: avgWaitTime,
      cancelled_count: cancelled,
      no_show_count: noShow,
      currently_in_queue: stillWaiting,
      per_service: perService,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load stats";
    return Response.json({ error: msg }, { status: 500 });
  }
}