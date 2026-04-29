import { NextRequest, NextResponse } from "next/server";
import { estimateSmartWaitTime, seedHistory } from "@/lib/queue-logic";

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

  const result = estimateSmartWaitTime(
    position,
    serviceName,
    seedHistory,
    fallbackDuration
  );

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
