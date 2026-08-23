const db = require('../config/db');

class ApplicationRepository {
  async apply({ job_id, worker_id }) {
    // Prevent duplicate applications
    const existing = await db.query(
      `SELECT * FROM job_applications WHERE job_id = $1 AND worker_id = $2`,
      [job_id, worker_id]
    );
    if (existing.rows.length > 0) {
      const err = new Error('Worker has already applied for this job');
      err.statusCode = 400;
      throw err;
    }

    const res = await db.query(
      `INSERT INTO job_applications (job_id, worker_id, application_status, applied_at)
       VALUES ($1, $2, 'PENDING', CURRENT_TIMESTAMP)
       RETURNING *`,
      [job_id, worker_id]
    );
    return res.rows[0];
  }

  async findById(application_id) {
    const res = await db.query(`SELECT * FROM job_applications WHERE application_id = $1`, [application_id]);
    return res.rows[0] || null;
  }

  async updateStatus(application_id, status) {
    const res = await db.query(
      `UPDATE job_applications
       SET application_status = $1
       WHERE application_id = $2
       RETURNING *`,
      [status, application_id]
    );
    return res.rows[0];
  }

  async findByJobOrWorker({ job_id, worker_id }) {
    let sql = `
      SELECT ja.*, j.title AS job_title, j.wage, j.location AS job_location,
             w.full_name AS worker_name, w.location AS worker_location, w.verified AS worker_verified,
             COALESCE((SELECT AVG(r.rating)::NUMERIC(3,2) FROM ratings r WHERE r.worker_id = w.worker_id), 5.0) AS worker_rating
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.job_id
      JOIN workers w ON ja.worker_id = w.worker_id
      WHERE 1=1
    `;
    const params = [];

    if (job_id) {
      params.push(job_id);
      sql += ` AND ja.job_id = $${params.length}`;
    }
    if (worker_id) {
      params.push(worker_id);
      sql += ` AND ja.worker_id = $${params.length}`;
    }

    sql += ` ORDER BY ja.applied_at DESC`;
    const res = await db.query(sql, params);
    return res.rows;
  }

  // Worker Selection Transaction:
  // 1. Mark target application ACCEPTED
  // 2. Reject all other applications for this job
  // 3. Create a booking record (booking_status = 'CONFIRMED')
  // Executed within an atomic PostgreSQL transaction.
  async selectWorkerTransaction({ job_id, worker_id, employer_id }) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Accept target application
      const acceptRes = await client.query(
        `UPDATE job_applications
         SET application_status = 'ACCEPTED'
         WHERE job_id = $1 AND worker_id = $2
         RETURNING *`,
        [job_id, worker_id]
      );

      if (acceptRes.rows.length === 0) {
        throw new Error(`Application for job_id ${job_id} and worker_id ${worker_id} not found`);
      }

      // 2. Reject remaining applications for this job
      await client.query(
        `UPDATE job_applications
         SET application_status = 'REJECTED'
         WHERE job_id = $1 AND worker_id != $2`,
        [job_id, worker_id]
      );

      // 3. Insert confirmed booking record
      const bookingRes = await client.query(
        `INSERT INTO bookings (job_id, worker_id, employer_id, booking_status, created_at)
         VALUES ($1, $2, $3, 'CONFIRMED', CURRENT_TIMESTAMP)
         RETURNING *`,
        [job_id, worker_id, employer_id]
      );

      await client.query('COMMIT');

      return {
        application: acceptRes.rows[0],
        booking: bookingRes.rows[0]
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new ApplicationRepository();
