import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Calendar, CreditCard, Gift, Bell } from 'lucide-react-native';

export function NotificationsPage({ onBack }) {
  const notifications = [
    {
      id: "1",
      type: "reminder",
      icon: Calendar,
      title: "Appointment Reminder",
      message: "Your appointment at Philippine General Hospital is tomorrow at 10:30 AM.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      type: "payment",
      icon: CreditCard,
      title: "Payment Due",
      message: "You have an outstanding balance of ₱2,500 for Laboratory Tests.",
      time: "1 day ago",
      unread: true,
    },
    {
      id: "3",
      type: "promo",
      icon: Gift,
      title: "Special Offer",
      message: "Get 20% off on your next general check-up at UERM Medical Center!",
      time: "2 days ago",
      unread: true,
    },
    {
      id: "4",
      type: "news",
      icon: Bell,
      title: "Insurance Update",
      message: "Your insurance coverage has been renewed for another year.",
      time: "1 week ago",
      unread: false,
    },
  ];

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
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.listContainer}>
        {notifications.map((notif) => {
          const iconStyle = getIconStyle(notif.type);
          const IconComponent = notif.icon;

          return (
            <View
              key={notif.id}
              style={[
                styles.notificationItem,
                notif.unread && styles.notificationItemUnread
              ]}
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
                <Text style={styles.notificationTime}>{notif.time}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#0ea5e9',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
