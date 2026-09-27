# GigEasy

> **Cooperative-Backed On-Demand Gig Workforce Platform**  
> Direct local matching, server-enforced 250m GPS geofencing, automated cooperative escrow settlement, and a portable digital identity for unorganized blue-collar labor.

[![Platform](https://img.shields.io/badge/Platform-React%20Native%20%7C%20Expo%2054-000000?style=flat-square&logo=expo)](https://expo.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pg--mem-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Realtime](https://img.shields.io/badge/Realtime-WebSocket-010101?style=flat-square&logo=socket.io)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Engine%20Production-orange?style=flat-square)](#4-system-architecture)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 1. The Ground Reality: 450 Million Unorganized Workers

India’s informal workforce (masons, electricians, carpenters, plumbers, warehouse staff, event crew) powers urban development, yet operates in an exploitative ecosystem:

* **Predatory Contractor Commissions:** Traditional labor brokers (*thekedars*) siphon **20% to 40%** of daily earnings simply for discovery.
* **The Labor Chowk Trap:** Millions stand at physical street intersections for 3–4 hours every morning with no guarantee of work, losing productive days.
* **Rampant Wage Theft:** Verbal agreements lead to arbitrary deductions or complete non-payment after full days of physical labor.
* **Zero Social Safety Net:** A single work-site injury routinely forces a laborer’s family into predatory high-interest debt cycles.
* **Credit Invisibility:** With no paper trail or payslips, daily-wage workers are locked out of formal bank loans and micro-credit.

**GigEasy replaces the middleman with cooperative digital infrastructure**—enabling instant local gig discovery, verified attendance, guaranteed payouts, and an automated social safety net.

---

## 2. Why Existing Solutions Fail vs. How GigEasy Solves It

Most platforms fail because they design for white-collar assumptions. Here is how GigEasy solves real-world informal labor challenges:

### 1. The Cash Blindspot (70%+ Cash Reality)
* **The Failure:** Typical apps force digital cards or wallets. In informal Indian labor, over 70% of transactions happen in physical cash. When cash is paid outside the app, tracking breaks, platforms lose relevance, and wage theft continues.
* **GigEasy's Fix:** **Dual Cash-OTP Cryptographic Handshake**. For cash jobs, the employer generates a 6-digit OTP on payment release. The worker enters it to conclude the shift. This officially certifies the cash payment, logs it to PostgreSQL, and credits the worker’s formal earnings record.

### 2. The Ghost Worker Problem (False Check-Ins)
* **The Failure:** Competing apps rely on "Swipe to Start" buttons with no server verification, allowing workers to claim attendance while kilometers away.
* **GigEasy's Fix:** **Server-Enforced 250m Haversine Geofencing**. Check-in is mathematically validated against the job site coordinates. Shifts cannot be started unless the worker is physically within 250 meters.

### 3. Corporate Aggregator Exploitation (25–35% Cuts)
* **The Failure:** Commercial apps act as corporate intermediaries taking massive commissions while providing zero healthcare or equity.
* **GigEasy's Fix:** **Enforced 82/8/5/5 Cooperative Split**. Every invoice automatically routes:
  * **82%** → Liquid Net Earning to Worker (Instant UPI / Cash)
  * **8%** → Local Cooperative Fund (Shared tools, collective bargaining, training)
  * **5%** → Emergency Welfare & Accident Insurance Pool
  * **5%** → Platform Operations & Verification

### 4. Financial Invisibility & Lack of Credit
* **The Failure:** Informal gig records disappear into proprietary databases with zero utility for the worker.
* **GigEasy's Fix:** **Worker Digital Passport & Trust Engine (0–100)**. Completed gigs, on-time arrivals, peer ratings, and verified earnings create a portable financial identity recognized by cooperative credit societies for micro-loans.

### 5. Fragile Demos vs. Production Reliability
* **The Failure:** 90% of hackathon projects fail during judging because local PostgreSQL databases aren't configured or Docker containers crash.
* **GigEasy's Fix:** **Dual-Mode Persistence**. The backend connects to PostgreSQL if available, or automatically boots an embedded in-memory PostgreSQL engine (`pg-mem`) running the exact production relational migrations, seeds, and SQL queries out of the box with zero setup.

---

## 3. Competitive Comparison Matrix

| Critical Dimension | Traditional Thekedar | Commercial Aggregators | Typical Hackathon Apps | **GigEasy Platform** |
|---|:---:|:---:|:---:|:---:|
| **Middleman Take Rate** | **20% – 40%** extracted | **25% – 35%** corporate cut | N/A (toy mockups) | **82% directly to Worker** (5% platform fee) |
| **Emergency Welfare Pool** | ❌ None | ❌ None / Discretionary | ❌ None | ✅ **Automated 5% dedicated welfare pool** |
| **Cash Settlement Integrity** | ❌ Prone to wage theft | ❌ Discouraged / unverified | ❌ Ignored completely | ✅ **Dual Cash-OTP cryptographic handshake** |
| **Attendance Verification** | ❌ Verbal / manual | ⚠️ Soft client GPS | ❌ "Swipe to start" with no check | ✅ **Server-enforced 250m Haversine geofence** |
| **Credit / Loan Footprint** | ❌ 100% invisible | ❌ Locked in proprietary app | ❌ Ephemeral mock data | ✅ **Exportable Worker Passport & Trust Score** |
| **Discovery Latency** | 3–4 hours at chowk | Scheduled days ahead | Static bulletin boards | ✅ **Real-time geospatial radar in seconds** |
| **Evaluation Stability** | N/A | N/A | ❌ Fails without local DB | ✅ **Runs instantly with zero config (`pg-mem`)** |

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   MOBILE CLIENT (EXPO 54 / REACT NATIVE)         │
│     Worker Portal   •   Employer Portal   •   Cooperative Admin  │
│         Zustand Global State   +   React Query Server Cache      │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTP / REST + WebSocket (/realtime)
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND GATEWAY (NODE.JS / EXPRESS)            │
│   JWT Auth • RBAC • Geofence Engine • Escrow Svc • Audit Logger  │
└───────────────────────────────┬──────────────────────────────────┘
                                │ Pool Queries
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   DUAL-MODE DATABASE PERSISTENCE                 │
│       PostgreSQL 16 (Production)  /  pg-mem Engine (Embedded)    │
│      Full Relational Schema • Spatial Calculations • Seed Data   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. End-to-End Gig Lifecycle State Machine

```
[ DRAFT ] ──► [ PUBLISHED ] ──► [ HIRING ]
                                    │
                                    ▼
                             [ APPLIED / BID ]
                                    │
                                    ▼
                             [ HIRED / ESCROW LOCKED ]
                                    │
                                    ▼
                             [ CHECKED-IN (GPS <= 250m) ]
                                    │
                                    ▼
                             [ WORK SUBMITTED ]
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
      [ CASH-OTP / UPI RELEASE ]                 [ DISPUTED ]
      ├── 82% Worker Net                               │
      ├──  8% Cooperative Fund                         ▼
      ├──  5% Welfare & Insurance             [ COOP ARBITRATION ]
      └──  5% Platform Fee
                 │
                 ▼
           [ COMPLETED ]
```

---

## 6. Core API & Real-Time Events Reference

### Primary REST Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck and active database engine mode (`postgres` / `pg-mem`) | Public |
| `GET` | `/api/jobs` | Fetch available gigs with category & distance radius filters | Authenticated |
| `POST` | `/api/jobs` | Post a new gig with location, budget, and skill requirements | Employer |
| `POST` | `/api/jobs/:id/apply` | Apply to a gig with an optional wage counter-offer | Worker |
| `POST` | `/api/applications/:id/hire` | Accept application, finalize wage, and lock escrow | Employer |
| `POST` | `/api/applications/:id/checkin` | Validate 250m geofence coordinates and start shift | Worker |
| `POST` | `/api/applications/:id/verify-cash` | Validate 6-digit OTP and trigger cooperative split | Employer |
| `GET` | `/api/analytics/cooperative` | Aggregate metrics on workforce gaps and welfare funds | Cooperative Admin |

### WebSocket Real-Time Channels (`/realtime`)
* `JOB_DISPATCHED`: Real-time push alert to nearby workers when a relevant gig is posted.
* `APPLICATION_RECEIVED`: Real-time ping notifying employers of new applicants.
* `SHIFT_STATUS_CHANGED`: Live updates across `CHECKED_IN`, `IN_PROGRESS`, and `COMPLETED`.
* `PAYMENT_RELEASED`: Escrow breakdown event delivering confirmation to worker and employer.

---

## 7. Technology Stack

* **Mobile App:** React Native, Expo SDK 54, TypeScript, React Navigation v7, Zustand, TanStack React Query, Reanimated, Google Maps API
* **Backend:** Node.js (v18+), Express, TypeScript, WebSocket (`ws`), UUID
* **Database:** PostgreSQL + automatic fallback to `pg-mem` (embedded in-memory relational engine)
* **Security & Auth:** Role-Based Access Control (RBAC), JWT token verification, 250m Haversine distance validation, immutable audit logging

---

## 8. Quickstart Guide (Run in 2 Minutes)

### Prerequisites
* **Node.js 18+** & **npm**
* **Expo Go** on your phone (or an Android/iOS emulator, or web browser)

### Step 1: Clone & Configure
```bash
git clone https://github.com/PranavGupta1406/GIGEASY.git
cd GIGEASY

# Copy environment templates (pre-configured with safe defaults)
cp .env.example .env
cp server/.env.example server/.env
```

### Step 2: Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### Step 3: Run the Application

**Option A — One-Click Launch (Windows):**
```cmd
run.bat
```
*(Automatically launches the backend on `http://localhost:5050` and the Expo mobile server in parallel).*

**Option B — Manual Launch:**
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Mobile Client
npm start
```
*Scan the generated QR code with **Expo Go**, or press `w` to run on web.*

---

## 9. 2-Minute Judge Walkthrough & Edge-Case Verification

To verify the core problem-solving capabilities during evaluation:

1. **Gig Radar & Proximity:** Open the app as **Worker**. View nearby opportunities on the live map radar filtered by trade (plumber, electrician, carpenter).
2. **Post & Match:** Switch to **Employer** and dispatch a gig (e.g., *"Electrical Wiring - ₹850"*). Switch back to Worker to see the gig appear instantly via WebSocket.
3. **Anti-Ghost Worker Test:** Tap **Apply** and then **Hire**. Attempt shift check-in: the backend validates your device coordinates against the site using Haversine calculation, ensuring workers are on-site before shifts activate.
4. **Cash Handshake Test:** On shift completion, choose cash payment. The employer generates a **6-digit Cash OTP**. The worker inputs the OTP, proving physical payment occurred and locking it into the worker's official financial history.
5. **Welfare Split Verification:** Inspect the final invoice breakdown: **82%** Worker Net, **8%** Cooperative Fund, **5%** Emergency Healthcare Pool, **5%** Platform.

---

## 10. License

This project is licensed under the [MIT License](LICENSE).
