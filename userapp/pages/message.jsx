import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { ConversationView } from '../components/conversation-view';

export function MessagesPage({ onBack }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchText, setSearchText] = useState('');

  const conversations = [
    {
      id: "1",
      name: "Philippine General Hospital",
      lastMessage: "Your appointment has been confirmed for Nov 27.",
      time: "10:30 AM",
      unread: 2,
      avatar: "/hospital-icon.png",
    },
    {
      id: "2",
      name: "UERM Medical Center",
      lastMessage: "Thank you for visiting us. Please complete the survey.",
      time: "Yesterday",
      unread: 0,
      avatar: "/uerm-hospital-icon.jpg",
    },
    {
      id: "3",
      name: "Dr. Jasper King Gueco",
      lastMessage: "Your lab results are ready. Please schedule a follow-up.",
      time: "Nov 20",
      unread: 1,
      avatar: "/doctor-avatar-male.jpg",
    },
  ];

  if (selectedConversation) {
    const conv = conversations.find((c) => c.id === selectedConversation);
    return (
      <ConversationView
        name={conv?.name || ""}
        avatar={conv?.avatar || ""}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <ScrollView style={styles.conversationsList}>
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            onPress={() => setSelectedConversation(conv.id)}
            style={styles.conversationItem}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{conv.name.charAt(0)}</Text>
            </View>
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName}>{conv.name}</Text>
                <Text style={styles.conversationTime}>{conv.time}</Text>
              </View>
              <Text style={styles.conversationMessage} numberOfLines={1}>
                {conv.lastMessage}
              </Text>
            </View>
            {conv.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{conv.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
  searchContainer: {
    padding: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#0ea5e9',
    fontSize: 18,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});
