import { NextRequest, NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var pendingNotifications: Array<Record<string, unknown>> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const list = global.pendingNotifications || [];
    const idx = list.findIndex((n) => n.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], read: true };
      global.pendingNotifications = list;
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error marking notification as read",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
