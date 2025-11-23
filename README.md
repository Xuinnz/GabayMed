Gabay: A Smart Application for Locating Appropriate Hospitals and Doctors through AI-Driven Assistance

Gabay is a next-generation Health Information System (HIS 2.0) designed to bridge the gap between patients and quality medical services in the Philippines. It addresses critical issues such as financial ambiguity, fragmentation of care, and unequal access to healthcare resources through a dual-module ecosystem.

📜 Table of Contents

About the Project

Problem Statement

The Solution

Key Features

Gabay 1.0 (Patient App)

Gabay 2.0 (Hospital Core)

Tech Stack

Getting Started

The Team

Acknowledgments

🧐 About the Project

Submitted as an entry for the PUP Hackathon: Uthack ang Puhunan, Gabay utilizes Artificial Intelligence and geolocation services to guide users from symptom onset to the best medical consultation. Unlike traditional systems that focus solely on hospital administration, Gabay prioritizes patient empowerment by providing real-time financial transparency and intelligent triage.

⚠️ Problem Statement

The Philippine healthcare system currently faces a "Crisis of Financial Ambiguity and Fragmentation":

Financial Toxicity: Patients lack real-time visibility into their net balance (after PhilHealth/HMO deductions), leading to "shock bills" upon discharge.

Fragmented Navigation: Existing systems operate in silos. Hospitals have ledgers, and patients have booking apps, but there is no unified source of truth.

Inefficient Triage: Lack of pre-screening leads to overcrowding in specialized facilities when primary care would suffice.

💡 The Solution

Gabay proposes a HIS 2.0 architecture with two integrated modules:

Gabay 1.0 (Mobile Client): A patient-facing app for AI triage, navigation, and real-time financial tracking.

Gabay 2.0 (Web Admin): A hospital management core that handles operations, insurance logic, and regulatory compliance.

🚀 Key Features

Gabay 1.0: Patient Empowerment Portal

Target Platform: Mobile (iOS/Android)

🤖 AI-Powered Chatbot: Digital triage using Llama-3.1-8B to assess symptoms and suggest urgency levels (ER vs. Consult).

📍 Geospatial Facility Matching: Suggests hospitals/doctors based on specialization match and proximity using MapLibre GL.

💰 Real-Time Patient Ledger: Displays the exact out-of-pocket balance after automatically calculating PhilHealth and HMO deductions.

📂 Health Records Vault: Secure storage for lab results, prescriptions, and immunization history with privacy controls.

📅 Smart Scheduling: Direct appointment booking synchronized with the hospital's internal calendar.

💳 E-Payments: Integrated payment gateway for settling bills via credit card or e-wallets.

🔍 Claims Tracker: Real-time status updates on insurance claims (e.g., "Submitted," "Processing," "Paid").

Gabay 2.0: Hospital Management Core

Target Platform: Web (Desktop)

🏥 Operational Command Center: Dashboard for patient search, registration, and queue management.

⚙️ Insurance Automation Engine: Configurable rules for carrier coverage, co-pays, and deductibles to automate "Patient Portion" calculations.

📆 Dynamic Appointment Book: Visual scheduling interface managing provider availability and facility resources.

📝 Automated Claims Generation: One-click generation of PhilHealth-compliant claim forms (PDF) from ledger data.

📊 Analytics & Reporting: Real-time insights into revenue cycles, provider productivity, and disease surveillance.

🔐 Role-Based Access: Secure administrative controls for staff, doctors, and finance officers.

🛠 Tech Stack

The platform is designed for low-resource environments, prioritizing cost-accessibility and portability.

Mobile Client (Gabay 1.0)

Framework: React Native with Expo

State Management: Zustand

Validation: React Hook Form + Zod

Maps: MapLibre GL

Backend & DevOps

Infrastructure: Serverless Functions hosted on Vercel

CI/CD: GitHub Actions

Monitoring: Sentry for error tracking

AI & Data

LLM (Primary): Groq Llama-3.1-8B-Instant

LLM (Fallback): Hugging Face Mistral 7B

Database: PostgreSQL with PostGIS extensions

BaaS: Supabase (Auth, Storage, Real-time DB)

🏁 Getting Started

Prerequisites

Node.js (v18+)

npm or yarn

Expo Go app (for mobile testing)

Installation

Clone the repository

git clone [https://github.com/your-username/gabay.git](https://github.com/your-username/gabay.git)
cd gabay


Install dependencies

# For the mobile app
cd mobile
npm install

# For the web/backend
cd ../web
npm install


Environment Setup
Create a .env file in the root directories and add your keys (Supabase, Groq, MapLibre):

EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
GROQ_API_KEY=your_ai_key


Run the Application

# Run Mobile App
npx expo start

# Run Web Dashboard
npm run dev