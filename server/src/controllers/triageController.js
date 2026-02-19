import { supabase } from '../config/supabase.js';
import { checkSafetyNet } from '../utils/safetyNet.js';
import { runTriagePipeline } from '../services/aiService.js';
import { resolveFacilities } from '../services/resolverService.js';

export const handleTriage = async (req, res) => {
  try {
    const { 
        // We added session_id to continue a chat
        session_id, 
        user_id, // Passed from frontend (auth.user.id)
        symptoms, 
        age, 
        medical_history, 
        medical_background, 
        latitude, 
        longitude, 
        insurance_provider 
    } = req.body;

    let currentSessionId = session_id;

    // 1. If no session exists, create one
    if (!currentSessionId) {
        const { data: newSession } = await supabase
            .from('triage_sessions')
            .insert({ user_id: user_id }) // specific to this user
            .select()
            .single();
        currentSessionId = newSession.id;
    }

    // 2. Save USER Message to DB
    await supabase.from('triage_messages').insert({
        session_id: currentSessionId,
        sender_role: 'user',
        content: symptoms
    });

    // 3. Run Safety Net
    if (checkSafetyNet(symptoms)) {
        const emergencyResponse = "CRITICAL: Symptoms indicate a potential emergency. Proceed to ER immediately.";
        
        // Save AI Emergency Response
        await supabase.from('triage_messages').insert({
            session_id: currentSessionId,
            sender_role: 'ai',
            content: emergencyResponse,
            ai_metadata: { urgency: 'EMERGENCY' }
        });

        return res.json({
            status: 'EMERGENCY',
            session_id: currentSessionId,
            message: emergencyResponse,
            action: 'CALL_911'
        });
    }
    const { data: specData, error } = await supabase
        .from('specializations')
        .select('slug');
    
    if (error) throw error;

    // Convert to a comma-separated string: "cardiology, nephrology, pediatrics..."
    const allowedSpecializations = specData.map(s => s.slug).join(', ');

    // 4. Run AI Pipeline
    const diagnosis = await runTriagePipeline(symptoms, { age, medical_history, medical_background }, allowedSpecializations);

    // 5. Save AI Response to DB
    await supabase.from('triage_messages').insert({
        session_id: currentSessionId,
        sender_role: 'ai',
        content: diagnosis.user_friendly_response, // The chat text
        ai_metadata: diagnosis // The hidden technical data
    });

    // 6. Run Resolver (The Matrix)
    const matrix = await resolveFacilities(
      diagnosis.specialization_slug, 
      latitude, 
      longitude,
      insurance_provider
    );

    // 7. Return everything to Frontend
    return res.json({
      status: 'SUCCESS',
      session_id: currentSessionId, // Frontend needs this for the next message
      diagnosis: diagnosis,
      facilities: matrix
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};