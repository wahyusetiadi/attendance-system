// // src/app/api/notifications/pending/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const limit = parseInt(searchParams.get('limit') || '15');

//     // ✅ DATA DUMMY untuk testing
//     const dummyNotifications = [
//       {
//         id: '1',
//         studentId: 'STU001',
//         studentName: 'Ahmad Rizki',
//         rfidTag: 'RF001',
//         type: 'checkin',
//         timestamp: new Date().toISOString(), // Sekarang
//         location: 'Gerbang Utama',
//         status: 'success',
//         message: 'Check-in berhasil',
//         isLate: false,
//         lateMinutes: 0,
//         workDurationHours: null,
//         attendanceStatus: 'present',
//         read: false
//       },
//       {
//         id: '2',
//         studentId: 'STU002',
//         studentName: 'Siti Fatimah',
//         rfidTag: 'RF002',
//         type: 'checkin',
//         timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10 menit lalu
//         location: 'Gerbang Utama',
//         status: 'success',
//         message: 'Check-in terlambat',
//         isLate: true,
//         lateMinutes: 15,
//         workDurationHours: null,
//         attendanceStatus: 'late',
//         read: false
//       },
//       {
//         id: '3',
//         studentId: 'STU003',
//         studentName: 'Budi Santoso',
//         rfidTag: 'RF003',
//         type: 'checkout',
//         timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 menit lalu
//         location: 'Gerbang Utama',
//         status: 'success',
//         message: 'Check-out berhasil',
//         isLate: false,
//         lateMinutes: 0,
//         workDurationHours: 8,
//         attendanceStatus: 'present',
//         read: false
//       },
//       {
//         id: '4',
//         studentId: 'STU004',
//         studentName: 'Dewi Lestari',
//         rfidTag: 'RF004',
//         type: 'checkin',
//         timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 menit lalu
//         location: 'Gerbang Samping',
//         status: 'failed',
//         message: 'RFID tidak terdaftar',
//         isLate: false,
//         lateMinutes: 0,
//         workDurationHours: null,
//         attendanceStatus: 'failed',
//         read: false
//       },
//       {
//         id: '5',
//         studentId: 'STU005',
//         studentName: 'Andi Wijaya',
//         rfidTag: 'RF005',
//         type: 'checkout',
//         timestamp: new Date(Date.now() - 60 * 60000).toISOString(), // 1 jam lalu
//         location: 'Gerbang Utama',
//         status: 'success',
//         message: 'Check-out berhasil',
//         isLate: false,
//         lateMinutes: 0,
//         workDurationHours: 7.5,
//         attendanceStatus: 'present',
//         read: true // Sudah dibaca
//       }
//     ];

//     // ✅ Simulasi data yang berubah setiap polling
//     const randomizedNotifications = dummyNotifications.map(notif => ({
//       ...notif,
//       // Simulasi notifikasi baru dengan mengubah timestamp
//       timestamp: Math.random() > 0.7 ? new Date().toISOString() : notif.timestamp
//     }));

//     const limitedNotifications = randomizedNotifications.slice(0, limit);

//     return NextResponse.json({
//       success: true,
//       data: limitedNotifications,
//       count: limitedNotifications.length,
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Error fetching notifications',
//         data: [],
//         count: 0,
//         timestamp: new Date().toISOString()
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     // Mock successful deletion
//     return NextResponse.json({
//       success: true,
//       message: 'Notifications cleared successfully',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Error clearing notifications:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Error clearing notifications',
//         timestamp: new Date().toISOString()
//       },
//       { status: 500 }
//     );
//   }
// }
