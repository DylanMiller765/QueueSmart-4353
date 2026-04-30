import { getServiceSupabase } from "../../../../../../lib/supabase";

function csvField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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

    const headers = [
      "User ID",
      "Service",
      "Status",
      "Joined At",
      "Served At",
      "Wait Time (minutes)",
    ];

    const rows = entries.map((e) =>
      [
        e.user_id,
        e.service_name,
        e.status,
        e.joined_at,
        e.served_at ?? "",
        e.wait_time_minutes ?? "",
      ]
        .map(csvField)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const today = new Date().toISOString().split("T")[0];
    const filename = `queuesmart-user-history-${today}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate CSV";
    return Response.json({ error: msg }, { status: 500 });
  }
}