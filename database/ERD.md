# GigEasy PostgreSQL Database Entity-Relationship Diagram (ERD)

## Entity Relationship Overview

```mermaid
erDiagram
    users ||--o| workers : "has profile"
    users ||--o| employers : "has profile"
    users ||--o| kyc_verification : "verifies"
    workers ||--o{ worker_skills : "possesses"
    skills ||--o{ worker_skills : "categorizes"
    employers ||--o{ jobs : "posts"
    jobs ||--o{ job_applications : "receives"
    workers ||--o{ job_applications : "applies"
    jobs ||--o{ bookings : "generates"
    workers ||--o{ bookings : "booked for"
    employers ||--o{ bookings : "manages"
    workers ||--o{ earnings : "receives"
    jobs ||--o{ earnings : "generates payout"
    jobs ||--o{ ratings : "reviewed under"
    workers ||--o{ ratings : "receives rating"
    employers ||--o{ ratings : "gives rating"

    users {
        int user_id PK
        string firebase_uid UK
        string role
        string phone UK
        string email
        timestamp created_at
    }

    workers {
        int worker_id PK
        int user_id FK, UK
        string full_name
        string aadhaar_number
        string location
        decimal latitude
        decimal longitude
        decimal experience_years
        string availability
        string profile_photo
        boolean verified
        timestamp created_at
    }

    employers {
        int employer_id PK
        int user_id FK, UK
        string company_name
        string company_type
        text address
        boolean verified
        timestamp created_at
    }

    skills {
        int skill_id PK
        string skill_name UK
    }

    worker_skills {
        int worker_id PK, FK
        int skill_id PK, FK
    }

    jobs {
        int job_id PK
        int employer_id FK
        string title
        text description
        string skill_required
        decimal wage
        date job_date
        time start_time
        time end_time
        string location
        decimal latitude
        decimal longitude
        int workers_required
        string status
        timestamp created_at
    }

    job_applications {
        int application_id PK
        int job_id FK
        int worker_id FK
        string application_status
        timestamp applied_at
    }

    bookings {
        int booking_id PK
        int job_id FK
        int worker_id FK
        int employer_id FK
        string booking_status
        timestamp created_at
    }

    earnings {
        int earning_id PK
        int worker_id FK
        int job_id FK
        decimal amount
        string payment_status
        timestamp payment_date
    }

    ratings {
        int rating_id PK
        int job_id FK
        int worker_id FK
        int employer_id FK
        int rating
        text review
        timestamp created_at
    }

    kyc_verification {
        int kyc_id PK
        int user_id FK, UK
        boolean aadhaar_verified
        boolean face_verified
        boolean digilocker_verified
        timestamp verified_at
    }
```

## Summary of Tables

1. **`users`**: Master user authentication table linked to Firebase UIDs and roles (`worker`, `employer`, `admin`).
2. **`workers`**: Worker profile information including geolocation (latitude/longitude), experience, and verification state.
3. **`employers`**: Employer / company details and address.
4. **`skills`**: Master taxonomy of skills (Electrician, Carpenter, Plumber, Painter, Welder, Mason, Helper, Driver).
5. **`worker_skills`**: Junction table mapping workers to their skills.
6. **`jobs`**: Job postings created by employers with location, dates, wages, required skills, and status (`OPEN`, `CLOSED`, `CANCELLED`).
7. **`job_applications`**: Job applications placed by workers (`PENDING`, `ACCEPTED`, `REJECTED`).
8. **`bookings`**: Confirmed/completed bookings connecting job, worker, and employer.
9. **`earnings`**: Financial tracking of payouts and earnings for workers.
10. **`ratings`**: Rating (1 to 5 stars) and qualitative feedback left by employers for workers.
11. **`kyc_verification`**: Multi-factor identity status tracking (Aadhaar, Face, DigiLocker).
