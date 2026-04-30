import { getActiveEntriesByService } from "@/lib/queueStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceId = url.searchParams.get("service_id");

  if (!serviceId) {
    return Response.json(
      { message: "service_id is required" },
      { status: 400 }
    );
  }

  try {
    const entries = await getActiveEntriesByService(Number(serviceId));
    return Response.json({ entries });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load entries";
    return Response.json({ error: msg }, { status: 500 });
  }
}