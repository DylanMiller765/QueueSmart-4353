import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/types";
import { buildNotificationMessage, validateNotificationInput, seedNotifications } from "@/lib/queue-logic";

const notificationStore: Notification[] = [...seedNotifications];
let nextId = notificationStore.length + 1;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId || !userId.trim()) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({ notifications: notificationStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, type, serviceName, position } = body;

  const errors = validateNotificationInput({ userId, type, serviceName });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { title, message, notifType } = buildNotificationMessage(
    type,
    serviceName,
    position
  );

  const notification: Notification = {
    id: `nl${nextId++}`,
    title,
    message,
    type: notifType,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notificationStore.push(notification);
  console.log(`[NOTIFICATION] ${notification.createdAt} — ${message}`);

  return NextResponse.json({ success: true, notification }, { status: 201 });
}