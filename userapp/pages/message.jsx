import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ConversationView } from '../components/conversation-view';
import MessagesAPI from '../services/messagesApi';

export function MessagesPage({ onBack }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await MessagesAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Refresh when pulling down
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  // Filter based on search
  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  if (selectedConversation) {
    const conv = conversations.find((c) => c.id === selectedConversation);
    return (
      <ConversationView
        conversationId={selectedConversation} // Pass the patient_id as conversationId
        name={conv?.name || ""}
        avatar={conv?.avatar || ""}
        onBack={() => {
          setSelectedConversation(null);
          fetchConversations(); // Refresh list on back to update unread counts/last message
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#66BAFF', '#83BFF0']}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
      </LinearGradient>

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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <ScrollView 
          style={styles.conversationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredConversations.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No messages yet.</Text>
            </View>
          ) : (
            filteredConversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                onPress={() => setSelectedConversation(conv.id)}
                style={styles.conversationItem}
              >
                <View style={styles.avatar}>
                  {conv.avatar ? (
                    <Image source={{ uri: conv.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{conv.initials}</Text>
                  )}
                </View>
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{conv.name}</Text>
                    <Text style={styles.conversationTime}>{conv.timestamp}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.conversationMessage, 
                      conv.unread && styles.conversationMessageUnread
                    ]} 
                    numberOfLines={1}
                  >
                    {conv.unread ? '• ' : ''}{conv.lastMessage}
                  </Text>
                </View>
                {conv.unread && (
                  <View style={styles.unreadBadge}>
                    <View style={styles.unreadDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  conversationMessageUnread: {
    color: '#1f2937',
    fontWeight: '600',
  },
  unreadBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0ea5e9',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  }
});
