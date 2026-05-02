import * as Notifications from 'expo-notifications';
import { apiCoreRequest } from '@/api/apiService';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Project ID for Expo push notifications
const EXPO_PROJECT_ID = Constants.expoConfig?.extra?.eas.projectId;

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'transaction' | 'summary' | 'recurring' | 'budget' | 'warning';
  created_at: string;
  data?: Record<string, any>;
}

// Configure notification channel for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

// Register push token with backend
export async function registerForPushNotificationsAsync(authToken: string): Promise<string | null> {
  try {
    console.log('Attempting to register push token...');

    // Check if user has granted permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('Permission not granted, requesting...');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });
    const token = tokenData.data;
    console.log('Expo push token:', token);

    // Register token with backend
    await apiCoreRequest('/notifications/store-push-token', 'POST', authToken, {}, { push_token: token });

    console.log('Expo push token registered successfully');
    return token;
  } catch (error) {
    console.error('Error registering with Expo Notifications:', error);
    return null;
  }
}

// Setup notification event handlers
export function setupNotificationHandlers(): () => void {
  console.log('Setting up notification handlers...');

  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Foreground notification received:', notification);
    // Handle foreground notifications (e.g., show in-app alert)
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification opened/clicked:', response);
    const { data } = response.notification.request.content;
    if (data) {
      console.log('Additional data:', data);
      // Add navigation logic here (e.g., navigate to transaction details)
    }
  });
  console.log('Notification event listeners added successfully');

  return () => {
    console.log('Removing notification event listeners...');
    notificationListener.remove();
    responseListener.remove();
    console.log('Event listeners removed successfully');
  };
}

// Process WebSocket notification
export function processWebSocketNotification(data: any): Notification | null {
  try {
    const notification: Notification = {
      id: data.id || data.transaction_id || Date.now().toString(),
      title: data.title || `New ${data.type} Notification`,
      body: data.body || `You have a new ${data.type} notification`,
      type: data.type || 'transaction',
      created_at: data.created_at || new Date().toISOString(),
      data: data.data || {},
    };
    console.log('Processed WebSocket notification:', notification);
    return notification;
  } catch (error) {
    console.error('Error processing WebSocket notification:', error);
    return null;
  }
}