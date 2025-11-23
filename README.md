# Gabay: AI-Powered Hospital & Doctor Locator (HIS 2.0 for the Philippines)

Gabay is a next-generation **Health Information System (HIS 2.0)** built to bridge the gap between Filipino patients and quality medical services. It addresses:

- **Financial ambiguity** (shock hospital bills)
- **Fragmented care** (disconnected apps and hospital systems)
- **Unequal access** to appropriate facilities and specialists

Gabay does this through a **dual-module ecosystem**: a patient app and a hospital management core, connected by AI and real-time data.

---

## 📜 Table of Contents

1. [About the Project](#-about-the-project)
2. [Problem Statement](#-problem-statement)
3. [The Solution](#-the-solution)
4. [Key Features](#-key-features)
   - [Gabay 1.0 – Patient App](#gabay-10--patient-app)
   - [Gabay 2.0 – Hospital Core](#gabay-20--hospital-core)
5. [Tech Stack](#-tech-stack)
   - [Mobile Client (Gabay 1.0)](#mobile-client-gabay-10)
   - [Backend & DevOps](#backend--devops)
   - [AI & Data](#ai--data)
6. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Setup](#environment-setup)
   - [Running the Apps](#running-the-apps)
7. [The Team](#-the-team)
8. [Acknowledgments](#-acknowledgments)

---

## 🧐 About the Project

**Gabay** was submitted as an entry for the **PUP Hackathon: Uthack ang Puhunan**.

Unlike traditional hospital systems that focus only on administration, Gabay is **patient-first**:

- Uses **AI** and **geolocation** to guide users from first symptom to proper consultation.
- Provides **real-time financial transparency** so patients can see their **actual out-of-pocket** costs.
- Links patient tools and hospital operations into a **single, unified source of truth**.

---

## ⚠️ Problem Statement

The Philippine healthcare system faces a **“Crisis of Financial Ambiguity and Fragmentation”**:

1. **Financial Toxicity**
   - Patients rarely know their **net balance** (after PhilHealth/HMO deductions) until discharge.
   - This results in **“shock bills”** and financial distress.

2. **Fragmented Navigation**
   - Hospitals maintain internal ledgers.
   - Patients use separate booking or health apps.
   - There is **no unified, patient-visible ledger** or navigation layer.

3. **Inefficient Triage**
   - Little or no **pre-screening** of cases.
   - **Specialized facilities** become overcrowded with cases suitable for **primary care**, straining resources.

---

## 💡 The Solution

Gabay introduces a **HIS 2.0 architecture** composed of two tightly integrated modules:

1. **Gabay 1.0 – Mobile Client (Patient App)**
   - AI triage and navigation
   - Real-time financial ledger
   - Appointment booking and records vault

2. **Gabay 2.0 – Web Admin (Hospital Core)**
   - Hospital operations, queueing, and scheduling
   - Insurance and billing logic
   - Regulatory and claims automation

Together, they create a **closed feedback loop** between patient experience and hospital operations.

---

## 🚀 Key Features

### Gabay 1.0 – Patient App

**Target Platform:** Mobile (iOS / Android)

- 🤖 **AI-Powered Chatbot**
  - Uses **Llama-3.1-8B** for digital triage.
  - Assesses symptoms and suggests **urgency level** (e.g., ER vs. outpatient consult).

- 📍 **Geospatial Facility Matching**
  - Recommends **hospitals and doctors** based on:
    - Clinical specialization
    - Proximity via **MapLibre GL**

- 💰 **Real-Time Patient Ledger**
  - Shows **exact out-of-pocket balance** after:
    - PhilHealth deductions
    - HMO coverage
  - Reduces risk of **unexpected bills**.

- 📂 **Health Records Vault**
  - Secure storage for:
    - Lab results
    - Prescriptions
    - Immunization history
  - With configurable **privacy controls**.

- 📅 **Smart Scheduling**
  - Direct appointment booking.
  - Syncs with hospital’s **internal calendar** and capacity.

- 💳 **E-Payments**
  - Integrated payment gateway for:
    - Credit/debit cards
    - E-wallets

- 🔍 **Claims Tracker**
  - Real-time view of **insurance claim status**:
    - e.g., “Submitted”, “Processing”, “Paid”

---

### Gabay 2.0 – Hospital Core

**Target Platform:** Web (Desktop)

- 🏥 **Operational Command Center**
  - Unified dashboard for:
    - Patient search and registration
    - Queue and visit management

- ⚙️ **Insurance Automation Engine**
  - Configurable rules for:
    - Carrier coverage
    - Co-pays and deductibles
  - Automatically computes the **“Patient Portion”** of the bill.

- 📆 **Dynamic Appointment Book**
  - Visual schedule management for:
    - Providers and their availability
    - Rooms and facility resources

- 📝 **Automated Claims Generation**
  - One-click generation of **PhilHealth-compliant** claim forms (PDF).
  - Pulls data directly from the **ledger and encounters**.

- 📊 **Analytics & Reporting**
  - Real-time metrics for:
    - Revenue cycle
    - Provider productivity
    - Disease and case surveillance

- 🔐 **Role-Based Access Control**
  - Granular permissions for:
    - Administrative staff
    - Physicians
    - Finance officers and billers

---

## 🛠 Tech Stack

Designed for **low-resource environments**, prioritizing **cost, reliability, and portability**.

### Mobile Client (Gabay 1.0)

- **Framework:** React Native (Expo)
- **State Management:** Zustand
- **Forms & Validation:** React Hook Form + Zod
- **Maps & Geospatial:** MapLibre GL

### Backend & DevOps

- **Infrastructure:** Serverless Functions on **Vercel**
- **CI/CD:** GitHub Actions
- **Monitoring & Error Tracking:** Sentry

### AI & Data

- **Primary LLM:** Groq Llama-3.1-8B-Instant
- **Fallback LLM:** Hugging Face Mistral 7B
- **Database:** PostgreSQL with **PostGIS** (geospatial queries)
- **BaaS:** Supabase (Auth, Storage, Real-time Database)

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- **Expo Go** app (for mobile testing on device)

> Adapt paths/commands below to match your actual repo layout  
> (e.g., `client` / `server` instead of `mobile` / `web` if needed).

---

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/gabay.git
   cd gabay
   ```

2. **Install dependencies**

   **Mobile app:**

   ```bash
   cd mobile
   npm install
   ```

   **Web / backend:**

   ```bash
   cd ../web
   npm install
   ```

---

### Environment Setup

Create a `.env` file in the relevant app directories (e.g., `mobile`, `web`) and configure your keys:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

Add any additional environment variables required for:

- MapLibre (e.g., tile server keys)
- Sentry
- Other third-party integrations

---

### Running the Apps

From the **mobile** directory:

```bash
# Run Mobile App
npx expo start
```

From the **web** directory:

```bash
# Run Web Dashboard
npm run dev
```

Follow the terminal instructions to open:

- Mobile app in **Expo Go** (QR code)
- Web dashboard in your browser (usually `http://localhost:3000`)

---

## 👥 The Team

_Add your team members, roles, and contact links here._  
For example:

- Name – Role (e.g., AI Engineer, Mobile Developer)
- Name – Role (e.g., Product Designer)
- Name – Role (e.g., Backend Engineer)

---

## 🙏 Acknowledgments

- **PUP Hackathon: Uthack ang Puhunan** organizers and mentors
- Open-source communities behind:
  - React Native, Expo, Zustand, MapLibre
  - Supabase, PostgreSQL/PostGIS
  - Llama, Mistral, and related AI tooling

_Thank you for supporting healthcare innovation in the Philippines._