import { NextRequest, NextResponse } from "next/server";
import { estimateSmartWaitTime, seedHistory } from "@/lib/queue-logic";
import { getServiceSupabase } from "@/lib/supabase";
import { QueueHistory } from "@/types";

async function getHistoryFromDB(serviceName: string): Promise<QueueHistory[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("queue_entries")
    .select("id, service_name, joined_at, status, wait_time_minutes")
    .eq("service_name", serviceName)
    .eq("status", "completed")
    .not("wait_time_minutes", "is", null);

  if (error || !data || data.length === 0) return [];

  return data.map((row) => ({
    id: row.id,
    serviceName: row.service_name,
    date: row.joined_at.split("T")[0],
    status: "completed" as const,
    waitTime: row.wait_time_minutes ?? 0,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const positionParam = searchParams.get("position");
  const serviceName = searchParams.get("serviceName");
  const durationParam = searchParams.get("duration");

  if (!positionParam || !serviceName) {
    return NextResponse.json(
      { error: "position and serviceName are required" },
      { status: 400 }
    );
  }

  const position = parseInt(positionParam);
  const fallbackDuration = durationParam ? parseInt(durationParam) : 5;

  if (isNaN(position) || position < 1) {
    return NextResponse.json(
      { error: "position must be a positive integer" },
      { status: 400 }
    );
  }

  if (isNaN(fallbackDuration) || fallbackDuration < 1) {
    return NextResponse.json(
      { error: "duration must be at least 1 minute" },
      { status: 400 }
    );
  }

  // use real DB data, fall back to seed if DB has nothing yet
  const dbHistory = await getHistoryFromDB(serviceName);
  const history = dbHistory.length > 0 ? dbHistory : seedHistory;

  const result = estimateSmartWaitTime(position, serviceName, history, fallbackDuration);

  return NextResponse.json({
    serviceName,
    position,
    ...result,
    message:
      result.basedOn === "history"
        ? `Based on ${result.sampleSize} past visits (${result.confidence} confidence): ~${result.estimatedWaitMinutes} min`
        : `No history yet — using default estimate: ~${result.estimatedWaitMinutes} min`,
  });
}
