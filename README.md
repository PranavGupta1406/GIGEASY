# GigEasy

> **Cooperative-Backed On-Demand Gig Workforce Platform**  
> Direct local matching, server-enforced GPS geofencing, automated cooperative escrow settlement, and a portable digital identity for unorganized blue-collar labor.

[![Platform](https://img.shields.io/badge/Platform-React%20Native%20%7C%20Expo%2054-000000?style=flat-square&logo=expo)](https://expo.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pg--mem-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Realtime](https://img.shields.io/badge/Realtime-WebSocket-010101?style=flat-square&logo=socket.io)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Architecture](https://img.shields.io/badge/Architecture-Enterprise%20Dual--Mode-orange?style=flat-square)](#4-system-architecture)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 1. Problem Reality & Ground Truth

India’s informal economy employs over **450 million unorganized daily-wage workers**—masons, electricians, carpenters, plumbers, painters, warehouse labor, and event crews. Despite contributing substantially to the country’s GDP, their daily reality is broken:

* **Predatory Middlemen (*Thekedars*):** Labor brokers take **20% to 40%** cuts simply for connecting workers with employers.
* **The Labor Chowk Inefficiency:** Millions stand at physical street intersections from 6:00 AM to 10:00 AM every single morning. If no contractor arrives by 10:00 AM, that day's livelihood is permanently lost.
* **Chronic Wage Theft:** In cash agreements, workers have no written contract. Deductions, delayed payments, and outright non-payment upon work completion are routine occurrences.
* **The Complete Absence of Social Protection:** Zero health insurance, accident cover, or emergency relief pools. A single on-site injury routinely pushes a laborer's entire family into high-interest debt cycles.
* **Financial Invisibility:** Because cash wages leave no verifiable footprint, banks, credit unions, and government programs classify these workers as "unbanked / high risk," shutting them out of formal loans.
* **Employer Risk & Lack of Accountability:** Homeowners, contractors, and businesses cannot verify worker skill credentials, suffer from rampant no-shows, and have no formal recourse during disputes.

---

## 2. Why Other Solutions Fail vs. How GigEasy Actually Solves It

Most existing platforms and hackathon submissions fundamentally fail because they design for white-collar assumptions rather than physical on-the-ground realities.

Here is the authentic breakdown of where alternative solutions break down and how GigEasy addresses each failure mode:

### 1. The Cash Blindspot (The 75% Cash Reality)
* **How others fail:** Most apps assume 100% credit card or digital wallet usage. In reality, **over 70% of informal Indian labor settles in physical cash on-site**. When other apps force online payments, users take transactions offline. The moment they go offline, tracking fails, the platform becomes useless, and wage theft continues unchecked.
* **How GigEasy solves it:** We built the **Dual Cash-OTP Cryptographic Handshake**. When an employer selects cash payment, an on-demand 6-digit cryptographic OTP is generated on the employer's device only upon completion. The worker enters this OTP on their own phone to close the shift. This verifies physical handover of cash, creates an immutable audit trail in PostgreSQL, updates the worker's verified earnings record, and triggers the cooperative welfare ledger.

### 2. The Ghost Worker & False Check-in Problem
* **How others fail:** Platforms use simple "Swipe to Start" or "Tap Arrived" buttons with zero server verification. Workers can accept jobs and claim arrival from kilometers away, causing project delays and employer distrust.
* **How GigEasy solves it:** Server-side **250m Haversine GPS Geofencing**. When a worker taps "Check-in", the server mathematically validates the device's live coordinates against the gig's latitude and longitude. Check-ins are strictly rejected if outside the 250-meter perimeter.

### 3. The Corporate Aggregator Trap (25–35% Take Rates)
* **How others fail:** Commercial gig platforms (Urban Company, TaskRabbit clones) act as corporate extractive intermediaries. They charge 25% to 35% commission while treating workers as disposable commodities with zero healthcare or equity.
* **How GigEasy solves it:** A **Cooperative-First Economic Model**. The platform enforces an automated split:
  $$\text{Invoice} = \mathbf{82\%}\text{ (Worker Net)} + \mathbf{8\%}\text{ (Coop Fund)} + \mathbf{5\%}\text{ (Social Welfare)} + \mathbf{5\%}\text{ (Platform)}$$
  Workers keep the vast majority of their earnings, while 5% automatically builds an emergency hospital/accident pool and 8% finances community tools and skill training centers.

### 4. The Unbanked Worker Credit Deficit
* **How others fail:** Apps treat completed orders as ephemeral logs. The worker finishes a job, gets paid, and remains financially invisible to banks.
* **How GigEasy solves it:** The **Worker Digital Passport & Portable Trust Engine (0–100)**. Every completed gig, geofenced hour, client review, and verified rupee earned generates a permanent, tamper-evident record. Cooperative credit societies and banks can read this verified audit history to extend micro-loans without requiring traditional payslips.

### 5. Fragile Prototypes vs. Resilient Dual-Mode Engineering
* **How others fail:** 90% of hackathon projects fail during evaluation because local databases are unconfigured, container dependencies clash, or mock APIs return broken static JSON.
* **How GigEasy solves it:** An enterprise-grade **Dual-Mode Persistence Architecture**. The backend seamlessly connects to production PostgreSQL if available; if not, it automatically boots an embedded, in-memory PostgreSQL engine (`pg-mem`) running the exact production relational schema, seeds, and SQL queries out of the box. Anyone can clone, test, and run it instantly with zero configuration friction.

---

### Competitive Comparison Matrix

| Critical Dimension | Traditional Thekedar (Middleman) | Corporate Aggregators (Commercial) | Typical Hackathon Prototypes | **GigEasy Platform** |
|---|:---:|:---:|:---:|:---:|
| **Take Rate / Middleman Cut** | **20% – 40%** extracted | **25% – 35%** corporate cut | N/A (Toy apps with no economics) | **82% to Worker** (Minimal 5% platform) |
| **Emergency Welfare & Insurance** | ❌ None (abandoned if injured) | ❌ Minimal / Discretionary | ❌ None | ✅ **Automated 5% dedicated welfare pool** |
| **Cash Settlement Integrity** | ❌ Prone to wage theft / verbal | ❌ Discouraged / unverified | ❌ Ignored or unverified | ✅ **Dual Cash-OTP cryptographic handshake** |
| **Attendance Verification** | ❌ Verbal / physical headcount | ⚠️ Soft GPS (easily spoofed) | ❌ "Swipe to start" with no geofence | ✅ **Server-enforced 250m Haversine geofence** |
| **Credit / Loan Worthiness** | ❌ Completely unrecorded | ❌ Proprietary data locked in app | ❌ Ephemeral mock data | ✅ **Exportable Worker Passport & Trust Score** |
| **Job Discovery Latency** | 3–4 hours waiting at chowk | Scheduled days in advance | Static bulletin boards | ✅ **Real-time geospatial radar in seconds** |
| **Two-Sided Portability** | ❌ Rigid lock-in | ❌ Separate siloed applications | ❌ Single-role mockups | ✅ **Instant Role Switching (Worker/Employer/Coop)** |
| **Judge / Evaluation Stability** | N/A | N/A | ❌ Fails on missing local DB | ✅ **Dual-mode PostgreSQL with auto pg-mem** |

---

## 3. Core Functional Pillars

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     GIGEASY PLATFORM                                   │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│    WORKER EMPOWERMENT    │    EMPLOYER RELIABILITY  │     COOPERATIVE GOVERNANCE       │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ • Zero Middleman Cuts    │ • One-Click Gig Dispatch │ • Automated Welfare Pool (5%)    │
│ • Portable Trust Score   │ • GPS Geofenced Check-in │ • Cooperative Growth Fund (8%)   │
│ • Guaranteed Fair Pay    │ • Real-Time Map Radar    │ • Demand Forecasting Engine      │
│ • Secure Cash-OTP Release│ • Transparent Bidding    │ • Workforce Gap Analytics        │
│ • Instant UPI Settlements│ • Dispute Resolution     │ • Micro-Insurance Custody        │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 1. Two-Sided Real-Time Marketplace
* **On-Demand Dispatch:** Employers post gigs with budget, skill prerequisites, duration, and geo-coordinates in seconds.
* **Gig Radar:** Workers view nearby opportunities on an interactive map visual filtered by skill category, pay rate, and distance.
* **Transparent Negotiation:** Both parties can place structured counter-offers within policy-backed fair-wage guardrails before mutual contract confirmation.

### 2. Geofenced Attendance & Anti-Fraud Handshakes
* **250m Radius Geofencing:** Worker check-in is cryptographically validated against job site GPS coordinates to ensure physical presence.
* **Dual Cash-OTP Handshake:** For cash-based jobs, the employer generates a secure one-time code that the worker validates on-site, preventing false completion claims or unauthorized cancellations.
* **Active Shift Tracking:** Live state transitions (`ARRIVED` → `CHECKED_IN` → `IN_PROGRESS` → `WORK_SUBMITTED` → `COMPLETED`).

### 3. Cooperative Escrow & Automated Welfare Split
Every completed transaction automatically routes funds through a mathematically enforced cooperative split:
* **82% Worker Earning:** Liquid payout released instantly to worker's UPI / bank account.
* **8% Cooperative Fund:** Reinvested into local cooperative tools, collective equipment purchasing, and training centers.
* **5% Social Welfare Pool:** Automatically finances emergency medical relief, accident insurance, and disability safety nets.
* **5% Platform Infrastructure:** Maintains uptime, identity verification infrastructure, and server pipelines.

### 4. Portable Worker Passport & Trust Engine
* **Aadhaar/KYC Integration:** Multi-level identity verification badge.
* **Dynamic Trust Score (0–100):** Calculated from verified shift completions, punctuality rate, peer ratings, and dispute-free history.
* **Financial Inclusivity:** Exportable, tamper-evident earnings history recognized by cooperative credit societies for micro-loans.

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      MOBILE CLIENT (EXPO / REACT NATIVE)         │
│  ┌────────────────────┐ ┌───────────────────┐ ┌────────────────┐ │
│  │   Worker Portal    │ │  Employer Portal  │ │  Coop Admin    │ │
│  └─────────┬──────────┘ └─────────┬─────────┘ └────────┬───────┘ │
│            │                      │                    │         │
│            ▼                      ▼                    ▼         │
│     Zustand State Store  │  React Query Cache  │  Native Modules │
└───────────────────────┬────────────────────────────┬─────────────┘
                        │ HTTP / REST                │ WebSocket (/realtime)
                        ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND GATEWAY (NODE.JS / EXPRESS)             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Middleware: JWT Verification • RBAC • Audit Log • CORS     │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────┬───────────────────────┬────────────┐  │
│  │ Gig Lifecycle Engine  │ Geofence / OTP Engine │ Escrow Svc │  │
│  └───────────────────────┴───────────────────────┴────────────┘  │
└───────────────────────┬────────────────────────────┬─────────────┘
                        │ Pool Queries               │ Event Broadcast
                        ▼                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATA & EVENT STORAGE                          │
│  ┌───────────────────────────────────────┐ ┌──────────────────┐  │
│  │ PostgreSQL 16 (Relational + Spatial)  │ │ Realtime WS Hub  │  │
│  │ (Embedded pg-mem fallback for dev)    │ │ Client Registry  │  │
│  └───────────────────────────────────────┘ └──────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. End-to-End Gig Lifecycle State Machine

```
  [ DRAFT ] ───► [ PUBLISHED ] ───► [ HIRING ]
                                          │
                                          ▼
                                   [ APPLIED ] ◄──► [ NEGOTIATING ]
                                          │
                                          ▼
                                   [ ACCEPTED / HIRED ]
                                          │
                                          ▼
                                   [ ON_THE_WAY ]
                                          │
                                          ▼
                                    [ ARRIVED ]
                                          │ (GPS Geofence <= 250m)
                                          ▼
                                  [ CHECKED_IN ]
                                          │
                                          ▼
                                  [ IN_PROGRESS ]
                                          │
                                          ▼
                                 [ WORK_SUBMITTED ]
                                          │
                ┌─────────────────────────┴────────────────────────┐
                ▼                                                  ▼
     [ EMPLOYER VERIFIES / OTP ]                           [ DISPUTED ]
                │                                                  │
                ▼                                                  ▼
      [ ESCROW SPLIT TRIGGERED ]                          [ COOP ARBITRATION ]
      ├── 82% Worker Net (UPI)
      ├──  8% Cooperative Fund
      ├──  5% Welfare/Insurance
      └──  5% Platform Fee
                │
                ▼
          [ COMPLETED ]
```

---

## 6. Technology Stack

### Client-Side (Mobile)
| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React Native (Expo SDK 54) | Single cross-platform codebase (Android & iOS) with native performance |
| **Language** | TypeScript (Strict Mode) | Compile-time type safety across domain models and navigation contracts |
| **State Management** | Zustand + TanStack React Query | Lightweight atomic global store paired with resilient asynchronous server-state caching |
| **Navigation** | React Navigation v7 | Deep-linkable Native Stack and Bottom Tabs navigation |
| **UI & Styling** | Vanilla StyleSheet Design System | Zero-overhead, high-performance styling without heavy runtime CSS parsing |
| **Animations** | React Native Reanimated | 60 FPS hardware-accelerated gestures, sheet expansions, and status badges |
| **Maps** | Google Maps API & Web Visualizer | Real-time geospatial job clustering, radius rendering, and marker pins |

### Server-Side (Backend)
| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js (v18+) | Non-blocking asynchronous I/O ideal for concurrent gig dispatching |
| **Framework** | Express + TypeScript | Lightweight, auditable HTTP router with custom middleware pipelines |
| **Database** | PostgreSQL + `pg-mem` fallback | Full ACID relational persistence with zero-config in-memory database fallback for instant local testing |
| **Realtime** | WebSocket (`ws`) | Sub-100ms bidirectional event dispatch for order updates, location pings, and alerts |
| **Security** | RBAC + JWT + Audit Log | Strict role separation (`worker`, `employer`, `cooperative_admin`) with tamper-evident event logs |
| **Payments** | UPI Gateway + Escrow Logic | Automated multi-split payout pipeline with idempotent transaction handling |

---

## 7. Directory Structure

```text
Gigeasy/
├── assets/                       # Branding, adaptive icons, and vector assets
├── database/
│   ├── ERD.md                    # Entity Relationship Diagram & documentation
│   ├── schema.sql                # Complete PostgreSQL production DDL
│   ├── seeds.sql                 # Seed fixtures for skills, workers, gigs, coops
│   └── migrations/               # Incremental database migrations
├── server/
│   ├── src/
│   │   ├── db.ts                 # Dual-mode PG pool (PostgreSQL / pg-mem fallback)
│   │   ├── server.ts             # Express REST router, WebSocket hub, gig controllers
│   │   ├── config/               # Server configuration
│   │   ├── controllers/          # Domain controller handlers
│   │   ├── middleware/           # Auth tokens, RBAC, input sanitization
│   │   ├── repositories/         # Database access abstraction layers
│   │   ├── routes/               # API route modules
│   │   └── services/             # Escrow, matching, verification, and analytics
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── components/               # Production UI components (buttons, cards, pickers)
│   ├── config/                   # Dynamic Google Maps and environment adapters
│   ├── constants/                # Design tokens: palette, typography, spacing, motion
│   ├── navigation/               # NativeStack and BottomTabs route hierarchies
│   ├── screens/
│   │   ├── auth/                 # Phone OTP, onboarding, role selection
│   │   ├── worker/               # Job feed, active shift, passport, earnings, welfare
│   │   ├── employer/             # Gig post, applicants review, live tracking, cart
│   │   ├── cooperative/          # Coop dashboard, demand forecasting, welfare pool
│   │   └── shared/               # Active shift tracker, dispute resolution, ratings
│   ├── services/
│   │   ├── api.ts                # Typed client HTTP client with offline queueing
│   │   ├── firebase/             # Secure authentication client
│   │   ├── ai/                   # Demand forecast & service triage heuristics
│   │   └── realtime/             # WebSocket event listeners and connection manager
│   ├── store/                    # Zustand global application state
│   ├── theme.ts                  # Universal color palette & typography bindings
│   └── types/                    # Domain definitions, DTOs, and state machine enums
├── app.config.js                 # Dynamic Expo configuration (reads .env variables)
├── app.json                      # Static Expo app manifest
├── package.json
├── tsconfig.json
└── README.md
```

---

## 8. Quickstart Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **Expo Go** mobile app (available on Google Play Store and Apple App Store) or an Android/iOS emulator

### Step 1: Clone the Repository
```bash
git clone https://github.com/PranavGupta1406/GIGEASY.git
cd GIGEASY
```

### Step 2: Configure Environment Variables

**Client Environment:**
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your machine's local IP address (so physical mobile devices can reach your server):
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5050/api
```

**Backend Environment:**
```bash
cp server/.env.example server/.env
```
*(The server automatically defaults to an in-memory embedded PostgreSQL instance if external PostgreSQL credentials are not provided—no manual database setup is required to run and test!)*

### Step 3: Install Dependencies
```bash
# Install root (mobile app) dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Step 4: Run the Application

**Option A — Automated Launch (Windows):**
```cmd
run.bat
```
This launches both the backend server and the Expo development server simultaneously in dedicated terminal instances.

**Option B — Manual Launch:**

1. **Start the Backend API & Realtime Gateway:**
   ```bash
   cd server
   npm run dev
   ```
   *Server boots at `http://localhost:5050` with WebSocket gateway on `/realtime`.*

2. **Start the Expo Mobile Client:**
   ```bash
   npm start
   ```
   *Scan the printed QR code using the **Expo Go** app on your phone, or press `a` for Android Emulator / `w` for Web.*

---

## 9. API & Real-Time Event Reference

### Core HTTP Endpoints
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and database engine mode | Public |
| `GET` | `/api/jobs` | Retrieve open gigs with distance/category filters | Required |
| `POST` | `/api/jobs` | Create and broadcast a new gig vacancy | Employer |
| `GET` | `/api/jobs/:id/applicants` | List all applicants with trust scores for a gig | Employer |
| `POST` | `/api/jobs/:id/apply` | Worker applies for a gig with counter-offer | Worker |
| `POST` | `/api/applications/:id/hire` | Accept application and initiate escrow custody | Employer |
| `POST` | `/api/applications/:id/checkin`| Validate geofence & start shift timer | Worker |
| `POST` | `/api/applications/:id/verify-cash`| Verify OTP handshake & release escrow | Employer |
| `POST` | `/api/applications/:id/dispute`| Raise arbitration ticket with evidence | Any |
| `GET` | `/api/analytics/cooperative` | Aggregate demand forecasts & welfare fund stats | Admin |

### WebSocket Realtime Events (`/realtime`)
* `CONNECTED`: Initialized handshake with client connection registry.
* `JOB_DISPATCHED`: Real-time broadcast of newly posted local gigs within neighborhood radius.
* `APPLICATION_RECEIVED`: Alert sent to employer when a worker applies.
* `SHIFT_STATUS_CHANGED`: Live updates for `CHECKED_IN`, `IN_PROGRESS`, and `COMPLETED`.
* `PAYMENT_RELEASED`: Real-time push alert confirming escrow breakdown and UPI deposit.

---

## 10. Security & Enterprise Compliance

1. **Zero Secret Leakage:** No private API keys or database credentials exist in source code; all secrets are managed via strictly ignored `.env` profiles and dynamic configurations.
2. **PostgreSQL Parameterization:** 100% of SQL queries utilize parameterized values (`$1, $2, ...`) eliminating SQL injection vectors.
3. **Audit Trails:** Immutable state changes are recorded in the `audit_log` table with timestamps, previous state, new state, and authenticated user ID.
4. **Tamper-Evident Geofencing:** Check-in coordinates are computed server-side using the Haversine spatial distance formula, rejecting spoofed or out-of-boundary check-ins.
5. **Idempotent Payouts:** Financial transactions generate unique UUID references to prevent double-debiting during network retries.

---

## 11. Live Evaluation & Edge-Case Demonstration

To experience why GigEasy is a practical, resilient problem solver, test these realistic edge cases:

1. **The Cash Handshake Proof:**
   * Post a gig as an **Employer** with cash settlement.
   * Accept and check in as a **Worker**.
   * When concluding the gig, notice the employer must generate a **6-digit Cash OTP**. The worker inputs this OTP to confirm receipt. Even though cash changed physical hands, the transaction is digitally recorded, verified, and accredited to the worker's official financial earnings record.

2. **The Geofence Anti-Spoofing Test:**
   * Attempt to trigger shift check-in when coordinates are beyond 250 meters from the job location.
   * The server calculates spatial distance using the Haversine formula and rejects the check-in with an out-of-bounds error, protecting the employer from ghost workers.

3. **The Cooperative Welfare Split:**
   * Inspect the invoice breakdown on job completion.
   * Observe how the total budget is mathematically split: 82% to worker, 8% to the local cooperative equipment pool, 5% to the emergency welfare safety net, and 5% to platform operations.

---

## 12. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
