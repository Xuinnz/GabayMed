import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, Linking, ActivityIndicator } from 'react-native';
import { ArrowLeft, Send, MapPin, Paperclip, Mic, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import ChatbotAPI from '../services/chatbotApi'; 
import BrowseAPI from '../services/browseApi'; // Import BrowseAPI

export function SintomasAI({ onBack, isModal = false }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const facilitiesRef = useRef([]); // Store facilities to avoid re-fetching

  // Helper: Find nearest facility based on AI recommendation
  const findRecommendedFacility = (metadata) => {
    if (!facilitiesRef.current || facilitiesRef.current.length === 0) return null;

    const urgency = metadata?.urgency_level;
    const specialist = metadata?.recommended_specialist || "";
    
    // 1. Determine target keywords
    let targetKeywords = [];
    if (urgency === 'EMERGENCY' || urgency === 'HIGH') {
      targetKeywords = ['emergency', 'er', 'trauma'];
    } else if (specialist) {
      // Simple normalization: "Cardiologist" -> "cardio"
      const root = specialist.toLowerCase().replace('specialist', '').replace('doctor', '').trim().substring(0, 5);
      targetKeywords = [root];
    }

    // 2. Filter facilities (facilitiesRef is already sorted by distance from BrowseAPI)
    let match = facilitiesRef.current.find(f => {
      if (!f.services) return false;
      return f.services.some(s => 
        targetKeywords.some(k => s.toLowerCase().includes(k))
      );
    });

    // 3. Fallback to General Medicine if no specific match found
    if (!match) {
      match = facilitiesRef.current.find(f => {
        if (!f.services) return false;
        return f.services.some(s => 
          s.toLowerCase().includes('general') || s.toLowerCase().includes('family') || s.toLowerCase().includes('primary')
        );
      });
    }

    // 4. Ultimate fallback: Nearest facility (first in list)
    if (!match && facilitiesRef.current.length > 0) {
      match = facilitiesRef.current[0];
    }

    return match;
  };

  // Initialize Session & Load Facilities
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Facilities first (needed for history processing)
        const facilitiesData = await BrowseAPI.getSeekCareData();
        facilitiesRef.current = facilitiesData.facilities;

        // 2. Start/Get Session
        const session = await ChatbotAPI.startOrGetSession();
        setSessionId(session.id);

        // 3. Get History
        const history = await ChatbotAPI.getSessionMessages(session.id);
        
        if (history.length === 0) {
          setMessages([{
            id: "welcome",
            type: "ai",
            content: "Hello! I'm Gabay, your AI health assistant. How are you feeling today?",
          }]);
        } else {
          // Process history to attach facility info
          const processedHistory = history.map(msg => {
            let facility = null;
            if (msg.sender_role !== 'user' && msg.ai_metadata) {
              facility = findRecommendedFacility(msg.ai_metadata);
            }
            return {
              id: msg.id,
              type: msg.sender_role === 'user' ? 'user' : 'ai',
              content: msg.content,
              metadata: msg.ai_metadata,
              facility: facility
            };
          });
          setMessages(processedHistory);
        }
      } catch (error) {
        console.error("Failed to init chat:", error);
        setMessages([{
          id: "error",
          type: "ai",
          content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !sessionId) return;

    const userText = inputValue;
    setInputValue(""); 

    const tempUserMsg = {
      id: Date.now().toString(),
      type: "user",
      content: userText,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try { 
      const aiMsgData = await ChatbotAPI.sendMessage(sessionId, userText);

      // Resolve facility for the new message
      const recommendedFacility = findRecommendedFacility(aiMsgData.ai_metadata);

      const aiMsg = {
        id: aiMsgData.id,
        type: "ai",
        content: aiMsgData.content,
        metadata: aiMsgData.ai_metadata,
        facility: recommendedFacility
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error("Send failed:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: "ai",
        content: "I apologize, but I couldn't process that request. Please check your connection.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get badge colors
  const getUrgencyStyles = (level) => {
    switch (level) {
      case 'EMERGENCY': return { bg: '#FEE2E2', text: '#991B1B' }; // Red
      case 'HIGH': return { bg: '#FFEDD5', text: '#9A3412' };      // Orange
      case 'MEDIUM': return { bg: '#FEF9C3', text: '#854D0E' };    // Yellow
      case 'LOW': return { bg: '#DCFCE7', text: '#166534' };       // Green
      default: return { bg: '#F3F4F6', text: '#374151' };          // Gray
    }
  };

  const content = (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#66BAFF', '#83BFF0']}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SintomasAI</Text>
        <View style={{ width: 32 }} />
      </LinearGradient>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => {
          const urgency = message.metadata?.urgency_level;
          const specialist = message.metadata?.recommended_specialist;
          
          // Show map if urgency is significant OR if a specialist is explicitly recommended 
          // (e.g. "Dentist", "General Practitioner") even if urgency is LOW.
          // This ensures "Where is the nearest dental?" shows a map.
          const showMap = message.facility && (
            urgency === 'EMERGENCY' || 
            urgency === 'HIGH' || 
            urgency === 'MEDIUM' || 
            (specialist && specialist !== 'None' && specialist !== 'Self-care')
          );

          const urgencyStyle = getUrgencyStyles(urgency);
          const facility = message.facility;

          return (
            <View 
              key={message.id} 
              style={[
                styles.messageWrapper,
                message.type === "user" && styles.userMessageWrapper
              ]}
            >
              {message.type === "ai" ? (
                <View style={styles.aiMessageContainer}>
                  {/* Metadata Header */}
                  {urgency && (
                    <View style={styles.metaHeader}>
                      <View style={[styles.urgencyBadge, { backgroundColor: urgencyStyle.bg }]}>
                        <AlertCircle size={12} color={urgencyStyle.text} style={{ marginRight: 4 }} />
                        <Text style={[styles.urgencyText, { color: urgencyStyle.text }]}>
                          {urgency} URGENCY
                        </Text>
                      </View>
                      {specialist && (
                        <Text style={styles.specialistText}>
                          Rec: <Text style={{ fontWeight: '600' }}>{specialist}</Text>
                        </Text>
                      )}
                    </View>
                  )}

                  <Text style={styles.aiMessageText}>{message.content}</Text>
                  
                  {showMap && facility && (
                    <View style={styles.mapContainer}>
                      <View style={styles.mapView}>
                        <MapView
                          style={styles.map}
                          initialRegion={{
                            latitude: facility.latitude || 14.5977,
                            longitude: facility.longitude || 121.0112,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                          scrollEnabled={false}
                          zoomEnabled={false}
                          pitchEnabled={false}
                          rotateEnabled={false}
                        >
                          <Marker
                            coordinate={{
                              latitude: facility.latitude || 14.5977,
                              longitude: facility.longitude || 121.0112,
                            }}
                            title={facility.name}
                            description={facility.address}
                          />
                        </MapView>
                        <TouchableOpacity 
                          style={styles.mapButton}
                          onPress={() => {
                            const url = Platform.select({
                              ios: `maps:0,0?q=${facility.name}@${facility.latitude},${facility.longitude}`,
                              android: `geo:0,0?q=${facility.latitude},${facility.longitude}(${facility.name})`,
                            });
                            Linking.openURL(url);
                          }}
                        >
                          <MapPin size={12} color="#fff" />
                          <Text style={styles.mapButtonText}>View on Maps</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.locationInfo}>
                        <MapPin size={16} color="#0ea5e9" />
                        <View style={styles.locationText}>
                          <Text style={styles.locationName}>{facility.name}</Text>
                          <Text style={styles.locationDistance}>
                            {facility.distance} away • {urgency === 'EMERGENCY' ? 'Nearest ER' : 'Recommended'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.userMessageBubble}>
                  <Text style={styles.userMessageText}>{message.content}</Text>
                </View>
              )}
            </View>
          );
        })}
        {isLoading && (
          <View style={styles.loadingBubble}>
             <ActivityIndicator size="small" color="#66BAFF" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainerWrapper}>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Paperclip size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Mic size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSend}
              placeholder="Describe your symptoms..."
              placeholderTextColor="#d1d5db"
              multiline
            />
          </View>
          <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={isLoading}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  if (isModal) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onBack}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {content}
          </View>
        </View>
      </Modal>
    );
  }

  return content;
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
    justifyContent: 'space-between',
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
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    marginBottom: 20,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    maxWidth: '90%',
    backgroundColor: '#E8F5FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  // NEW STYLES FOR METADATA
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  specialistText: {
    fontSize: 11,
    color: '#4b5563',
  },
  aiMessageText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 22,
  },
  userMessageBubble: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: '85%',
  },
  userMessageText: {
    fontSize: 14,
    color: '#1f2937',
  },
  mapContainer: {
    marginTop: 12,
  },
  mapView: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    height: 144,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#60a5fa',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  locationText: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  locationDistance: {
    fontSize: 12,
    color: '#6b7280',
  },
  inputContainerWrapper: {
    padding: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#1f2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    height: '85%',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 20,
    backgroundColor: '#E8F5FF',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  }
});
