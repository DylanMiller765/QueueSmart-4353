import { queue } from "@/lib/store";

export async function POST() {
  if (queue.length === 0) {
    return Response.json(
      { message: "Queue is empty" },
      { status: 404 }
    );
  }

  const servedUser = queue.shift();

  return Response.json(
    {
      message: "Next user served successfully",
      servedUser,
      queue,
    },
    { status: 200 }
  );
}