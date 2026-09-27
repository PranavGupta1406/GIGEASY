// PostgreSQL Connection Pool & Schema Manager — GigEasy
// Seamlessly connects to real PostgreSQL if available;
// otherwise automatically launches embedded pg-mem so the app works 100% locally with real SQL.
import { Pool as PgPool } from 'pg';
import { newDb } from 'pg-mem';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'gigeasy'}`;

let internalPool: any = new PgPool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 2000,
});

export let isDbConnected = false;
export let isUsingPgMem = false;

// Delegating pool that routes to either real PG or pg-mem seamlessly
export const pool = {
  query: (text: string, params?: any[]) => internalPool.query(text, params),
  connect: () => internalPool.connect(),
  on: (event: string, listener: (...args: any[]) => void) => internalPool.on?.(event, listener),
  end: () => internalPool.end?.(),
};

export async function initDatabase() {
  let client: any;
  try {
    client = await internalPool.connect();
    isDbConnected = true;
    console.log('✅ Connected to PostgreSQL database successfully');
  } catch (err: any) {
    console.warn(`⚠️  External PostgreSQL unavailable (${err.message}).`);
    console.log('🔄 Initializing embedded in-memory PostgreSQL engine (pg-mem) for full SQL lifecycle...');

    const memDb = newDb();
    memDb.public.registerFunction({
      name: 'uuid_generate_v4',
      impure: true,
      implementation: () => uuidv4(),
    });
    memDb.registerExtension('uuid-ossp', (schema) => {
      schema.registerFunction({
        name: 'uuid_generate_v4',
        impure: true,
        implementation: () => uuidv4(),
      });
    });

    const { Pool: MemPool } = memDb.adapters.createPg();
    internalPool = new MemPool();
    isDbConnected = true;
    isUsingPgMem = true;
    client = await internalPool.connect();
  }

  try {
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    } catch { /* extension already handled or not needed in memory */ }

    // Core user tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255),
        phone_number VARCHAR(30),
        role VARCHAR(20) NOT NULL DEFAULT 'worker',
        name VARCHAR(150),
        verification_status VARCHAR(30) DEFAULT 'UNVERIFIED',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS worker_profiles (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        city VARCHAR(100) NOT NULL DEFAULT 'Noida',
        state VARCHAR(100) NOT NULL DEFAULT 'UP',
        address_text TEXT,
        experience_years NUMERIC(4,1) DEFAULT 0,
        expected_daily_wage INT NOT NULL DEFAULT 1000,
        preferred_radius_km INT DEFAULT 15,
        availability_status VARCHAR(30) DEFAULT 'AVAILABLE',
        languages TEXT[] DEFAULT ARRAY['Hindi','English'],
        bio TEXT,
        trust_score INT DEFAULT 75,
        verification_status VARCHAR(30) DEFAULT 'PENDING',
        rating NUMERIC(3,2) DEFAULT 5.0,
        completed_jobs_count INT DEFAULT 0,
        skills JSONB DEFAULT '[]'::jsonb,
        latitude NUMERIC(10,7) DEFAULT 28.6139,
        longitude NUMERIC(10,7) DEFAULT 77.2090,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS employer_profiles (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(200) NOT NULL DEFAULT 'My Business',
        business_type VARCHAR(100) NOT NULL DEFAULT 'Other',
        contact_name VARCHAR(150) NOT NULL DEFAULT 'Contact',
        contact_phone VARCHAR(30),
        contact_email VARCHAR(255),
        city VARCHAR(100) NOT NULL DEFAULT 'Noida',
        state VARCHAR(100) NOT NULL DEFAULT 'UP',
        address_text TEXT,
        verification_status VARCHAR(30) DEFAULT 'VERIFIED',
        rating NUMERIC(3,2) DEFAULT 5.0,
        total_jobs_posted INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(100) PRIMARY KEY,
        employer_id VARCHAR(100),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        skill_category VARCHAR(100),
        skill_name VARCHAR(100),
        city VARCHAR(100) NOT NULL DEFAULT 'Noida',
        state VARCHAR(100) NOT NULL DEFAULT 'UP',
        address_text TEXT,
        start_date VARCHAR(50),
        start_time VARCHAR(50),
        end_time VARCHAR(50),
        workers_required INT DEFAULT 1,
        workers_hired INT DEFAULT 0,
        min_wage INT NOT NULL DEFAULT 0,
        max_wage INT NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'HIRING',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS job_applications (
        id VARCHAR(100) PRIMARY KEY,
        job_id VARCHAR(100),
        worker_id VARCHAR(100),
        proposed_wage INT NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'APPLIED',
        note TEXT,
        negotiations JSONB DEFAULT '[]'::jsonb,
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Gig lifecycle tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS gigs (
        gig_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employer_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        skill_id VARCHAR(50) NOT NULL DEFAULT 'other',
        skill_name VARCHAR(100) NOT NULL,
        skill_category VARCHAR(100) NOT NULL,
        workers_required INT NOT NULL DEFAULT 1,
        workers_confirmed INT NOT NULL DEFAULT 0,
        min_wage NUMERIC(10,2) NOT NULL,
        max_wage NUMERIC(10,2) NOT NULL,
        start_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME,
        duration_hours NUMERIC(4,1),
        address TEXT NOT NULL,
        latitude NUMERIC(10,7) NOT NULL,
        longitude NUMERIC(10,7) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        status VARCHAR(40) NOT NULL DEFAULT 'PUBLISHED',
        requirements TEXT[],
        fair_pay_min NUMERIC(10,2),
        fair_pay_max NUMERIC(10,2),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
      );
      CREATE TABLE IF NOT EXISTS gig_applications (
        application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        gig_id UUID NOT NULL REFERENCES gigs(gig_id) ON DELETE CASCADE,
        worker_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        proposed_wage NUMERIC(10,2) NOT NULL,
        agreed_wage NUMERIC(10,2),
        status VARCHAR(40) NOT NULL DEFAULT 'APPLIED',
        note TEXT,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        on_the_way_at TIMESTAMPTZ,
        arrived_at TIMESTAMPTZ,
        checked_in_at TIMESTAMPTZ,
        check_in_lat NUMERIC(10,7),
        check_in_lng NUMERIC(10,7),
        work_started_at TIMESTAMPTZ,
        work_submitted_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        employer_confirmed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (gig_id, worker_id)
      );
      CREATE TABLE IF NOT EXISTS negotiations (
        negotiation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        application_id UUID NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
        sender_role VARCHAR(20) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS direct_offers (
        offer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employer_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        worker_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gig_id UUID REFERENCES gigs(gig_id) ON DELETE SET NULL,
        work_type VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        location_address TEXT NOT NULL,
        latitude NUMERIC(10,7),
        longitude NUMERIC(10,7),
        duration_hours NUMERIC(4,1),
        pay NUMERIC(10,2) NOT NULL,
        requirements TEXT,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours')
      );
      CREATE TABLE IF NOT EXISTS gig_payments (
        payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        application_id UUID NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        razorpay_signature VARCHAR(400),
        cash_otp VARCHAR(6),
        cash_otp_expires_at TIMESTAMPTZ,
        cash_otp_verified_at TIMESTAMPTZ,
        status VARCHAR(30) NOT NULL DEFAULT 'PAYMENT_REQUIRED',
        initiated_at TIMESTAMPTZ,
        confirmed_at TIMESTAMPTZ,
        settled_at TIMESTAMPTZ,
        failure_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS work_sessions (
        session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        application_id UUID NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
        check_in_time TIMESTAMPTZ,
        check_in_lat NUMERIC(10,7),
        check_in_lng NUMERIC(10,7),
        check_out_time TIMESTAMPTZ,
        check_out_lat NUMERIC(10,7),
        check_out_lng NUMERIC(10,7),
        duration_minutes INT,
        notes TEXT
      );
      CREATE TABLE IF NOT EXISTS disputes (
        dispute_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        application_id UUID NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
        raised_by_role VARCHAR(20) NOT NULL,
        raised_by_user VARCHAR(100) NOT NULL REFERENCES users(id),
        issue_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        evidence_urls TEXT[],
        agreed_amount NUMERIC(10,2),
        employer_response TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
        admin_notes TEXT,
        resolution VARCHAR(20),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS gig_ratings (
        rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        application_id UUID NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
        rater_role VARCHAR(20) NOT NULL,
        rater_user_id VARCHAR(100) NOT NULL REFERENCES users(id),
        rated_user_id VARCHAR(100) NOT NULL REFERENCES users(id),
        score INT NOT NULL,
        tags TEXT[],
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (application_id, rater_role)
      );
      CREATE TABLE IF NOT EXISTS ratings (
        id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4(),
        worker_id VARCHAR(100),
        employer_id VARCHAR(100),
        rating NUMERIC(3,2) DEFAULT 5.0,
        score INT DEFAULT 5,
        rated_user_id VARCHAR(100)
      );
      CREATE TABLE IF NOT EXISTS worker_availability (
        user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        mode VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE_NOW',
        max_distance_km INT NOT NULL DEFAULT 10,
        preferred_trades TEXT[],
        min_pay_per_day NUMERIC(10,2),
        preferred_start TIME,
        preferred_end TIME,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS fair_pay_estimates (
        estimate_id SERIAL PRIMARY KEY,
        skill_category VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        p25_wage NUMERIC(10,2),
        p50_wage NUMERIC(10,2),
        p75_wage NUMERIC(10,2),
        sample_count INT NOT NULL DEFAULT 0,
        computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (skill_category, city)
      );
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(100),
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS audit_log (
        log_id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        actor_user_id VARCHAR(100),
        actor_role VARCHAR(20),
        previous_state JSONB,
        new_state JSONB,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed fair pay benchmarks
    await client.query(`
      INSERT INTO fair_pay_estimates (skill_category, city, p25_wage, p50_wage, p75_wage, sample_count) VALUES
        ('Electrical','Noida',1200,1500,1800,0),('Construction','Noida',900,1200,1500,0),
        ('Plumbing','Noida',1000,1300,1600,0),('Carpentry','Noida',1100,1400,1700,0),
        ('Warehouse','Noida',800,1000,1300,0),('Driving','Noida',900,1100,1400,0),
        ('Electrical','Delhi',1300,1600,2000,0),('Construction','Delhi',1000,1300,1600,0),
        ('Plumbing','Delhi',1100,1400,1700,0),('Carpentry','Delhi',1200,1500,1800,0),
        ('Warehouse','Delhi',850,1050,1350,0),('Driving','Delhi',950,1200,1500,0),
        ('Hospitality','Delhi',700,900,1200,0),('Hospitality','Noida',650,850,1150,0),
        ('Security','Noida',900,1100,1400,0),('Security','Delhi',950,1150,1450,0),
        ('Factory','Noida',800,1000,1250,0),('Cleaning','Noida',700,900,1100,0),
        ('Painting','Noida',1000,1300,1600,0),('Painting','Delhi',1100,1400,1700,0)
      ON CONFLICT (skill_category, city) DO NOTHING
    `);

    // Seed initial demo users, employer, worker, and gigs so the app is immediately populated
    await client.query(`
      INSERT INTO users (id, email, phone_number, role, name, verification_status) VALUES
        ('emp-demo-1', 'contact@delhibuilders.in', '+919876543210', 'employer', 'Delhi Builders Corp', 'VERIFIED'),
        ('e1', 'contact@delhibuilders.in', '+919876543210', 'employer', 'Delhi Builders Corp', 'VERIFIED'),
        ('usr_emp1', 'contact@delhibuilders.in', '+919876543210', 'employer', 'Delhi Builders Corp', 'VERIFIED'),
        ('worker-demo-1', 'ramesh.kumar@gmail.com', '+919812345678', 'worker', 'Ramesh Kumar', 'VERIFIED'),
        ('w1', 'ramesh.kumar@gmail.com', '+919812345678', 'worker', 'Ramesh Kumar', 'VERIFIED'),
        ('usr_w1', 'ramesh.kumar@gmail.com', '+919812345678', 'worker', 'Ramesh Kumar', 'VERIFIED'),
        ('worker-demo-2', 'sunil.sharma@gmail.com', '+919823456789', 'worker', 'Sunil Sharma', 'VERIFIED'),
        ('w2', 'sunil.sharma@gmail.com', '+919823456789', 'worker', 'Sunil Sharma', 'VERIFIED'),
        ('w3', 'vikram.singh@gmail.com', '+919834567890', 'worker', 'Vikram Singh', 'VERIFIED'),
        ('demo_user', 'demo@gigeasy.in', '+919999999999', 'worker', 'Demo User', 'VERIFIED')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO employer_profiles (id, user_id, business_name, business_type, contact_name, city, state, verification_status, rating, total_jobs_posted) VALUES
        ('ep-1', 'emp-demo-1', 'Delhi Builders Corp', 'Construction & Infrastructure', 'Rajesh Gupta', 'Noida', 'UP', 'VERIFIED', 4.85, 12),
        ('ep-e1', 'e1', 'Delhi Builders Corp', 'Construction & Infrastructure', 'Rajesh Gupta', 'Noida', 'UP', 'VERIFIED', 4.85, 12),
        ('ep-usr_emp1', 'usr_emp1', 'Delhi Builders Corp', 'Construction & Infrastructure', 'Rajesh Gupta', 'Noida', 'UP', 'VERIFIED', 4.85, 12)
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO worker_profiles (id, user_id, name, city, state, experience_years, expected_daily_wage, skills, availability_status, rating, completed_jobs_count, latitude, longitude) VALUES
        ('wp-1', 'worker-demo-1', 'Ramesh Kumar', 'Noida', 'UP', 5.5, 1400, '["Electrical", "Wiring", "Solar Panel Installation"]'::jsonb, 'AVAILABLE', 4.9, 34, 28.5355, 77.3910),
        ('wp-w1', 'w1', 'Ramesh Kumar', 'Noida', 'UP', 5.5, 1400, '["Electrical", "Wiring", "Solar Panel Installation"]'::jsonb, 'AVAILABLE', 4.9, 34, 28.5355, 77.3910),
        ('wp-usr_w1', 'usr_w1', 'Ramesh Kumar', 'Noida', 'UP', 5.5, 1400, '["Electrical", "Wiring", "Solar Panel Installation"]'::jsonb, 'AVAILABLE', 4.9, 34, 28.5355, 77.3910),
        ('wp-2', 'worker-demo-2', 'Sunil Sharma', 'Delhi', 'Delhi', 3.0, 1200, '["Carpentry", "Furniture Assembly", "Wood Polishing"]'::jsonb, 'AVAILABLE', 4.7, 18, 28.6139, 77.2090),
        ('wp-w2', 'w2', 'Sunil Sharma', 'Delhi', 'Delhi', 3.0, 1200, '["Carpentry", "Furniture Assembly", "Wood Polishing"]'::jsonb, 'AVAILABLE', 4.7, 18, 28.6139, 77.2090),
        ('wp-w3', 'w3', 'Vikram Singh', 'Noida', 'UP', 4.0, 1100, '["Warehouse", "Loading", "Inventory"]'::jsonb, 'AVAILABLE', 4.8, 22, 28.5355, 77.3910)
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO gigs (gig_id, employer_id, title, description, skill_id, skill_name, skill_category, workers_required, workers_confirmed, min_wage, max_wage, start_date, start_time, duration_hours, address, latitude, longitude, city, state, status, fair_pay_min, fair_pay_max) VALUES
        ('11111111-1111-1111-1111-111111111111', 'emp-demo-1', 'Commercial Electrical Conduit Wiring', 'Need 2 licensed electricians for complete conduit layout and main panel connections in commercial complex.', 'electrical', 'Commercial Electrician', 'Electrical', 2, 0, 1400, 1800, CURRENT_DATE + 1, '09:00:00', 8.0, 'Sector 62, Electronic City, Noida', 28.6270, 77.3725, 'Noida', 'UP', 'PUBLISHED', 1300, 1750),
        ('22222222-2222-2222-2222-222222222222', 'emp-demo-1', 'Custom Modular Kitchen Carpentry', 'Experienced carpenter needed for installing modular cabinets, hinge alignments, and drawer systems.', 'carpentry', 'Cabinet Carpenter', 'Carpentry', 1, 0, 1200, 1600, CURRENT_DATE + 2, '09:30:00', 8.0, 'Connaught Place, Central Delhi', 28.6315, 77.2167, 'Delhi', 'Delhi', 'PUBLISHED', 1150, 1550),
        ('33333333-3333-3333-3333-333333333333', 'emp-demo-1', 'Industrial Warehouse Sorting & Dispatch', 'Material handling and barcode scanning for logistics distribution center.', 'warehouse', 'Warehouse Associate', 'Warehouse', 3, 0, 950, 1200, CURRENT_DATE + 1, '08:00:00', 9.0, 'Okhla Phase III, Industrial Area, New Delhi', 28.5412, 77.2766, 'Delhi', 'Delhi', 'PUBLISHED', 900, 1150),
        ('44444444-4444-4444-4444-444444444444', 'emp-demo-1', 'Residential Copper Pipe Plumbing Fix', 'Fix concealed pipe leakage and reinstall sanitary fixtures in 3 bathrooms.', 'plumbing', 'Plumber', 'Plumbing', 1, 0, 1100, 1500, CURRENT_DATE + 1, '10:00:00', 7.0, 'Indirapuram, Ghaziabad', 28.6415, 77.3712, 'Ghaziabad', 'UP', 'PUBLISHED', 1050, 1450)
      ON CONFLICT (gig_id) DO NOTHING;
    `);

    client.release?.();
    console.log('✅ All schema tables & seed benchmarks successfully initialized');
  } catch (schemaErr: any) {
    console.error('❌ Schema initialization error:', schemaErr.message);
  }
}
