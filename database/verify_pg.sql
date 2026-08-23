-- ==============================================================================
-- GIGEASY POSTGRESQL DATABASE VERIFICATION SUITE
-- ==============================================================================

-- 1. Verify Table Record Counts
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL
SELECT 'workers' AS table_name, COUNT(*) FROM workers
UNION ALL
SELECT 'employers' AS table_name, COUNT(*) FROM employers
UNION ALL
SELECT 'skills' AS table_name, COUNT(*) FROM skills
UNION ALL
SELECT 'jobs' AS table_name, COUNT(*) FROM jobs
UNION ALL
SELECT 'job_applications' AS table_name, COUNT(*) FROM job_applications
UNION ALL
SELECT 'bookings' AS table_name, COUNT(*) FROM bookings
UNION ALL
SELECT 'earnings' AS table_name, COUNT(*) FROM earnings
UNION ALL
SELECT 'ratings' AS table_name, COUNT(*) FROM ratings
UNION ALL
SELECT 'kyc_verification' AS table_name, COUNT(*) FROM kyc_verification;

-- 2. Verify Spatial Haversine Distance Query (Jobs near Connaught Place 28.6315, 77.2167)
SELECT j.job_id, j.title, j.skill_required, j.wage, j.location,
       ROUND((6371 * acos(
         cos(radians(28.6315)) * cos(radians(j.latitude)) *
         cos(radians(j.longitude) - radians(77.2167)) +
         sin(radians(28.6315)) * sin(radians(j.latitude))
       ))::numeric, 2) AS distance_km
FROM jobs j
WHERE j.status = 'OPEN'
ORDER BY distance_km ASC;

-- 3. Verify Job Applications Joined with Worker & Skill Details
SELECT ja.application_id, ja.job_id, j.title AS job_title, w.full_name AS worker_name, ja.application_status
FROM job_applications ja
JOIN jobs j ON ja.job_id = j.job_id
JOIN workers w ON ja.worker_id = w.worker_id;

-- 4. Verify Earnings Aggregations for Workers
SELECT 
  w.full_name,
  COALESCE(SUM(e.amount), 0) AS total_earnings,
  COALESCE(SUM(CASE WHEN DATE(e.payment_date) = CURRENT_DATE THEN e.amount ELSE 0 END), 0) AS today_earnings,
  COALESCE(SUM(CASE WHEN e.payment_date >= DATE_TRUNC('week', CURRENT_DATE) THEN e.amount ELSE 0 END), 0) AS weekly_earnings,
  COALESCE(SUM(CASE WHEN e.payment_date >= DATE_TRUNC('month', CURRENT_DATE) THEN e.amount ELSE 0 END), 0) AS monthly_earnings
FROM workers w
LEFT JOIN earnings e ON w.worker_id = e.worker_id AND e.payment_status = 'PAID'
GROUP BY w.worker_id, w.full_name;

-- 5. Verify Worker Rating Calculation
SELECT 
  w.worker_id,
  w.full_name,
  COALESCE(AVG(r.rating)::NUMERIC(3,2), 5.0) AS calculated_rating,
  COUNT(r.rating_id) AS total_reviews
FROM workers w
LEFT JOIN ratings r ON w.worker_id = r.worker_id
GROUP BY w.worker_id, w.full_name;
