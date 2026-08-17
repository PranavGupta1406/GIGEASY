-- ==============================================================================
-- GIGEASY PRODUCTION POSTGRESQL + POSTGIS DATABASE SCHEMA
-- ==============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ------------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('WORKER', 'EMPLOYER', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);

-- ------------------------------------------------------------------------------
-- 2. SKILLS MASTER DATA
-- ------------------------------------------------------------------------------
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_category ON skills(category);

-- ------------------------------------------------------------------------------
-- 3. WORKER PROFILES & WORKER SKILLS
-- ------------------------------------------------------------------------------
CREATE TYPE availability_status AS ENUM ('AVAILABLE', 'BUSY', 'UNAVAILABLE');

CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    profile_photo_url TEXT,
    location GEOMETRY(Point, 4326), -- PostGIS coordinates (lat/lng)
    address_text TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    experience_years NUMERIC(4, 1) DEFAULT 0,
    expected_daily_wage INT NOT NULL,
    preferred_radius_km INT DEFAULT 15,
    availability_status availability_status DEFAULT 'AVAILABLE',
    languages VARCHAR(50)[] DEFAULT ARRAY['Hindi'],
    bio TEXT,
    trust_score INT DEFAULT 70 CHECK (trust_score BETWEEN 0 AND 100),
    verification_status verification_status DEFAULT 'PENDING',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    completed_jobs_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Index on Worker Location
CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST(location);
CREATE INDEX idx_worker_profiles_availability ON worker_profiles(availability_status);
CREATE INDEX idx_worker_profiles_trust ON worker_profiles(trust_score DESC);

CREATE TABLE worker_skills (
    worker_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE RESTRICT,
    years_experience INT DEFAULT 1,
    PRIMARY KEY (worker_id, skill_id)
);

-- ------------------------------------------------------------------------------
-- 4. EMPLOYER PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE employer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    logo_url TEXT,
    location GEOMETRY(Point, 4326),
    address_text TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    gstin VARCHAR(20),
    verification_status verification_status DEFAULT 'VERIFIED',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    total_jobs_posted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employer_profiles_location ON employer_profiles USING GIST(location);

-- ------------------------------------------------------------------------------
-- 5. GIGS / JOBS
-- ------------------------------------------------------------------------------
CREATE TYPE job_status AS ENUM (
    'DRAFT', 'PUBLISHED', 'HIRING', 'FULL', 'ACTIVE', 'COMPLETED', 'CLOSED', 'CANCELLED', 'DISPUTED'
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employer_profiles(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    skill_id UUID REFERENCES skills(id) ON DELETE RESTRICT,
    location GEOMETRY(Point, 4326) NOT NULL,
    address_text TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    workers_required INT NOT NULL CHECK (workers_required > 0),
    workers_hired INT DEFAULT 0 CHECK (workers_hired <= workers_required),
    min_wage INT NOT NULL,
    max_wage INT NOT NULL,
    requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
    status job_status DEFAULT 'HIRING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Index for PostGIS ST_DWithin radius queries
CREATE INDEX idx_jobs_location ON jobs USING GIST(location);
CREATE INDEX idx_jobs_status_date ON jobs(status, start_date);

-- ------------------------------------------------------------------------------
-- 6. APPLICATIONS & WAGE NEGOTIATIONS
-- ------------------------------------------------------------------------------
CREATE TYPE application_status AS ENUM (
    'APPLIED', 'UNDER_REVIEW', 'NEGOTIATING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'WITHDRAWN', 'EXPIRED'
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
    proposed_wage INT NOT NULL,
    final_agreed_wage INT,
    status application_status DEFAULT 'APPLIED',
    note TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_job_worker_application UNIQUE (job_id, worker_id)
);

CREATE INDEX idx_applications_job ON job_applications(job_id, status);
CREATE INDEX idx_applications_worker ON job_applications(worker_id, status);

CREATE TABLE negotiations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    sender_role user_role NOT NULL,
    proposed_wage INT NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_negotiations_app ON negotiations(application_id, round_number);

-- ------------------------------------------------------------------------------
-- 7. ATTENDANCE & WORK EXECUTION
-- ------------------------------------------------------------------------------
CREATE TYPE shift_status AS ENUM ('SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW', 'DISPUTED');

CREATE TABLE shift_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE RESTRICT,
    worker_id UUID REFERENCES worker_profiles(id) ON DELETE RESTRICT,
    status shift_status DEFAULT 'SCHEDULED',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    worker_check_in_location GEOMETRY(Point, 4326),
    distance_from_site_meters INT,
    is_geofence_verified BOOLEAN DEFAULT FALSE,
    hours_worked NUMERIC(4, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shift_attendance_job ON shift_attendance(job_id);
CREATE INDEX idx_shift_attendance_worker ON shift_attendance(worker_id);

-- ------------------------------------------------------------------------------
-- 8. PAYMENTS & ESCROW
-- ------------------------------------------------------------------------------
CREATE TYPE payment_status AS ENUM (
    'PENDING', 'HELD_IN_ESCROW', 'RELEASED_TO_WORKER', 'REFUNDED', 'DISPUTED'
);

CREATE TABLE escrow_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE RESTRICT,
    employer_id UUID REFERENCES employer_profiles(id) ON DELETE RESTRICT,
    worker_id UUID REFERENCES worker_profiles(id) ON DELETE RESTRICT,
    agreed_daily_wage INT NOT NULL,
    platform_fee INT NOT NULL,
    tds_deduction INT NOT NULL,
    net_worker_payout INT NOT NULL,
    status payment_status DEFAULT 'HELD_IN_ESCROW',
    payment_gateway_ref VARCHAR(100),
    funded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_escrow_job ON escrow_payments(job_id);
CREATE INDEX idx_escrow_worker ON escrow_payments(worker_id);

-- ------------------------------------------------------------------------------
-- 9. RATINGS, REVIEWS & DISPUTES
-- ------------------------------------------------------------------------------
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE RESTRICT,
    rated_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    rated_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    score NUMERIC(3, 2) NOT NULL CHECK (score BETWEEN 1.0 AND 5.0),
    punctuality_score INT CHECK (punctuality_score BETWEEN 1 AND 5),
    work_quality_score INT CHECK (work_quality_score BETWEEN 1 AND 5),
    behaviour_score INT CHECK (behaviour_score BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE RESTRICT,
    raised_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    against_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 10. SAMPLE POSTGIS RADIUS QUERY TEMPLATE (Jobs within 10km of worker)
-- ------------------------------------------------------------------------------
-- SELECT j.*, 
--        ST_Distance(j.location::geography, ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography) / 1000 AS distance_km
-- FROM jobs j
-- WHERE j.status = 'HIRING'
--   AND ST_DWithin(j.location::geography, ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography, 10000)
-- ORDER BY distance_km ASC;
