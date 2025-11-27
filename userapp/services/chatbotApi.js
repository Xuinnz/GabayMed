import { supabase } from '../lib/supabase';
import Session from './session';
import ProfileAPI from './profileApi'; // Import ProfileAPI

// --- CONFIGURATION ---
// 1. If using Android Emulator: Use 'http://10.0.2.2:3000/api/triage'
// 2. If using iOS Simulator: Use 'http://localhost:3000/api/triage'
// 3. If using Physical Phone: Run 'ipconfig' in terminal and use that IP (e.g., 192.168.1.X)
const API_URL = 'http://192.168.1.12:3000/api/triage'; 

const ChatbotAPI = {
  /**
   * Starts a new triage session or retrieves an active one.
   */
  async startOrGetSession() {
    try {
      const userId = await Session.getUserId(); 
      if (!userId) throw new Error("User not logged in");

      // Check for an existing active session
      const { data: existingSession } = await supabase
        .from('triage_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession) {
        return existingSession;
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('triage_sessions')
        .insert({ user_id: userId, status: 'active' })
        .select()
        .single();

      if (error) throw error;
      return newSession;
    } catch (error) {
      console.error("Error starting session:", error);
      throw error;
    }
  },

  /**
   * Fetches message history for a specific session.
   */
  async getSessionMessages(sessionId) {
    const { data, error } = await supabase
      .from('triage_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Sends a user message, calls the AI API, and saves the response.
   */
  async sendMessage(sessionId, userComplaint) {
    try {
      // 1. Fetch User Profile Data
      const userProfile = await ProfileAPI.getProfile();

      // 2. Save User Message
      const { error: userMsgError } = await supabase
        .from('triage_messages')
        .insert({
          session_id: sessionId,
          sender_role: 'user',
          content: userComplaint
        });

      if (userMsgError) throw userMsgError;

      // 3. Call AI Endpoint with Timeout Handling
      const controller = new AbortController();
      // Increase timeout to 60 seconds for AI processing
      const timeoutId = setTimeout(() => controller.abort(), 60000); 

      console.log(`Sending request to: ${API_URL}`);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_complaint: userComplaint,
            age: userProfile.age,
            medical_history: userProfile.medicalHistory.join(', '), // Convert array to string
            allergies: userProfile.allergies
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
        }

        const aiResponse = await response.json();

        // 4. Save AI Response
        const { data: aiMessage, error: aiMsgError } = await supabase
          .from('triage_messages')
          .insert({
            session_id: sessionId,
            sender_role: 'assistant',
            content: aiResponse.user_friendly_response,
            ai_metadata: aiResponse
          })
          .select()
          .single();

        if (aiMsgError) throw aiMsgError;

        // 5. Update Session Status
        await supabase
          .from('triage_sessions')
          .update({
            urgency_level: aiResponse.urgency_level,
            recommended_specialist: aiResponse.recommended_specialist,
            summary_text: aiResponse.primary_suspect_condition,
            updated_at: new Date()
          })
          .eq('id', sessionId);

        return aiMessage;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error("AI Request Timed Out (Server took too long)");
        }
        throw fetchError;
      }

    } catch (error) {
      console.error("Error in sendMessage flow:", error);
      throw error;
    }
  }
};

export default ChatbotAPI;