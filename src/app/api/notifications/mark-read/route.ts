// // src/app/api/notifications/mark-read/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(request: NextRequest) {
//   try {
//     const { id } = await request.json();

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'Notification ID is required' },
//         { status: 400 }
//       );
//     }

//     // Untuk sementara, kita hanya return success
//     // Karena backend tidak memiliki endpoint mark-read individual
//     return NextResponse.json({
//       success: true,
//       message: 'Notification marked as read',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Error marking notification as read',
//         timestamp: new Date().toISOString()
//       },
//       { status: 500 }
//     );
//   }
// }
