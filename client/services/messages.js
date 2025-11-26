import { createClient } from '@supabase/supabase-js';

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

/*
  REQUIRED SUPABASE SCHEMA:

  create table messages (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references patients(patient_id) not null,
    sender_type text check (sender_type in ('patient', 'staff')) not null,
    content text not null,
    created_at timestamptz default now(),
    is_read boolean default false
  );

  -- Optional: Index for performance
  create index idx_messages_patient_id on messages(patient_id);
  create index idx_messages_created_at on messages(created_at);
*/

export const messagesAPI = {
  
  // 1. Get Conversations (List of patients with their last message)
  async getConversations() {
    try {
      // Fetch all messages ordered by newest first
      // In a real production app, you'd use a View or RPC for this to avoid fetching all messages
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by patient_id to get the latest message for each conversation
      const conversationMap = new Map();
      const patientIds = new Set();

      messages.forEach(msg => {
        if (!conversationMap.has(msg.patient_id)) {
          conversationMap.set(msg.patient_id, msg);
          patientIds.add(msg.patient_id);
        }
      });

      if (patientIds.size === 0) return [];

      // Fetch details for these patients
      const { data: patients, error: patientError } = await supabase
        .from('patients')
        .select(`
          patient_id,
          profiles ( full_name, avatar_url )
        `)
        .in('patient_id', Array.from(patientIds));

      if (patientError) throw patientError;

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
