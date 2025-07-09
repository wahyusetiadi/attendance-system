// // src/lib/rabbitmqConsumer.ts
// import amqp from 'amqplib';

// // Shared storage untuk notifications
// export let pendingNotifications: any[] = [];

// export class RabbitMQConsumer {
//   private connection: any = null;
//   private channel: any = null;
//   private isConnected: boolean = false;
//   private reconnectAttempts: number = 0;
//   private maxReconnectAttempts: number = 5;
//   private reconnectTimeout: NodeJS.Timeout | null = null;

//   async connect() {
//     try {
//       const rabbitMQUrl = process.env.NEXT_PUBLIC_RABBITMQ_URL || 'amqp://localhost:5672';
//       console.log('🔌 Frontend connecting to RabbitMQ:', rabbitMQUrl);

//       this.connection = await amqp.connect(rabbitMQUrl);
//       this.channel = await this.connection.createChannel();

//       // Error handlers dengan auto-reconnect
//       this.connection.on('error', (err: Error) => {
//         console.error('❌ RabbitMQ Frontend connection error:', err);
//         this.isConnected = false;
//         this.handleReconnect();
//       });

//       this.connection.on('close', () => {
//         console.warn('⚠️ RabbitMQ Frontend connection closed');
//         this.isConnected = false;
//         this.handleReconnect();
//       });

//       this.isConnected = true;
//       this.reconnectAttempts = 0;
//       console.log('✅ Frontend connected to RabbitMQ successfully');

//       // Set up queue
//       await this.setupQueue();
//     } catch (error) {
//       console.error('❌ Frontend RabbitMQ connection failed:', error);
//       this.handleReconnect();
//     }
//   }

//   private async handleReconnect() {
//     if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//       console.error('❌ Max reconnect attempts reached. Stopping reconnection.');
//       return;
//     }

//     this.reconnectAttempts++;
//     const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff

//     console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

//     this.reconnectTimeout = setTimeout(() => {
//       this.connect();
//     }, delay);
//   }

//   async setupQueue() {
//     if (!this.channel) {
//       throw new Error('RabbitMQ channel not initialized');
//     }

//     try {
//       // Declare exchange dan queue yang SAMA dengan backend
//       await this.channel.assertExchange('attendance_exchange', 'topic', { durable: true });
//       await this.channel.assertQueue('attendance_notifications', { durable: true });
//       await this.channel.bindQueue('attendance_notifications', 'attendance_exchange', 'attendance.*');

//       // Set prefetch untuk better performance
//       await this.channel.prefetch(10);

//       console.log('👂 Frontend listening for attendance notifications...');

//       // Consume messages
//       await this.channel.consume('attendance_notifications', async (msg: any) => {
//         if (msg) {
//           try {
//             const backendNotification = JSON.parse(msg.content.toString());
//             console.log('📨 Backend notification received:', backendNotification);

//             // Transform backend notification ke format frontend
//             const frontendNotification = this.transformBackendNotification(backendNotification);

//             console.log('✅ Transformed notification:', frontendNotification);

//             // Check for duplicates
//             const exists = pendingNotifications.some(n => n.id === frontendNotification.id);
//             if (!exists) {
//               pendingNotifications.push(frontendNotification);
//               console.log('➕ Notification added:', frontendNotification.studentName, frontendNotification.type);
//               console.log('📊 Total pending notifications:', pendingNotifications.length);
//             } else {
//               console.log('⚠️ Duplicate notification ignored:', frontendNotification.id);
//             }

//             // Acknowledge message
//             this.channel.ack(msg);
//           } catch (error) {
//             console.error('❌ Error processing RabbitMQ notification:', error);
//             if (this.channel) {
//               this.channel.nack(msg, false, false);
//             }
//           }
//         }
//       });
//     } catch (error) {
//       console.error('❌ Error setting up RabbitMQ queue:', error);
//       throw error;
//     }
//   }

//   private transformBackendNotification(backendData: any) {
//     // Backend menggunakan struktur AttendanceNotification
//     return {
//       id: backendData.id || `rabbitmq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//       studentId: backendData.teacherId,
//       studentName: backendData.teacherName,
//       rfidTag: backendData.rfidUid,
//       type: this.mapNotificationType(backendData.type),
//       timestamp: new Date(backendData.timestamp),
//       location: backendData.location || 'Unknown Location',
//       status: backendData.status || 'success',
//       message: backendData.message,
//       isLate: backendData.isLate || false,
//       lateMinutes: backendData.lateMinutes || 0,
//       workDurationHours: backendData.workDurationHours,
//       attendanceStatus: backendData.attendanceStatus,
//       notes: backendData.notes
//     };
//   }

//   private mapNotificationType(backendType: string): 'checkin' | 'checkout' {
//     switch (backendType) {
//       case 'check-in':
//       case 'manual-create':
//         return 'checkin';
//       case 'check-out':
//       case 'status-update':
//         return 'checkout';
//       default:
//         return 'checkin';
//     }
//   }

//   async disconnect() {
//     try {
//       if (this.reconnectTimeout) {
//         clearTimeout(this.reconnectTimeout);
//         this.reconnectTimeout = null;
//       }

//       if (this.channel) {
//         await this.channel.close();
//       }
//       if (this.connection) {
//         await this.connection.close();
//       }
//       this.isConnected = false;
//       console.log('✅ Frontend disconnected from RabbitMQ');
//     } catch (error) {
//       console.error('❌ Error disconnecting from RabbitMQ:', error);
//     }
//   }

//   getConnectionStatus(): boolean {
//     return this.isConnected;
//   }

//   // Method untuk get notifications (digunakan untuk polling)
//   getNotifications(): any[] {
//     return [...pendingNotifications];
//   }

//   // Method untuk clear notifications
//   clearNotifications(): void {
//     pendingNotifications = [];
//   }
// }

// // Function untuk remove notifications yang sudah dibaca
// export function removeNotificationsFromPending(notificationIds: string[]) {
//   const initialCount = pendingNotifications.length;

//   pendingNotifications = pendingNotifications.filter(
//     notification => !notificationIds.includes(notification.id)
//   );

//   const removedCount = initialCount - pendingNotifications.length;
//   console.log(`✅ ${removedCount} notifications removed from RabbitMQ pending list`);

//   return removedCount;
// }

// // Export instance
// export const rabbitMQConsumer = new RabbitMQConsumer();
