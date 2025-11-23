const Groq = require('groq-sdk');
const allowCors = require('./cors'); // Import the helper

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// The Core Logic (Now clean of CORS headers)
const handler = async (request, response) => {
    // 1. Validate Input
    const { symptoms, medical_history } = request.body;

    if (!symptoms) {
        return response.status(400).json({ error: "Symptoms are required" });
    }

    try {
        // 2. The "System Prompt"
        // We command the AI to act as a JSON machine.
        const systemPrompt = `
        You are a medical triage API for the Philippines. 
        Analyze the symptoms and medical history. 
        
        CRITICAL RULES:
        1. Output ONLY valid JSON. Do not write introductions.
        2. Use exactly these fields: 
           - "likely_condition": (Short string, e.g., "Acute Gastritis")
           - "suggested_specialty": (One of: "General Medicine", "Cardiologist", "Pediatrics", "Dentist", "Neurology", "Orthopedics", "Pulmonology")
           - "urgency_level": ("HIGH", "MEDIUM", "LOW")
           - "reasoning": (Short explanation, max 1 sentence)
        3. If symptoms match a heart attack, stroke, or severe difficulty breathing, set urgency to "HIGH".
        `;

        const userContent = `
        Symptoms: ${symptoms}
        Medical History: ${JSON.stringify(medical_history || {})}
        `;

        // 3. Call the Groq Llama-3 Model
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            model: 'llama-3.1-8b-instant', // Fast & Cheap
            temperature: 0.1,        // Low temp = strict JSON
            response_format: { type: "json_object" } // Enforce JSON mode
        });

        // 4. Parse and Return
        const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);
        
        return response.status(200).json(aiResponse);

    } catch (error) {
        console.error("AI Error:", error);
        return response.status(500).json({ error: "Failed to process triage." });
    }
}

// 5. Wrap the handler with the CORS helper
module.exports = allowCors(handler);