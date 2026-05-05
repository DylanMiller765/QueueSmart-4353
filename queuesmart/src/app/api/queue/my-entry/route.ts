import { getEntriesByUser } from "@/lib/queueStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ message: "userId is required" }, { status: 400 });
  }

  try {
    const entries = await getEntriesByUser(userId);
    const active = entries.find(
      (e) => e.status === "waiting" || e.status === "serving"
    );

    if (!active) {
      return Response.json({ entry: null });
    }

    return Response.json({ entry: active });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load entry";
    return Response.json({ error: msg }, { status: 500 });
  }
}
