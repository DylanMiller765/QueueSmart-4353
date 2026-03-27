import { queue } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, serviceId, priority } = body;

  if (!userId || !serviceId) {
    return Response.json(
      { message: "userId and serviceId are required" },
      { status: 400 }
    );
  }

  const alreadyInQueue = queue.find((entry) => entry.userId === userId);

  if (alreadyInQueue) {
    return Response.json(
      { message: "User is already in the queue" },
      { status: 400 }
    );
  }

  const newEntry = {
    id: queue.length + 1,
    userId,
    serviceId,
    priority: priority ?? 1,
    timeJoined: Date.now(),
  };

  queue.push(newEntry);

  queue.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.timeJoined - b.timeJoined;
  });

  return Response.json(
    {
      message: "User joined the queue successfully",
      queue,
    },
    { status: 201 }
  );
}