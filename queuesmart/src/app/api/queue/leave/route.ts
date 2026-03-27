import { queue } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId } = body;

  if (!userId) {
    return Response.json(
      { message: "userId is required" },
      { status: 400 }
    );
  }

  const index = queue.findIndex((entry) => entry.userId === userId);

  if (index === -1) {
    return Response.json(
      { message: "User not found in queue" },
      { status: 404 }
    );
  }

  const removedUser = queue.splice(index, 1)[0];

  return Response.json(
    {
      message: "User left the queue successfully",
      removedUser,
      queue,
    },
    { status: 200 }
  );
}