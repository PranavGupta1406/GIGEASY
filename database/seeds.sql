-- ==============================================================================
-- GIGEASY POSTGRESQL SEED DATA - ON DEMAND MARKETPLACE
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO service_categories (category_id, name, description, icon_name) VALUES
(1, 'Construction & Infrastructure', 'Masons, Carpenters, Painters, Electricians, Plumbers', 'hard-hat'),
(2, 'Factory & Industrial Workers', 'Packing, Assembly, Warehouse, Forklift', 'factory'),
(3, 'Transportation & Delivery', 'Auto, E-Rickshaw, Tempo, Truck Drivers', 'truck'),
(4, 'Retail & Logistics', 'Warehouse Associate, Inventory Assistant, Sales Promoter', 'shopping-bag'),
(5, 'Event & Hospitality', 'Decorator, Catering, Waiter, Security Guard', 'coffee')
ON CONFLICT (category_id) DO NOTHING;

-- 2. Insert Services
INSERT INTO services (service_id, category_id, name, base_price, estimated_arrival_mins) VALUES
(1, 1, 'Mason', 800.00, 30),
(2, 1, 'Carpenter', 900.00, 30),
(3, 1, 'Painter', 750.00, 45),
(4, 1, 'Electrician', 1000.00, 20),
(5, 1, 'Plumber', 900.00, 25),
(6, 1, 'Welder', 1200.00, 60),
(7, 2, 'Packing Worker', 600.00, 30),
(8, 2, 'Warehouse Loader', 650.00, 30),
(9, 3, 'Auto Driver', 700.00, 15),
(10, 3, 'Tempo Driver', 1100.00, 30),
(11, 4, 'Sales Promoter', 850.00, 60),
(12, 5, 'Waiter', 600.00, 45),
(13, 5, 'Security Guard', 800.00, 60),
(14, 5, 'Housekeeping Staff', 500.00, 45)
ON CONFLICT (service_id) DO NOTHING;

-- 3. Insert Users (Admin, Employer, Worker)
INSERT INTO users (user_id, firebase_uid, role, phone, email) VALUES
(1, 'uid_employer_1', 'employer', '+919876543210', 'employer1@gigeasy.com'),
(2, 'uid_worker_1', 'worker', '+919999999991', 'worker1@gigeasy.com'),
(3, 'uid_worker_2', 'worker', '+919999999992', 'worker2@gigeasy.com'),
(4, 'uid_worker_3', 'worker', '+919999999993', 'worker3@gigeasy.com'),
(5, 'uid_worker_4', 'worker', '+919999999994', 'worker4@gigeasy.com')
ON CONFLICT (user_id) DO NOTHING;

-- 4. Insert Employer
INSERT INTO employers (employer_id, user_id, company_name, company_type, address, verified) VALUES
(1, 1, 'Apex Builders Pvt Ltd', 'Construction', 'Plot 45, Okhla Phase 3, New Delhi', TRUE)
ON CONFLICT (employer_id) DO NOTHING;

-- 5. Insert Workers
INSERT INTO workers (worker_id, user_id, full_name, location, latitude, longitude, experience_years, verified) VALUES
(1, 2, 'Ramesh Kumar', 'Okhla, New Delhi', 28.5355, 77.2631, 5.5, TRUE),
(2, 3, 'Suresh Singh', 'Govindpuri, New Delhi', 28.5283, 77.2652, 3.0, TRUE),
(3, 4, 'Amit Sharma', 'Kalkaji, New Delhi', 28.5398, 77.2571, 8.0, TRUE),
(4, 5, 'Rahul Verma', 'Lajpat Nagar, New Delhi', 28.5677, 77.2433, 2.5, FALSE)
ON CONFLICT (worker_id) DO NOTHING;

-- 6. Map Worker Services
INSERT INTO worker_services (worker_id, service_id) VALUES
(1, 4), -- Ramesh is Electrician
(1, 5), -- Ramesh is also Plumber
(2, 1), -- Suresh is Mason
(3, 2), -- Amit is Carpenter
(4, 4)  -- Rahul is Electrician
ON CONFLICT DO NOTHING;

-- 7. Insert Carts (Empty cart for employer)
INSERT INTO carts (cart_id, employer_id) VALUES
(1, 1)
ON CONFLICT (cart_id) DO NOTHING;

-- (Optional) If we want a cart item:
-- INSERT INTO cart_items (cart_id, service_id, quantity, date, shift_time) VALUES (1, 4, 2, CURRENT_DATE, '09:00:00');

-- 8. Insert Orders (Past order)
INSERT INTO orders (order_id, employer_id, status, work_site_address, latitude, longitude, total_amount) VALUES
(1, 1, 'COMPLETED', 'Okhla Phase 3, Delhi', 28.5355, 77.2631, 2000.00),
(2, 1, 'REQUESTED', 'Okhla Phase 3, Delhi', 28.5355, 77.2631, 2800.00)
ON CONFLICT (order_id) DO NOTHING;

-- 9. Insert Order Items
INSERT INTO order_items (order_item_id, order_id, service_id, quantity, price, date, shift_time) VALUES
(1, 1, 4, 2, 1000.00, CURRENT_DATE - INTERVAL '2 days', '09:00:00'), -- 2 Electricians
(2, 2, 1, 3, 800.00, CURRENT_DATE + INTERVAL '1 day', '09:00:00'), -- 3 Masons
(3, 2, 2, 1, 900.00, CURRENT_DATE + INTERVAL '1 day', '09:00:00')  -- 1 Carpenter
ON CONFLICT (order_item_id) DO NOTHING;

-- 10. Insert Bookings (Assignments)
INSERT INTO bookings (booking_id, order_item_id, worker_id, employer_id, booking_status) VALUES
(1, 1, 1, 1, 'COMPLETED'), -- Ramesh completed Electrician job
(2, 1, 4, 1, 'COMPLETED')  -- Rahul completed Electrician job
ON CONFLICT (booking_id) DO NOTHING;

-- 11. Insert Earnings
INSERT INTO earnings (worker_id, booking_id, amount, payment_status, payment_date) VALUES
(1, 1, 1000.00, 'PAID', CURRENT_TIMESTAMP),
(4, 2, 1000.00, 'PAID', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 12. Insert Ratings
INSERT INTO ratings (booking_id, worker_id, employer_id, rating, review) VALUES
(1, 1, 1, 5, 'Great work, on time.'),
(2, 4, 1, 4, 'Good work.')
ON CONFLICT DO NOTHING;

-- Reset Sequences
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('workers_worker_id_seq', (SELECT MAX(worker_id) FROM workers));
SELECT setval('employers_employer_id_seq', (SELECT MAX(employer_id) FROM employers));
SELECT setval('service_categories_category_id_seq', (SELECT MAX(category_id) FROM service_categories));
SELECT setval('services_service_id_seq', (SELECT MAX(service_id) FROM services));
SELECT setval('carts_cart_id_seq', (SELECT MAX(cart_id) FROM carts));
SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));
SELECT setval('order_items_order_item_id_seq', (SELECT MAX(order_item_id) FROM order_items));
SELECT setval('bookings_booking_id_seq', (SELECT MAX(booking_id) FROM bookings));
