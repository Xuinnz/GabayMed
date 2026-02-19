import OpenAI from 'openai';
import { z } from 'zod';
import { getMedicalContext } from './ragService.js';
import { SYSTEM_PROMPTS, AI_MODELS } from '../utils/constants.js';

// 1. Zod Schema
const TriageSchema = z.object({
    specialization_slug: z.string(),
    urgency: z.enum(["low", "medium", "high", "emergency"]),
    reasoning: z.string(),
    triage_questions: z.array(z.string()).optional(),
    user_friendly_response: z.string(),
});

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: 'https://api.groq.com/openai/v1'
});

export const runTriagePipeline = async (symptoms, patientProfile) => {
    console.log("🤖 AI: Starting Triage Pipeline...");

    // STEP 1: Get Context (RAG)
    const context = await getMedicalContext(symptoms);
    
    // Helper function to format JSON fields cleanly for the AI
    const formatData = (data) => {
        if (!data) return "None";
        if (typeof data === 'string') return data;
        return JSON.stringify(data); // Convert JSON objects to string for the prompt
    };

    // Extract fields from your DB schema
    const history = formatData(patientProfile.medical_history);
    const background = formatData(patientProfile.medical_background);

    // STEP 2: Agent A (The Sprinter)
    const userPrompt = `
    Patient Profile:
    - Age: ${patientProfile.age || "Unknown"}
    - Medical History: ${history}
    - Medical Background (Allergies/Family): ${background}

    Symptoms: "${symptoms}"

    Relevant Medical Guidelines:
    ${context}

    *** CRITICAL INSTRUCTION ***
    You must map the symptoms to ONE of the following valid specialization slugs ONLY:
    [ ${allowedList} ]
    
    If the exact match is missing, choose "general-medicine" or the closest available option from THIS LIST. Do not invent a new slug.
    `;

    try {
        const completionA = await groq.chat.completions.create({
            model: AI_MODELS.TRIAGE,
            messages: [
                { role: "system", content: SYSTEM_PROMPTS.AGENT_A },
                { role: "user", content: userPrompt }
            ],
            temperature: 0,
            response_format: { type: "json_object" } 
        });

        const rawContent = completionA.choices[0].message.content;
        let resultA = JSON.parse(rawContent);

        // VALIDATION
        resultA = TriageSchema.parse(resultA);

        console.log("⚡ Agent A Decision:", resultA.specialization_slug);

        // STEP 3: Agent B (The Auditor)
        const completionB = await groq.chat.completions.create({
            model: AI_MODELS.AUDITOR,
            messages: [
                { role: "system", content: SYSTEM_PROMPTS.AGENT_B },
                { role: "user", content: `
                    Patient Profile: Age ${patientProfile.age}, History: ${history}, Background: ${background}
                    Symptoms: "${symptoms}"
                    Agent A Diagnosis: ${JSON.stringify(resultA)}
                    Relevant Guidelines: ${context}
                `}
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const auditResult = JSON.parse(completionB.choices[0].message.content);
        console.log("🛡️ Agent B Audit:", auditResult.status);

        // FINAL MERGE
        if (auditResult.status === "OVERRIDE" && auditResult.corrected_slug) {
            return {
                ...resultA,
                specialization_slug: auditResult.corrected_slug,
                urgency: auditResult.corrected_urgency || resultA.urgency,
                reasoning: `(Audit Correction) ${auditResult.audit_note}`,
                context_used: true
            };
        }

        return { ...resultA, context_used: !!context };

    } catch (error) {
        console.error("❌ AI Pipeline Error:", error);
        
        return {
            specialization_slug: "general-medicine",
            urgency: "medium",
            reasoning: "System could not definitively categorize. Defaulting to General Medicine for safety.",
            user_friendly_response: "I am having trouble processing your specific symptoms. Please consult a General Practitioner to be safe.",
            context_used: false
        };
    }
};