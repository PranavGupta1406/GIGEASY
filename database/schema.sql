-- ==============================================================================
-- GIGEASY POSTGRESQL DATABASE SCHEMA
-- Database Name: gigeasy
-- ==============================================================================

-- Create Database (Run separately if needed: CREATE DATABASE gigeasy;)

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS kyc_verification CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS worker_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS employers CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- Table 1: users
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- ------------------------------------------------------------------------------
-- Table 2: workers
-- ------------------------------------------------------------------------------
CREATE TABLE workers (
    worker_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    aadhaar_number VARCHAR(20),
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    experience_years NUMERIC(4, 1) DEFAULT 0,
    availability VARCHAR(50) DEFAULT 'AVAILABLE',
    profile_photo TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workers_user_id ON workers(user_id);
CREATE INDEX idx_workers_location ON workers(latitude, longitude);

-- ------------------------------------------------------------------------------
-- Table 3: employers
-- ------------------------------------------------------------------------------
CREATE TABLE employers (
    employer_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    company_type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employers_user_id ON employers(user_id);

-- ------------------------------------------------------------------------------
-- Table 4: skills
-- ------------------------------------------------------------------------------
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE INDEX idx_skills_name ON skills(skill_name);

-- ------------------------------------------------------------------------------
-- Table 5: worker_skills
-- ------------------------------------------------------------------------------
CREATE TABLE worker_skills (
    worker_id INT REFERENCES workers(worker_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (worker_id, skill_id)
);

-- ------------------------------------------------------------------------------
-- Table 6: jobs
-- ------------------------------------------------------------------------------
CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    employer_id INT NOT NULL REFERENCES employers(employer_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    skill_required VARCHAR(100) NOT NULL,
    wage NUMERIC(10, 2) NOT NULL CHECK (wage > 0),
    job_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    workers_required INT NOT NULL DEFAULT 1 CHECK (workers_required > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_skill ON jobs(skill_required);
CREATE INDEX idx_jobs_location ON jobs(latitude, longitude);

-- ------------------------------------------------------------------------------
-- Table 7: job_applications
-- ------------------------------------------------------------------------------
CREATE TABLE job_applications (
    application_id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    application_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (application_status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_job_worker UNIQUE (job_id, worker_id)
);

CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_worker ON job_applications(worker_id);

-- ------------------------------------------------------------------------------
-- Table 8: bookings
-- ------------------------------------------------------------------------------
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    employer_id INT NOT NULL REFERENCES employers(employer_id) ON DELETE CASCADE,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (booking_status IN ('CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_job ON bookings(job_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_bookings_employer ON bookings(employer_id);

-- ------------------------------------------------------------------------------
-- Table 9: earnings
-- ------------------------------------------------------------------------------
CREATE TABLE earnings (
    earning_id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID')),
    payment_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_earnings_worker ON earnings(worker_id);
CREATE INDEX idx_earnings_status ON earnings(payment_status);

-- ------------------------------------------------------------------------------
-- Table 10: ratings
-- ------------------------------------------------------------------------------
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    employer_id INT NOT NULL REFERENCES employers(employer_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_worker ON ratings(worker_id);
CREATE INDEX idx_ratings_job ON ratings(job_id);

-- ------------------------------------------------------------------------------
-- Table 11: kyc_verification
-- ------------------------------------------------------------------------------
CREATE TABLE kyc_verification (
    kyc_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    face_verified BOOLEAN DEFAULT FALSE,
    digilocker_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_kyc_user ON kyc_verification(user_id);
