// src/service/notification.service.ts
import { getApiMode } from '@/lib/apiMode';

class NotificationService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();

    return fetch(endpoint, {
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
      // In demo/mock mode, only local Next route exists
      const endpoint = getApiMode() === 'mock'
        ? `/api/notifications/pending?limit=${limit}`
        : `/api/notifications?limit=${limit}`;

      const response = await this.fetchWithAuth(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const list = data.data || data.notifications || [];
        return list.map((notification: any) => ({
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
      const endpoint = getApiMode() === 'mock' ? '/api/notifications/pending' : '/api/notifications';
      const response = await this.fetchWithAuth(endpoint, {
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
