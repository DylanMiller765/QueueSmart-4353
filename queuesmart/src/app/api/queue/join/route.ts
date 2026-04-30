import { joinQueue, getActiveEntriesByService } from "@/lib/queueStore";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, serviceId, serviceName } = body;

  if (!userId || !serviceId || !serviceName) {
    return Response.json(
      { message: "userId, serviceId, and serviceName are required" },
      { status: 400 }
    );
  }

  // check if they're already in this queue
  const active = await getActiveEntriesByService(Number(serviceId));
  const alreadyIn = active.find((e) => e.user_id === userId);

  if (alreadyIn) {
    return Response.json(
      { message: "User is already in the queue" },
      { status: 400 }
    );
  }

  try {
    const entry = await joinQueue({
      user_id: userId,
      service_id: Number(serviceId),
      service_name: serviceName,
    });

    return Response.json(
      { message: "User joined the queue successfully", entry },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to join queue";
    return Response.json({ message: msg }, { status: 500 });
  }
}