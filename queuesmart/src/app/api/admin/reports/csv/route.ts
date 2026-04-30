import { getAllEntries } from "@/lib/queueStore";

// turn one row into a csv line, escape commas/quotes/newlines
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
    const startDate = url.searchParams.get("start"); // optional ?start=2026-04-01
    const endDate = url.searchParams.get("end");     // optional ?end=2026-04-30
    const serviceFilter = url.searchParams.get("service"); // optional ?service=Passport+Renewal

    let entries = await getAllEntries();

    // apply optional filters
    if (startDate) {
      entries = entries.filter((e) => e.joined_at >= startDate);
    }
    if (endDate) {
      entries = entries.filter((e) => e.joined_at <= endDate);
    }
    if (serviceFilter) {
      entries = entries.filter(
        (e) => e.service_name.toLowerCase() === serviceFilter.toLowerCase()
      );
    }

    // build the csv
    const headers = [
      "Entry ID",
      "User ID",
      "Service",
      "Position",
      "Status",
      "Joined At",
      "Served At",
      "Wait Time (minutes)",
    ];

    const rows = entries.map((e) =>
      [
        e.id,
        e.user_id,
        e.service_name,
        e.position,
        e.status,
        e.joined_at,
        e.served_at ?? "",
        e.wait_time_minutes ?? "",
      ]
        .map(csvField)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    // filename with today's date
    const today = new Date().toISOString().split("T")[0];
    const filename = `queuesmart-report-${today}.csv`;

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