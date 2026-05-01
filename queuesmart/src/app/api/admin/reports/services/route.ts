import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("start");
    const endDate = url.searchParams.get("end");

    const supabase = getServiceSupabase();

    // Get all services from the service table
    const { data: services, error: servicesError } = await supabase
      .from("service")
      .select("service_id, service_name, description, expected_duration, priority_level, is_active")
      .order("service_id", { ascending: true });

    if (servicesError) throw new Error(servicesError.message);

    // Get all queue entries so we can calculate activity per service
    let query = supabase
      .from("queue_entries")
      .select("service_id, service_name, status, wait_time_minutes, joined_at");

    if (startDate) query = query.gte("joined_at", startDate);
    if (endDate) query = query.lte("joined_at", endDate);

    const { data: entries, error: entriesError } = await query;
    if (entriesError) throw new Error(entriesError.message);

    const allEntries = entries ?? [];

    // For each service, calculate its queue activity
    const result = (services ?? []).map((service) => {
      const serviceEntries = allEntries.filter(
        (e) => e.service_id === service.service_id
      );

      const completed = serviceEntries.filter((e) => e.status === "completed");
      const currentlyWaiting = serviceEntries.filter(
        (e) => e.status === "waiting" || e.status === "serving"
      ).length;
      const cancelled = serviceEntries.filter(
        (e) => e.status === "cancelled"
      ).length;
      const noShow = serviceEntries.filter(
        (e) => e.status === "no-show"
      ).length;

      const totalWait = completed.reduce(
        (sum, e) => sum + (e.wait_time_minutes ?? 0),
        0
      );
      const avgWait =
        completed.length > 0
          ? Math.round(totalWait / completed.length)
          : 0;

      return {
        service_id: service.service_id,
        service_name: service.service_name,
        description: service.description,
        expected_duration: service.expected_duration,
        priority_level: service.priority_level,
        is_active: service.is_active,
        total_visits: serviceEntries.length,
        completed: completed.length,
        currently_waiting: currentlyWaiting,
        cancelled,
        no_show: noShow,
        avg_wait_minutes: avgWait,
      };
    });

    return Response.json({
      services: result,
      total_services: result.length,
      active_services: result.filter((s) => s.is_active).length,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate service report";
    return Response.json({ error: msg }, { status: 500 });
  }
}