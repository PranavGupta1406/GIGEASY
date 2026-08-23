-- Migration: 002_create_indexes.sql
-- Description: Indexes for optimal query performance

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_location ON workers(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_employers_user_id ON employers(user_id);

CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_skill ON jobs(skill_required);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON job_applications(worker_id);

CREATE INDEX IF NOT EXISTS idx_bookings_job ON bookings(job_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_employer ON bookings(employer_id);

CREATE INDEX IF NOT EXISTS idx_earnings_worker ON earnings(worker_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(payment_status);

CREATE INDEX IF NOT EXISTS idx_ratings_worker ON ratings(worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_job ON ratings(job_id);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verification(user_id);
