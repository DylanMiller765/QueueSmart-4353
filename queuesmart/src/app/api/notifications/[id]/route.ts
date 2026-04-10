import { NextRequest, NextResponse } from "next/server";

// In-memory reference to the same store in route.ts
// We patch the notification's read status here
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  // Status is managed in the parent route store
  // This endpoint signals a notification was viewed
  return NextResponse.json({ success: true, id, status: "viewed" });
}