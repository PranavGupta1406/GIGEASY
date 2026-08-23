-- Seed Data for GigEasy

-- 1. Skills Master Data
INSERT INTO skills (skill_name) VALUES
('Electrician'),
('Carpenter'),
('Plumber'),
('Painter'),
('Welder'),
('Mason'),
('Helper'),
('Driver')
ON CONFLICT (skill_name) DO NOTHING;

-- 2. Sample Users
INSERT INTO users (firebase_uid, role, phone, email) VALUES
('uid_worker_1', 'worker', '+919876543210', 'ramesh.kumar@example.com'),
('uid_worker_2', 'worker', '+919876543211', 'suresh.verma@example.com'),
('uid_worker_3', 'worker', '+919876543212', 'amit.sharma@example.com'),
('uid_employer_1', 'employer', '+919876543220', 'hire@apexbuilders.com'),
('uid_employer_2', 'employer', '+919876543221', 'contact@delhirenovations.com')
ON CONFLICT (firebase_uid) DO NOTHING;

-- 3. Worker Profiles
INSERT INTO workers (user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified) VALUES
(1, 'Ramesh Kumar', 'XXXXXXXX1234', 'Connaught Place, New Delhi', 28.6315, 77.2167, 5.5, 'AVAILABLE', 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a', TRUE),
(2, 'Suresh Verma', 'XXXXXXXX5678', 'Noida Sector 62, Uttar Pradesh', 28.6280, 77.3649, 3.0, 'AVAILABLE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', TRUE),
(3, 'Amit Sharma', 'XXXXXXXX9012', 'DLF CyberCity, Gurugram', 28.4950, 77.0895, 7.0, 'AVAILABLE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', FALSE)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Employer Profiles
INSERT INTO employers (user_id, company_name, company_type, address, verified) VALUES
(4, 'Apex Builders Pvt Ltd', 'Construction', 'Plot 45, Okhla Phase 3, New Delhi', TRUE),
(5, 'Delhi Home Renovations', 'Services', 'Shop 12, South Extension, New Delhi', TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Worker Skills
INSERT INTO worker_skills (worker_id, skill_id) VALUES
(1, 1), -- Ramesh: Electrician
(1, 7), -- Ramesh: Helper
(2, 3), -- Suresh: Plumber
(2, 4), -- Suresh: Painter
(3, 2), -- Amit: Carpenter
(3, 6)  -- Amit: Mason
ON CONFLICT DO NOTHING;

-- 6. Jobs
INSERT INTO jobs (employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required, status) VALUES
(1, 'Commercial Wiring & Setup', 'Urgent need for certified electrician for commercial building panel wiring.', 'Electrician', 1200.00, CURRENT_DATE + INTERVAL '1 day', '09:00:00', '18:00:00', 'Okhla Phase 3, New Delhi', 28.5355, 77.2631, 2, 'OPEN'),
(2, 'Bathroom Plumbing Repair', 'Fix leaky pipes and install new taps in residential flat.', 'Plumber', 900.00, CURRENT_DATE + INTERVAL '2 days', '10:00:00', '16:00:00', 'South Extension, New Delhi', 28.5684, 77.2207, 1, 'OPEN'),
(1, 'Wall Painting & Touchup', 'Interior painting for 2 BHK apartment.', 'Painter', 1000.00, CURRENT_DATE + INTERVAL '3 days', '09:00:00', '17:00:00', 'Noida Sector 18', 28.5708, 77.3261, 3, 'OPEN')
ON CONFLICT DO NOTHING;

-- 7. Job Applications
INSERT INTO job_applications (job_id, worker_id, application_status) VALUES
(1, 1, 'ACCEPTED'),
(2, 2, 'PENDING')
ON CONFLICT DO NOTHING;

-- 8. Bookings
INSERT INTO bookings (job_id, worker_id, employer_id, booking_status) VALUES
(1, 1, 1, 'CONFIRMED')
ON CONFLICT DO NOTHING;

-- 9. Earnings
INSERT INTO earnings (worker_id, job_id, amount, payment_status, payment_date) VALUES
(1, 1, 1200.00, 'PAID', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 10. Ratings
INSERT INTO ratings (job_id, worker_id, employer_id, rating, review) VALUES
(1, 1, 1, 5, 'Excellent electrical work done on time!')
ON CONFLICT DO NOTHING;

-- 11. KYC Verification
INSERT INTO kyc_verification (user_id, aadhaar_verified, face_verified, digilocker_verified, verified_at) VALUES
(1, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP),
(2, TRUE, TRUE, FALSE, CURRENT_TIMESTAMP),
(3, FALSE, FALSE, FALSE, NULL),
(4, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP),
(5, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
