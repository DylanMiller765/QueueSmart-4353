import { serveNext } from "@/lib/queueStore";

export async function POST(req: Request) {
  const body = await req.json();
  const { serviceId } = body;

  if (!serviceId) {
    return Response.json(
      { message: "serviceId is required" },
      { status: 400 }
    );
  }

  const served = await serveNext(Number(serviceId));

  if (!served) {
    return Response.json(
      { message: "Queue is empty" },
      { status: 404 }
    );
  }

  return Response.json(
    { message: "Next user served successfully", servedUser: served },
    { status: 200 }
  );
}