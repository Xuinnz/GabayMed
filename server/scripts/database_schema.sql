-- ==============================================================================
-- GABAY: Health & Financial Navigation System - Database Initialization
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. DEFINE ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('patient', 'staff', 'admin');
CREATE TYPE facility_type AS ENUM ('hospital', 'clinic', 'diagnostic_center');
CREATE TYPE facility_level AS ENUM ('primary_care', 'level_1', 'level_2', 'level_3', 'specialized');
CREATE TYPE accreditation_status AS ENUM ('philhealth_accredited', 'non_accredited');
CREATE TYPE plan_coverage_type AS ENUM ('primary', 'secondary', 'tertiary');
CREATE TYPE carrier_status AS ENUM ('active', 'inactive');
CREATE TYPE carrier_type AS ENUM ('government', 'hmo');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE session_status AS ENUM ('active', 'inactive');
CREATE TYPE sender_type AS ENUM ('facility', 'user');
CREATE TYPE service_status AS ENUM ('available', 'full');
CREATE TYPE provider_type AS ENUM ('doctor', 'nurse', 'technician');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'missed');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'pending', 'refunded');
CREATE TYPE payment_code AS ENUM ('cash', 'card', 'check', 'online');
CREATE TYPE ledger_type AS ENUM ('payment', 'procedure');
CREATE TYPE claim_status AS ENUM ('pending_submission', 'submitted_to_ph', 'adjudicated', 'denied');

-- 3. CREATE TABLES
-- ------------------------------------------------------------------------------

-- Users (Extension of Auth.Users is managed via app logic usually, but here is the public profile)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    birth_date DATE,
    contact_number TEXT,
    address TEXT,
    location GEOGRAPHY(POINT, 4326), -- GPS Location
    medical_background JSONB DEFAULT '{}',
    medical_history JSONB DEFAULT '{}', -- For Agent B Context
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facilities (The Directory)
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    type facility_type NOT NULL DEFAULT 'hospital',
    level facility_level DEFAULT 'level_1', -- Critical for PhilHealth Logic
    contact_number TEXT,
    location GEOGRAPHY(POINT, 4326), -- For Proximity Search
    philhealth_accreditation_no TEXT,
    accreditation_status accreditation_status DEFAULT 'non_accredited',
    is_public BOOLEAN DEFAULT false, -- Powers Public vs Private Logic
    is_gabay BOOLEAN DEFAULT false, -- Is this a Partner Facility?
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients (The Link between User and Facility)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    local_mrn TEXT NOT NULL, -- Medical Record Number specific to this facility
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, facility_id) -- Prevent duplicate profiles
);

-- Staff (Facility Admins)
CREATE TABLE staff (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    role user_role DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Carriers
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    status carrier_status DEFAULT 'active',
    type carrier_type NOT NULL,
    street_address TEXT,
    city TEXT,
    province TEXT,
    zip_code TEXT,
    accreditation_number TEXT,
    payer_id TEXT, -- For EDI/Claims
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Plans (The Rules Engine)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_id UUID REFERENCES carriers(id),
    name TEXT NOT NULL, -- e.g. "Maxicare Platinum"
    renewal_month INT,
    deductible DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Policies (Global Insurance Profile)
CREATE TABLE user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    subscriber_id TEXT NOT NULL,
    coverage_start_date DATE,
    coverage_end_date DATE,
    coverage_type plan_coverage_type DEFAULT 'primary',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specializations (Taxonomy)
CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Matched by Agent A
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Guidelines (Vector Store for RAG)
CREATE TABLE medical_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    category TEXT, -- Hybrid Search Filter
    embedding VECTOR(1536), -- Compatible with OpenAI/Voyage
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triage Sessions (Chat History)
CREATE TABLE triage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    urgency_level urgency_level DEFAULT 'low',
    recommended_specialist_slug TEXT, -- Stores the AI result
    summary_text TEXT,
    status session_status DEFAULT 'active',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triage Messages
CREATE TABLE triage_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES triage_sessions(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL, -- 'user' or 'ai'
    content TEXT NOT NULL,
    ai_metadata JSONB DEFAULT '{}', -- Stores confidence score, reasoning
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facility Services (Operational)
CREATE TABLE facility_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    specialization_id UUID REFERENCES specializations(id),
    avg_wait_time_minutes INT DEFAULT 60, -- Operational Signal
    status service_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procedures (Reference Standard)
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL, -- CPT/PhilHealth Code
    name TEXT NOT NULL,
    standard_ref_price DECIMAL(10,2), -- Benchmark Price
    specialization_id UUID REFERENCES specializations(id),
    appointment_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee Schedules (Pricing Containers)
CREATE TABLE fee_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "2025 Standard Rates"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee Schedule Items (The REAL Price Source of Truth)
CREATE TABLE fee_schedule_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES fee_schedules(id) ON DELETE CASCADE,
    procedure_id UUID REFERENCES procedures(id),
    price DECIMAL(10,2) NOT NULL, -- The specific price at this hospital
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(schedule_id, procedure_id)
);

-- Providers (Doctors)
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_service_id UUID REFERENCES facility_services(id),
    first_name TEXT,
    last_name TEXT,
    type provider_type DEFAULT 'doctor',
    license_number TEXT,
    schedule_details JSONB DEFAULT '{}', -- Working Hours
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    provider_id UUID REFERENCES providers(id),
    procedure_id UUID REFERENCES procedures(id), -- The service booked
    appointment_date TIMESTAMPTZ NOT NULL,
    reason_for_visit TEXT,
    status appointment_status DEFAULT 'pending',
    duration_minutes INT DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (Direct Facility <-> Patient)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    sender_type sender_type NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ledgers (The Bill)
CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id),
    total_bill_amount DECIMAL(10,2) NOT NULL,
    philhealth_deduction DECIMAL(10,2) DEFAULT 0,
    hmo_deduction DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    -- Generated Column for NET PAYABLE
    patient_payable_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_bill_amount - philhealth_deduction - hmo_deduction - discount_amount) STORED,
    payment_status payment_status DEFAULT 'unpaid',
    claim_status claim_status DEFAULT 'pending_submission',
    description TEXT,
    payment_code payment_code,
    type ledger_type DEFAULT 'procedure',
    transaction_date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES
-- ------------------------------------------------------------------------------
-- Geospatial Index for Fast Map Search
CREATE INDEX idx_facilities_location ON facilities USING GIST(location);
-- Vector Index for RAG
CREATE INDEX idx_medical_guidelines_embedding ON medical_guidelines USING hnsw (embedding vector_cosine_ops);
-- Foreign Key Indexes (Performance)
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_fee_items_procedure ON fee_schedule_items(procedure_id);

-- 5. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_guidelines ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Simplified for Hackathon)
-- Users can see their own profile
CREATE POLICY "Users view own profile" ON users FOR SELECT USING (auth.uid() = id);

-- Patients can see ledgers linked to their patient profile
CREATE POLICY "Patients view own ledgers" ON ledgers FOR SELECT 
USING (
    appointment_id IN (
        SELECT id FROM appointments WHERE patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    )
);

-- Public can read Guidelines (for RAG)
CREATE POLICY "Public read guidelines" ON medical_guidelines FOR SELECT TO anon, authenticated USING (true);

-- 6. FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Function: Find Nearest Facilities
CREATE OR REPLACE FUNCTION find_nearest_facility(
    user_lat FLOAT,
    user_long FLOAT,
    limit_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type facility_type,
    is_public BOOLEAN,
    dist_meters FLOAT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.type,
        f.is_public,
        ST_Distance(f.location, ST_SetSRID(ST_MakePoint(user_long, user_lat), 4326)) AS dist_meters
    FROM facilities f
    ORDER BY f.location <-> ST_SetSRID(ST_MakePoint(user_long, user_lat), 4326)
    LIMIT limit_count;
END;
$$;

-- Trigger Function: Auto-Message on Appointment
CREATE OR REPLACE FUNCTION notify_appointment_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO messages (patient_id, sender_type, content)
    VALUES (
        NEW.patient_id,
        'facility',
        'Hello! We have received your appointment request for ' || TO_CHAR(NEW.appointment_date, 'Mon DD, YYYY at HH:MI AM') || '. Our team will review it shortly.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointment_created
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_appointment_creation();

-- Trigger Function: Auto-Create Ledger on Completion
CREATE OR REPLACE FUNCTION generate_bill_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    service_price DECIMAL(10,2);
    ph_deduction DECIMAL(10,2) := 0; -- Default 0
    hmo_deduction DECIMAL(10,2) := 0; -- Default 0
BEGIN
    -- Only run if status changed to COMPLETED
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        
        -- 1. Get Price (Try Fee Schedule first, then fallback to Procedure Ref)
        SELECT COALESCE(
            (SELECT price FROM fee_schedule_items fsi 
             JOIN fee_schedules fs ON fs.id = fsi.schedule_id 
             JOIN patients p ON p.facility_id = fs.facility_id
             WHERE fsi.procedure_id = NEW.procedure_id AND p.id = NEW.patient_id AND fs.is_active = true LIMIT 1),
            (SELECT standard_ref_price FROM procedures WHERE id = NEW.procedure_id),
            0
        ) INTO service_price;

        -- 2. Mock Deduction Logic (For Hackathon Demo)
        -- In real life, query user_plans + plan rules.
        -- Here: If public facility, 100% off. If private, flat 500 off.
        ph_deduction := 500.00;

        -- 3. Insert Ledger
        INSERT INTO ledgers (
            appointment_id, 
            total_bill_amount, 
            philhealth_deduction, 
            hmo_deduction, 
            description, 
            type
        ) VALUES (
            NEW.id,
            service_price,
            ph_deduction,
            hmo_deduction,
            'Service Completion Bill',
            'procedure'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointment_completed
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION generate_bill_on_completion();

CREATE OR REPLACE FUNCTION match_guidelines (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    medical_guidelines.id,
    medical_guidelines.content,
    medical_guidelines.metadata,
    1 - (medical_guidelines.embedding <=> query_embedding) as similarity
  FROM medical_guidelines
  WHERE 1 - (medical_guidelines.embedding <=> query_embedding) > match_threshold
  ORDER BY medical_guidelines.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. REALTIME SETUP
-- ------------------------------------------------------------------------------
-- Allow frontend to subscribe to changes (Optimistic UI)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE ledgers;