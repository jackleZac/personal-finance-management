import { createContext, useEffect, useState, ReactNode } from 'react';
import WebSocketService from '@/api/webSocketService';
import { useAuth } from '@/hooks/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processWebSocketNotification, registerForPushNotificationsAsync, setupNotificationHandlers } from '@/api/notificationApi';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'transaction' | 'summary' | 'recurring' | 'budget' | 'warning';
  created_at: string;
  data?: Record<string, any>;
}

interface NotificationContextType {
  isInitialized: boolean;
  notifications: Notification[];
  requestPermission: () => Promise<boolean>;
  clearNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
  isInitialized: false,
  notifications: [],
  requestPermission: async () => false,
  clearNotifications: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userId, token } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from AsyncStorage on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications');
        if (stored) {
          const parsed: Notification[] = JSON.parse(stored);
          parsed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setNotifications(parsed);
        }
      } catch (err) {
        console.error('Error loading notifications from AsyncStorage:', err);
      } finally {
        setIsInitialized(true);
      }
    };
    loadNotifications();
  }, []);

  // Initialize WebSocket and push notifications
  useEffect(() => {
    if (!token || !userId) return;

    // Initialize push notifications
    const initNotifications = async () => {
      const pushToken = await registerForPushNotificationsAsync(token);
      if (pushToken) {
        console.log('Push notifications initialized with token:', pushToken);
      }
    };
    initNotifications();

    // Setup notification handlers
    const cleanupHandlers = setupNotificationHandlers();

    // Initialize WebSocket for ML server (notifications)
    WebSocketService.initialize(token, true);

    // Handle WebSocket notifications
    const handleNotification = (data: any) => {
      const notification = processWebSocketNotification(data);
      if (notification) {
        setNotifications((prev) => {
          // Avoid duplicates by checking notification ID
          if (prev.some((n) => n.id === notification.id)) {
            return prev;
          }
          const updated = [notification, ...prev].slice(0, 100);
          AsyncStorage.setItem('notifications', JSON.stringify(updated)).catch((err) =>
            console.error('Error saving notifications:', err)
          );
          return updated;
        });
      }
    };

    // Listen for notification events
    WebSocketService.on('new_transaction_notification', handleNotification, true);
    WebSocketService.on('weekly_spending_summary', handleNotification, true);
    WebSocketService.on('budget_completion', handleNotification, true);
    WebSocketService.on('balance_shortfall_alert', handleNotification, true);

    return () => {
      cleanupHandlers();
      WebSocketService.off('new_transaction_notification', handleNotification, true);
      WebSocketService.off('weekly_spending_summary', handleNotification, true);
      WebSocketService.off('budget_completion', handleNotification, true);
      WebSocketService.off('balance_shortfall_alert', handleNotification, true);
      WebSocketService.disconnect('ml');
    };
  }, [token, userId]);

  const requestPermission = async (): Promise<boolean> => {
    if (!token) return false;
    const pushToken = await registerForPushNotificationsAsync(token);
    return !!pushToken;
  };

  const clearNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem('notifications');
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        isInitialized,
        notifications,
        requestPermission,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}