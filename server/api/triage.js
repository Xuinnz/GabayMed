const Groq = require('groq-sdk');
const { z } = require('zod'); // STRICT VALIDATION REQUIRED
const allowCors = require('./cors'); 

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// 1. Define the Expected Output Schema
// If the AI returns garbage, this ensures your app doesn't crash.
const TriageSchema = z.object({
    urgency_level: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]),
    primary_suspect_condition: z.string(),
    recommended_specialist: z.string(),
    reasoning: z.string(),
    triage_questions: z.array(z.string()).optional(),
    user_friendly_response: z.string(),
});

// 2. The "Rules-First" Safety Filter
// Do not waste tokens or risk AI hallucination on obvious emergencies.
const EMERGENCY_KEYWORDS = /chest pain|trouble breathing|severe bleeding|stroke|loss of consciousness|suicide|overdose|heart attack/i;

const handler = async (request, response) => {
    // 3. Validate Input Variables
    const { age, medical_history, allergies, user_complaint, available_specialists } = request.body;

    if (!user_complaint) {
        return response.status(400).json({ error: "Symptoms are required" });
    }

    try {
        // --- LAYER 1: DETERMINISTIC RED FLAG CHECK ---
        // If the user says "chest pain", we force an emergency response instantly.
        if (EMERGENCY_KEYWORDS.test(user_complaint)) {
            console.log("High-risk keyword detected. Bypassing AI.");
            return response.status(200).json({
                urgency_level: "EMERGENCY",
                primary_suspect_condition: "Detected Critical Emergency Symptoms",
                recommended_specialist: "Emergency Medicine",
                reasoning: "User reported symptoms matching critical emergency keywords.",
                triage_questions: [],
                user_friendly_response: "Based on your symptoms, you may be experiencing a medical emergency. Please proceed to the nearest Emergency Room immediately."
            });
        }

        // --- LAYER 2: AI TRIAGE ---
        
        const systemPrompt = `
        You are Gabay, an AI medical triage assistant. Your goal is NOT to diagnose diseases but to assess symptom urgency and recommend the appropriate medical specialist.

        SAFETY PROTOCOL:
        1. NEVER provide a definitive diagnosis (e.g., "You have pneumonia"). Use "Symptoms are consistent with...".
        2. IF symptoms suggest life-threat (chest pain, stroke, severe bleeding), urgency MUST be "EMERGENCY".
        3. Map symptoms to a specific medical specialization for routing.

        CONSTRAINT - AVAILABLE SPECIALISTS:
        You must ONLY recommend a specialist from the following list: [${available_specialists || "General Practitioner"}].
        If the exact specialist is not in the list, choose "General Check-up" or the closest match available in the list.

        OUTPUT FORMAT:
        Respond ONLY with a valid JSON object matching this structure:
        {
            "urgency_level": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
            "primary_suspect_condition": "Brief description (NOT diagnosis)",
            "recommended_specialist": "Must be one from the provided list",
            "reasoning": "Short explanation",
            "triage_questions": ["Question 1", "Question 2"],
            "user_friendly_response": "Clear, compassionate message. End with 'This is an AI assessment, not a medical diagnosis.'"
        }
        `;

        // FIXED: Variables now match the destructuring from request.body
        const userContent = `
        User Profile:
        - Age: ${age || "Not stated"}
        - History: ${medical_history || "None"}
        - Allergies: ${allergies || "None"}

        User Complaint: "${user_complaint}"
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            model: 'llama-3.1-8b-instant', 
            temperature: 0.1, 
            response_format: { type: "json_object" }
        });

        // 4. Parse and Validate with Zod
        // Llama-3-8b is fast but can be "dumb". It might miss a comma.
        const rawContent = chatCompletion.choices[0].message.content;
        let aiResponse;
        
        try {
             aiResponse = JSON.parse(rawContent);
             // VALIDATE STRUCTURE
             aiResponse = TriageSchema.parse(aiResponse);
        } catch (validationError) {
             console.error("AI JSON Validation Failed:", rawContent);
             // Fallback if AI fails to generate valid JSON
             return response.status(200).json({
                 urgency_level: "MEDIUM", // Default to caution
                 primary_suspect_condition: "Unclear Symptoms",
                 recommended_specialist: "General Practitioner",
                 reasoning: "The system could not definitively categorize the input.",
                 triage_questions: ["Could you describe your symptoms in more detail?"],
                 user_friendly_response: "I'm having trouble understanding. Please consult a General Practitioner or describe your symptoms differently."
             });
        }
        
        return response.status(200).json(aiResponse);

    } catch (error) {
        console.error("System Error:", error);
        return response.status(500).json({ error: "Failed to process triage." });
    }
}

module.exports = allowCors(handler);