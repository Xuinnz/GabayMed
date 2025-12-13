# GabayMed Backend (The Intelligence Engine)

**Core Logic for AI Triage, RAG (Retrieval-Augmented Generation), and the Geo-Financial Resolver.**

This backend serves as the "Brain" of the Gabay ecosystem. It does not handle simple CRUD operations (the frontend talks directly to Supabase for that). Instead, this server handles high-computation, secure logic that cannot be trusted to the client: AI Inference, Financial Estimation, and Emergency Routing.

## ⚡ Key Capabilities

### 1. The Geo-Financial Resolver (`/services/resolverService.js`)
*   **What it does:** The "Money Feature." It takes a medical specialization (e.g., Nephrology) and queries the database to generate a Comparative Matrix of nearby facilities.
*   **The Logic:** It dynamically calculates the **Estimated Net Cost** for a specific patient by subtracting their insurance coverage (PhilHealth/HMO) from the facility's base price.
*   **Output:** A sorted list comparing "Economy" (Public/Free) vs. "Speed" (Private/Paid).

### 2. Multi-Agent AI Triage (`/services/aiService.js`)
*   **Agent A (The Sprinter):** Uses **Llama-3.1-8b-Instant** (via Groq) for sub-second symptom mapping.
*   **Agent B (The Auditor):** Uses **Llama-3.3-70b** to cross-reference the decision against DOH Guidelines to prevent hallucinations.
*   **RAG Layer:** Retrieves trusted DOH Clinical Practice Guidelines from Supabase `pgvector` to ground the AI.

### 3. Zero-Latency Safety Net (`/utils/safetyNet.js`)
*   A deterministic Regex engine that intercepts life-threatening keywords (e.g., "dugo", "unconscious", "chest pain") before the AI is even called.
*   **Latency:** < 2ms.
*   **Language Support:** English, Tagalog, and Taglish.

---

## 🛠️ Tech Stack

*   **Runtime:** Node.js (ES Modules)
*   **Framework:** Express.js (Hybrid Serverless Setup)
*   **Database:** Supabase (PostgreSQL + PostGIS + pgvector)
*   **AI Inference:** Groq Cloud (Llama 3)
*   **Embeddings:** OpenAI (`text-embedding-3-small`)
*   **Deployment:** Vercel Serverless Functions

---

## 🚀 Setup & Installation

### 1. Prerequisites
*   Node.js v18+
*   A Supabase Project (with Vector & PostGIS enabled)
*   Groq Cloud API Key
*   OpenAI API Key (for Embeddings only)

### 2. Installation
```bash
cd server
npm install