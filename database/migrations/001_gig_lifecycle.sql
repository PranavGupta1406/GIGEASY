-- ==============================================================================
-- GIGEASY MIGRATION 001 — GIG LIFECYCLE TABLES
-- Additive only. Does NOT drop existing tables.
-- Run: psql -d gigeasy -f database/migrations/001_gig_lifecycle.sql
-- ==============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table: gigs — Full gig lifecycle with state machine
-- ==============================================================================
CREATE TABLE IF NOT EXISTS gigs (
  gig_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id  VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  skill_id     VARCHAR(50)  NOT NULL,
  skill_name   VARCHAR(100) NOT NULL,
  skill_category VARCHAR(100) NOT NULL,
  workers_required  INT     NOT NULL DEFAULT 1 CHECK (workers_required > 0),
  workers_confirmed INT     NOT NULL DEFAULT 0,
  min_wage     NUMERIC(10,2) NOT NULL CHECK (min_wage > 0),
  max_wage     NUMERIC(10,2) NOT NULL CHECK (max_wage >= min_wage),
  start_date   DATE         NOT NULL,
  start_time   TIME         NOT NULL,
  end_time     TIME,
  duration_hours NUMERIC(4,1),
  address      TEXT         NOT NULL,
  latitude     NUMERIC(10,7) NOT NULL,
  longitude    NUMERIC(10,7) NOT NULL,
  city         VARCHAR(100) NOT NULL,
  state        VARCHAR(100),
  status       VARCHAR(40)  NOT NULL DEFAULT 'PUBLISHED'
    CHECK (status IN (
      'DRAFT','PUBLISHED','MATCHING','APPLICATIONS_OPEN','NEGOTIATING',
      'WORKER_SELECTED','PAYMENT_PENDING','PAYMENT_SECURED','READY_TO_START',
      'IN_PROGRESS','WORK_SUBMITTED','EMPLOYER_CONFIRMATION','COMPLETED',
      'SETTLED','CANCELLED','DISPUTED','EXPIRED','NO_SHOW','PAYMENT_FAILED'
    )),
  requirements TEXT[],
  fair_pay_min NUMERIC(10,2),
  fair_pay_max NUMERIC(10,2),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gigs_employer      ON gigs(employer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status        ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_skill         ON gigs(skill_category);
CREATE INDEX IF NOT EXISTS idx_gigs_city          ON gigs(city);
CREATE INDEX IF NOT EXISTS idx_gigs_location      ON gigs(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_gigs_start_date    ON gigs(start_date);

-- ==============================================================================
-- Table: gig_applications — Full application lifecycle
-- ==============================================================================
CREATE TABLE IF NOT EXISTS gig_applications (
  application_id UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id         UUID        NOT NULL REFERENCES gigs(gig_id) ON DELETE CASCADE,
  worker_id      VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proposed_wage  NUMERIC(10,2) NOT NULL,
  agreed_wage    NUMERIC(10,2),
  status         VARCHAR(40)  NOT NULL DEFAULT 'APPLIED'
    CHECK (status IN (
      'APPLIED','REVIEWING','NEGOTIATING','ACCEPTED','REJECTED',
      'HIRED','CHECKED_IN','IN_PROGRESS','WORK_SUBMITTED','UNDER_REVIEW',
      'COMPLETED','PAID','SETTLED','DISPUTED','WITHDRAWN','EXPIRED'
    )),
  note           TEXT,
  applied_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  checked_in_at  TIMESTAMPTZ,
  check_in_lat   NUMERIC(10,7),
  check_in_lng   NUMERIC(10,7),
  work_started_at     TIMESTAMPTZ,
  work_submitted_at   TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  employer_confirmed_at TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (gig_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_gig_apps_gig     ON gig_applications(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_apps_worker  ON gig_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_gig_apps_status  ON gig_applications(status);

-- ==============================================================================
-- Table: negotiations — Offer / counter-offer thread per application
-- ==============================================================================
CREATE TABLE IF NOT EXISTS negotiations (
  negotiation_id UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID        NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
  sender_role    VARCHAR(20)  NOT NULL CHECK (sender_role IN ('worker','employer')),
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ACCEPTED','REJECTED','COUNTERED','EXPIRED')),
  note           TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_negotiations_app ON negotiations(application_id);

-- ==============================================================================
-- Table: direct_offers — Employer → Worker direct job offers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS direct_offers (
  offer_id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id       VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id         VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gig_id            UUID         REFERENCES gigs(gig_id) ON DELETE SET NULL,
  work_type         VARCHAR(100) NOT NULL,
  date              DATE         NOT NULL,
  start_time        TIME         NOT NULL,
  location_address  TEXT         NOT NULL,
  latitude          NUMERIC(10,7),
  longitude         NUMERIC(10,7),
  duration_hours    NUMERIC(4,1),
  pay               NUMERIC(10,2) NOT NULL CHECK (pay > 0),
  requirements      TEXT,
  notes             TEXT,
  status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ACCEPTED','DECLINED','NEGOTIATING','EXPIRED','WITHDRAWN')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW() + INTERVAL '48 hours'
);

CREATE INDEX IF NOT EXISTS idx_direct_offers_worker   ON direct_offers(worker_id);
CREATE INDEX IF NOT EXISTS idx_direct_offers_employer ON direct_offers(employer_id);
CREATE INDEX IF NOT EXISTS idx_direct_offers_status   ON direct_offers(status);

-- ==============================================================================
-- Table: gig_payments — Payment state machine (no illegal wallet / custom escrow)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS gig_payments (
  payment_id        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id    UUID        NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
  amount            NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  razorpay_order_id  VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature  VARCHAR(400),
  status            VARCHAR(30)  NOT NULL DEFAULT 'PAYMENT_REQUIRED'
    CHECK (status IN (
      'PAYMENT_REQUIRED','PAYMENT_INITIATED','PAYMENT_PENDING',
      'PAYMENT_CONFIRMED','PAYMENT_FAILED','PAYMENT_RELEASE_PENDING',
      'PAYMENT_SETTLED','REFUND_PENDING','REFUNDED','DISPUTED'
    )),
  initiated_at   TIMESTAMPTZ,
  confirmed_at   TIMESTAMPTZ,
  settled_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gig_payments_app ON gig_payments(application_id);

-- ==============================================================================
-- Table: work_sessions — GPS-timestamped check-in/out records
-- ==============================================================================
CREATE TABLE IF NOT EXISTS work_sessions (
  session_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id   UUID        NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
  check_in_time    TIMESTAMPTZ,
  check_in_lat     NUMERIC(10,7),
  check_in_lng     NUMERIC(10,7),
  check_out_time   TIMESTAMPTZ,
  check_out_lat    NUMERIC(10,7),
  check_out_lng    NUMERIC(10,7),
  duration_minutes INT,
  notes            TEXT
);

CREATE INDEX IF NOT EXISTS idx_work_sessions_app ON work_sessions(application_id);

-- ==============================================================================
-- Table: disputes — Dispute center with evidence and resolution
-- ==============================================================================
CREATE TABLE IF NOT EXISTS disputes (
  dispute_id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id   UUID        NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
  raised_by_role   VARCHAR(20)  NOT NULL CHECK (raised_by_role IN ('worker','employer')),
  raised_by_user   VARCHAR(100) NOT NULL REFERENCES users(id),
  issue_type       VARCHAR(50)  NOT NULL,
  description      TEXT         NOT NULL,
  evidence_urls    TEXT[],
  agreed_amount    NUMERIC(10,2),
  employer_response TEXT,
  status           VARCHAR(30)  NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','EMPLOYER_RESPONDED','UNDER_REVIEW','RESOLVED','CLOSED')),
  admin_notes      TEXT,
  resolution       VARCHAR(20)
    CHECK (resolution IN ('WORKER_FAVOR','EMPLOYER_FAVOR','SPLIT','DISMISSED')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_disputes_app    ON disputes(application_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- ==============================================================================
-- Table: gig_ratings — Two-sided ratings, post-completion only
-- ==============================================================================
CREATE TABLE IF NOT EXISTS gig_ratings (
  rating_id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id    UUID        NOT NULL REFERENCES gig_applications(application_id) ON DELETE CASCADE,
  rater_role        VARCHAR(20)  NOT NULL CHECK (rater_role IN ('worker','employer')),
  rater_user_id     VARCHAR(100) NOT NULL REFERENCES users(id),
  rated_user_id     VARCHAR(100) NOT NULL REFERENCES users(id),
  score             INT          NOT NULL CHECK (score BETWEEN 1 AND 5),
  tags              TEXT[],
  comment           TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, rater_role)
);

CREATE INDEX IF NOT EXISTS idx_gig_ratings_rated ON gig_ratings(rated_user_id);

-- ==============================================================================
-- Table: worker_availability — Persisted availability settings
-- ==============================================================================
CREATE TABLE IF NOT EXISTS worker_availability (
  user_id           VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mode              VARCHAR(30)  NOT NULL DEFAULT 'AVAILABLE_NOW'
    CHECK (mode IN ('AVAILABLE_NOW','AVAILABLE_TODAY','SCHEDULED','NOT_AVAILABLE')),
  max_distance_km   INT          NOT NULL DEFAULT 10,
  preferred_trades  TEXT[],
  min_pay_per_day   NUMERIC(10,2),
  preferred_start   TIME,
  preferred_end     TIME,
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Table: fair_pay_estimates — Statistical pay benchmarks by skill+city
-- ==============================================================================
CREATE TABLE IF NOT EXISTS fair_pay_estimates (
  estimate_id    SERIAL       PRIMARY KEY,
  skill_category VARCHAR(100) NOT NULL,
  city           VARCHAR(100) NOT NULL,
  p25_wage       NUMERIC(10,2),
  p50_wage       NUMERIC(10,2),
  p75_wage       NUMERIC(10,2),
  sample_count   INT          NOT NULL DEFAULT 0,
  computed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (skill_category, city)
);

-- ==============================================================================
-- Table: notifications — Persistent notification log
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50)  NOT NULL,
  title           VARCHAR(200) NOT NULL,
  message         TEXT         NOT NULL,
  entity_type     VARCHAR(50),
  entity_id       VARCHAR(100),
  read            BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read);

-- ==============================================================================
-- Table: audit_log — Immutable audit trail for all critical state changes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  log_id         BIGSERIAL    PRIMARY KEY,
  entity_type    VARCHAR(50)  NOT NULL,
  entity_id      VARCHAR(100) NOT NULL,
  action         VARCHAR(100) NOT NULL,
  actor_user_id  VARCHAR(100) REFERENCES users(id),
  actor_role     VARCHAR(20),
  previous_state JSONB,
  new_state      JSONB,
  metadata       JSONB,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

-- ==============================================================================
-- Seed: fair pay estimates (initial realistic NCR benchmarks)
-- ==============================================================================
INSERT INTO fair_pay_estimates (skill_category, city, p25_wage, p50_wage, p75_wage, sample_count)
VALUES
  ('Electrical',    'Noida',    1200, 1500, 1800, 0),
  ('Construction',  'Noida',    900,  1200, 1500, 0),
  ('Plumbing',      'Noida',    1000, 1300, 1600, 0),
  ('Carpentry',     'Noida',    1100, 1400, 1700, 0),
  ('Warehouse',     'Noida',    800,  1000, 1300, 0),
  ('Driving',       'Noida',    900,  1100, 1400, 0),
  ('Electrical',    'Delhi',    1300, 1600, 2000, 0),
  ('Construction',  'Delhi',    1000, 1300, 1600, 0),
  ('Plumbing',      'Delhi',    1100, 1400, 1700, 0),
  ('Carpentry',     'Delhi',    1200, 1500, 1800, 0),
  ('Warehouse',     'Delhi',    850,  1050, 1350, 0),
  ('Driving',       'Delhi',    950,  1200, 1500, 0),
  ('Hospitality',   'Delhi',    700,  900,  1200, 0),
  ('Hospitality',   'Noida',    650,  850,  1150, 0),
  ('Security',      'Noida',    900,  1100, 1400, 0),
  ('Security',      'Delhi',    950,  1150, 1450, 0),
  ('Factory',       'Noida',    800,  1000, 1250, 0),
  ('Cleaning',      'Noida',    700,  900,  1100, 0),
  ('Cleaning',      'Delhi',    750,  950,  1150, 0),
  ('Painting',      'Noida',    1000, 1300, 1600, 0),
  ('Painting',      'Delhi',    1100, 1400, 1700, 0)
ON CONFLICT (skill_category, city) DO NOTHING;

-- ==============================================================================
-- Done
-- ==============================================================================
SELECT 'Migration 001 complete' AS status;
