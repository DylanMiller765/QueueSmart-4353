import { NextRequest, NextResponse } from "next/server";
import {
  getAllQueues,
  getQueueByServiceId,
  createQueue,
  updateQueueStatus,
  validateQueueInput,
  validateUpdateInput,
} from "@/lib/queueStore";

// GET — fetch all queues or by service_id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("service_id");

  try {
    if (serviceId) {
      const queue = await getQueueByServiceId(serviceId);
      if (!queue) {
        return NextResponse.json(
          { error: "Queue not found for this service" },
          { status: 404 }
        );
      }
      return NextResponse.json({ queue });
    }

    const queues = await getAllQueues();
    return NextResponse.json({ queues });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch queues" },
      { status: 500 }
    );
  }
}

// POST — create a new queue for a service
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { service_id, status } = body;

  const errors = validateQueueInput({ service_id, status });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const queue = await createQueue({ service_id, status });
    return NextResponse.json({ success: true, queue }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create queue" },
      { status: 500 }
    );
  }
}

// PATCH — update queue status (open/closed)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const errors = validateUpdateInput({ status });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const queue = await updateQueueStatus(id, status);
    if (!queue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, queue });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update queue" },
      { status: 500 }
    );
  }
}