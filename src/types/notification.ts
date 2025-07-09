// // src/types/notification.ts
// export interface FrontendNotification {
//   id: string;
//   studentId: string;
//   studentName: string;
//   rfidTag: string;
//   type: 'checkin' | 'checkout';
//   timestamp: Date;
//   location: string;
//   status: 'success' | 'failed';
//   message: string;
//   isLate: boolean;
//   lateMinutes: number;
//   workDurationHours: number | null;
//   attendanceStatus: string | null;
//   notes?: string;
//   read?: boolean;
//   createdAt?: Date;
// }

// export interface NotificationResponse {
//   success: boolean;
//   data: FrontendNotification[];
//   count: number;
//   timestamp: string;
//   message?: string;
// }

// export interface NotificationApiResponse {
//   success: boolean;
//   message: string;
//   timestamp: string;
// }

// export interface NotificationContextType {
//   notifications: FrontendNotification[];
//   unreadCount: number;
//   isLoading: boolean;
//   error: string | null;
//   isPolling: boolean;
//   fetchNotifications: () => Promise<void>;
//   markAsRead: (id: string) => Promise<void>;
//   clearAll: () => Promise<void>;
//   startPolling: () => void;
//   stopPolling: () => void;
// }
