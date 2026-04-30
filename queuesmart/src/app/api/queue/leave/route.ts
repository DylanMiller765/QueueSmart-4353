import { leaveQueue, getEntriesByUser } from "@/lib/queueStore";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = body;

  if (!userId) {
    return Response.json(
      { message: "userId is required" },
      { status: 400 }
    );
  }

  // find their active entry (waiting or serving)
  const userEntries = await getEntriesByUser(userId);
  const activeEntry = userEntries.find(
    (e) => e.status === "waiting" || e.status === "serving"
  );

  if (!activeEntry) {
    return Response.json(
      { message: "User not found in queue" },
      { status: 404 }
    );
  }

  const removed = await leaveQueue(activeEntry.id);

  if (!removed) {
    return Response.json(
      { message: "Failed to leave queue" },
      { status: 500 }
    );
  }

  return Response.json(
    { message: "User left the queue successfully", removedUser: removed },
    { status: 200 }
  );
}