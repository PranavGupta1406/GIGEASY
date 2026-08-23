const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const store = require('../repositories/inMemoryStore');

// Load environment variables from root or server directory
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'gigeasy',
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

let isPgConnected = false;

pool.on('error', (err) => {
  // Silent fallback
});

// Test connection
pool.query('SELECT 1')
  .then(() => {
    isPgConnected = true;
    console.log(`✅ Connected to PostgreSQL database: ${config.database} on ${config.host}:${config.port}`);
  })
  .catch((err) => {
    console.log(`ℹ️ Running GigEasy Backend in In-Memory Standalone Mode (PostgreSQL offline/unreachable).`);
  });

function executeInMemoryQuery(text, params = []) {
  const sql = text.trim();
  const upper = sql.toUpperCase();

  if (upper.startsWith('BEGIN') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
    return { rows: [], rowCount: 0 };
  }

  // 1. Skills
  if (upper.includes('FROM SKILLS')) {
    return { rows: [...store.skills], rowCount: store.skills.length };
  }
  if (upper.startsWith('INSERT INTO SKILLS')) {
    const name = params[0];
    let skill = store.skills.find(s => s.skill_name.toLowerCase() === (name || '').toLowerCase());
    if (!skill) {
      skill = { skill_id: store.skills.length + 1, skill_name: name };
      store.skills.push(skill);
    }
    return { rows: [skill], rowCount: 1 };
  }

  // 2. Jobs
  if (upper.includes('FROM JOBS')) {
    if (upper.includes('WHERE J.JOB_ID = $1') || upper.includes('WHERE JOB_ID = $1')) {
      const jobId = parseInt(params[0], 10);
      const job = store.jobs.find(j => j.job_id === jobId) || null;
      return { rows: job ? [job] : [], rowCount: job ? 1 : 0 };
    }
    if (upper.includes('HAVING') || upper.includes('DISTANCE_KM')) {
      // Nearby jobs
      return { rows: store.jobs.filter(j => j.status === 'OPEN').map(j => ({ ...j, distance_km: 2.5 })), rowCount: store.jobs.length };
    }
    let list = [...store.jobs];
    return { rows: list, rowCount: list.length };
  }
  if (upper.startsWith('INSERT INTO JOBS')) {
    const [employer_id, title, description, skill_required, wage, job_date, start_time, end_time, location, latitude, longitude, workers_required] = params;
    const newJob = {
      job_id: store.jobs.length + 1,
      employer_id: parseInt(employer_id, 10),
      title,
      description,
      skill_required,
      wage: parseFloat(wage) || 0,
      job_date: job_date || new Date().toISOString().split('T')[0],
      start_time: start_time || '09:00:00',
      end_time: end_time || '18:00:00',
      location: location || 'New Delhi',
      latitude: latitude || 28.6139,
      longitude: longitude || 77.2090,
      workers_required: workers_required || 1,
      status: 'OPEN',
      company_name: 'Apex Builders Pvt Ltd',
      company_type: 'Construction',
      applications_count: 0,
      workers_hired: 0,
      created_at: new Date()
    };
    store.jobs.unshift(newJob);
    return { rows: [newJob], rowCount: 1 };
  }
  if (upper.startsWith('UPDATE JOBS')) {
    if (upper.includes('SET STATUS =') && upper.includes('WHERE JOB_ID = $1')) {
      const jobId = parseInt(params[0], 10);
      const job = store.jobs.find(j => j.job_id === jobId);
      if (job) job.status = 'CLOSED';
      return { rows: job ? [job] : [], rowCount: job ? 1 : 0 };
    }
    const jobId = parseInt(params[params.length - 1], 10);
    const job = store.jobs.find(j => j.job_id === jobId);
    if (job) {
      if (params[0]) job.title = params[0];
      if (params[1]) job.description = params[1];
      if (params[2]) job.skill_required = params[2];
      if (params[3]) job.wage = params[3];
      if (params[11]) job.status = params[11];
    }
    return { rows: job ? [job] : [], rowCount: job ? 1 : 0 };
  }
  if (upper.startsWith('DELETE FROM JOBS')) {
    const jobId = parseInt(params[0], 10);
    const idx = store.jobs.findIndex(j => j.job_id === jobId);
    const deleted = idx !== -1 ? store.jobs.splice(idx, 1)[0] : null;
    return { rows: deleted ? [deleted] : [], rowCount: deleted ? 1 : 0 };
  }

  // 3. Workers
  if (upper.includes('FROM WORKERS')) {
    if (upper.includes('WHERE W.WORKER_ID = $1') || upper.includes('WHERE WORKER_ID = $1')) {
      const id = parseInt(params[0], 10);
      const w = store.workers.find(item => item.worker_id === id || item.user_id === id) || null;
      return { rows: w ? [w] : [], rowCount: w ? 1 : 0 };
    }
    return { rows: [...store.workers], rowCount: store.workers.length };
  }
  if (upper.startsWith('INSERT INTO WORKERS')) {
    const [user_id, full_name, aadhaar_number, location, latitude, longitude, experience_years, availability, profile_photo, verified] = params;
    const worker = {
      worker_id: store.workers.length + 1,
      user_id: parseInt(user_id, 10),
      full_name,
      aadhaar_number,
      location,
      latitude,
      longitude,
      experience_years,
      availability: availability || 'AVAILABLE',
      profile_photo,
      verified: !!verified,
      skills: ['Electrician'],
      average_rating: 5.0,
      completed_jobs_count: 0
    };
    store.workers.push(worker);
    return { rows: [worker], rowCount: 1 };
  }
  if (upper.startsWith('UPDATE WORKERS')) {
    const id = parseInt(params[params.length - 1], 10);
    const w = store.workers.find(item => item.worker_id === id);
    return { rows: w ? [w] : [], rowCount: w ? 1 : 0 };
  }

  // 4. Employers
  if (upper.includes('FROM EMPLOYERS')) {
    if (upper.includes('WHERE E.EMPLOYER_ID = $1') || upper.includes('WHERE EMPLOYER_ID = $1')) {
      const id = parseInt(params[0], 10);
      const emp = store.employers.find(item => item.employer_id === id || item.user_id === id) || null;
      return { rows: emp ? [emp] : [], rowCount: emp ? 1 : 0 };
    }
    return { rows: [...store.employers], rowCount: store.employers.length };
  }
  if (upper.startsWith('INSERT INTO EMPLOYERS')) {
    const [user_id, company_name, company_type, address, verified] = params;
    const employer = {
      employer_id: store.employers.length + 1,
      user_id: parseInt(user_id, 10),
      company_name,
      company_type,
      address,
      verified: !!verified,
      total_jobs_posted: 0,
      total_completed_jobs: 0,
      total_spending: 0
    };
    store.employers.push(employer);
    return { rows: [employer], rowCount: 1 };
  }

  // 5. Job Applications
  if (upper.includes('FROM JOB_APPLICATIONS')) {
    if (upper.includes('WHERE APPLICATION_ID = $1')) {
      const id = parseInt(params[0], 10);
      const app = store.job_applications.find(a => a.application_id === id) || null;
      return { rows: app ? [app] : [], rowCount: app ? 1 : 0 };
    }
    if (upper.includes('WHERE JOB_ID = $1 AND WORKER_ID = $2')) {
      const [jId, wId] = params.map(n => parseInt(n, 10));
      const app = store.job_applications.find(a => a.job_id === jId && a.worker_id === wId);
      return { rows: app ? [app] : [], rowCount: app ? 1 : 0 };
    }
    let apps = [...store.job_applications];
    if (params.length > 0) {
      if (upper.includes('JA.JOB_ID = $1')) {
        apps = apps.filter(a => a.job_id === parseInt(params[0], 10));
      } else if (upper.includes('JA.WORKER_ID = $1')) {
        apps = apps.filter(a => a.worker_id === parseInt(params[0], 10));
      }
    }
    return { rows: apps, rowCount: apps.length };
  }
  if (upper.startsWith('INSERT INTO JOB_APPLICATIONS')) {
    const [job_id, worker_id] = params.map(n => parseInt(n, 10));
    const job = store.jobs.find(j => j.job_id === job_id) || {};
    const worker = store.workers.find(w => w.worker_id === worker_id) || {};
    const application = {
      application_id: store.job_applications.length + 1,
      job_id,
      worker_id,
      application_status: 'PENDING',
      applied_at: new Date(),
      job_title: job.title || 'Gig Job',
      wage: job.wage || 1000,
      job_location: job.location || 'New Delhi',
      worker_name: worker.full_name || 'Worker',
      worker_location: worker.location || 'New Delhi',
      worker_verified: worker.verified || false,
      worker_rating: worker.average_rating || 5.0
    };
    store.job_applications.unshift(application);
    return { rows: [application], rowCount: 1 };
  }
  if (upper.startsWith('UPDATE JOB_APPLICATIONS')) {
    if (upper.includes('WHERE JOB_ID = $1 AND WORKER_ID = $2')) {
      const [jId, wId] = params.map(n => parseInt(n, 10));
      const app = store.job_applications.find(a => a.job_id === jId && a.worker_id === wId);
      if (app) app.application_status = 'ACCEPTED';
      return { rows: app ? [app] : [], rowCount: app ? 1 : 0 };
    }
    if (upper.includes('WHERE JOB_ID = $1 AND WORKER_ID != $2')) {
      const [jId, wId] = params.map(n => parseInt(n, 10));
      store.job_applications.forEach(a => {
        if (a.job_id === jId && a.worker_id !== wId) a.application_status = 'REJECTED';
      });
      return { rows: [], rowCount: 0 };
    }
    const [status, appId] = params;
    const app = store.job_applications.find(a => a.application_id === parseInt(appId, 10));
    if (app) app.application_status = status;
    return { rows: app ? [app] : [], rowCount: app ? 1 : 0 };
  }

  // 6. Bookings
  if (upper.includes('FROM BOOKINGS')) {
    if (upper.includes('WHERE B.BOOKING_ID = $1') || upper.includes('WHERE BOOKING_ID = $1')) {
      const bId = parseInt(params[0], 10);
      const b = store.bookings.find(item => item.booking_id === bId) || null;
      return { rows: b ? [b] : [], rowCount: b ? 1 : 0 };
    }
    let list = [...store.bookings];
    if (params.length > 0) {
      if (upper.includes('B.WORKER_ID = $1')) {
        list = list.filter(b => b.worker_id === parseInt(params[0], 10));
      } else if (upper.includes('B.EMPLOYER_ID = $1')) {
        list = list.filter(b => b.employer_id === parseInt(params[0], 10));
      }
    }
    return { rows: list, rowCount: list.length };
  }
  if (upper.startsWith('INSERT INTO BOOKINGS')) {
    const [job_id, worker_id, employer_id] = params.map(n => parseInt(n, 10));
    const job = store.jobs.find(j => j.job_id === job_id) || {};
    const worker = store.workers.find(w => w.worker_id === worker_id) || {};
    const emp = store.employers.find(e => e.employer_id === employer_id) || {};
    const booking = {
      booking_id: store.bookings.length + 1,
      job_id,
      worker_id,
      employer_id,
      booking_status: 'CONFIRMED',
      created_at: new Date(),
      job_title: job.title || 'Gig Job',
      job_description: job.description || '',
      wage: job.wage || 1000,
      job_location: job.location || 'New Delhi',
      job_date: job.job_date || new Date().toISOString().split('T')[0],
      start_time: job.start_time || '09:00:00',
      end_time: job.end_time || '18:00:00',
      worker_name: worker.full_name || 'Worker',
      worker_photo: worker.profile_photo || '',
      worker_location: worker.location || '',
      company_name: emp.company_name || 'Employer',
      company_type: emp.company_type || '',
      company_address: emp.address || ''
    };
    store.bookings.unshift(booking);
    return { rows: [booking], rowCount: 1 };
  }
  if (upper.startsWith('UPDATE BOOKINGS')) {
    const bId = parseInt(params[params.length - 1], 10);
    const b = store.bookings.find(item => item.booking_id === bId);
    if (b) b.booking_status = params[0] || 'COMPLETED';
    return { rows: b ? [b] : [], rowCount: b ? 1 : 0 };
  }

  // 7. Earnings
  if (upper.includes('FROM EARNINGS')) {
    const wId = parseInt(params[0], 10);
    const workerEarnings = store.earnings.filter(e => !wId || e.worker_id === wId);
    if (upper.includes('SUM(AMOUNT) AS TOTAL_EARNINGS')) {
      const total = workerEarnings.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
      const paid = workerEarnings.filter(e => e.payment_status === 'PAID').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
      const pending = workerEarnings.filter(e => e.payment_status === 'PENDING').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
      return {
        rows: [{
          total_earnings: total,
          today_earnings: 1200,
          weekly_earnings: total,
          monthly_earnings: total,
          paid_earnings: paid,
          pending_earnings: pending,
          total_payouts: workerEarnings.length
        }],
        rowCount: 1
      };
    }
    if (upper.includes('GROUP BY DATE')) {
      return {
        rows: [
          { date: new Date().toISOString().split('T')[0], daily_total: 1200, jobs_completed: 1 }
        ],
        rowCount: 1
      };
    }
    if (upper.includes('GROUP BY TO_CHAR')) {
      return {
        rows: [
          { month: '2026-08', monthly_total: 1200, jobs_completed: 1 }
        ],
        rowCount: 1
      };
    }
    return { rows: workerEarnings, rowCount: workerEarnings.length };
  }
  if (upper.startsWith('INSERT INTO EARNINGS')) {
    const [worker_id, job_id, amount, payment_status] = params;
    const earning = {
      earning_id: store.earnings.length + 1,
      worker_id: parseInt(worker_id, 10),
      job_id: parseInt(job_id, 10),
      amount: parseFloat(amount) || 1200,
      payment_status: payment_status || 'PAID',
      payment_date: new Date(),
      job_title: 'Completed Gig Job',
      job_location: 'New Delhi',
      company_name: 'Apex Builders Pvt Ltd'
    };
    store.earnings.unshift(earning);
    return { rows: [earning], rowCount: 1 };
  }

  // 8. Users
  if (upper.includes('FROM USERS')) {
    if (upper.includes('WHERE USER_ID = $1')) {
      const u = store.users.find(item => item.user_id === parseInt(params[0], 10)) || null;
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }
    if (upper.includes('WHERE FIREBASE_UID = $1')) {
      const u = store.users.find(item => item.firebase_uid === params[0]) || null;
      return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
    }
    return { rows: [...store.users], rowCount: store.users.length };
  }

  // 9. Ratings
  if (upper.includes('FROM RATINGS')) {
    return { rows: [...store.ratings], rowCount: store.ratings.length };
  }
  if (upper.startsWith('INSERT INTO RATINGS')) {
    const [job_id, worker_id, employer_id, rating, review] = params;
    const r = {
      rating_id: store.ratings.length + 1,
      job_id: parseInt(job_id, 10),
      worker_id: parseInt(worker_id, 10),
      employer_id: parseInt(employer_id, 10),
      rating: parseInt(rating, 10),
      review: review || '',
      created_at: new Date()
    };
    store.ratings.unshift(r);
    return { rows: [r], rowCount: 1 };
  }

  // 10. KYC
  if (upper.includes('FROM KYC_VERIFICATION')) {
    const k = store.kyc_verification.find(item => item.user_id === parseInt(params[0], 10)) || null;
    return { rows: k ? [k] : [], rowCount: k ? 1 : 0 };
  }

  // 11. Count & Analytics fallback
  if (upper.includes('SELECT (SELECT COUNT(*) FROM USERS)')) {
    return {
      rows: [{
        total_users: store.users.length,
        total_workers: store.workers.length,
        total_employers: store.employers.length,
        open_jobs: store.jobs.filter(j => j.status === 'OPEN').length,
        completed_bookings: store.bookings.filter(b => b.booking_status === 'COMPLETED').length,
        total_payouts: store.earnings.filter(e => e.payment_status === 'PAID').reduce((sum, e) => sum + parseFloat(e.amount), 0)
      }],
      rowCount: 1
    };
  }

  return { rows: [], rowCount: 0 };
}

async function query(text, params) {
  if (isPgConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || !isPgConnected) {
        return executeInMemoryQuery(text, params);
      }
      throw err;
    }
  }
  return executeInMemoryQuery(text, params);
}

const mockPoolClient = {
  query: async (text, params) => executeInMemoryQuery(text, params),
  release: () => {}
};

const customPool = {
  ...pool,
  query,
  connect: async () => {
    if (isPgConnected) {
      try {
        return await pool.connect();
      } catch (err) {
        return mockPoolClient;
      }
    }
    return mockPoolClient;
  }
};

module.exports = {
  pool: customPool,
  query,
  isPgConnected: () => isPgConnected
};
