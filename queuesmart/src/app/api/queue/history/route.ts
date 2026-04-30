import { getEntriesByUser } from "@/lib/queueStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json(
      { message: "userId is required" },
      { status: 400 }
    );
  }

  try {
    const entries = await getEntriesByUser(userId);
    return Response.json({ entries });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load history";
    return Response.json({ error: msg }, { status: 500 });
  }
}