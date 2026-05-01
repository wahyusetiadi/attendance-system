// src/app/api/notifications/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

declare global {
  // eslint-disable-next-line no-var
  var pendingNotifications: Array<Record<string, unknown>> | undefined;
}

// Inisialisasi global storage
if (!global.pendingNotifications) {
  global.pendingNotifications = [];
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === WEBHOOK CALLED ===');
    console.log('📋 Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('🌐 Request URL:', request.url);
    console.log('📊 Current pending notifications count:', global.pendingNotifications?.length || 0);

    const rawBody = await request.text();
    console.log('📦 Raw request body:', rawBody);

    let notification;
    try {
      notification = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    console.log('📨 Parsed notification data:', notification);

    // Tambahkan timestamp untuk ID yang lebih unik
    const uniqueId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const formattedNotification: Record<string, unknown> = {
      id: notification.id || uniqueId,
      studentId: notification.studentId || notification.teacherId,
      studentName: notification.studentName || notification.teacherName,
      rfidTag: notification.rfidTag,
      type: notification.type,
      timestamp: notification.timestamp || new Date().toISOString(),
      location: notification.location || 'Unknown Location',
      status: notification.status || 'success',
      message: notification.message,
      isLate: notification.isLate || false,
      lateMinutes: notification.lateMinutes || 0,
      workDurationHours: notification.workDurationHours,
      attendanceStatus: notification.attendanceStatus
    };

    console.log('✅ Formatted notification:', formattedNotification);

    // Tambahkan ke global storage tanpa duplikasi check dulu untuk debugging
    global.pendingNotifications!.push(formattedNotification);

    console.log('📈 Notification added. Total notifications:', global.pendingNotifications!.length);
    console.log(
      '📝 All pending notifications:',
      global.pendingNotifications!.map((n) => ({
        id: n.id,
        studentName: n.studentName,
        type: n.type,
        timestamp: n.timestamp,
      }))
    );

    return NextResponse.json({
      success: true,
      message: 'Notification received successfully',
      notificationId: formattedNotification.id,
      totalPending: global.pendingNotifications!.length
    });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method untuk debugging - lihat semua notifikasi yang tersimpan
export async function GET() {
  console.log('🔍 GET /api/notifications/webhook called');
  console.log('📊 Total stored notifications:', global.pendingNotifications?.length || 0);

  return NextResponse.json({
    success: true,
    pendingNotifications: global.pendingNotifications || [],
    count: global.pendingNotifications?.length || 0,
    timestamp: new Date().toISOString()
  });
}
