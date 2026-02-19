import OpenAI from 'openai';
import { supabase } from '../config/supabase.js';
import { AI_MODELS } from '../utils/constants.js';

// Initialize OpenAI specifically for Embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const getMedicalContext = async (userQuery) => {
  try {
    console.log("🔍 RAG: Generating embedding...");
    
    // 1. Generate Vector
    const embeddingResponse = await openai.embeddings.create({
      model: AI_MODELS.EMBEDDING,
      input: userQuery.replace(/\n/g, ' '),
    });

    const vector = embeddingResponse.data[0].embedding;

    // 2. Search Database (RPC call)
    const { data: documents, error } = await supabase.rpc('match_guidelines', {
      query_embedding: vector,
      match_threshold: 0.78, // Lower threshold to ensure we get *some* context
      match_count: 3        // Top 3 chunks
    });

    if (error) {
      console.error("❌ RAG DB Error:", error);
      return "";
    }

    if (!documents || documents.length === 0) {
        console.log("⚠️ RAG: No relevant guidelines found.");
        return "";
    }

    // 3. Join chunks into a single text block
    const contextText = documents
        .map(doc => `[Source: ${doc.metadata?.source || 'DOH'}]\n${doc.content}`)
        .join("\n---\n");
    
    console.log(`✅ RAG: Found ${documents.length} relevant guidelines.`);
    return contextText;

  } catch (err) {
    console.error("❌ RAG Service Failed:", err);
    return ""; // Fail gracefully (empty context is better than crash)
  }
};