import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useContext } from 'react';
import { NotificationContext } from '@/hooks/NotificationContext';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
}

export default function Notification() {
  const { notifications, isInitialized } = useContext(NotificationContext);
  const [loading, setLoading] = useState(!isInitialized);
  const [error, setError] = useState<string | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (isInitialized) {
      setLoading(false);
    } else {
      setError('Notification system not initialized');
    }
  }, [isInitialized]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Notifications" variant="back" />
      <ScrollView style={{ backgroundColor, paddingTop: 5 }}>
        {notifications.length === 0 ? (
          <Text style={[styles.noNotifications, { color: iconColor }]}>No notifications available</Text>
        ) : (
          notifications.map((notification) => (
            <View 
              key={notification.id} 
              style={[
                styles.notificationCard, 
                { 
                  backgroundColor: secondaryBackgroundColor,
                }
              ]}
            >
              <Text style={[
                styles.notificationTitle, 
                { color: textColor },
                notification.type === 'summary' && styles.summaryTitle
              ]}>
                {notification.type === 'transaction' ? '💸 ' : notification.type === 'recurring' ? '🔄 ' : '📊 '}
                {notification.title}
              </Text>
              <Text style={[styles.notificationBody, { color: textColor }]}>{notification.body}</Text>
              <Text style={[styles.notificationDate, { color: iconColor }]}>
                {new Date(notification.created_at).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  noNotifications: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  notificationCard: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTitle: {
    color: '#3C8CE7',
  },
  notificationBody: {
    fontSize: 14,
    marginVertical: 8,
  },
  notificationDate: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
});