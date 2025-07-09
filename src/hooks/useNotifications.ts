// // src/hooks/useNotifications.ts
// import { useState, useEffect, useCallback, useRef } from "react";
// import { FrontendNotification } from "@/types/notification";

// interface UseNotificationsOptions {
//   pollInterval?: number;
//   maxNotifications?: number;
//   autoStart?: boolean;
// }

// interface UseNotificationsReturn {
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

// export function useNotifications(
//   options: UseNotificationsOptions = {}
// ): UseNotificationsReturn {
//   const {
//     pollInterval = 3000,
//     maxNotifications = 15,
//     autoStart = true,
//   } = options;

//   const [notifications, setNotifications] = useState<FrontendNotification[]>(
//     []
//   );
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isPolling, setIsPolling] = useState<boolean>(false);
//   const [readNotifications, setReadNotifications] = useState<Set<string>>(
//     new Set()
//   );

//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const isComponentMounted = useRef(true);

//   // Update your fetchNotifications function
//   const fetchNotifications = useCallback(async () => {
//     if (!isComponentMounted.current) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       // Get auth token (adjust based on your auth implementation)
//       const token =
//         localStorage.getItem("token") ||
//         sessionStorage.getItem("authToken") ||
//         document.cookie
//           .split("; ")
//           .find((row) => row.startsWith("token="))
//           ?.split("=")[1];

//       const response = await fetch(
//         `/api/notifications/pending?limit=${maxNotifications}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log('response', response);

//       if (!response.ok) {
//         if (response.status === 401) {
//           setError("Authentication failed. Please login again.");
//           return;
//         }
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (isComponentMounted.current) {
//         if (data.success) {
//           const formattedNotifications = data.data.map((notification: any) => ({
//             ...notification,
//             timestamp: new Date(notification.timestamp),
//             read: readNotifications.has(notification.id),
//           }));
//           setNotifications(formattedNotifications);
//         } else {
//           setError(data.message || "Failed to fetch notifications");
//         }
//       }
//     } catch (err) {
//       if (isComponentMounted.current) {
//         setError(err instanceof Error ? err.message : "Unknown error");
//       }
//     } finally {
//       if (isComponentMounted.current) {
//         setIsLoading(false);
//       }
//     }
//   }, [maxNotifications, readNotifications]);

//   const markAsRead = useCallback(async (id: string) => {
//     try {
//       const response = await fetch("/api/notifications/mark-read", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ id }),
//       });

//       if (response.ok) {
//         setReadNotifications((prev) => new Set(prev).add(id));
//         setNotifications((prev) =>
//           prev.map((notification) =>
//             notification.id === id
//               ? { ...notification, read: true }
//               : notification
//           )
//         );
//       }
//     } catch (err) {
//       console.error("Error marking notification as read:", err);
//     }
//   }, []);

//   const clearAll = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/notifications/pending", {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         setNotifications([]);
//         setReadNotifications(new Set());
//       } else {
//         throw new Error("Failed to clear notifications");
//       }
//     } catch (err) {
//       if (isComponentMounted.current) {
//         setError(
//           err instanceof Error ? err.message : "Failed to clear notifications"
//         );
//       }
//     } finally {
//       if (isComponentMounted.current) {
//         setIsLoading(false);
//       }
//     }
//   }, []);

//   const startPolling = useCallback(() => {
//     if (intervalRef.current) return;

//     setIsPolling(true);
//     fetchNotifications();

//     intervalRef.current = setInterval(() => {
//       fetchNotifications();
//     }, pollInterval);
//   }, [fetchNotifications, pollInterval]);

//   const stopPolling = useCallback(() => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     setIsPolling(false);
//   }, []);

//   // Calculate unread count
//   const unreadCount = notifications.filter((n) => !n.read).length;

//   useEffect(() => {
//     if (autoStart) {
//       startPolling();
//     }

//     return () => {
//       isComponentMounted.current = false;
//       stopPolling();
//     };
//   }, [autoStart, startPolling, stopPolling]);

//   return {
//     notifications,
//     unreadCount,
//     isLoading,
//     error,
//     isPolling,
//     fetchNotifications,
//     markAsRead,
//     clearAll,
//     startPolling,
//     stopPolling,
//   };
// }
