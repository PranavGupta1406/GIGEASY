# GigEasy

> A cooperative-backed on-demand gig workforce platform connecting verified blue-collar workers and employers with geofenced attendance, automated escrow settlement, and decentralized welfare protection.

[![Platform](https://img.shields.io/badge/Platform-React%20Native%20%7C%20Expo%2054-000000?style=flat-square&logo=expo)](https://expo.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pg--mem-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Realtime](https://img.shields.io/badge/Realtime-WebSocket-010101?style=flat-square&logo=socket.io)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 1. Problem Statement & Real-World Impact

India's informal economy employs over **450 million unorganized daily-wage workers**—including construction laborers, electricians, plumbers, carpenters, painters, warehouse handlers, and event staff. Despite being the backbone of urban infrastructure, this workforce operates in a deeply fractured, predatory environment:

* **Predatory Contractor Commissions:** Traditional labor brokers (*thekedars*) extract **20% to 40%** of worker wages for simple discovery.
* **Physical Labor Chowk Inefficiencies:** Workers gather at physical street intersections (*labor chowks*) at 6:00 AM, often waiting 3–4 hours without guaranteed employment, losing productive working days.
* **Wage Theft & Delayed Settlements:** Cash transactions routinely result in arbitrary deductions, delayed payouts, or complete non-payment after work completion.
* **Zero Social Safety Net:** Informal laborers lack health coverage, accident insurance, or micro-savings, leaving families vulnerable to financial ruin from a single injury.
* **Unverifiable Work History & Credit Exclusion:** Without documented earnings or portable credentials, workers remain locked out of formal banking, loans, and credit systems.
* **Employer Risk & Lack of Accountability:** Contractors and homeowners struggle to find background-verified workers with reliable skill ratings, attendance guarantees, or formal dispute mechanisms.

### The GigEasy Solution
GigEasy replaces exploitative middlemen with a **cooperative-backed digital infrastructure**. It provides instant local gig discovery, GPS geofenced check-ins, automated payment escrow with transparent welfare deductions, and a portable, cryptographically verifiable **Worker Digital Passport**.

---

## 2. Core Pillars & Capabilities

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

$$\text{Total Invoice} = \text{Worker Net (82\%)} + \text{Coop Fund (8\%)} + \text{Welfare Fund (5\%)} + \text{Platform Fee (5\%)}$$

* **82% Worker Earning:** Liquid payout released instantly to worker's UPI / bank account.
* **8% Cooperative Fund:** Reinvested into local cooperative tools, collective equipment purchasing, and training centers.
* **5% Social Welfare Pool:** Automatically finances emergency medical relief, accident insurance, and disability safety nets.
* **5% Platform Infrastructure:** Maintains uptime, identity verification infrastructure, and server pipelines.

### 4. Portable Worker Passport & Trust Engine
* **Aadhaar/KYC Integration:** Multi-level identity verification badge.
* **Dynamic Trust Score (0–100):** Calculated from verified shift completions, punctuality rate, peer ratings, and dispute-free history.
* **Financial Inclusivity:** Exportable, tamper-evident earnings history recognized by cooperative credit societies for micro-loans.

---

## 3. System Architecture

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

## 4. End-to-End Gig Lifecycle State Machine

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

## 5. Technology Stack

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

## 6. Directory Structure

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

## 7. Quickstart Guide

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

## 8. API & Real-Time Event Reference

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

## 9. Security & Enterprise Compliance

1. **Zero Secret Leakage:** No private API keys or database credentials exist in source code; all secrets are managed via strictly ignored `.env` profiles and dynamic configurations.
2. **PostgreSQL Parameterization:** 100% of SQL queries utilize parameterized values (`$1, $2, ...`) eliminating SQL injection vectors.
3. **Audit Trails:** Immutable state changes are recorded in the `audit_log` table with timestamps, previous state, new state, and authenticated user ID.
4. **Tamper-Evident Geofencing:** Check-in coordinates are computed server-side using the Haversine spatial distance formula, rejecting spoofed or out-of-boundary check-ins.
5. **Idempotent Payouts:** Financial transactions generate unique UUID references to prevent double-debiting during network retries.

---

## 10. Hackathon Demonstration Workflow

To demonstrate the full end-to-end problem-solving flow during judging:

1. **Worker Onboarding:** Open the app, select **Worker**, log in via phone number, and review your **Worker Passport** with Trust Score.
2. **Employer Posts a Gig:** Switch to **Employer** mode. Post a gig (e.g., *"Electrical Wiring Maintenance"* at ₹850). The gig immediately appears in the real-time feed.
3. **Application & Match:** As a worker, view the gig on the interactive map radar, click **Apply**, or submit a counter-bid.
4. **Hiring & Escrow Lock:** The employer reviews the applicant's verified trust rating and clicks **Hire**. Escrow is locked.
5. **Geofenced Shift & OTP:** The worker checks in on site. When the shift finishes, the employer enters the cash verification OTP or completes online payment.
6. **Cooperative Welfare Split:** Observe the instant settlement:
   * Worker receives **82%** (immediate income).
   * Cooperative fund receives **8%** (collective asset pooling).
   * Welfare pool receives **5%** (insurance / medical safety net).
   * Platform fee retains **5%**.

---

## 11. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
