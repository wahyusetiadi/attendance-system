// src/service/notification.service.ts
class NotificationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();

    return fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });
  }

  async getNotifications(limit: number = 10): Promise<any[]> {
    try {
      const response = await this.fetchWithAuth(`/api/notifications?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async clearNotifications(): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth('/api/notifications', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
