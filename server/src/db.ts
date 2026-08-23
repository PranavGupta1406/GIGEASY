// PostgreSQL Connection Pool & Schema Manager
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'gigeasy'}`;

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export let isDbConnected = false;

// In-memory fallback repository for instant local persistence if PostgreSQL DB is not yet created
export const memoryDb = {
  users: new Map<string, any>(),
  workerProfiles: new Map<string, any>(),
  employerProfiles: new Map<string, any>(),
  jobs: new Map<string, any>(),
  applications: new Map<string, any>(),
};

/**
 * Initialize PostgreSQL tables matching database/schema.sql
 */
export async function initDatabase() {
  try {
    const client = await pool.connect();
    isDbConnected = true;
    console.log('✅ Connected to PostgreSQL database successfully');

    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255),
        phone_number VARCHAR(30),
        role VARCHAR(20) NOT NULL,
        name VARCHAR(150),
        verification_status VARCHAR(30) DEFAULT 'UNVERIFIED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS worker_profiles (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        address_text TEXT,
        experience_years NUMERIC(4, 1) DEFAULT 0,
        expected_daily_wage INT NOT NULL,
        preferred_radius_km INT DEFAULT 15,
        availability_status VARCHAR(30) DEFAULT 'AVAILABLE',
        languages TEXT[] DEFAULT ARRAY['Hindi', 'English'],
        bio TEXT,
        trust_score INT DEFAULT 75,
        verification_status VARCHAR(30) DEFAULT 'PENDING',
        rating NUMERIC(3, 2) DEFAULT 5.0,
        completed_jobs_count INT DEFAULT 0,
        skills JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employer_profiles (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(200) NOT NULL,
        business_type VARCHAR(100) NOT NULL,
        contact_name VARCHAR(150) NOT NULL,
        contact_phone VARCHAR(30),
        contact_email VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        address_text TEXT,
        verification_status VARCHAR(30) DEFAULT 'VERIFIED',
        rating NUMERIC(3, 2) DEFAULT 5.0,
        total_jobs_posted INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(100) PRIMARY KEY,
        employer_id VARCHAR(100),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        skill_category VARCHAR(100),
        skill_name VARCHAR(100),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        address_text TEXT,
        start_date VARCHAR(50),
        start_time VARCHAR(50),
        end_time VARCHAR(50),
        workers_required INT DEFAULT 1,
        workers_hired INT DEFAULT 0,
        min_wage INT NOT NULL,
        max_wage INT NOT NULL,
        status VARCHAR(50) DEFAULT 'HIRING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS job_applications (
        id VARCHAR(100) PRIMARY KEY,
        job_id VARCHAR(100),
        worker_id VARCHAR(100),
        proposed_wage INT NOT NULL,
        status VARCHAR(50) DEFAULT 'APPLIED',
        note TEXT,
        negotiations JSONB DEFAULT '[]'::jsonb,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('✅ PostgreSQL Schema tables initialized & synchronized');
  } catch (err: any) {
    isDbConnected = false;
    console.warn(`⚠️ PostgreSQL connection not available (${err.message}). Using real-time memory repository fallback.`);
  }
}
