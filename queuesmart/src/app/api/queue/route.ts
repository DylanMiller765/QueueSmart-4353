import { queue } from "@/lib/store";

export async function GET() {
  return Response.json(
    {
      queue,
    },
    { status: 200 }
  );
}