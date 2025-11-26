import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { ArrowLeft, Send, MapPin, Home } from 'lucide-react-native';

export function SintomasAI({ onBack, isModal = false }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      content: "Hello, Red Gabriel\nHow are you feeling today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Thanks for sharing. Let me check — you have:
• ${inputValue.includes("cough") ? "Cough" : "Symptom"} (${inputValue.includes("3 days") ? "3 days" : "recent"})
• ${inputValue.includes("fever") ? "Fever (mild)" : "General discomfort"}

Possible causes could include common flu or a mild respiratory infection.

If your fever lasts more than 5 days, worsens, or you experience shortness of breath, it's best to see a doctor.

The nearest facility that can assist you is:`,
        showMap: true,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const content = (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SintomasAI</Text>
        <Home size={20} color="#fff" />
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        <View style={styles.chatBorder}>
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageWrapper,
                message.type === "user" && styles.userMessageWrapper
              ]}
            >
              {message.type === "ai" ? (
                <View style={styles.aiMessageContainer}>
                  <Text style={styles.aiMessageText}>{message.content}</Text>
                  {message.showMap && (
                    <View style={styles.mapContainer}>
                      <View style={styles.mapView}>
                        <TouchableOpacity style={styles.mapButton}>
                          <MapPin size={12} color="#fff" />
                          <Text style={styles.mapButtonText}>View on Maps</Text>
                        </TouchableOpacity>
                        <View style={styles.mapPlaceholder}>
                          <Text style={styles.mapPlaceholderText}>🗺️</Text>
                        </View>
                        <View style={styles.hospitalPin}>
                          <Text style={styles.hospitalPinText}>H</Text>
                        </View>
                      </View>
                      <View style={styles.locationInfo}>
                        <MapPin size={16} color="#0ea5e9" />
                        <View style={styles.locationText}>
                          <Text style={styles.locationName}>Philippine General Hospital</Text>
                          <Text style={styles.locationDistance}>(Manila) ~2.1 km away.</Text>
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
          ))}
        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSend}
            placeholder="Describe your symptoms..."
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Send size={20} color="#fff" />
        </TouchableOpacity>
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
    backgroundColor: '#0ea5e9',
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
    padding: 16,
  },
  chatBorder: {
    borderWidth: 2,
    borderColor: '#bae6fd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    minHeight: 400,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    maxWidth: '100%',
  },
  aiMessageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  userMessageBubble: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: 14,
    color: '#fff',
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
  mapButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 48,
  },
  hospitalPin: {
    position: 'absolute',
    top: '50%',
    left: '33%',
    width: 32,
    height: 32,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  hospitalPinText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
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
});
