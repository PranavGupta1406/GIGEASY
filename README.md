# GigEasy

> **Cooperative-Backed On-Demand Gig Workforce Platform**  
> Direct local matching, 250m GPS geofencing, automated 4-way escrow split, and a portable digital trust score for unorganized blue-collar workers.

[![Platform](https://img.shields.io/badge/Platform-React%20Native%20%7C%20Expo%2054-000000?style=flat-square&logo=expo)](https://expo.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pg--mem-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![Realtime](https://img.shields.io/badge/Realtime-WebSocket-010101?style=flat-square&logo=socket.io)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## ⚡ The 30-Second Pitch

India has **450 million unorganized daily-wage workers** (masons, electricians, carpenters, cleaners) trapped in physical labor chowks, losing **20–40%** of their daily wages to exploitative labor contractors (*thekedars*), with zero health insurance, rampant wage theft, and no formal credit records.

**GigEasy cuts out the middlemen** through a cooperative model where:
* Workers keep **82% of every rupee earned**.
* **5% automatically builds an emergency healthcare & accident pool**.
* **8% funds the local cooperative** for shared tools and training.
* Cash payments are locked with a **cryptographic OTP handshake** to eliminate wage theft.
* Attendance is enforced by **server-side 250m GPS geofencing**.

---

## 🏆 Why GigEasy Wins (Comparison Matrix)

| Critical Dimension | Traditional Thekedar | Commercial Aggregators | Typical Hackathon Apps | **GigEasy Platform** |
|---|:---:|:---:|:---:|:---:|
| **Take Rate / Cut** | **20% – 40%** taken | **25% – 35%** corporate cut | N/A (toy mockups) | **82% to Worker** (5% platform fee) |
| **Emergency Welfare** | ❌ None | ❌ None / Discretionary | ❌ None | ✅ **Automated 5% dedicated welfare pool** |
| **Cash Handling Integrity** | ❌ Prone to wage theft | ❌ Discouraged / unrecorded | ❌ Ignored | ✅ **Dual Cash-OTP cryptographic handshake** |
| **Attendance Verification** | ❌ Verbal / manual | ⚠️ Soft client GPS | ❌ "Swipe to start" with no check | ✅ **Server-enforced 250m Haversine geofence** |
| **Credit / Loan Footprint** | ❌ 100% invisible | ❌ Locked in proprietary app | ❌ Ephemeral mock data | ✅ **Exportable Worker Passport & Trust Score** |
| **Judge Stability** | N/A | N/A | ❌ Crashes without local DB | ✅ **Runs instantly with zero config (`pg-mem`)** |

---

## 💡 The 5 Problems We Actually Solved

### 1. The Cash Reality (Dual Cash-OTP Handshake)
*Over 70% of informal Indian labor settles in physical cash.* Other apps fail because they force cards or ignore cash entirely. GigEasy generates an on-site **6-digit cryptographic OTP** on the employer's device only upon completion. The worker inputs it to close the shift—digitally certifying the cash payment into the worker’s official credit record.

### 2. Zero-Ghost-Worker Attendance (250m Geofencing)
No more workers clicking "Arrived" from their couch. Shift check-in is verified on the backend using the **Haversine GPS formula**. If the worker is outside the 250-meter job radius, check-in is strictly blocked.

### 3. Automated Cooperative Split (82 / 8 / 5 / 5)
Every invoice is mathematically split upon job release:
* **82% → Worker Net Earning** (instant liquid UPI/Cash)
* **8% → Cooperative Equipment & Training Fund**
* **5% → Emergency Health & Accident Safety Net**
* **5% → Platform Maintenance**

### 4. Worker Digital Passport (Unbanked to Credit-Worthy)
Daily wage workers cannot get bank loans because cash income is untracked. GigEasy converts every verified shift, attendance score, and rating into a **tamper-evident Digital Passport (Trust Score 0–100)** that cooperative banks use for micro-lending.

### 5. Instant Evaluation Stability (Zero Setup Required)
90% of hackathon demos crash because judges lack PostgreSQL configurations. GigEasy features **dual-mode persistence**: it connects to PostgreSQL if available, or boots an embedded in-memory PostgreSQL engine (`pg-mem`) with all tables, seeds, and SQL logic out of the box.

---

## 🏗️ Architecture & Gig Lifecycle

```
[ POST GIG ] ──► [ MAP RADAR ] ──► [ BID / HIRE ] ──► [ GEOFENCE CHECK-IN (<=250m) ]
                                                                │
                                                                ▼
[ 82% Worker | 8% Coop | 5% Welfare | 5% Fee ] ◄── [ CASH-OTP / UPI RELEASE ]
```

```
┌────────────────────────────────────────────────────────┐
│                   REACT NATIVE (EXPO 54)               │
│        Worker Portal  •  Employer Portal  •  Coop      │
│          Zustand Store  +  React Query Cache           │
└───────────────────────────┬────────────────────────────┘
                            │ REST + WebSocket (/realtime)
                            ▼
┌────────────────────────────────────────────────────────┐
│               NODE.JS + EXPRESS BACKEND                │
│     JWT Auth • RBAC • Geofence • Escrow Controller     │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│        POSTGRESQL 16 / IN-MEMORY pg-mem FALLBACK       │
│           Full Relational Schema + Audit Logs          │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart (Run in 2 Minutes)

### Prerequisites
* **Node.js 18+** & **npm**
* **Expo Go** app on your phone (or web browser)

### Windows (One-Click Launch)
```cmd
run.bat
```
*Launches backend (`http://localhost:5050`) and mobile Expo server simultaneously.*

---

### Cross-Platform (Manual Launch)

```bash
# 1. Clone & enter
git clone https://github.com/PranavGupta1406/GIGEASY.git
cd GIGEASY

# 2. Setup environment
cp .env.example .env
cp server/.env.example server/.env

# 3. Install
npm install
cd server && npm install && cd ..

# 4. Run Server (Terminal 1)
cd server && npm run dev

# 5. Run Mobile App (Terminal 2)
npm start
```
*Scan the QR code in your terminal with **Expo Go** or press `w` to open on web.*

---

## 📱 Quick Test Flow for Judges (2-Minute Demo)

1. **Worker Feed:** Open app, select **Worker**, view the **Live Gig Radar** with nearby jobs.
2. **Post a Gig:** Switch to **Employer**, post a gig (e.g., *"Electrical Repair - ₹800"*).
3. **Instant Match:** Switch to **Worker**, see the job appear live, tap **Apply**.
4. **Hire & Geofence:** Employer taps **Hire**. Worker triggers **Check-in** (validated within 250m).
5. **Cash-OTP Release:** Employer completes the shift, generates **Cash OTP**, worker enters OTP, and funds split automatically (**82% Worker / 8% Coop / 5% Welfare / 5% Fee**).

---

## 🛠️ Tech Stack

* **Mobile:** React Native, Expo SDK 54, TypeScript, Zustand, TanStack Query, Reanimated
* **Backend:** Node.js, Express, WebSocket (`ws`), TypeScript
* **Database:** PostgreSQL with automatic embedded `pg-mem` fallback
* **Security:** Role-Based Access Control (RBAC), JWT, 250m Haversine GPS validation

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
