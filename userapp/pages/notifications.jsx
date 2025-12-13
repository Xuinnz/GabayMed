import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ArrowLeft, Calendar, CreditCard, Gift, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function NotificationsPage({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('YOUR_API_ENDPOINT/notifications');
      // const data = await response.json();
      
      // Simulated data for now
      setTimeout(() => {
        const mockNotifications = [
          {
            id: "1",
            type: "reminder",
            icon: Calendar,
            title: "Appointment Reminder",
            message: "Your appointment at Philippine General Hospital is tomorrow at 10:30 AM.",
            time: "2 hours ago",
            timestamp: Date.now() - 2 * 60 * 60 * 1000,
            unread: true,
          },
          {
            id: "2",
            type: "payment",
            icon: CreditCard,
            title: "Payment Due",
            message: "You have an outstanding balance of ₱2,500 for Laboratory Tests.",
            time: "1 day ago",
            timestamp: Date.now() - 24 * 60 * 60 * 1000,
            unread: true,
          },
          {
            id: "3",
            type: "promo",
            icon: Gift,
            title: "Special Offer",
            message: "Get 20% off on your next general check-up at UERM Medical Center!",
            time: "2 days ago",
            timestamp: Date.now() - 48 * 60 * 60 * 1000,
            unread: true,
          },
          {
            id: "4",
            type: "news",
            icon: Bell,
            title: "Insurance Update",
            message: "Your insurance coverage has been renewed for another year.",
            time: "1 week ago",
            timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
            unread: false,
          },
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => n.unread).length);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`YOUR_API_ENDPOINT/notifications/${notificationId}/read`, { method: 'POST' });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, unread: false } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch('YOUR_API_ENDPOINT/notifications/read-all', { method: 'POST' });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, unread: false }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    return `${Math.floor(days / 7)} ${Math.floor(days / 7) === 1 ? 'week' : 'weeks'} ago`;
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "reminder":
        return { bg: '#dbeafe', color: '#3b82f6' };
      case "payment":
        return { bg: '#fee2e2', color: '#ef4444' };
      case "promo":
        return { bg: '#dcfce7', color: '#22c55e' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#66BAFF', '#83BFF0']}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>You're all caught up!</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />
          }
        >
          {notifications.map((notif) => {
            const iconStyle = getIconStyle(notif.type);
            const IconComponent = notif.icon;

            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notificationItem,
                  notif.unread && styles.notificationItemUnread
                ]}
                onPress={() => notif.unread && markAsRead(notif.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: iconStyle.bg }]}>
                  <IconComponent size={20} color={iconStyle.color} />
                </View>
                <View style={styles.contentContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                    {notif.unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage}>{notif.message}</Text>
                  <Text style={styles.notificationTime}>{getRelativeTime(notif.timestamp)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  notificationItemUnread: {
    backgroundColor: '#f0f9ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
    marginTop: 6,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
});
