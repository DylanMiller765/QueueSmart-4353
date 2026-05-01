import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { buildNotificationMessage, validateNotificationInput } from "@/lib/queue-logic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId || !userId.trim()) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, type, serviceName, position } = body;

  const errors = validateNotificationInput({ userId, type, serviceName });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { title, message, notifType } = buildNotificationMessage(type, serviceName, position);

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      message,
      type: notifType,
      status: "unread",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[NOTIFICATION] ${data.created_at} — ${message}`);
  return NextResponse.json({ success: true, notification: data }, { status: 201 });
}
