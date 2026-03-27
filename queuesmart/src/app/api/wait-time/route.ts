import { NextRequest, NextResponse } from "next/server";
import { estimateWaitTime } from "@/lib/queue-logic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position");
  const duration = searchParams.get("duration");

  if (!position || !duration) {
    return NextResponse.json(
      { error: "position and duration are required" },
      { status: 400 }
    );
  }

  const pos = parseInt(position);
  const dur = parseInt(duration);

  if (isNaN(pos) || isNaN(dur)) {
    return NextResponse.json(
      { error: "position and duration must be numbers" },
      { status: 400 }
    );
  }

  if (pos < 1) {
    return NextResponse.json(
      { error: "position must be at least 1" },
      { status: 400 }
    );
  }

  if (dur < 1) {
    return NextResponse.json(
      { error: "duration must be at least 1 minute" },
      { status: 400 }
    );
  }

  const estimatedWaitMinutes = estimateWaitTime(pos, dur);

  return NextResponse.json({
    position: pos,
    serviceDuration: dur,
    estimatedWaitMinutes,
    message: `Estimated wait time is ${estimatedWaitMinutes} minutes`,
  });
}