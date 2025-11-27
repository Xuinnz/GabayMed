import { createClient } from '@supabase/supabase-js';
import { Session } from './session'; // Import Session service

// Helper to get env vars
const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

export const messagesAPI = {
  
  // 1. Get Conversations (List of patients with their last message)
  // UPDATED: Uses Session to get facilityId automatically
  async getConversations() {
    try {
      const facilityId = Session.getFacilityId();
      
      if (!facilityId) {
        console.warn("getConversations: No facilityId found in Session");
        return [];
      }

      // Step 1: Get all patients linked to this facility
      const { data: facilityPatients, error: patientsError } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('facility_id', facilityId);

      if (patientsError) throw patientsError;

      const validPatientIds = facilityPatients.map(p => p.patient_id);

      if (validPatientIds.length === 0) return [];

      // Step 2: Fetch messages ONLY for these patients
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          patient_id,
          content,
          created_at,
          is_read,
          sender_type
        `)
        .in('patient_id', validPatientIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by patient_id to get the latest message for each conversation
      const conversationMap = new Map();
      const activePatientIds = new Set();

      messages.forEach(msg => {
        if (!conversationMap.has(msg.patient_id)) {
          conversationMap.set(msg.patient_id, msg);
          activePatientIds.add(msg.patient_id);
        }
      });

      if (activePatientIds.size === 0) return [];

      // Fetch details for these active patients
      const { data: patients, error: detailsError } = await supabase
        .from('patients')
        .select(`
          patient_id,
          profiles ( full_name, avatar_url )
        `)
        .in('patient_id', Array.from(activePatientIds));

      if (detailsError) throw detailsError;

      // Combine data
      const conversations = patients.map(p => {
        const lastMsg = conversationMap.get(p.patient_id);
        const profile = p.profiles;
        
        // Calculate relative time (simple version)
        const date = new Date(lastMsg.created_at);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timestamp = '';
        if (diffMins < 1) timestamp = 'Just now';
        else if (diffMins < 60) timestamp = `${diffMins} min ago`;
        else if (diffHours < 24) timestamp = `${diffHours} hours ago`;
        else timestamp = `${diffDays} days ago`;

        return {
          id: p.patient_id,
          patientName: profile?.full_name || 'Unknown Patient',
          avatar: profile?.avatar_url || null,
          initials: (profile?.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          lastMessage: lastMsg.content,
          timestamp: timestamp,
          unread: !lastMsg.is_read && lastMsg.sender_type === 'patient',
          rawTimestamp: lastMsg.created_at // For sorting if needed
        };
      });

      // Sort by newest message
      return conversations.sort((a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp));

    } catch (error) {
      console.error("Get Conversations Error:", error);
      return [];
    }
  },

  // 2. Get Messages for a specific conversation
  async getMessages(patientId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        sender: msg.sender_type, // 'staff' or 'patient'
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: msg.is_read
      }));

    } catch (error) {
      console.error("Get Messages Error:", error);
      return [];
    }
  },

  // 3. Send a Message
  async sendMessage(patientId, text, senderType = 'staff') {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          patient_id: patientId,
          content: text,
          sender_type: senderType,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: {
          id: data.id,
          sender: data.sender_type,
          text: data.content,
          timestamp: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
    } catch (error) {
      console.error("Send Message Error:", error);
      return { success: false, error: error.message };
    }
  },

  // 4. Mark messages as read
  async markAsRead(patientId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('patient_id', patientId)
        .eq('sender_type', 'patient') // Only mark patient messages as read
        .eq('is_read', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Mark Read Error:", error);
      return { success: false };
    }
  }
};
