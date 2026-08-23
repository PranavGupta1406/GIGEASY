-- ==============================================================================
-- GIGEASY POSTGRESQL DATABASE SCHEMA - ON DEMAND MARKETPLACE
-- Database Name: gigeasy
-- ==============================================================================

-- Drop existing tables
DROP TABLE IF EXISTS kyc_verification CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS worker_assignments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS worker_services CASCADE;
DROP TABLE IF EXISTS worker_skills CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
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
-- Table 4: service_categories
-- ------------------------------------------------------------------------------
CREATE TABLE service_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50)
);

-- ------------------------------------------------------------------------------
-- Table 5: services
-- ------------------------------------------------------------------------------
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES service_categories(category_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price > 0),
    estimated_arrival_mins INT DEFAULT 30,
    description TEXT
);

CREATE INDEX idx_services_category ON services(category_id);

-- ------------------------------------------------------------------------------
-- Table 6: worker_services
-- ------------------------------------------------------------------------------
CREATE TABLE worker_services (
    worker_id INT REFERENCES workers(worker_id) ON DELETE CASCADE,
    service_id INT REFERENCES services(service_id) ON DELETE CASCADE,
    PRIMARY KEY (worker_id, service_id)
);

-- ------------------------------------------------------------------------------
-- Table 7: carts
-- ------------------------------------------------------------------------------
CREATE TABLE carts (
    cart_id SERIAL PRIMARY KEY,
    employer_id INT NOT NULL UNIQUE REFERENCES employers(employer_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Table 8: cart_items
-- ------------------------------------------------------------------------------
CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    date DATE,
    shift_time TIME,
    duration_hours INT DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Table 9: orders
-- ------------------------------------------------------------------------------
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    employer_id INT NOT NULL REFERENCES employers(employer_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'SEARCHING_WORKERS', 'WORKERS_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    work_site_address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(20),
    special_instructions TEXT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_employer ON orders(employer_id);

-- ------------------------------------------------------------------------------
-- Table 10: order_items
-- ------------------------------------------------------------------------------
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    shift_time TIME NOT NULL,
    duration_hours INT DEFAULT 8
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------------------------
-- Table 11: bookings (worker_assignments)
-- ------------------------------------------------------------------------------
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    order_item_id INT NOT NULL REFERENCES order_items(order_item_id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    employer_id INT NOT NULL REFERENCES employers(employer_id) ON DELETE CASCADE,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'SEARCHING' CHECK (booking_status IN ('SEARCHING', 'ASSIGNED', 'EN_ROUTE', 'WORK_STARTED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_order_item ON bookings(order_item_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);

-- ------------------------------------------------------------------------------
-- Table 12: earnings
-- ------------------------------------------------------------------------------
CREATE TABLE earnings (
    earning_id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID')),
    payment_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_earnings_worker ON earnings(worker_id);

-- ------------------------------------------------------------------------------
-- Table 13: ratings
-- ------------------------------------------------------------------------------
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    worker_id INT NOT NULL REFERENCES workers(worker_id) ON DELETE CASCADE,
    employer_id INT NOT NULL REFERENCES employers(employer_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_worker ON ratings(worker_id);

-- ------------------------------------------------------------------------------
-- Table 14: kyc_verification
-- ------------------------------------------------------------------------------
CREATE TABLE kyc_verification (
    kyc_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    face_verified BOOLEAN DEFAULT FALSE,
    digilocker_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE
);
