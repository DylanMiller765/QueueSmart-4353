import { NextRequest, NextResponse } from "next/server";
import { QueueHistory } from "@/types";
import { createHistoryEntry, updateHistoryEntry, validateHistoryInput, seedHistory } from "@/lib/queue-logic";

const historyStore: QueueHistory[] = [...seedHistory];
let nextId = historyStore.length + 1;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId || !userId.trim()) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const sorted = [...historyStore].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json({ history: sorted });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, serviceName } = body;

  const errors = validateHistoryInput({ userId, serviceName });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const entry = createHistoryEntry(`h${nextId++}`, serviceName);
  historyStore.push(entry);

  return NextResponse.json({ success: true, entry }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, waitTime } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!status || !["completed", "cancelled", "no-show"].includes(status)) {
    return NextResponse.json(
      { error: "status must be 'completed', 'cancelled', or 'no-show'" },
      { status: 400 }
    );
  }

  const entry = historyStore.find((h) => h.id === id);

  if (!entry) {
    return NextResponse.json(
      { error: "History entry not found" },
      { status: 404 }
    );
  }

  const updated = updateHistoryEntry(entry, status, waitTime ?? 0);
  Object.assign(entry, updated);

  return NextResponse.json({ success: true, entry });
}