import { NextRequest, NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var pendingNotifications: Array<Record<string, unknown>> | undefined;
}

function getStore() {
  if (!global.pendingNotifications) global.pendingNotifications = [];
  return global.pendingNotifications;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Number(searchParams.get("limit") || 15));

  const notifications = getStore()
      .slice()
      .sort((a, b) => new Date(String(b.timestamp)).getTime() - new Date(String(a.timestamp)).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      notifications,
      data: notifications,
      count: notifications.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching notifications",
        notifications: [],
        data: [],
        count: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    global.pendingNotifications = [];
    return NextResponse.json({
      success: true,
      message: "Notifications cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error clearing notifications",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
