# GigEasy Production Backend Architecture (NestJS + PostgreSQL + PostGIS + Redis)

## 1. High-Level Modular Design

The backend is organized into modular NestJS domains:

```text
src/
├── modules/
│   ├── auth/            # JWT sessions, OTP rate limiting, Role guards
│   ├── users/           # User lifecycle, accounts, suspension
│   ├── workers/         # Worker profiles, skills, availability
│   ├── employers/       # Employer profiles, company verification (GSTIN)
│   ├── jobs/            # Job lifecycle state machine, PostGIS spatial queries
│   ├── matching/        # Algorithmic matching & ranking engine
│   ├── applications/    # Application lifecycle & auditable wage negotiation
│   ├── attendance/      # 250m geofence validation, shift check-in/out
│   ├── payments/        # Razorpay/UPI gateway, Escrow custody, payouts
│   ├── verification/    # HyperVerge / DigiLocker identity provider integration
│   ├── realtime/        # Socket.IO WebSocket gateway for live events
│   ├── ratings/         # Dual-sided reviews and Trust Score computations
│   └── analytics/       # Product telemetry & Sentry observability
├── common/
│   ├── guards/          # RolesGuard, GeofenceGuard
│   ├── interceptors/    # LoggingInterceptor, TransformInterceptor
│   └── filters/         # GlobalExceptionFilter
└── database/            # TypeORM / Prisma PostGIS migrations
```

---

## 2. Redis Caching & Rate-Limiting Strategy

1. **Nearby Job Feeds Cache**:
   - Key: `geo:jobs:grid:<geohash_5>`
   - TTL: 60 seconds
   - Invalidation: On job state transition (`HIRING` -> `FULL` / `CLOSED`)

2. **OTP Abuse Protection**:
   - Key: `rate:otp:<phone_number>`
   - Policy: Max 3 requests per 15 minutes.

3. **Live Worker Geolocation & Presence**:
   - Redis Geospatial set: `GEOADD workers:active <lng> <lat> <worker_id>`
   - Query: `GEORADIUSBYMEMBER workers:active <job_id> 15 km WITHDIST`

---

## 3. Real-Time Event Architecture (WebSocket / Socket.IO)

| Event | Channel | Payload |
|---|---|---|
| `JOB_DISPATCHED` | `room:nearby:<city>` | `{ jobId, title, skill, wage, distanceKm }` |
| `APPLICATION_RECEIVED` | `room:employer:<employerId>` | `{ applicationId, workerId, proposedWage, matchScore }` |
| `COUNTER_OFFER_RECEIVED`| `room:user:<userId>` | `{ sessionId, newWage, senderRole, round }` |
| `WORKER_CHECKED_IN` | `room:job:<jobId>` | `{ shiftId, workerId, checkInTime, isGeofenceValid }` |
| `ESCROW_RELEASED` | `room:worker:<workerId>` | `{ netPayout, transactionId, timestamp }` |
